import test from 'node:test';
import assert from 'node:assert/strict';
import {loadRounds,saveRounds,roundsKey,legacyRoundsKey} from '../src/lib/round-storage.ts';
const round={id:'old-round',courseId:'cedar-hill',date:'2026-10-10',names:['You'],scores:[Array(9).fill(null)],finished:true};
function memory(){const values=new Map();return {values,async getItem(k){return values.get(k)??null;},async setItem(k,v){values.set(k,v);}};}
test('guest and account round caches stay isolated across account switches',async()=>{
 const storage=memory();await saveRounds(storage,null,[round]);await saveRounds(storage,'alice',[{...round,id:'alice-round'}]);
 assert.deepEqual(await loadRounds(storage,'bob'),[]);
 assert.equal((await loadRounds(storage,null))[0].id,'old-round');
 assert.equal((await loadRounds(storage,'alice'))[0].id,'alice-round');
 assert.equal(roundsKey(null),legacyRoundsKey);
});
test('corrupt existing rounds are rejected without overwriting them',async()=>{
 const storage=memory();storage.values.set(legacyRoundsKey,'broken');
 await assert.rejects(loadRounds(storage,null));assert.equal(storage.values.get(legacyRoundsKey),'broken');
 await assert.rejects(saveRounds(storage,'alice',[{...round,scores:[[-1]]}]));assert.equal(storage.values.has(roundsKey('alice')),false);
});

test('pending cloud scores survive restart and remain isolated by account',async()=>{
 const {stageRoundChanges,pendingRoundChanges,clearPendingRoundChanges}=await import('../src/lib/round-storage.ts');
 const storage=memory();const next={...round,scores:[Array(9).fill(4)],finished:true};
 await stageRoundChanges(storage,'alice',[round],[next]);
 assert.deepEqual(await pendingRoundChanges(storage,'alice'),{before:[round],after:[next]});
 assert.equal(await pendingRoundChanges(storage,'bob'),null);
 await assert.rejects(stageRoundChanges(storage,'alice',[],[{...next,scores:[[-1]]}]));
 assert.deepEqual((await pendingRoundChanges(storage,'alice')).after,[next]);
 await clearPendingRoundChanges(storage,'alice');
 assert.equal(await pendingRoundChanges(storage,'alice'),null);
});
test('an earlier cloud acknowledgement cannot clear newer pending scores',async()=>{
 const {stageRoundChanges,pendingRoundChanges,clearPendingRoundChanges}=await import('../src/lib/round-storage.ts');
 const storage=memory(),newer={...round,scores:[Array(9).fill(5)]};
 await stageRoundChanges(storage,'alice',[round],[newer]);
 await clearPendingRoundChanges(storage,'alice',[round]);
 assert.deepEqual((await pendingRoundChanges(storage,'alice')).after,[newer]);
 await clearPendingRoundChanges(storage,'alice',[newer]);
 assert.equal(await pendingRoundChanges(storage,'alice'),null);
});
