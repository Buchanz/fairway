import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {holeForTee,yardage} from '../src/lib/hole-map.ts';
const holes=JSON.parse(readFileSync(new URL('../src/data/duncan-meadows-holes.json',import.meta.url)));
test('Duncan reviewed tee selection changes origin without moving green or modifying shared layout',()=>{
 for(const hole of holes.slice(0,6)){
  const before=JSON.stringify(hole);
  const selected=['blue','white','green'].map(id=>holeForTee(hole,id));
  const distances=selected.map(h=>yardage(h.path[0],h.path.at(-1)));
  assert.ok(distances[0]>distances[1]&&distances[1]>distances[2]);
  for(const h of selected)assert.deepEqual(h.path.at(-1),hole.path.at(-1));
  assert.equal(JSON.stringify(hole),before);
 }
 assert.equal(holeForTee(holes[7],'white'),holes[7]);
 assert.equal(holeForTee(undefined,'blue'),undefined);
});
