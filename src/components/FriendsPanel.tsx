import {PlayerIdentity} from './PlayerIdentity';
import {MenuOverlay,type MenuAnchor} from './MenuOverlay';
import {SymbolView} from 'expo-symbols';
import {avatarUrl} from '../lib/avatar-cache';
import {useCallback,useEffect,useRef,useState} from 'react';
import {Image,Text,View,StyleSheet,Switch} from 'react-native';
import {useFocusEffect,router} from 'expo-router';
import {GlassPressable} from './Glass';
import {useAuth} from '../auth/AuthProvider';
import {authClient} from '../auth/client';
import {listFriends,requestFriend,acceptFriend,setFriendSharing,type Friend} from '../lib/friends';
import {SearchField} from './SearchField';
import {courses} from '../data/courses';
const panelCache=new Map<string,{friends:Friend[];invites:{id:string;owner_id:string}[]}>();
export function FriendsPanel({onRoundsChanged}:{onRoundsChanged?:()=>void}={}){
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
 const button=(title:string,action:()=>Promise<void>)=><GlassPressable disabled={busy} onPress={()=>void act(action)} style={s.button}><Text style={s.action}>{title}</Text></GlassPressable>;
 const hasContent=!id||results.length>0||!!searchMessage||friends.length>0||invites.length>0||!!performance||!!message;
 return <View style={{gap:8}}><Text style={s.title}>Friends</Text>{!!id&&<SearchField accessibilityLabel="Friend username" placeholder="Search usernames" value={code} onChangeText={value=>{setCode(value);setResults([]);setSearchMessage('');}} autoCapitalize="none" autoCorrect={false} returnKeyType="search"/>}{!hasContent&&<Text style={s.text}>Search a username to send a friend request.</Text>}{hasContent&&<View style={{gap:12}}>
  {!id?<><Text style={s.text}>Sign in to connect with friends and share completed rounds.</Text><GlassPressable onPress={()=>router.navigate('/account')} style={s.button}><Text style={s.action}>Sign in</Text></GlassPressable></>:<>

   {results.map(person=><View key={person.user_id} style={{flexDirection:'row',alignItems:'center',gap:12}}>{person.photo?<Image source={{uri:person.photo}} style={{width:44,height:44,borderRadius:22}}/>:<View style={{width:44,height:44,borderRadius:22,backgroundColor:'#d5dfd6',alignItems:'center',justifyContent:'center'}}><SymbolView name={{ios:'person.fill',android:'person',web:'person'}} size={24} tintColor="#557568"/></View>}<View style={{flex:1}}><Text style={s.title}>@{person.username}</Text></View>{friends.some(f=>f.id===person.user_id)?<Text style={s.text}>{friends.find(f=>f.id===person.user_id)?.accepted?'Friends':friends.find(f=>f.id===person.user_id)?.incoming?'Request received':'Request sent'}</Text>:button('Send request',async()=>{await requestFriend(person.username);setMessage('Request sent.');})}</View>)}
   {!!searchMessage&&<Text style={s.text}>{searchMessage}</Text>}
   {friends.some(f=>!f.accepted)&&<Text style={s.title}>Friend requests</Text>}{friends.some(f=>f.accepted)&&<Text style={s.text}>Accepted friends can be selected when starting a round.</Text>}{[...friends].sort((a,b)=>Number(a.accepted)-Number(b.accepted)).map(f=><FriendRow key={f.connectionId} friend={f} busy={busy} onShare={value=>act(()=>setFriendSharing(f.id,value))} onView={()=>act(async()=>{const result=await authClient!.rpc('friend_performances',{friend:f.id});if(result.error)throw result.error;setPerformance({name:f.displayName||f.name,rows:result.data});})} onAccept={()=>act(()=>acceptFriend(f.connectionId))} onRemove={()=>act(async()=>{const {error}=await authClient!.from('friendships').delete().eq('id',f.connectionId);if(error)throw error;setPerformance(null);})}/>)}
   {invites.map(invite=><View key={invite.id}><Text style={s.text}>Completed scorecard from {friends.find(f=>f.id===invite.owner_id)?.name||'a golfer'}</Text>{button('Add my scorecard to history',async()=>{const {error}=await authClient!.rpc('accept_round_invitation',{invitation:invite.id});if(error)throw error;setMessage('Added to your history.');onRoundsChanged?.();})}</View>)}
   {performance&&<View style={{gap:8}}><Text style={s.title}>{performance.name}’s rounds</Text>{!performance.rows.length&&<Text style={s.text}>No shared completed rounds.</Text>}{performance.rows.map((r,i)=><Text key={i} style={s.text}>{courses.find(c=>c.id===r.course_id)?.name||r.course_id} · {new Date(r.played_at).toLocaleDateString()} · {r.total} strokes / {r.holes} holes</Text>)}</View>}
  </>}{!!message&&<Text accessibilityRole="alert" style={s.text}>{message}</Text>}
 </View>}</View>;
}
function FriendRow({friend,busy,onShare,onView,onAccept,onRemove}:{friend:Friend;busy:boolean;onShare:(value:boolean)=>Promise<void>;onView:()=>Promise<void>;onAccept:()=>Promise<void>;onRemove:()=>Promise<void>}){
 const trigger=useRef<View>(null);
 const [anchor,setAnchor]=useState<MenuAnchor|null>(null),[open,setOpen]=useState(false);
 const close=useCallback(()=>setOpen(false),[]),exited=useCallback(()=>setAnchor(null),[]);
 const icon=<SymbolView name={{ios:'ellipsis',android:'more_horiz',web:'more_horiz'}} size={23} tintColor="#183C32"/>;
 return <View style={{gap:8,paddingVertical:12}}><View style={{flexDirection:'row',alignItems:'center',gap:12}}><PlayerIdentity name={friend.displayName||friend.name} username={friend.name} avatarPath={friend.avatarPath}/><GlassPressable ref={trigger} accessibilityRole="button" accessibilityLabel={`Options for ${friend.name}`} accessibilityState={{expanded:open}} onPress={()=>trigger.current?.measureInWindow((x,y,width,height)=>{setAnchor({x,y,width,height});setOpen(true);})} style={{width:44,height:44,borderRadius:22,backgroundColor:'#E8EEDD',alignItems:'center',justifyContent:'center',opacity:anchor?0:1}}>{icon}</GlassPressable></View>
 {!friend.accepted&&<Text style={s.text}>{friend.incoming?'Friend request received':'Request sent'}</Text>}
 {anchor&&<MenuOverlay open={open} anchor={anchor} onClose={close} onExited={exited} label="Friend options" preferredWidth={280} headerContent={<View style={{width:44,height:44,alignItems:'center',justifyContent:'center'}}>{icon}</View>}><View style={{padding:12,gap:12}}>
 {friend.accepted?<><GlassPressable disabled={busy} onPress={()=>{close();void onView();}} style={s.button}><Text style={s.action}>View rounds</Text></GlassPressable><View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8,paddingHorizontal:4}}><Text style={s.action}>Share my rounds</Text><Switch accessibilityLabel={`Share rounds with ${friend.name}`} disabled={busy} value={friend.sharing} trackColor={{true:'#175D3D'}} onValueChange={value=>void onShare(value)}/></View></>:friend.incoming?<GlassPressable disabled={busy} onPress={()=>{close();void onAccept();}} style={s.button}><Text style={s.action}>Accept request</Text></GlassPressable>:null}
 <GlassPressable disabled={busy} onPress={()=>{close();void onRemove();}} style={[s.button,{backgroundColor:'#E8EEDD'}]}><Text style={[s.action,{color:'#B83232'}]}>{friend.accepted?'Remove friend':friend.incoming?'Decline request':'Cancel request'}</Text></GlassPressable>
 </View></MenuOverlay>}
 </View>;
}
const s=StyleSheet.create({title:{fontSize:16,fontWeight:'600',color:'#183C32'},text:{fontSize:13,color:'#52675C'},card:{padding:18,gap:12,borderRadius:24,backgroundColor:'#E8EEDD'},button:{padding:12,borderRadius:24,backgroundColor:'#C5EB65',alignItems:'center'},action:{color:'#183C32',fontWeight:'600'}});
