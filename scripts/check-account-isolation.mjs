// Run against a test project with two confirmed test users; never production.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
const required=['EXPO_PUBLIC_SUPABASE_URL','EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY','TEST_USER_A_EMAIL','TEST_USER_A_PASSWORD','TEST_USER_B_EMAIL','TEST_USER_B_PASSWORD'];
for(const key of required)if(!process.env[key])throw Error(`Missing ${key}`);
const client=()=>createClient(process.env.EXPO_PUBLIC_SUPABASE_URL,process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const a=client(),b=client(),anon=client();
const id=`isolation-test-${randomUUID()}`;
let owner;
try{
 const loginA=await a.auth.signInWithPassword({email:process.env.TEST_USER_A_EMAIL,password:process.env.TEST_USER_A_PASSWORD});assert.ifError(loginA.error);owner=loginA.data.user.id;
 const loginB=await b.auth.signInWithPassword({email:process.env.TEST_USER_B_EMAIL,password:process.env.TEST_USER_B_PASSWORD});assert.ifError(loginB.error);assert.notEqual(owner,loginB.data.user.id);
 const data={id,courseId:'cedar-hill',date:new Date().toISOString(),names:['Test'],scores:[Array(9).fill(null)],finished:false};
 assert.ifError((await a.from('rounds').insert({user_id:owner,id,data})).error);
 const readA=await a.from('rounds').select('id').eq('id',id);assert.ifError(readA.error);assert.equal(readA.data.length,1);
 const readB=await b.from('rounds').select('id').eq('id',id);assert.ifError(readB.error);assert.equal(readB.data.length,0);
 const readAnon=await anon.from('rounds').select('id').eq('id',id);assert.ok(readAnon.error||readAnon.data.length===0);
 assert.ok((await b.from('rounds').insert({user_id:owner,id:id+'-forged',data:{...data,id:id+'-forged'}})).error);
 await b.from('rounds').update({data:{...data,finished:true}}).eq('user_id',owner).eq('id',id);
 await b.from('rounds').delete().eq('user_id',owner).eq('id',id);
 const intact=await a.from('rounds').select('data').eq('id',id).single();assert.ifError(intact.error);assert.equal(intact.data.data.finished,false);
 assert.ifError((await a.from('rounds').delete().eq('id',id)).error);
 console.log('PASS: owner access, anonymous denial, cross-account read/write/delete isolation.');
}finally{
 if(owner)await a.from('rounds').delete().eq('id',id);
 await Promise.all([a.auth.signOut(),b.auth.signOut()]);
}
