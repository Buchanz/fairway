import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {yardage,holeCamera} from '../src/lib/hole-map.ts';
test('new Island routings have 18 unique holes and valid camera geometry',()=>{
 const ids=new Set();
 for(const id of ['highland-pacific','cordova-bay','bear-mountain','bear-valley']){
  const holes=JSON.parse(readFileSync(new URL(`../src/data/${id}-holes.json`,import.meta.url)));
  assert.deepEqual(holes.map(h=>h.number),Array.from({length:18},(_,i)=>i+1));
  for(const h of holes){
   assert.ok(!ids.has(h.osmWayId),'A hole must not belong to two courses');ids.add(h.osmWayId);
   assert.ok([3,4,5].includes(h.par));
   const yards=yardage(h.path[0],h.path.at(-1));assert.ok(yards>50&&yards<800,`${id} ${h.number}: ${yards}`);
   for(const p of h.path){assert.ok(p.latitude>48.45&&p.latitude<48.55);assert.ok(p.longitude>-123.58&&p.longitude<-123.34);}
   const camera=holeCamera(h,320,440);assert.ok(Number.isFinite(camera.heading)&&Number.isFinite(camera.altitude));
  }
 }
});
