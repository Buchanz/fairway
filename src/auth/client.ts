import {createClient,processLock} from '@supabase/supabase-js';
const url=process.env.EXPO_PUBLIC_SUPABASE_URL;
const key=process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
// Require an explicit sign-in each time the app starts. A session created after
// sign-in still remains available in memory for the current app session, but a
// previous user's token is never restored automatically on a shared device.
export const authClient=url&&key?createClient(url,key,{auth:{
  persistSession:false,autoRefreshToken:true,detectSessionInUrl:false,lock:processLock,
}}):null;
