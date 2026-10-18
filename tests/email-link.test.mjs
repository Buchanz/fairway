import test from 'node:test';
import assert from 'node:assert/strict';
import {parseEmailLink} from '../src/auth/email-link.ts';
for(const base of ['fairway://account','exp://127.0.0.1:8081/--/account','https://fairway.example/account']){
 test(`confirmation and recovery callbacks: ${base}`,()=>{
  assert.equal(parseEmailLink(base+'#access_token=a&refresh_token=b&type=signup',base).recovery,false);
  assert.equal(parseEmailLink(base+'#access_token=a&refresh_token=b&type=recovery',base).recovery,true);
  assert.equal(parseEmailLink(base,base),null);
 });
}
test('reject foreign destinations, incomplete tokens and expired links',()=>{
 const base='fairway://account';
 assert.equal(parseEmailLink('evil://account#access_token=a&refresh_token=b',base),null);
 assert.equal(parseEmailLink('fairway://play#access_token=a&refresh_token=b',base),null);
 assert.throws(()=>parseEmailLink(base+'#access_token=a',base),/incomplete/);
 assert.throws(()=>parseEmailLink(base+'#error=access_denied&error_description=secret',base),/expired/);
});
