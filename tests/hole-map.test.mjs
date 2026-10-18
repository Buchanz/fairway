import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {bearing,holeCamera,yardage,suggestedTarget,greenDistances} from '../src/lib/hole-map.ts';
const holes=JSON.parse(readFileSync(new URL('../src/data/cedar-holes.json',import.meta.url)));
test('Cedar Hill has 18 unique plausible mapped tee-to-green paths',()=>{
 assert.deepEqual(holes.map(h=>h.number),Array.from({length:18},(_,i)=>i+1));
 for(const h of holes){assert.ok(h.path.length>=2);assert.ok([3,4,5].includes(h.par));const d=yardage(h.path[0],h.path.at(-1));assert.ok(d>60&&d<700);for(const p of h.path){assert.ok(p.latitude>48.448&&p.latitude<48.463);assert.ok(p.longitude>-123.351&&p.longitude<-123.338);}}
});
test('camera points from tee toward green for each cardinal direction',()=>{
 const a={latitude:0,longitude:0};
 for(const [b,expected] of [[{latitude:0.001,longitude:0},0],[{latitude:0,longitude:0.001},90],[{latitude:-0.001,longitude:0},180],[{latitude:0,longitude:-0.001},270]])assert.ok(Math.abs(bearing(a,b)-expected)<0.01);
});
test('hole cameras stay finite on compact screens and fit longer paths farther out',()=>{
 for(const h of holes){const c=holeCamera(h,300,400);for(const n of [c.center.latitude,c.center.longitude,c.heading,c.zoom,c.altitude])assert.ok(Number.isFinite(n));assert.equal(c.pitch,0);}
 const path=[{latitude:0,longitude:0},{latitude:0.001,longitude:0}];
 assert.ok(holeCamera({path},300,400).zoom>holeCamera({path:[path[0],{latitude:0.004,longitude:0}]},300,400).zoom);
});
test('additional course layouts have unique complete numbering and plausible distances',()=>{
 for(const id of ['olympic-view','royalwood','duncan-meadows']){
  const layout=JSON.parse(readFileSync(new URL(`../src/data/${id}-holes.json`,import.meta.url)));
  assert.deepEqual(layout.map(h=>h.number),Array.from({length:18},(_,i)=>i+1));
  for(const h of layout){assert.ok(h.path.length>=2);const distance=yardage(h.path[0],h.path.at(-1));assert.ok(distance>60&&distance<750,`${id} hole ${h.number}`);assert.ok(h.par===null||[3,4,5].includes(h.par));}
 }
});

test('suggested aim follows a dogleg rather than cutting across its midpoint',()=>{
 const path=[{latitude:0,longitude:0},{latitude:0,longitude:0.002},{latitude:0.002,longitude:0.002}];
 const target=suggestedTarget({path});
 assert.ok(Math.abs(target.latitude)<0.000001);
 assert.ok(Math.abs(target.longitude-0.002)<0.000001);
});
test('suggested aim handles repeated vertices and degenerate paths',()=>{
 const a={latitude:0,longitude:0},b={latitude:0,longitude:0.002};
 assert.deepEqual(suggestedTarget({path:[a,a,b]}),{latitude:0,longitude:0.001});
 assert.equal(suggestedTarget({path:[a,a]}),null);
 assert.equal(suggestedTarget({path:[]}),null);
});

const greenCenter={latitude:0.003,longitude:0};
const greenBoundary=[{latitude:0.0028,longitude:-0.0002},{latitude:0.0032,longitude:-0.0002},{latitude:0.0032,longitude:0.0002},{latitude:0.0028,longitude:0.0002},{latitude:0.0028,longitude:-0.0002}];
test('green yardages intersect mapped edges from the player approach',()=>{
 const tee={latitude:0,longitude:0};
 const distances=greenDistances(tee,greenCenter,greenBoundary);
 assert.equal(distances.front,yardage(tee,{latitude:0.0028,longitude:0}));
 assert.equal(distances.back,yardage(tee,{latitude:0.0032,longitude:0}));
 assert.ok(distances.front<distances.center&&distances.center<distances.back);
 const beyond={latitude:0.006,longitude:0};
 const reversed=greenDistances(beyond,greenCenter,greenBoundary);
 assert.equal(reversed.front,yardage(beyond,{latitude:0.0032,longitude:0}));
 assert.equal(reversed.back,yardage(beyond,{latitude:0.0028,longitude:0}));
 assert.ok(greenDistances({latitude:0.001,longitude:0},greenCenter,greenBoundary).center<distances.center);
});
test('missing green outlines do not invent front and back distances',()=>{
 assert.deepEqual(greenDistances({latitude:0,longitude:0},greenCenter),{center:yardage({latitude:0,longitude:0},greenCenter),front:null,back:null});
});

test('Mt Doug pilot has nine geographically plausible, oriented hole paths',()=>{
 const layout=JSON.parse(readFileSync(new URL('../src/data/mount-douglas-holes.json',import.meta.url)));
 assert.deepEqual(layout.map(h=>h.number),[1,2,3,4,5,6,7,8,9]);
 assert.equal(layout.reduce((sum,h)=>sum+h.par,0),31);
 assert.equal(layout.reduce((sum,h)=>sum+h.scorecardYards,0),1519);
 for(const h of layout){
  assert.equal(h.pilot,true);assert.ok(h.sourceUrl.includes('saanich.ca'));
  assert.equal(h.greenBoundary,undefined);
  const measured=yardage(h.path[0],h.path.at(-1));
  assert.ok(Math.abs(measured-h.scorecardYards)<20,`Review hole ${h.number}`);
  for(const p of h.path){assert.ok(p.latitude>48.4797&&p.latitude<48.4837);assert.ok(p.longitude>-123.355&&p.longitude<-123.3455);}
  const camera=holeCamera(h,350,500);assert.ok(Number.isFinite(camera.altitude));assert.equal(camera.heading,bearing(h.path[0],h.path.at(-1)));
 }
});

test('Ardmore and Langley pilots have complete, distinct, frameable hole routes',()=>{
 for(const [id,count] of [['ardmore',9],['langley-golf-centre',18]]){
  const layout=JSON.parse(readFileSync(new URL(`../src/data/${id}-holes.json`,import.meta.url)));
  assert.deepEqual(layout.map(h=>h.number),Array.from({length:count},(_,i)=>i+1));
  assert.equal(new Set(layout.map(h=>JSON.stringify(h.path))).size,count);
  for(const h of layout){
   const d=yardage(h.path[0],h.path.at(-1));assert.ok(d>50&&d<650,`${id} ${h.number}: ${d}`);
   const camera=holeCamera(h,350,480);assert.ok(Number.isFinite(camera.altitude));
   assert.equal(camera.heading,bearing(h.path[0],h.path.at(-1)));assert.equal(h.pilot,true);
  }
 }
});
