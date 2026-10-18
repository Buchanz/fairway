import test from 'node:test';
import assert from 'node:assert/strict';
import {createAvailabilityCache} from '../src/lib/availability-cache-core.ts';
const now=Date.parse('2026-10-14T18:00:00Z');
function inventory(checked=now){return {course:{'2026-10-14':{date:'2026-10-14',checkedAt:new Date(checked).toISOString(),slots:[]}}};}
test('availability cache restores fresh data but never extends its expiry',async()=>{
 let at=now;const cache=createAvailabilityCache({getItem:async()=>JSON.stringify({courses:inventory()}),setItem:async()=>{}},()=>at);
 assert.deepEqual(await cache.restore(),inventory());at+=120001;assert.deepEqual(cache.read(),{});
});
test('late disk hydration cannot replace a newer network snapshot',async()=>{
 let finish;const cache=createAvailabilityCache({getItem:()=>new Promise(resolve=>{finish=resolve;}),setItem:async()=>{}},()=>now);
 const pending=cache.restore();const latest=inventory(now+1);cache.save(latest);finish(JSON.stringify({courses:inventory()}));assert.deepEqual(await pending,latest);
});
test('invalid disk cache is ignored',async()=>{
 const cache=createAvailabilityCache({getItem:async()=>'{broken',setItem:async()=>{}},()=>now);assert.deepEqual(await cache.restore(),{});
});
