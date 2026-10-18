// Supabase Edge runtime. Privileged keys and email resolution stay server-side.
const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const reply=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers});
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.method!=='POST')return reply(405,{error:'Method not allowed'});
 try{
  const text=await req.text();
  if(text.length>4096)return reply(400,{error:'Invalid sign-in request.'});
  const body=JSON.parse(text),username=String(body.username??'').trim().replace(/^@/,'').toLowerCase();
  if(!/^[a-z0-9_]{3,24}$/.test(username)||typeof body.password!=='string'||!body.password||body.password.length>1024)return reply(401,{error:'Incorrect username or password.'});
  const url=Deno.env.get('SUPABASE_URL')!,service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,anon=Deno.env.get('SUPABASE_ANON_KEY')!;
  const lookup=await fetch(`${url}/rest/v1/rpc/resolve_login_username`,{method:'POST',headers:{apikey:service,Authorization:`Bearer ${service}`,'Content-Type':'application/json'},body:JSON.stringify({handle:username})});
  if(!lookup.ok)return reply(503,{error:'Username sign-in is unavailable. Please use your email.'});
  const email=await lookup.json();
  // Unknown and throttled handles follow the same Auth request and error path.
  const result=await fetch(`${url}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:anon,'Content-Type':'application/json'},body:JSON.stringify({email:email||'unavailable@invalid.invalid',password:body.password})});
  const session=await result.json();
  if(!email||!result.ok||!session.access_token)return reply(401,{error:'Incorrect username or password, or too many attempts. Try again later.'});
  return reply(200,{access_token:session.access_token,refresh_token:session.refresh_token});
 }catch{return reply(503,{error:'Unable to sign in. Please try again.'});}
});
