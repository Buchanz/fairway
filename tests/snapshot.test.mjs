import test from 'node:test';
import assert from 'node:assert/strict';
import {createSnapshot} from '../server/snapshot.mjs';
test('snapshot preloads all days, coalesces refresh and expires failures',async()=>{
 let now=Date.parse('2026-09-28T19:00:00Z'),calls=0,fail=false;
 const snapshot=createSnapshot(async date=>{calls++;if(fail)throw Error();return {date,checkedAt:new Date(now).toISOString(),slots:[]};},()=>now);
 await Promise.all([snapshot.refresh(),snapshot.refresh()]);
 assert.equal(calls,5);assert.equal(Object.keys(snapshot.read().days).length,5);
 fail=true;now+=60000;await snapshot.refresh();assert.equal(Object.keys(snapshot.read().days).length,5);
 now+=61000;assert.equal(Object.keys(snapshot.read().days).length,0);
});
