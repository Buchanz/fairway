import test from 'node:test';
import assert from 'node:assert/strict';
import {roundChanges} from '../src/lib/round-changes.ts';
const r={id:'one',courseId:'cedar-hill',date:'2026-10-10',names:['You'],scores:[Array(9).fill(null)],finished:false};
test('round updates include changed scores and explicit deletes only',()=>{
 const second={...r,id:'two'};const ended={...r,finished:true};
 assert.deepEqual(roundChanges([r,second],[ended]),{changed:[ended],removed:['two']});
 assert.deepEqual(roundChanges([r],[structuredClone(r)]),{changed:[],removed:[]});
});
test('a snapshot never deletes an unseen round created on another device',()=>{
 assert.deepEqual(roundChanges([r],[]).removed,['one']);
 assert.deepEqual(roundChanges([], [r]),{changed:[r],removed:[]});
});
