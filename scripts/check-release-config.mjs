// Fail store builds before uploading an app with missing or temporary services.
const failures=[];
const stableUrl=(key,value)=>{
 try{
  const url=new URL(value);
  if(url.protocol!=='https:'||/localhost|127\.0\.0\.1|\.trycloudflare\.com$|\.exp\.direct$|\.ngrok(-free)?\.(app|io)$/.test(url.hostname))throw Error();
 }catch{failures.push(`${key} must be a stable public HTTPS URL.`);}
};
if(process.env.EAS_BUILD_PROFILE==='production'){
 stableUrl('EXPO_PUBLIC_API_URL',process.env.EXPO_PUBLIC_API_URL);
 stableUrl('EXPO_PUBLIC_SUPABASE_URL',process.env.EXPO_PUBLIC_SUPABASE_URL);
 if(!process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY)failures.push('Supabase public key is missing.');
 if(process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL!=='fairway://account')failures.push('Installed-app auth callback must be fairway://account.');
 if(process.env.EAS_BUILD_PLATFORM==='android'&&!process.env.GOOGLE_MAPS_ANDROID_API_KEY)failures.push('Android Maps key is missing.');
 if(failures.length){console.error(failures.join('\n'));process.exit(1);}
 console.log('Store build configuration passed. External services still require acceptance testing.');
}else console.log('Preview build: production configuration gate skipped.');
