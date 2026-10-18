import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=ts.transpile(readFileSync(new URL('../supabase/functions/username-login/index.ts',import.meta.url),'utf8'));
function setup(email,ok=true){let handler;const calls=[];vm.runInNewContext(source,{Request,Response,fetch:async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return Response.json(url.includes('/rpc/')?email:ok?{access_token:'access',refresh_token:'refresh',user:{email}}:{error:'bad password'},{status:url.includes('/rpc/')||ok?200:400});},Deno:{env:{get:key=>key==='SUPABASE_URL'?'https://example.test':'server-key'},serve:fn=>{handler=fn;}}});return {run:body=>handler(new Request('https://example.test',{method:'POST',body:JSON.stringify(body)})),calls};}
test('username login normalizes handles and returns tokens only after password verification',async()=>{const {run,calls}=setup('private@example.test');const res=await run({username:' @Golfer ',password:'secret'});assert.equal(res.status,200);assert.deepEqual(await res.json(),{access_token:'access',refresh_token:'refresh'});assert.equal(calls[0].body.handle,'golfer');assert.equal(calls[1].body.email,'private@example.test');});
test('unknown handles and incorrect passwords return identical failures without emails',async()=>{const unknown=setup(null,false),wrong=setup('private@example.test',false);const a=await unknown.run({username:'golfer',password:'bad'}),b=await wrong.run({username:'golfer',password:'bad'});assert.equal(a.status,401);assert.equal(b.status,401);assert.deepEqual(await a.json(),await b.json());});
test('invalid usernames never reach privileged lookup',async()=>{const {run,calls}=setup(null);assert.equal((await run({username:'a',password:'bad'})).status,401);assert.equal(calls.length,0);});
