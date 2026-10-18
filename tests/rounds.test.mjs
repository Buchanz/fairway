import test from 'node:test';
import assert from 'node:assert/strict';
import {scoreTotal,validRounds,isCompletedRound} from '../src/lib/rounds.ts';
test('unplayed holes are excluded from the played count',()=>{assert.deepEqual(scoreTotal([null,5,3,null]),{total:8,played:2});});
test('stored rounds reject invalid scores and inconsistent player cards',()=>{const r={id:'1',courseId:'cedar-hill',date:'2026-10-04',names:['You'],scores:[Array(9).fill(null)],finished:false};assert.ok(validRounds([r]));assert.equal(validRounds([{...r,scores:[Array(9).fill(-1)]}]),false);assert.equal(validRounds([{...r,names:['One','Two']}]),false);});

test('Games includes only finished scorecards completed by every player',()=>{
 const r={id:'1',courseId:'cedar-hill',date:'2026-10-13',names:['You','Friend'],scores:[Array(9).fill(4),Array(9).fill(5)],finished:true};
 assert.equal(isCompletedRound(r),true);
 assert.equal(isCompletedRound({...r,finished:false}),false);
 assert.equal(isCompletedRound({...r,scores:[Array(9).fill(4),[null,...Array(8).fill(5)]]}),false);
 assert.equal(isCompletedRound({...r,scores:[Array(9).fill(null),Array(9).fill(null)]}),false);
 assert.equal(isCompletedRound({...r,scores:[Array(18).fill(4),Array(18).fill(5)]}),true);
});

test('ending a round retains only a fully scored 9 or 18 hole round',async()=>{
 const {endRound}=await import('../src/lib/rounds.ts');
 const other={id:'other',courseId:'cedar-hill',date:'2026-10-14',names:['You'],scores:[Array(9).fill(4)],finished:true};
 for(const holes of [9,18]){
  const round={...other,id:'active',finished:false,names:['You','Friend'],scores:[Array(holes).fill(4),Array(holes).fill(5)]};
  assert.deepEqual(endRound([other,round],'active'),[other,{...round,finished:true}]);
  const incomplete={...round,scores:[round.scores[0],[null,...Array(holes-1).fill(5)]]};
  assert.deepEqual(endRound([other,incomplete],'active'),[other]);
  assert.deepEqual(endRound([other,{...incomplete,finished:true}],'active'),[other]);
 }
 assert.deepEqual(endRound([other],'missing'),[other]);
});

test('friend invitations contain only linked guests on fully completed rounds',async()=>{
 const {roundInvitations}=await import('../src/lib/rounds.ts');
 const owner='11111111-1111-4111-8111-111111111111',friend='22222222-2222-4222-8222-222222222222';
 const round={id:'friends',courseId:'cedar-hill',date:'2026-10-14',names:['You','Friend','Guest'],playerIds:[owner,friend,null],scores:[Array(9).fill(4),Array(9).fill(5),Array(9).fill(6)],finished:true};
 assert.deepEqual(roundInvitations(round,owner),[{owner_id:owner,round_id:'friends',recipient:friend,player_index:1}]);
 assert.deepEqual(roundInvitations({...round,finished:false},owner),[]);
 assert.deepEqual(roundInvitations({...round,scores:[Array(9).fill(null),...round.scores.slice(1)]},owner),[]);
 assert.equal(validRounds([{...round,playerIds:[owner,friend,friend]}]),false);
 assert.equal(validRounds([{...round,playerIds:[owner,'invalid',null]}]),false);
 assert.equal(validRounds([{...round,playerIds:[owner]}]),false);
});
