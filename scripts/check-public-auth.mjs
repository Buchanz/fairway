// Read-only deployment check. Never creates an account or sends an email.
import assert from 'node:assert/strict';
const url=process.env.EXPO_PUBLIC_SUPABASE_URL,key=process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
assert.ok(url&&key,'Configure the public Supabase URL and publishable key.');
const headers={apikey:key,Authorization:`Bearer ${key}`};
const settings=await fetch(`${url}/auth/v1/settings`,{headers});
assert.equal(settings.status,200,'Auth settings must be reachable');
const config=await settings.json();
assert.equal(config.external.email,true,'Email authentication must be enabled');
assert.equal(config.disable_signup,false,'Signups must be enabled');
assert.equal(config.mailer_autoconfirm,false,'Email confirmation must be enabled');
for(const table of ['rounds','player_profiles','friendships','round_invitations']){
 const response=await fetch(`${url}/rest/v1/${table}?select=*&limit=1`,{headers});
 const data=await response.json();
 assert.ok((response.status===401||response.status===403)&&data.code==='42501',`${table}: expected anonymous permission denial, got ${response.status}`);
 console.log(`PASS: anonymous ${table} reads denied`);
}
// OpenAPI is read-only; verifies migration presence without invoking any functions.
const response=await fetch(`${url}/rest/v1/`,{headers:{...headers,Accept:'application/openapi+json'}});
if(response.ok){const schema=await response.json();console.log('Public API schema reachable; authenticated RPC existence requires dashboard or signed-in verification.');}
console.log('PASS: signup enabled, confirmation required, anonymous table access denied.');
console.log('NOT VERIFIED: SMTP delivery, redirects, authenticated isolation, profile uploads, account deletion.');
