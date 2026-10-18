import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseCedar} from '../server/cedar.mjs';
const row={id:1,date:'2026-09-27',start_time:'14:09',quantity_remaining:3,blocked_type:'open',divisions_available:[1,2],turn_tee_time:{quantity_remaining:1}};
test('18-hole availability respects capacity on both halves and does not invent prices',()=>{const result=parseCedar({data:[row]},row.date);assert.deepEqual(result.slots[0].players,[1]);assert.equal(result.slots[0].time,'2:09 PM');assert.equal(result.slots[0].price,null);});
test('excludes closed times, guest restrictions, and unavailable 18-hole rounds',()=>{for(const change of [{blocked_type:'closed'},{bookings_prevent_guests:1},{turn_tee_time:null},{divisions_available:[1]}])assert.equal(parseCedar([ {...row,...change}],row.date).slots.filter(s=>s.holes===18).length,0);});
test('empty response is distinct from invalid data',()=>{assert.deepEqual(parseCedar([],row.date).slots,[]);assert.throws(()=>parseCedar({error:'unauthorized'},row.date));assert.throws(()=>parseCedar([{...row,date:'2026-09-28'}],row.date));});

test('9-hole slots use outward capacity without requiring a return time',()=>{const result=parseCedar([{...row,turn_tee_time:null,divisions_available:[1]}],row.date);assert.equal(result.slots.length,1);assert.equal(result.slots[0].holes,9);assert.deepEqual(result.slots[0].players,[1,2,3]);});
