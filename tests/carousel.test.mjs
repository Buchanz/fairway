import test from 'node:test';
import assert from 'node:assert/strict';
import {upcomingSlots} from '../src/lib/availability.ts';
test('carousel shows remaining today then tomorrow, skips expired and wrong capacity',()=>{
 const now=Date.parse('2026-09-28T23:00:00Z');
 const slot=(date,id,minuteOfDay,players=[4])=>({id,date,minuteOfDay,players,time:'',price:null,holes:18});
 const inventory={
  '2026-09-29':{checkedAt:new Date(now).toISOString(),slots:[slot('2026-09-29','tomorrow',480)]},
  '2026-09-28':{checkedAt:new Date(now).toISOString(),slots:[slot('2026-09-28','past',900),slot('2026-09-28','today',1020),slot('2026-09-28','single',1030,[1])]}
 };
 assert.deepEqual(upcomingSlots(inventory,4,now).map(s=>s.id),['today','tomorrow']);
 assert.deepEqual(upcomingSlots(inventory,4,now+61*60000).map(s=>s.id),[]);
 inventory['2026-09-28'].slots=[];
 assert.deepEqual(upcomingSlots(inventory,4,now).map(s=>s.id),['tomorrow']);
 assert.deepEqual(upcomingSlots(inventory,4,now,'2026-09-28'),[]);
});
