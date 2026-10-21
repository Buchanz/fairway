import {SymbolView} from 'expo-symbols';
import {MenuOverlay,type MenuAnchor} from '../components/MenuOverlay';
import {PlayerIdentity} from '../components/PlayerIdentity';
import {useFocusEffect} from 'expo-router';
import {authClient} from '../auth/client';
import {courseHoles} from '../data/hole-layouts';
import {CoursePhoto} from '../components/CoursePhoto';
import {coursePhotos} from '../data/course-photos';
import {listFriends,type Friend} from '../lib/friends';
import {SearchField} from '../components/SearchField';
import {useHideTabs} from '../components/GlassTabs';
import {GlassInput as TextInput,GlassPressable as Pressable,GlassPanel} from '../components/Glass';
import {useCallback,useEffect,useRef,useState} from 'react';
import {Pressable as PlainPressable,ScrollView,View,Text,StyleSheet,Platform,Alert,Linking,Modal,KeyboardAvoidingView,Keyboard} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {distanceKm} from '../lib/geo';
import {Chip,colors} from '../components/ui';
import MobileRound from '../components/MobileRound';
import SwipeRound from '../components/SwipeRound';
import {courses} from '../data/courses';
import {courseTees,teeForRound,teeAppearance} from '../data/tees';

import {scoreTotal,isCompletedRound,endRound,type Round} from '../lib/rounds';
import {useAuth} from '../auth/AuthProvider';
import {cachedCloudRounds,readCloudRounds,writeCloudChanges} from '../lib/cloud-rounds';
import {loadRounds,saveRounds,stageRoundChanges,pendingRoundChanges,clearPendingRoundChanges} from '../lib/round-storage';
function newRoundId(){return Date.now().toString()+Math.random().toString(36).slice(2);}
export default function Play(){
 const {session,ready}=useAuth();
 if(!ready)return <SafeAreaView edges={['top','left','right']} style={s.screen}><Text>Opening your account…</Text></SafeAreaView>;
 return <PlaySetup key={session?.user.id||'guest'} userId={session?.user.id||null} accountName={session?.user.user_metadata.display_name||session?.user.user_metadata.username||'You'}/>;
}
function PlaySetup({userId,accountName}:{userId:string|null;accountName:string}){
 const {session}=useAuth();
 const roundCourses=courses;
 const [rounds,setRounds]=useState<Round[]>(()=>cachedCloudRounds(userId)||[]),[ready,setReady]=useState(false),[saveError,setSaveError]=useState('');
 const [active,setActive]=useState<string|null>(null),[courseId,setCourse]=useState('cedar-hill'),[count,setCount]=useState(1),[holes,setHoles]=useState(18),[names,setNames]=useState([accountName,'','','']),[hole,setHole]=useState(0);
 const [teeSelection,setTeeSelection]=useState<Record<string,string>>({});
 const [customTees,setCustomTees]=useState<Record<string,string>>({});
 const [friends,setFriends]=useState<Friend[]>([]),[playerIds,setPlayerIds]=useState<(string|null)[]>([userId,null,null,null]);

 const [panel,setPanel]=useState<'history'|null>(null),[query,setQuery]=useState('');
 useFocusEffect(useCallback(()=>{if(!userId)return;let alive=true;void listFriends(userId).then(rows=>{if(alive)setFriends(rows.filter(f=>f.accepted));}).catch(()=>{if(alive)setSaveError('Friends could not be loaded. Try adding the player again.');});return()=>{alive=false;};},[userId]));
 useEffect(()=>{let alive=true;async function identify(){let name=accountName;if(userId&&authClient){const {data}=await authClient.from('player_profiles').select('username').eq('user_id',userId).maybeSingle();if(data?.username)name=data.username;}if(alive)setNames(old=>[name,...old.slice(1)]);}void identify();return()=>{alive=false;};},[userId,accountName]);
 const [searching,setSearching]=useState(false);
 const [position,setPosition]=useState<{latitude:number;longitude:number}|null>(null);
 const [locationMessage,setLocationMessage]=useState('Finding your nearest course…');
 const [courseConfirmed,setCourseConfirmed]=useState(false);
 const choseCourse=useRef(false);
 useEffect(()=>{let alive=true;let timer:ReturnType<typeof setTimeout>|undefined;
  void (async()=>{try{
   let permission=await Location.getForegroundPermissionsAsync();
   if(!permission.granted&&permission.canAskAgain)permission=await Location.requestForegroundPermissionsAsync();
   if(!permission.granted)throw Error();
   const fix=await Promise.race([Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced}),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error()),10000);})]);
   if(!alive)return;setPosition(fix.coords);setLocationMessage(choseCourse.current?'Selected course':'Nearest course');
   if(!choseCourse.current){const nearest=[...courses].sort((a,b)=>distanceKm(fix.coords,a.location)-distanceKm(fix.coords,b.location))[0];if(nearest){setCourse(nearest.id);setHoles(nearest.holes===9?9:18);}}
  }catch{if(alive)setLocationMessage(choseCourse.current?'Selected course':'Choose a course · location unavailable');}finally{if(timer)clearTimeout(timer);}})();
  return()=>{alive=false;if(timer)clearTimeout(timer);};
 },[]);
 const entering=useRef(false);
 const [starting,setStarting]=useState(false);
 async function enterRound(action:()=>void){
  if(entering.current)return;
  entering.current=true;setStarting(true);Keyboard.dismiss();
  let granted=false;
  try{
   let permission=await Location.getForegroundPermissionsAsync();
   if(!permission.granted&&permission.canAskAgain)permission=await Location.requestForegroundPermissionsAsync();
   granted=permission.granted;
  }catch{/* GPS is optional; offer the map preview if permission lookup fails. */}
  finally{entering.current=false;setStarting(false);}
  if(granted){action();return;}
  Alert.alert('Location for your round','Allow location for live distances, or open the rangefinder in tee preview mode.',[{text:'Cancel',style:'cancel'},{text:'Open Settings',onPress:()=>void Linking.openSettings()},{text:'Continue with preview',onPress:action}]);
 }

 const [finishing,setFinishing]=useState(false);
 const queue=useRef(Promise.resolve());
 const localQueue=useRef(Promise.resolve());
 const confirmed=useRef<Round[]>([]);
 const [reload,setReload]=useState(0);
 useEffect(()=>{let alive=true;
  (async()=>{if(!userId)return loadRounds(AsyncStorage,null);const pending=await pendingRoundChanges(AsyncStorage,userId);if(pending){await writeCloudChanges(userId,pending.before,pending.after);await clearPendingRoundChanges(AsyncStorage,userId,pending.after);}return readCloudRounds(userId);})().then(saved=>{if(!alive)return;confirmed.current=saved;setRounds(saved);setReady(true);setSaveError('');}).catch(()=>{if(alive)setSaveError(userId?'Your rounds could not be loaded. Check your connection and retry.':'Saved rounds could not be opened. Existing data has not been overwritten.');});
  return()=>{alive=false;};
 },[userId,reload]);
 function update(next:Round[]){
  setRounds(next);
  const staged=userId?(localQueue.current=localQueue.current.catch(()=>{}).then(()=>stageRoundChanges(AsyncStorage,userId,confirmed.current,next))):Promise.resolve();
  void staged.catch(()=>{});
  queue.current=queue.current.catch(()=>{}).then(async()=>{
   if(userId){await staged;await writeCloudChanges(userId,confirmed.current,next);await (localQueue.current=localQueue.current.catch(()=>{}).then(()=>clearPendingRoundChanges(AsyncStorage,userId,next)));}
   else await saveRounds(AsyncStorage,null,next);
   confirmed.current=next;setSaveError('');
  }).catch(()=>{setSaveError('Your changes have not been saved. Check your connection and tap Retry before leaving.');throw Error('Save failed');});
  void queue.current.catch(()=>{});
  return queue.current;
 }
 function deleteRound(id:string){Alert.alert('Delete this round?', 'This removes its scores from this device.', [{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>update(rounds.filter(r=>r.id!==id))}]);}
 const selectedCourseId=roundCourses.some(c=>c.id===courseId)?courseId:roundCourses[0]?.id;
 const round=rounds.find(r=>r.id===active),course=courses.find(c=>c.id===(round?.courseId||selectedCourseId))||courses[0];
 function start(){if(!ready||!selectedCourseId||!courseConfirmed)return;if(names.slice(1,count).some(n=>!n.trim())){Alert.alert('Add your players','Choose a username or enter a guest name for each player.');return;}const tee=teeForRound(selectedCourseId,teeSelection[selectedCourseId]||courseTees[selectedCourseId]?.[0]?.id);const r:Round={playerIds:playerIds.slice(0,count),teeId:tee?.id,teeName:tee?.name||customTees[selectedCourseId]?.trim()||undefined,id:newRoundId(),courseId:selectedCourseId,date:new Date().toISOString(),names:names.slice(0,count).map((n,i)=>n.trim()||`Player ${i+1}`),scores:Array.from({length:count},()=>Array(holes).fill(null)),finished:false};update([r,...rounds]);setActive(r.id);setHole(0);}
 function change(player:number,delta:number){if(!round)return;const next={...round,scores:round.scores.map((scores,i)=>i===player?scores.map((v,h)=>h===hole?delta===0?null:Math.min(30,Math.max(1,(v??(delta>0?0:2))+delta)):v):scores)};update(rounds.map(r=>r.id===round.id?next:r));}
 useHideTabs(!!round);
 if(round && Platform.OS!=='web') return <MobileRound round={round} course={course} hole={hole} onHole={setHole} onScore={change} onClose={()=>setActive(null)} onFinish={async()=>{if(finishing)return false;setFinishing(true);try{await update(endRound(rounds,round.id));return true;}catch{return false;}finally{setFinishing(false);}}} saving={finishing} saveError={saveError}/>;
 const tees=courseTees[course.id]||[];
 const selectedTee=teeSelection[course.id]||(tees[0]?.id||'');
 const history=rounds.filter(r=>r.courseId===course.id&&isCompletedRound(r));
 const results=query.trim()?roundCourses.filter(c=>`${c.name} ${c.municipality}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>position?distanceKm(position,a.location)-distanceKm(position,b.location):a.name.localeCompare(b.name)):[];
 function choose(id:string){setCourseConfirmed(true);choseCourse.current=true;setLocationMessage('Selected course');setCourse(id);setHoles(courses.find(c=>c.id===id)?.holes===9?9:18);setPanel(null);setQuery('');setSearching(false);Keyboard.dismiss();}
 return <SafeAreaView edges={['top','left','right']} style={s.screen}>
  <View style={s.fixedHeader}>
   <View style={{height:44,alignItems:'center',justifyContent:'center'}}><Text style={s.heading}>Start a round</Text></View>

   <View style={{zIndex:30}}><SearchField value={query} onFocus={()=>setSearching(true)} onChangeText={setQuery} autoCorrect={false} returnKeyType="search"/>
    {searching&&!!query.trim()&&<GlassPanel style={s.searchResults}><ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled showsVerticalScrollIndicator={false} contentContainerStyle={s.searchResultsContent}>{results.map(c=><View key={c.id} style={s.resultShadow}><Pressable accessibilityRole="button" accessibilityLabel={`Select ${c.name}`} onPress={()=>choose(c.id)} style={s.courseResult}><CoursePhoto courseId={c.id} style={s.thumbnail}/><View style={s.resultCopy}><Text style={s.heading}>{c.name}</Text><Text style={s.muted}>{c.municipality}</Text><Text style={s.muted}>{courseHoles[c.id]?'Hole-by-hole GPS':'Manual map · hole mapping pending'}</Text></View></Pressable></View>)}{!results.length&&<Text style={s.muted}>No matching courses.</Text>}</ScrollView></GlassPanel>}
   </View>
  </View>
  <ScrollView style={{flex:1}} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={s.page}>
   {!!saveError&&<View><Text accessibilityRole="alert" style={s.error}>{saveError}</Text><Pressable onPress={()=>ready?update(rounds):setReload(n=>n+1)}><Text style={s.link}>Retry</Text></Pressable></View>}
   <Text style={s.heading}>Course Selection</Text>
   <GlassPanel style={[s.card,{overflow:'hidden'}]}>
    {!!coursePhotos[course.id]&&<CoursePhoto key={course.id} courseId={course.id} style={StyleSheet.absoluteFill}/>}
    <View style={[{alignSelf:'flex-start',gap:3},!!coursePhotos[course.id]&&s.photoCopy]}>
    <Text style={[s.eyebrow,!!coursePhotos[course.id]&&s.photoText]}>{locationMessage}</Text>
    <Text numberOfLines={1} adjustsFontSizeToFit style={[s.courseName,!!coursePhotos[course.id]&&s.photoText]}>{course.name}</Text>
    <Text style={[s.muted,!!coursePhotos[course.id]&&s.photoText]}>{course.municipality}{position?` · ${distanceKm(position,course.location).toFixed(1)} km away`:''}</Text>
    </View>
    <View style={s.row}><Pressable accessibilityRole="button" onPress={()=>setPanel('history')} style={[s.history,!!coursePhotos[course.id]&&{backgroundColor:'#12231ecc',paddingHorizontal:12,borderRadius:20}]}><Text style={[s.link,!!coursePhotos[course.id]&&s.photoText]}>History ({history.length}) ›</Text></Pressable><Pressable accessibilityRole="button" accessibilityState={{selected:courseConfirmed}} onPress={()=>choose(course.id)} style={{borderRadius:24,paddingHorizontal:20,paddingVertical:12,backgroundColor:colors.lime}}><Text style={s.white}>{courseConfirmed?'Selected':'Select'}</Text></Pressable></View>
   </GlassPanel>
   {!courseHoles[course.id]&&<Text style={s.muted}>Hole mapping pending. Scorekeeping and manual map measurements are available.</Text>}
   <View style={s.selectionGroup}><Text style={s.heading}>Holes</Text><View style={s.options}>{[9,18].map(n=><Chip key={n} label={`${n} Holes`} selected={holes===n} onPress={()=>setHoles(n)}/>)}</View></View>
   <View style={s.selectionGroup}><Text style={s.heading}>Tees</Text>
    {tees.length?<View style={s.options}>{tees.map(tee=><Pressable key={tee.id} accessibilityRole="button" accessibilityLabel={`${tee.name} tees`} accessibilityState={{selected:selectedTee===tee.id}} onPress={()=>setTeeSelection(p=>({...p,[course.id]:tee.id}))} style={[s.teeButton,{backgroundColor:teeAppearance(tee.id).background},selectedTee!==tee.id&&{opacity:0.55}]}><Text style={[s.teeText,{color:teeAppearance(tee.id).text}]}>{tee.name}</Text></Pressable>)}</View>:<TextInput accessibilityLabel="Tee name or colour" placeholder="Tee name or colour (optional)" maxLength={40} value={customTees[course.id]||''} onChangeText={v=>setCustomTees(p=>({...p,[course.id]:v}))} style={[s.input,{width:240}]}/>}

   </View>
   <View style={[s.row,{width:'100%'}]}><Text style={s.heading}>Players</Text><View style={{flexDirection:'row',alignItems:'center',gap:8}}><PlainPressable accessibilityRole="button" accessibilityLabel="Remove player" disabled={count===1} onPress={()=>setCount(n=>Math.max(1,n-1))} style={{width:44,height:44,alignItems:'center',justifyContent:'center',opacity:count===1?0.35:1}}><Text style={[s.heading,{fontSize:24}]}>−</Text></PlainPressable><Text accessibilityLiveRegion="polite" style={s.heading}>{count}</Text><PlainPressable accessibilityRole="button" accessibilityLabel="Add player" disabled={count===4} onPress={()=>setCount(n=>Math.min(4,n+1))} style={{width:44,height:44,alignItems:'center',justifyContent:'center',opacity:count===4?0.35:1}}><Text style={[s.heading,{fontSize:24}]}>＋</Text></PlainPressable></View></View>
   {names.slice(0,count).map((name,i)=>i===0?<GlassPanel key={i} interactive style={{paddingHorizontal:18,paddingVertical:14,borderRadius:28,backgroundColor:'#E8EEDD'}}><PlayerIdentity name={session?.user.user_metadata.display_name||name} username={userId&&name!=='You'?name:undefined} avatarPath={session?.user.user_metadata.avatar_path}/></GlassPanel>:<PlayerRow key={`${i}:${playerIds[i]||'guest'}`} index={i} name={name} playerId={playerIds[i]} friends={friends.filter(f=>!playerIds.includes(f.id)||playerIds[i]===f.id)} onRemove={()=>{setNames(old=>[...old.filter((_,j)=>j!==i),''].slice(0,4));setPlayerIds(old=>[...old.filter((_,j)=>j!==i),null].slice(0,4));setCount(old=>Math.max(1,old-1));}} onChange={(next,id)=>{setNames(old=>old.map((v,j)=>j===i?next:v));setPlayerIds(old=>old.map((v,j)=>j===i?id:v));}}/>)}
   <View style={{flex:1,minHeight:4}}/>
   <Pressable accessibilityRole="button" disabled={starting||!ready||!selectedCourseId||!courseConfirmed} onPress={()=>void enterRound(start)} style={[s.primary,(!ready||!selectedCourseId||!courseConfirmed)&&{opacity:0.4}]}><Text style={s.white}>{starting?'Opening round…':!ready?'Opening saved rounds…':!courseConfirmed?'Select a course above':'Start Round'}</Text></Pressable>
  </ScrollView>
  
  <Modal allowSwipeDismissal onDismiss={()=>setPanel(null)} visible={panel!==null} presentationStyle="pageSheet" animationType="slide" onRequestClose={()=>setPanel(null)}>
   <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={[s.modal,{justifyContent:'flex-start',backgroundColor:'#f5f6f2'}]}>
    <GlassPanel style={[s.sheet,{borderRadius:24},{flex:1,maxHeight:'100%',width:'100%'}]}><SafeAreaView style={{gap:14,flex:1}}><View style={s.row}><Pressable accessibilityRole="button" accessibilityLabel="Close sheet" onPress={()=>setPanel(null)} style={[s.close,{width:44,height:44,alignItems:'center'}]}><Text style={[s.link,{fontSize:26}]}>×</Text></Pressable><Text style={[s.heading,{flex:1,textAlign:'center'}]}>{`${course.name} history`}</Text><View style={{width:44}}/></View>
     {panel==='history'&&<ScrollView>{!history.length&&<Text style={s.muted}>No completed rounds at this course yet.</Text>}{!!history.length&&<Text style={s.muted}>Swipe left on a round to delete it.</Text>}{history.map(r=><SwipeRound key={r.id} onDelete={()=>deleteRound(r.id)}><Pressable accessibilityRole="button" style={s.result} onPress={()=>void enterRound(()=>{setPanel(null);setActive(r.id);setHole(0);})}><Text style={s.heading}>{new Date(r.date).toLocaleDateString()}</Text><Text style={s.muted}>{r.scores[0].length} holes{r.teeName?` · ${r.teeName}`:''}</Text><Text style={s.muted}>{r.names.map((n,i)=>`${n}: ${scoreTotal(r.scores[i]).total}`).join(' · ')}</Text></Pressable></SwipeRound>)}</ScrollView>}

    </SafeAreaView></GlassPanel>
   </KeyboardAvoidingView>
  </Modal>
 </SafeAreaView>;
}
function PlayerRow({index,name,playerId,friends,onChange,onRemove}:{index:number;name:string;playerId:string|null;friends:Friend[];onChange:(name:string,id:string|null)=>void;onRemove:()=>void}){
 const [mode,setMode]=useState<'username'|'guest'>(playerId?'username':'guest');
 const [search,setSearch]=useState('');
 const trigger=useRef<View>(null);
 const [anchor,setAnchor]=useState<MenuAnchor|null>(null),[open,setOpen]=useState(false);
 const removing=useRef(false);
 const close=useCallback(()=>setOpen(false),[]);
 const exited=useCallback(()=>{setAnchor(null);if(removing.current)onRemove();},[onRemove]);
 const selected=friends.find(f=>f.id===playerId);
 const matches=friends.filter(f=>f.name.toLowerCase().includes(search.trim().replace(/^@/,'').toLowerCase()));
 const icon=<SymbolView name={{ios:'ellipsis',android:'more_horiz',web:'more_horiz'}} size={23} tintColor="#183C32"/>;
 if(playerId)return <View>
  <GlassPanel style={{paddingHorizontal:18,paddingVertical:14,borderRadius:28,backgroundColor:'#E8EEDD',flexDirection:'row',alignItems:'center',gap:12}}>
   <PlayerIdentity name={selected?.displayName||selected?.name||name} username={selected?.name||name} avatarPath={selected?.avatarPath}/>
   <Pressable ref={trigger} accessibilityRole="button" accessibilityLabel={`Options for ${name}`} accessibilityState={{expanded:open}} onPress={()=>{Keyboard.dismiss();trigger.current?.measureInWindow((x,y,width,height)=>{setAnchor({x,y,width,height});setOpen(true);});}} style={{width:44,height:44,borderRadius:22,backgroundColor:'#E8EEDD',alignItems:'center',justifyContent:'center',opacity:anchor?0:1}}>{icon}</Pressable>
  </GlassPanel>
  {anchor&&<MenuOverlay open={open} anchor={anchor} onClose={close} onExited={exited} label="Player options" preferredWidth={260} headerContent={<View style={{width:44,height:44,alignItems:'center',justifyContent:'center'}}>{icon}</View>}>
   <View style={{padding:12}}><Pressable accessibilityRole="button" onPress={()=>{removing.current=true;close();}} style={{padding:14,borderRadius:24,backgroundColor:'#E8EEDD',alignItems:'center'}}><Text style={{color:'#B83232',fontWeight:'600'}}>Remove from round</Text></Pressable></View>
  </MenuOverlay>}
 </View>;
 return <GlassPanel style={{padding:12,borderRadius:24,backgroundColor:'#E8EEDD',gap:10}}>
  <View style={s.row}>{selected?<PlayerIdentity name={selected.displayName||selected.name} username={selected.name} avatarPath={selected.avatarPath}/>:<Text style={s.heading}>Player {index+1}</Text>}<View style={s.options}>{(['username','guest'] as const).map(option=><Chip key={option} label={option==='username'?'Username':'Guest'} selected={mode===option} onPress={()=>{setMode(option);setSearch('');onChange('',null);}}/>)}</View></View>
  {mode==='guest'?<TextInput accessibilityLabel={`Player ${index+1} guest name`} placeholder="Guest name" maxLength={30} value={name} onChangeText={value=>onChange(value,null)} style={[s.input,{borderRadius:24}]}/>:<>
   <SearchField accessibilityLabel={`Player ${index+1} username`} placeholder="Search friend username" value={playerId?`@${name}`:search} onChangeText={value=>{setSearch(value);onChange('',null);}} autoCapitalize="none" autoCorrect={false}/>
   {playerId?<Text style={s.muted}>Account linked</Text>:<>{matches.slice(0,5).map(friend=><Pressable key={friend.id} accessibilityLabel={`Add ${friend.name} to round`} onPress={()=>onChange(friend.name,friend.id)} style={{padding:12,borderRadius:20,backgroundColor:'#C5EB65'}}><PlayerIdentity name={friend.displayName||friend.name} username={friend.name} avatarPath={friend.avatarPath}/></Pressable>)}{!matches.length&&<Text style={s.muted}>No matching friends. Manage friends in Account to link their scorecard, or add them as a guest.</Text>}</>}
  </>}
 </GlassPanel>;
}
const s=StyleSheet.create({fixedHeader:{flexShrink:0,zIndex:30,backgroundColor:'#F5F6F2',width:'100%',maxWidth:600,alignSelf:'center',paddingHorizontal:20,paddingTop:8,paddingBottom:12,gap:8},photoText:{color:'#fff'},photoCopy:{backgroundColor:'#12231eb0',paddingHorizontal:10,paddingVertical:6,borderRadius:12,maxWidth:'100%'},searchResults:{position:'absolute',top:54,left:0,right:0,maxHeight:280,backgroundColor:'#E8EEDD',borderRadius:22,overflow:'hidden'},searchResultsContent:{padding:14,gap:10},resultShadow:{borderRadius:16,boxShadow:'0 3px 7px rgba(24,60,50,0.14)'},courseResult:{backgroundColor:'#fff',borderRadius:16,padding:8,flexDirection:'row',alignItems:'center',gap:12,minHeight:76},thumbnail:{width:64,height:60,borderRadius:10,flexShrink:0},resultCopy:{flex:1,gap:4,alignItems:'flex-start'},selectionGroup:{alignItems:'flex-start',gap:6},teeButton:{minHeight:44,paddingHorizontal:14,paddingVertical:8,borderRadius:24,borderWidth:2,borderColor:'#d5ddd1',justifyContent:'center'},teeText:{color:'#ffffff',fontWeight:'600',paddingHorizontal:5,paddingVertical:3},whiteTeeText:{color:'#000000'},screen:{flex:1,backgroundColor:'#F5F6F2'},page:{flexGrow:1,paddingHorizontal:20,paddingVertical:8,gap:8,maxWidth:600,width:'100%',alignSelf:'center'},row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},brand:{fontSize:20,fontWeight:'700',color:colors.green},title:{fontSize:28,fontWeight:'700',color:colors.ink},heading:{fontSize:16,fontWeight:'600',color:colors.ink},courseName:{fontSize:24,fontWeight:'700',color:colors.ink},eyebrow:{fontSize:11,color:colors.green},muted:{fontSize:12,color:colors.muted,lineHeight:17},link:{color:colors.green,fontSize:14},options:{flexDirection:'row',flexWrap:'wrap',gap:8},search:{backgroundColor:'white',borderRadius:28,padding:14},card:{minHeight:176,paddingVertical:16,paddingHorizontal:20,gap:5,justifyContent:'space-between',backgroundColor:'#E8EEDD',borderRadius:24},history:{minHeight:36,justifyContent:'center'},input:{backgroundColor:'white',borderWidth:1,borderColor:'#dce3d9',borderRadius:12,padding:12,fontSize:16},playersButton:{minHeight:52,paddingHorizontal:16,paddingVertical:8,borderRadius:26,backgroundColor:colors.lime,borderWidth:1,borderColor:colors.green},playersLabel:{fontSize:15,fontWeight:'600',color:'#fff'},playerCount:{paddingHorizontal:4,paddingVertical:6},primary:{backgroundColor:colors.lime,padding:16,borderRadius:28,alignItems:'center',minHeight:52},white:{color:colors.ink,fontWeight:'600',fontSize:16},modal:{flex:1,justifyContent:'flex-end',backgroundColor:'#06110d88'},sheet:{backgroundColor:'#f5f6f2',borderTopLeftRadius:24,borderTopRightRadius:24,padding:20,gap:14,maxHeight:'85%',minHeight:280},close:{borderRadius:22,backgroundColor:'#ffffff',paddingHorizontal:12,minHeight:44,minWidth:44,justifyContent:'center'},result:{backgroundColor:'#ffffff',borderRadius:14,paddingHorizontal:12,marginVertical:4,paddingVertical:16,gap:5,borderBottomWidth:1,borderBottomColor:'#dce3d9'},error:{color:'#9b4824',fontSize:12}});
