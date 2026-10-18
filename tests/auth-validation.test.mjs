import test from 'node:test';
import assert from 'node:assert/strict';
import {validNewPassword,normalizeUsername,usernamePattern} from '../src/auth/validation.ts';
test('new passwords match the hosted Supabase length and character requirements',()=>{
 for(const value of ['Short!A','lowercaseonly!','Uppercaseonly12','Uppercase12 ','UPPERCASEONLY!12','Lowercaseonly!','FairwayRound12💚'])assert.equal(validNewPassword(value),false);
 assert.equal(validNewPassword('FairwayRound!12'),true);
});
test('usernames normalize casing and reject spaces and invalid lengths',()=>{
 assert.equal(normalizeUsername(' @Golf_Player '),'golf_player');
 for(const value of ['ab','bad name','a'.repeat(25),'name!'])assert.equal(usernamePattern.test(value),false);
 assert.equal(usernamePattern.test(normalizeUsername('Golf_Player')),true);
});
