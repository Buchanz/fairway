import {useEffect,useRef,useState} from 'react';
import {AppState,Text,View} from 'react-native';
import * as Location from 'expo-location';
import {authClient} from '../auth/client';
import {useAuth} from '../auth/AuthProvider';
import {GlassPanel,GlassPressable} from './Glass';
import {scoreTotal,type Round} from '../lib/rounds';
import {CoursePhoto} from './CoursePhoto';
import {courses} from '../data/courses';
type Group={owner_id:string;round_id:string;course_id:string;names:string[]};
type State={active:number;result:null|{name:string;winner:string;flippedAt:string}};
const button={backgroundColor:'#C5EB65',borderRadius:24,padding:12,alignItems:'center' as const};
export function RoundGroup({ownerId,roundId}:{ownerId:string;roundId:string}){
 const {session}=useAuth();
 const [joined,setJoined]=useState(false),[state,setState]=useState<State|null>(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{
  if(!joined||!authClient)return;
  let alive=true,running=false,lastPosition=0;
  async function tick(){
   if(running||AppState.currentState!=='active')return;running=true;
   try{
    let coords:{latitude:number;longitude:number}|undefined;
    if(Date.now()-lastPosition>15000){
     const permission=await Location.getForegroundPermissionsAsync();
     if(!permission.granted)throw Error('Enable location to join the tee flip.');
     const fix=await Location.getLastKnownPositionAsync({maxAge:30000,requiredAccuracy:100});
     if(!fix)throw Error('Waiting for a recent GPS fix. Open the rangefinder or enable precise location.');
     coords=fix.coords;lastPosition=Date.now();
    }
    if(!alive)return;
    const {data,error}=await authClient!.rpc('round_group_state',{owner:ownerId,game:roundId,...(coords?{lat:coords.latitude,lng:coords.longitude}:{})});
    if(error)throw Error(error.code==='PGRST202'?'Group rounds are awaiting the account database update.':error.message);
    if(alive){setState(data);setMessage('');}
   }catch(e){if(alive)setMessage(e instanceof Error?e.message:'Group connection failed.');}finally{running=false;}
  }
  void tick();const timer=setInterval(()=>void tick(),3000);
  // A foreground watch keeps GPS fresh without sharing background location.
  let watch:Location.LocationSubscription|undefined;
  void Location.watchPositionAsync({accuracy:Location.Accuracy.Balanced,timeInterval:10000,distanceInterval:10},()=>{}).then(value=>{if(alive)watch=value;else value.remove();}).catch(()=>{});
  return()=>{alive=false;clearInterval(timer);watch?.remove();};
 },[joined,ownerId,roundId]);
 async function join(){const p=await Location.requestForegroundPermissionsAsync();if(p.granted)setJoined(true);else setMessage('Location is needed to confirm the group is together.');}
 async function flip(){if(busy||!authClient)return;setBusy(true);try{const {data,error}=await authClient.rpc('round_group_state',{owner:ownerId,game:roundId,flip:true});if(error)throw error;setState(data);setMessage('');}catch(e){setMessage(e instanceof Error?e.message:String((e as {message?:string})?.message||'Could not flip.'));}finally{setBusy(false);}}
 return <GlassPanel style={{backgroundColor:'#E8EEDD',padding:16,borderRadius:24,gap:10}}><Text style={{fontWeight:'600',color:'#183C32'}}>Flip a tee</Text>
 {!joined?<><Text>Join with location enabled. Your scorekeeper’s completed scorecard will be saved to your account.</Text><GlassPressable style={button} onPress={()=>void join().catch(()=>setMessage('Could not request location.'))}><Text>Join group</Text></GlassPressable></>:<>
 <Text>{state?.active||0} players active · stay within 200 m</Text>
 {state?.result&&<Text accessibilityLiveRegion="polite" style={{fontSize:22,fontWeight:'700',color:'#183C32'}}>{state.result.name} goes first</Text>}
 {session?.user.id===ownerId?<GlassPressable style={button} disabled={busy} onPress={()=>void flip()}><Text>{busy?'Flipping…':'Flip a tee'}</Text></GlassPressable>:<Text>The scorekeeper flips; the same result appears here.</Text>}
 </>}{!!message&&<Text accessibilityRole="alert">{message}</Text>}</GlassPanel>;
}
export function ActiveRoundGroups({onCompleted,onCount,rounds=[]}:{onCompleted?:()=>void;onCount?:(count:number)=>void;rounds?:Round[]}){
 const known=useRef<string[]>([]);
 const {session}=useAuth();const [groups,setGroups]=useState<Group[]>([]),[open,setOpen]=useState<string|null>(null);
 useEffect(()=>{if(!session||!authClient)return;let alive=true;const load=async()=>{if(AppState.currentState!=='active')return;const {data,error}=await authClient!.rpc('my_active_groups');if(alive&&!error){const next=(data||[]) as Group[];if(known.current.some(id=>!next.some(g=>`${g.owner_id}:${g.round_id}`===id)))onCompleted?.();known.current=next.map(g=>`${g.owner_id}:${g.round_id}`);setGroups(next);onCount?.(next.length);}};void load();const timer=setInterval(()=>void load(),15000);return()=>{alive=false;clearInterval(timer);};},[session,onCompleted,onCount]);
 if(!groups.length)return null;
 return <View style={{gap:8}}>{groups.map(g=><View key={`${g.owner_id}:${g.round_id}`} style={{gap:8}}><GlassPanel style={{borderRadius:24,overflow:'hidden',backgroundColor:'#E8EEDD'}}><GlassPressable onPress={()=>setOpen(open===g.round_id?null:g.round_id)} accessibilityLabel="Open group round"><CoursePhoto courseId={g.course_id} style={{width:'100%',height:150}}/><View style={{padding:16,gap:6}}><Text style={{fontSize:18,fontWeight:'600',color:'#183C32'}}>{courses.find(c=>c.id===g.course_id)?.name||g.course_id}</Text><Text style={{color:'#52675C'}}>Active round</Text><Text style={{color:'#183C32'}}>{g.names.map((name,i)=>{const round=g.owner_id===session?.user.id?rounds.find(r=>r.id===g.round_id):undefined;const score=round?.scores[i]?scoreTotal(round.scores[i]):null;return `${name}${score?` · ${score.total} strokes (${score.played} holes)`:''}`;}).join('\n')}</Text><Text style={{color:'#52675C'}}>Open group and tee flip</Text></View></GlassPressable></GlassPanel>{open===g.round_id&&<RoundGroup ownerId={g.owner_id} roundId={g.round_id}/>}</View>)}</View>;
}
