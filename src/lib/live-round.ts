import {useEffect,useState} from 'react';
import {AppState} from 'react-native';
import {authClient} from '../auth/client';
// Prevent a friend's round from covering a round this device is already scoring.
export let scoringOwnRound=false;
export function useLiveRoundHost(roundId:string, hole:number, enabled:boolean){
 const [error,setError]=useState('');
 useEffect(()=>{if(!enabled)return;scoringOwnRound=true;return()=>{scoringOwnRound=false;};},[enabled,roundId]);
 useEffect(()=>{
  if(!enabled||!authClient)return;
  let running=false,alive=true;
  const ping=async()=>{if(running||AppState.currentState!=='active')return;running=true;try{const {error}=await authClient!.rpc('live_round_ping',{game:roundId,current_hole:hole});if(alive)setError(error?'Live round sync is waiting. Check your connection.':'');}catch{if(alive)setError('Live round sync is waiting. Check your connection.');}finally{running=false;}};
  void ping();const timer=setInterval(()=>void ping(),10000);
  const listener=AppState.addEventListener('change',state=>{if(state==='active')void ping();});
  return()=>{alive=false;clearInterval(timer);listener.remove();};
 },[enabled,roundId,hole]);
 return enabled?error:'';
}
