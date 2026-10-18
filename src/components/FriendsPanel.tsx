import {avatarUrl} from '../lib/avatar-cache';
import {useCallback,useEffect,useState} from 'react';
import {Image,Text,View,StyleSheet,Switch} from 'react-native';
import {useFocusEffect,router} from 'expo-router';
import {GlassPanel,GlassPressable} from './Glass';
import {useAuth} from '../auth/AuthProvider';
import {authClient} from '../auth/client';
import {listFriends,requestFriend,acceptFriend,setFriendSharing,type Friend} from '../lib/friends';
import {SearchField} from './SearchField';
import {courses} from '../data/courses';
const panelCache=new Map<string,{friends:Friend[];invites:{id:string;owner_id:string}[]}>();
export function FriendsPanel({onRoundsChanged}:{onRoundsChanged:()=>void}){
 const {session}=useAuth(),id=session?.user.id;
 const [friends,setFriends]=useState<Friend[]>(()=>id?panelCache.get(id)?.friends||[]:[]),[code,setCode]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const [results,setResults]=useState<{user_id:string;username:string;photo:string|null}[]>([]),[searchMessage,setSearchMessage]=useState('');
 useEffect(()=>{
  let active=true;const query=code.trim().replace(/^@/,'').toLowerCase();
  const timer=setTimeout(()=>{void(async()=>{
   setResults([]);setSearchMessage('');if(!id||query.length<3||!authClient)return;
   const {data,error}=await authClient.rpc('search_players',{search_username:query});
   if(!active)return;if(error){setSearchMessage('Search could not load. Please try again.');return;}
   const rows=(data||[]) as {user_id:string;username:string;avatar_path:string|null}[];
   setResults(rows.map(row=>({...row,photo:null})));if(!rows.length)setSearchMessage('No matching usernames.');
   await Promise.all(rows.map(async row=>{const photo=row.avatar_path?await avatarUrl(row.avatar_path).catch(()=>null):null;if(active)setResults(current=>current.map(person=>person.user_id===row.user_id?{...person,photo}:person));}));
  })();},250);
  return()=>{active=false;clearTimeout(timer);};
 },[code,id]);
 const [invites,setInvites]=useState<{id:string;owner_id:string}[]>(()=>id?panelCache.get(id)?.invites||[]:[]);
 const [performance,setPerformance]=useState<{name:string;rows:{course_id:string;played_at:string;holes:number;total:number}[]}|null>(null);
 const load=useCallback(async()=>{if(!id||!authClient)return;const [f,i]=await Promise.all([listFriends(id),authClient.from('round_invitations').select('id,owner_id').eq('recipient',id).eq('accepted',false)]);if(i.error)throw i.error;panelCache.set(id,{friends:f,invites:i.data});setFriends(f);setInvites(i.data);},[id]);
 useFocusEffect(useCallback(()=>{void load().catch(()=>setMessage('Friends could not be loaded. Check your account connection.'));},[load]));
 async function act(action:()=>Promise<void>){if(busy)return;setBusy(true);setMessage('');try{await action();await load();}catch(e){setMessage(e instanceof Error?e.message:'Could not save. Please retry.');}finally{setBusy(false);}}
 const shareToggle=(friend:Friend)=><Switch accessibilityLabel={`Share my completed scores with ${friend.name}`} disabled={busy} value={friend.sharing} trackColor={{true:'#175D3D'}} onValueChange={value=>void act(()=>setFriendSharing(friend.id,value))}/>;
 const button=(title:string,action:()=>Promise<void>)=><GlassPressable disabled={busy} onPress={()=>void act(action)} style={s.button}><Text style={s.action}>{title}</Text></GlassPressable>;
 return <View style={{gap:8}}><Text style={s.title}>Friends</Text>{!!id&&<SearchField accessibilityLabel="Friend username" placeholder="Search usernames" value={code} onChangeText={value=>{setCode(value);setResults([]);setSearchMessage('');}} autoCapitalize="none" autoCorrect={false} returnKeyType="search"/>}<GlassPanel style={s.card}>
  {!id?<><Text style={s.text}>Sign in to connect with friends and share completed rounds.</Text><GlassPressable onPress={()=>router.navigate('/account')} style={s.button}><Text style={s.action}>Sign in</Text></GlassPressable></>:<>

   {results.map(person=><View key={person.user_id} style={{flexDirection:'row',alignItems:'center',gap:12}}>{person.photo?<Image source={{uri:person.photo}} style={{width:44,height:44,borderRadius:22}}/>:<View style={{width:44,height:44,borderRadius:22,backgroundColor:'#d5dfd6',alignItems:'center',justifyContent:'center'}}><Text style={s.title}>{person.username[0].toUpperCase()}</Text></View>}<View style={{flex:1}}><Text style={s.title}>@{person.username}</Text><Text style={s.text}>Share my rounds</Text></View>{friends.find(f=>f.id===person.user_id)?shareToggle(friends.find(f=>f.id===person.user_id)!):null}{button(friends.some(f=>f.id===person.user_id)?'Connected':'Add friend',async()=>{await requestFriend(person.username);setMessage('Request sent.');})}</View>)}
   {!!searchMessage&&<Text style={s.text}>{searchMessage}</Text>}
   {friends.map(f=><View key={f.connectionId} style={{gap:6}}><View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}><View><Text style={s.title}>@{f.name}</Text><Text style={s.text}>Share my rounds</Text></View>{shareToggle(f)}</View>{f.accepted?button('View rounds',async()=>{const result=await authClient!.rpc('friend_performances',{friend:f.id});if(result.error)throw result.error;setPerformance({name:f.name,rows:result.data});}):f.incoming?button('Accept request',()=>acceptFriend(f.connectionId)):<Text style={s.text}>Request sent</Text>}{button(f.accepted?'Remove friend':'Dismiss request',async()=>{const {error}=await authClient!.from('friendships').delete().eq('id',f.connectionId);if(error)throw error;setPerformance(null);})}</View>)}
   {invites.map(invite=><View key={invite.id}><Text style={s.text}>Completed scorecard from {friends.find(f=>f.id===invite.owner_id)?.name||'a golfer'}</Text>{button('Add my scorecard to history',async()=>{const {error}=await authClient!.rpc('accept_round_invitation',{invitation:invite.id});if(error)throw error;setMessage('Added to your history.');onRoundsChanged();})}</View>)}
   {performance&&<View style={{gap:8}}><Text style={s.title}>{performance.name}’s rounds</Text>{!performance.rows.length&&<Text style={s.text}>No shared completed rounds.</Text>}{performance.rows.map((r,i)=><Text key={i} style={s.text}>{courses.find(c=>c.id===r.course_id)?.name||r.course_id} · {new Date(r.played_at).toLocaleDateString()} · {r.total} strokes / {r.holes} holes</Text>)}</View>}
  </>}{!!message&&<Text accessibilityRole="alert" style={s.text}>{message}</Text>}
 </GlassPanel></View>;
}
const s=StyleSheet.create({title:{fontSize:16,fontWeight:'600',color:'#183C32'},text:{fontSize:13,color:'#52675C'},card:{padding:18,gap:12,borderRadius:24,backgroundColor:'#E8EEDD'},button:{padding:12,borderRadius:24,backgroundColor:'#C5EB65',alignItems:'center'},action:{color:'#183C32',fontWeight:'600'}});
