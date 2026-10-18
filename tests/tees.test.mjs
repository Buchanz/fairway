import test from 'node:test';
import assert from 'node:assert/strict';
import {courseTees,teeForRound} from '../src/data/tees.ts';
import {validRounds} from '../src/lib/rounds.ts';
test('Cedar Hill tee yardages match published totals and cover all holes',()=>{
 for(const [id,total] of [['blue',5164],['white',4977],['red',4740]]){
  const tee=teeForRound('cedar-hill',id);assert.equal(tee.yardages.length,18);
  assert.equal(tee.yardages.reduce((a,b)=>a+b,0),total);
 }
 assert.equal(teeForRound('royalwood','blue').name,'Blue');
 assert.equal(teeForRound('cedar-hill','unknown'),undefined);
 assert.equal(courseTees['cedar-hill'][0].yardages[0],301);
});
test('saved rounds retain tee selection and remain compatible with older rounds',()=>{
 const old={id:'old',courseId:'cedar-hill',date:'2026-10-10',names:['You'],scores:[Array(18).fill(null)],finished:false};
 assert.ok(validRounds([old]));
 const round={...old,teeId:'white',teeName:'White'};
 const restored=JSON.parse(JSON.stringify([round]));assert.ok(validRounds(restored));assert.equal(restored[0].teeId,'white');
 assert.equal(validRounds([{...old,teeName:42}]),false);
 assert.equal(validRounds([{...old,teeId:{}}]),false);
});
test('published course tee options have stable unique IDs and source attribution',()=>{
 for(const tees of Object.values(courseTees)){
  assert.equal(new Set(tees.map(t=>t.id)).size,tees.length);
  for(const tee of tees){assert.match(tee.sourceUrl,/^https:\/\//);assert.ok([0,9,18].includes(tee.yardages.length));}
 }
 assert.deepEqual(courseTees['highland-pacific'].map(t=>t.name),['Gold','Blue','White','Green Combo','Silver','Family']);
 assert.ok(teeForRound('royalwood','green-orange'));
 assert.equal(teeForRound('langley-golf-centre','standard').yardages.reduce((a,b)=>a+b),2220);
});
