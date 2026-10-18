import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseDuncan,createDuncanSnapshot} from '../server/duncan.mjs';
const row={id:123,course_id:23175,date:'2026-10-03',start_time:'14:08',out_of_capacity:false,frozen:false,restrictions:[],event_id:null,green_fees:[{affiliation_type_id:112653,green_fee:69}]};
test('Duncan uses confirmed player-specific capacity and visitor prices',()=>{
 const [slot]=parseDuncan([row],row.date,18,1);assert.deepEqual(slot.players,[1]);assert.equal(slot.price,69);assert.equal(slot.minuteOfDay,848);
 for(const change of [{out_of_capacity:true},{frozen:true},{restrictions:['single player restriction']},{event_id:7}])assert.equal(parseDuncan([{...row,...change}],row.date,18,1).length,0);
 assert.throws(()=>parseDuncan([row],row.date,18,4));assert.throws(()=>parseDuncan([row],'2026-10-04',18,1));
});
test('Duncan does not infer single-player availability from a foursome',()=>{
 assert.equal(parseDuncan([{...row,out_of_capacity:true}],row.date,18,1).length,0);
 const group={...row,green_fees:Array(4).fill(row.green_fees[0])};assert.deepEqual(parseDuncan([group],row.date,18,4)[0].players,[4]);
});
test('Duncan refresh is bounded, coalesced and stale data expires',async()=>{
 let clock=Date.parse('2026-10-03T18:00:00Z'),calls=0,fail=false;
 const cache=createDuncanSnapshot(async()=>{calls++;if(fail)throw Error();return [];},()=>clock);
 await Promise.all([cache.refresh(),cache.refresh()]);assert.equal(calls,56);assert.equal(Object.keys(cache.read()).length,7);
 await cache.refresh();assert.equal(calls,56);fail=true;clock+=91000;await cache.refresh();assert.equal(Object.keys(cache.read()).length,7);
 clock+=30000;assert.equal(Object.keys(cache.read()).length,0);
});
