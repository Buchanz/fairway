import {useEffect,useState} from 'react';
import {AppState,Modal,Platform} from 'react-native';
import {useAuth} from '../auth/AuthProvider';
import {authClient} from '../auth/client';
import {scoringOwnRound} from '../lib/live-round';
import {validRounds,type Round} from '../lib/rounds';
import {courses} from '../data/courses';
import MobileRound from './MobileRound';
type Live={ownerId:string;round:Round;hole:number};
export function LiveRoundArrival(){
 const {session}=useAuth();
 if(!session||Platform.OS==='web')return null;
 return <SignedInArrival key={session.user.id}/>;
}
function SignedInArrival(){
 const [live,setLive]=useState<Live|null>(null),[dismissed,setDismissed]=useState<string|null>(null);
 useEffect(()=>{
  if(!authClient)return;
  let alive=true,running=false;
  const load=async()=>{
   if(running||AppState.currentState!=='active'||scoringOwnRound)return;running=true;
   try{
    const {data,error}=await authClient!.rpc('my_live_round');
    if(!alive||error)return;
    if(data&&validRounds([data.round])&&Number.isInteger(data.hole)&&data.hole>=0&&data.hole<data.round.scores[0].length)setLive(data);
    else setLive(null);
   }catch{/* Keep the last synced view during a temporary connection loss. */}finally{running=false;}
  };
  void load();const timer=setInterval(()=>void load(),4000);
  const listener=AppState.addEventListener('change',state=>{if(state==='active')void load();});
  return()=>{alive=false;clearInterval(timer);listener.remove();};
 },[]);
 const course=courses.find(c=>c.id===live?.round.courseId);
 if(!live||!course||dismissed===`${live.ownerId}:${live.round.id}`||scoringOwnRound)return null;
 return <Modal visible presentationStyle="fullScreen" animationType="fade" onRequestClose={()=>setDismissed(`${live.ownerId}:${live.round.id}`)}>
  <MobileRound key={`${live.ownerId}:${live.round.id}`} round={live.round} ownerId={live.ownerId} spectator course={course} hole={live.hole} onHole={()=>{}} onScore={()=>{}} onClose={()=>setDismissed(`${live.ownerId}:${live.round.id}`)} onFinish={async()=>false} saving={false} saveError=""/>
 </Modal>;
}
