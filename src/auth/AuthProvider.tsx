import {readCloudRounds} from '../lib/cloud-rounds';
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {AppState,Platform} from 'react-native';
import type {Session} from '@supabase/supabase-js';
import {authClient} from './client';
const Context=createContext<{session:Session|null;ready:boolean;error:string}>({session:null,ready:false,error:''});
export function AuthProvider({children}:{children:ReactNode}){
 const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(!authClient),[error,setError]=useState('');
 useEffect(()=>{
  if(!authClient)return;
  let alive=true,receivedEvent=false;
  const {data:{subscription}}=authClient.auth.onAuthStateChange((_event,next)=>{if(alive){receivedEvent=true;setSession(next);setReady(true);}});
  authClient.auth.getSession().then(({data,error})=>{if(alive&&!receivedEvent){if(error)setError('Could not restore your session. Please sign in again.');setSession(data.session);setReady(true);}}).catch(()=>{if(alive){setError('Could not restore your session.');setReady(true);}});
  const listener=Platform.OS!=='web'?AppState.addEventListener('change',state=>{if(state==='active')authClient?.auth.startAutoRefresh();else authClient?.auth.stopAutoRefresh();}):null;
  return()=>{alive=false;subscription.unsubscribe();listener?.remove();};
 },[]);
 useEffect(()=>{if(session?.user.id)void readCloudRounds(session.user.id).catch(()=>{});},[session?.user.id]);
 return <Context.Provider value={{session,ready,error}}>{children}</Context.Provider>;
}
export const useAuth=()=>useContext(Context);
