import {RoundGroup} from './RoundGroup';
import {useAuth} from '../auth/AuthProvider';
import {GlassPressable as Pressable,GlassPanel,AnimatedGlassPanel} from './Glass';
import {useCallback,useEffect,useRef,useState} from 'react';
import {Alert, Animated, BackHandler, Easing, ScrollView, Platform, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import RangeMap, {type RangeMapHandle} from './RangeMap';
import {teeForRound,teeAppearance} from '../data/tees';
import {holeForTee} from '../lib/hole-map';
import {mappedRoundHole} from '../data/hole-layouts';
import type {Course} from '../data/courses';
import {scoreTotal,isCompletedRound, type Round} from '../lib/rounds';

type Props = {round:Round;course:Course;hole:number;onHole:(hole:number)=>void;onScore:(player:number,delta:number)=>void;onClose:()=>void;onFinish:()=>Promise<boolean>;saving:boolean;saveError:string};
export default function MobileRound({round,course,hole,onHole,onScore,onClose,onFinish,saving,saveError}:Props) {
  const insets=useSafeAreaInsets();
  const {session}=useAuth();
  const mapControls=useRef<RangeMapHandle>(null);
  const [scoresOpen,setScoresOpen]=useState(false);
  const [expansion]=useState(()=>new Animated.Value(0));
  const {height}=useWindowDimensions();
  const expandedHeight=Math.min(540,height-insets.top-insets.bottom-72);
  useEffect(()=>{
    const animation=Animated.timing(expansion,{toValue:scoresOpen?1:0,duration:scoresOpen?460:380,easing:Easing.inOut(Easing.cubic),useNativeDriver:false});
    animation.start();
    return ()=>animation.stop();
  },[scoresOpen,expansion]);
  const complete=isCompletedRound({...round,finished:true});
  const requestClose=useCallback(()=>{
    if(saving)return;
    if(isCompletedRound(round)&&!saveError){onClose();return;}
    Alert.alert('End this round?', complete?'Your completed round will be saved in course history.':'This round is incomplete. Ending it will discard its scores and it will not appear in history.', [
      {text:'Keep playing',style:'cancel'},
      {text:complete?'Save round':'Discard round',style:complete?'default':'destructive',onPress:()=>{void onFinish().then(saved=>{if(saved)onClose();});}},
    ]);
  },[round,complete,onFinish,onClose,saving,saveError]);
  useEffect(()=>{
    const listener=BackHandler.addEventListener('hardwareBackPress',()=>{if(scoresOpen)setScoresOpen(false);else requestClose();return true;});
    return ()=>listener.remove();
  },[scoresOpen,requestClose]);
  const holes=round.scores[0].length;
  const playingTee=teeForRound(course.id,round.teeId);
  const teeYards=playingTee?.yardages[playingTee.yardages.length===9?hole%9:hole];
  const mappedHole=holeForTee(mappedRoundHole(course.id,hole),round.teeId);
  return <View style={s.screen}>
    <RangeMap teeColor={teeAppearance(round.teeId).background} hole={mappedHole} controlsRef={mapControls} point={course.location} fullScreen topInset={insets.top+88} bottomInset={insets.bottom+98} targetKey={`${round.id}:${hole}`}/>
    <View pointerEvents="box-none" style={[s.header,{top:insets.top+12}]}>
      {Platform.OS==='ios'?<View pointerEvents="none" style={{width:48,height:48}}/>:<Pressable accessibilityRole="button" accessibilityLabel="Recenter GPS map" onPress={()=>mapControls.current?.recenter()} style={s.circle}><Text style={[s.light,{fontSize:25}]}>⌖</Text></Pressable>}
      <GlassPanel style={s.holeControl}>
        <Pressable accessibilityRole="button" accessibilityLabel="Previous hole" disabled={hole===0} onPress={()=>onHole(hole-1)} style={[s.arrow,hole===0&&s.disabled]}><Text style={s.light}>‹</Text></Pressable>
        <View style={s.holeLabel}><Text style={s.hole}>Hole {hole+1}</Text><Text numberOfLines={1} style={s.course}>{teeYards?`${round.teeName} · ${teeYards} yd`:mappedHole?.par?`Par ${mappedHole.par} · ${course.name}`:course.name}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Next hole" disabled={hole===holes-1} onPress={()=>onHole(hole+1)} style={[s.arrow,hole===holes-1&&s.disabled]}><Text style={s.light}>›</Text></Pressable>
      </GlassPanel>
      <Pressable accessibilityRole="button" accessibilityLabel="End round and return to courses" onPress={requestClose} style={s.circle}><Text style={s.light}>×</Text></Pressable>
    </View>
    <Animated.View pointerEvents={scoresOpen?'auto':'none'} style={[s.scrim,{opacity:expansion}]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close scorecard" style={StyleSheet.absoluteFill} onPress={()=>setScoresOpen(false)}/>
    </Animated.View>
    <AnimatedGlassPanel accessibilityViewIsModal={scoresOpen} style={[s.sheet,{bottom:insets.bottom+28,height:expansion.interpolate({inputRange:[0,1],outputRange:[72,expandedHeight]}),borderRadius:expansion.interpolate({inputRange:[0,1],outputRange:[36,28]})}]}>
      <Pressable accessibilityRole="button" accessibilityLabel={scoresOpen?'Collapse scorecard':'Open scorecard'} accessibilityState={{expanded:scoresOpen}} onPress={()=>setScoresOpen(value=>!value)} style={s.scoreBar}>
        <View style={{flex:1}}><Text numberOfLines={1} style={s.scoreTitle}>Scorecard · Hole {hole+1}</Text><Text numberOfLines={1} style={s.summary}>{round.names[0]} · {scoreTotal(round.scores[0]).total} strokes · {scoreTotal(round.scores[0]).played} played</Text></View><Text style={s.scoreTitle}>{scoresOpen?'−':'＋'}</Text>
      </Pressable>
      <Animated.View pointerEvents={scoresOpen?'auto':'none'} accessibilityElementsHidden={!scoresOpen} importantForAccessibility={scoresOpen?'auto':'no-hide-descendants'} style={{flex:1,paddingHorizontal:20,paddingBottom:20,gap:12,opacity:expansion.interpolate({inputRange:[0,0.3,1],outputRange:[0.01,0.01,1]})}}>
          <Text style={s.summary}>{course.name}{round.teeName?` · ${round.teeName} tees`:''}{teeYards?` · ${teeYards} yd (scorecard)`:''}</Text>
          {!!saveError&&<Text accessibilityRole="alert" style={s.error}>{saveError}</Text>}
          <ScrollView contentContainerStyle={s.players}>
            {round.names.map((name,i)=><View key={i} style={s.player}>
              <View style={s.playerName}><Text style={s.scoreTitle}>{name}</Text><Text style={s.summary}>{scoreTotal(round.scores[i]).total} total</Text></View>
              <GlassPanel interactive style={{flexDirection:'row',alignItems:'center',height:48,flexShrink:0,gap:8,padding:4,borderRadius:24,backgroundColor:'#E8EEDD'}}>
                <Pressable accessibilityRole="button" accessibilityLabel={`Decrease ${name}'s score`} disabled={saving} onPress={()=>onScore(i,-1)} style={{width:40,height:40,alignItems:'center',justifyContent:'center'}}><Text style={s.counterText}>−</Text></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={`Clear ${name}'s score`} disabled={saving} onLongPress={()=>onScore(i,0)} style={s.number}><Text style={s.counterText}>{round.scores[i][hole]??'—'}</Text></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={`Increase ${name}'s score`} disabled={saving} onPress={()=>onScore(i,1)} style={{width:40,height:40,alignItems:'center',justifyContent:'center'}}><Text style={s.counterText}>＋</Text></Pressable></GlassPanel>
            </View>)}
            {session&&round.names.length>1&&<RoundGroup ownerId={session.user.id} roundId={round.id}/>}
            <Text style={s.summary}>Total strokes including penalties. Hold a score to clear it.</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={hole<holes-1?'Finish hole and go to next hole':'Finish final hole'} onPress={()=>{
              if(round.scores.some(card=>card[hole]===null)){Alert.alert('Add scores first','Enter a score for each player before finishing this hole.');return;}
              if(hole<holes-1)onHole(hole+1);
              else {requestClose();return;}
              setScoresOpen(false);
            }} style={[s.primary,{borderRadius:28,alignItems:'center',minHeight:52,justifyContent:'center'}]}><Text style={[s.primaryText,{color:'#183C32'}]}>{saving?'Saving…':hole===holes-1?'Finish & Save Round':'Finish Hole'}</Text></Pressable>
          </ScrollView>
      </Animated.View>
    </AnimatedGlassPanel>
  </View>;
}
const s=StyleSheet.create({counterText:{fontSize:20,fontWeight:'600',color:'#183C32'},screen:{flex:1,backgroundColor:'#162b21'},header:{position:'absolute',left:16,right:16,flexDirection:'row',gap:8,justifyContent:'space-between',alignItems:'center'},circle:{width:48,height:48,borderRadius:24,backgroundColor:'#12231ee8',alignItems:'center',justifyContent:'center'},light:{color:'white',fontSize:30},holeControl:{width:200,maxWidth:'62%',flexShrink:1,flexDirection:'row',alignItems:'center',backgroundColor:'#12231ee8',borderRadius:30,padding:4},holeLabel:{flex:1,alignItems:'center'},hole:{color:'white',fontWeight:'700',fontSize:20},course:{color:'#d3e1d8',fontSize:12,maxWidth:190},arrow:{width:44,height:48,alignItems:'center',justifyContent:'center'},disabled:{opacity:0.3},scoreBar:{height:72,paddingVertical:16,paddingHorizontal:24,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},scoreTitle:{fontSize:16,fontWeight:'600',color:'#ffffff'},summary:{fontSize:12,color:'#d3e1d8',lineHeight:18},modal:{flex:1,justifyContent:'flex-end'},scrim:{position:'absolute',top:0,bottom:0,left:0,right:0,backgroundColor:'#06110d88'},sheet:{position:'absolute',left:12,right:12,backgroundColor:'#12231ee8',overflow:'hidden'},sheetHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:10},title:{fontSize:24,fontWeight:'700',color:'#ffffff'},button:{minWidth:44,minHeight:44,padding:12,borderRadius:12,backgroundColor:'#ffffff1a',alignItems:'center',justifyContent:'center'},players:{gap:18,paddingTop:12},player:{flexDirection:'row',alignItems:'center',gap:8},playerName:{flex:1},number:{width:44,height:44,alignItems:'center',justifyContent:'center'},primary:{padding:14,borderRadius:12,backgroundColor:'#C5EB65'},primaryText:{color:'white',fontWeight:'600'},confirm:{gap:12},error:{color:'#a43124'}});
