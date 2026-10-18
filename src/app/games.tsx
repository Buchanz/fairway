import {CoursePhoto} from '../components/CoursePhoto';
import {ActiveRoundGroups} from '../components/RoundGroup';
import {FriendsPanel} from '../components/FriendsPanel';
import {SearchField} from '../components/SearchField';
import {useCallback,useState} from 'react';
import {Alert,ScrollView,StyleSheet,Text,View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router,useFocusEffect} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuth} from '../auth/AuthProvider';
import {cachedCloudRounds,readCloudRounds,writeCloudChanges} from '../lib/cloud-rounds';
import {loadRounds,saveRounds} from '../lib/round-storage';
import {scoreTotal,isCompletedRound,type Round} from '../lib/rounds';
import {courses} from '../data/courses';
import {GlassPanel,GlassPressable} from '../components/Glass';

import SwipeRound from '../components/SwipeRound';
export default function Games(){const {session,ready}=useAuth();return <GameHistory key={session?.user.id||'guest'} userId={session?.user.id||null} authReady={ready}/>;}
function GameHistory({userId,authReady}:{userId:string|null;authReady:boolean}){
 const [rounds,setRounds]=useState<Round[]>(()=>cachedCloudRounds(userId)||[]),[error,setError]=useState(''),[loading,setLoading]=useState(!cachedCloudRounds(userId)),[reload,setReload]=useState(0),[busy,setBusy]=useState(false),[expanded,setExpanded]=useState<string|null>(null);
 useFocusEffect(useCallback(()=>{let alive=true;if(!authReady)return;
  (userId?readCloudRounds(userId):loadRounds(AsyncStorage,null)).then(saved=>{if(alive){setRounds([...saved].sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)));setError('');}}).catch(()=>{if(alive)setError('Could not load your games. Please retry.');}).finally(()=>{if(alive)setLoading(false);});return()=>{alive=false;};
 // Retry deliberately recreates the focus callback to refetch while this tab stays focused.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[userId,authReady,reload]));
 function remove(id:string){if(busy)return;Alert.alert('Delete this game?','This removes the round and all player scores.',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>{setBusy(true);const next=rounds.filter(r=>r.id!==id);void (userId?writeCloudChanges(userId,rounds,next):saveRounds(AsyncStorage,null,next)).then(()=>{setRounds(next);setError('');}).catch(()=>setError('Could not delete this game. Please retry.')).finally(()=>setBusy(false));}}]);}
 const refreshCompleted=useCallback(()=>setReload(n=>n+1),[]);
 const [query,setQuery]=useState('');
 const [activeCount,setActiveCount]=useState<number|null>(userId?null:0);
 const completed=rounds.filter(isCompletedRound);
 const terms=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 const matches=completed.filter(round=>{
  const course=courses.find(c=>c.id===round.courseId);
  const text=[course?.name,course?.municipality,...round.names,round.teeName,new Date(round.date).toLocaleDateString(),new Date(round.date).toLocaleDateString(undefined,{month:'long',year:'numeric',day:'numeric'}),`${round.scores[0].length} holes`].join(' ').toLocaleLowerCase();
  return terms.every(term=>text.includes(term));
 });
 return <SafeAreaView edges={['top','left','right']} style={s.page}><View style={s.header}><View style={{width:44,height:44}}/><Text style={s.title}>Games</Text><View style={{width:44}}/></View><View style={{paddingHorizontal:20,width:'100%',maxWidth:600,alignSelf:'center'}}><SearchField placeholder="Search Games" accessibilityLabel="Search games by course, player or date" value={query} onChangeText={setQuery} autoCorrect={false} returnKeyType="search"/></View><ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={s.list}>
  <Text style={[s.heading,{alignSelf:'flex-start',fontSize:16}]}>Recent Games</Text>
  <ActiveRoundGroups onCompleted={refreshCompleted} onCount={setActiveCount}/>
  {!!error&&<View><Text accessibilityRole="alert">{error}</Text><GlassPressable onPress={()=>setReload(n=>n+1)}><Text>Retry</Text></GlassPressable></View>}
  {loading&&!activeCount?<GlassPanel style={s.card}><Text style={s.heading}>Recent Games</Text><Text style={s.muted}>Loading your games…</Text></GlassPanel>:!completed.length&&activeCount===0&&!error?<GlassPanel style={s.card}><Text style={s.heading}>No completed games yet</Text><Text style={s.muted}>Your completed rounds will appear here.</Text><GlassPressable onPress={()=>router.navigate('/play')} accessibilityRole="button" style={{backgroundColor:'#C5EB65',padding:16,borderRadius:28,alignItems:'center'}}><Text style={{color:'#183C32',fontWeight:'600'}}>Start a round</Text></GlassPressable></GlassPanel>:null}
  {!loading&&!!completed.length&&!matches.length&&<Text style={s.muted}>No games match your search.</Text>}
  {matches.map(r=><SwipeRound key={r.id} onDelete={()=>remove(r.id)}><GlassPanel style={s.card}><GlassPressable accessibilityRole="button" accessibilityState={{expanded:expanded===r.id}} onPress={()=>setExpanded(expanded===r.id?null:r.id)}><View style={{gap:12}}><CoursePhoto courseId={r.courseId} style={{width:'100%',height:150,borderRadius:18}}/><View style={{flex:1,gap:4}}><Text style={s.heading}>{courses.find(c=>c.id===r.courseId)?.name||r.courseId}</Text><Text style={s.muted}>{new Date(r.date).toLocaleDateString()} · {r.scores[0].length} holes{r.teeName?` · ${r.teeName}`:''}</Text><Text style={s.heading}>{scoreTotal(r.scores[Math.max(0,r.playerIds?.indexOf(userId||'')??0)]).total} strokes</Text></View></View></GlassPressable>
   {expanded!==r.id&&<Text numberOfLines={2} style={s.name}>{r.names.map((name,i)=>`${name}: ${scoreTotal(r.scores[i]).total}`).join(' · ')}</Text>}
   {expanded===r.id&&r.names.map((name,i)=>{const score=scoreTotal(r.scores[i]);return <View key={i} style={s.row}><Text style={s.name}>{name}</Text><Text style={s.muted}>{score.total} strokes · {score.played} played</Text></View>;})}
   <GlassPressable onPress={()=>setExpanded(expanded===r.id?null:r.id)}><Text style={s.muted}>{expanded===r.id?'Hide scorecard −':'View hole scores ＋'}</Text></GlassPressable>
   {expanded===r.id&&<ScrollView horizontal><View><View style={s.scores}><Text style={s.cell}>Hole</Text>{r.scores[0].map((_,h)=><Text key={h} style={s.cell}>{h+1}</Text>)}</View>{r.names.map((name,i)=><View key={i} style={s.scores}><Text numberOfLines={1} style={s.cell}>{name}</Text>{r.scores[i].map((score,h)=><Text key={h} style={s.cell}>{score??'—'}</Text>)}</View>)}</View></ScrollView>}
  </GlassPanel></SwipeRound>)}
  {!!completed.length&&<Text style={s.muted}>Swipe left on a game to delete it.</Text>}

 <FriendsPanel onRoundsChanged={()=>setReload(n=>n+1)}/>
 </ScrollView></SafeAreaView>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:'#F5F6F2'},header:{flexDirection:'row',alignItems:'center',paddingHorizontal:20,paddingVertical:8},title:{flex:1,textAlign:'center',fontSize:16,fontWeight:'600',color:'#183C32'},list:{paddingHorizontal:20,paddingTop:8,paddingBottom:20,gap:8,flexGrow:1,width:'100%',maxWidth:600,alignSelf:'center'},card:{backgroundColor:'#E8EEDD',borderRadius:24,minHeight:176,paddingVertical:16,paddingHorizontal:20,gap:8,justifyContent:'space-between'},heading:{fontSize:18,fontWeight:'600',color:'#183C32'},muted:{fontSize:13,lineHeight:20,color:'#65766D'},name:{fontSize:14,fontWeight:'600',color:'#183C32',flex:1},row:{flexDirection:'row',alignItems:'center',gap:8},scores:{flexDirection:'row',paddingVertical:8},cell:{width:55,textAlign:'center',color:'#183C32'}});
