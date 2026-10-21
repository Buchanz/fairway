import {useEffect,useState} from 'react';
import {AppState,Text} from 'react-native';
import {authClient} from '../auth/client';
import {useAuth} from '../auth/AuthProvider';
import {GlassPanel,GlassPressable} from './Glass';
import type {Round} from '../lib/rounds';
type Result={name:string;playerIndex:number;flippedAt:string};
export function RoundGroup({ownerId,round}:{ownerId?:string;round:Round}){
 const {session}=useAuth();
 const [result,setResult]=useState<Result|null>(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const isOwner=!ownerId||ownerId===session?.user.id;
 useEffect(()=>{
  if(!ownerId||!authClient)return;
  let alive=true,running=false;
  const load=async()=>{if(running||AppState.currentState!=='active')return;running=true;try{const {data,error}=await authClient!.rpc('live_round_flip',{owner:ownerId,game:round.id});if(alive&&!error)setResult(data);}catch{/* Keep the last synced view during a temporary connection loss. */}finally{running=false;}};
  void load();const timer=setInterval(()=>void load(),3000);
  return()=>{alive=false;clearInterval(timer);};
 },[ownerId,round.id]);
 async function flip(){
  if(busy||round.names.length<2)return;setBusy(true);setMessage('');
  try{
   if(ownerId&&authClient){const {data,error}=await authClient.rpc('live_round_flip',{owner:ownerId,game:round.id,do_flip:true});if(error)throw Error(error.message);setResult(data);}
   else {const playerIndex=Math.floor(Math.random()*round.names.length);setResult({name:round.names[playerIndex],playerIndex,flippedAt:new Date().toISOString()});}
  }catch(e){setMessage(e instanceof Error?e.message:'Could not flip. Try again.');}finally{setBusy(false);}
 }
 return <GlassPanel style={{backgroundColor:'#E8EEDD',padding:16,borderRadius:24,gap:14}}>
 <Text style={{color:'#183C32'}}>{round.names.join(' · ')}</Text>
 {result&&<Text accessibilityLiveRegion="polite" style={{fontSize:24,fontWeight:'700',color:'#183C32'}}>{result.name} goes first</Text>}
 {round.names.length<2?<Text>Add another player before starting to flip a tee.</Text>:isOwner?<GlassPressable accessibilityRole="button" disabled={busy} onPress={()=>void flip()} style={{backgroundColor:'#C5EB65',borderRadius:24,padding:14,alignItems:'center'}}><Text style={{fontWeight:'600',color:'#183C32'}}>{busy?'Flipping…':'Flip a Tee'}</Text></GlassPressable>:<Text>The scorekeeper flips. The result appears here for everyone.</Text>}
 {!!message&&<Text accessibilityRole="alert">{message}</Text>}
 </GlassPanel>;
}
