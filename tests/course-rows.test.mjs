import {test} from 'node:test';
import assert from 'node:assert/strict';
import {matchingSlots} from '../src/lib/availability.ts';
const now=Date.parse('2026-09-26T18:00:00Z');
const slot=(id,minuteOfDay,players,date='2026-09-26')=>({id,minuteOfDay,players,date,time:'',price:60,holes:18});
test('course row times are earliest first and honor exact permitted group sizes',()=>{
 const input=[slot('late',1000,[2,3,4]),slot('early',800,[2,3]),slot('past',600,[2,3,4]),slot('tomorrow',800,[2,3,4],'2026-09-27')];
 assert.deepEqual(matchingSlots(input,2,now).map(t=>t.id),['early','late']);
 assert.deepEqual(matchingSlots(input,4,now).map(t=>t.id),['late']);
 assert.equal(matchingSlots(input,1,now).length,0);
 assert.equal(input[0].id,'late');
});
