import {Image} from 'expo-image';
import {Animated,Modal,ScrollView,StyleSheet,Text,View} from 'react-native';
import {useEffect,useState} from 'react';
import {GlassPanel,GlassPressable as Pressable} from './Glass';
import {colors} from './ui';

/** Web-only product sheet for the Fairway mobile experience. */
export function WebMobileSheet({open,onClose}:{open:boolean;onClose:()=>void}){
 const [progress]=useState(()=>new Animated.Value(0));
 useEffect(()=>{
  if(!open)return;
  progress.setValue(0);
  Animated.spring(progress,{toValue:1,damping:24,stiffness:260,mass:.85,useNativeDriver:true}).start();
 },[open,progress]);
 if(!open)return null;
 return <Modal transparent visible animationType="none" onRequestClose={onClose}>
  <View style={s.backdrop}>
   <Pressable accessibilityRole="button" accessibilityLabel="Close mobile information" onPress={onClose} style={StyleSheet.absoluteFill}/>
   <Animated.View accessibilityViewIsModal style={[s.sheet,{opacity:progress,transform:[{scale:progress.interpolate({inputRange:[0,1],outputRange:[.94,1]})}]}]}>
    <GlassPanel style={s.panel}>
     <View style={s.hero}>
      <View style={s.heroCopy}><Text style={s.kickerHero}>FAIRWAY MOBILE</Text><Text style={s.heroTitle}>Your round, in your pocket.</Text><Text style={s.heroSubtitle}>A focused GPS rangefinder and scorecard built for the course, with the same Fairway account on every device.</Text><View style={s.heroPill}><Text style={s.heroPillText}>GPS distances · scores · friends</Text></View></View>
      <View style={s.heroPhone}><Image source={require('../../assets/mobile-preview.jpg')} contentFit="cover" style={[s.heroImage]}/></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Close mobile information" onPress={onClose} style={s.close}><Text style={s.closeText}>×</Text></Pressable>
     </View>
     <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.sectionIntro}><Text style={s.sectionLabel}>MADE FOR THE COURSE</Text><Text style={s.sectionTitle}>Everything you need between the first tee and the last green.</Text></View>
      <View style={s.features}>
       <View style={s.feature}><Text style={s.featureIcon}>⌖</Text><View style={s.featureCopy}><Text style={s.heading}>Hole-by-hole GPS</Text><Text style={s.body}>See tee, front, centre and back distances as you move through each mapped hole.</Text></View></View>
       <View style={s.feature}><Text style={s.featureIcon}>＋</Text><View style={s.featureCopy}><Text style={s.heading}>Simple scorekeeping</Text><Text style={s.body}>Keep every player together, add guests, and move to the next hole without losing your round.</Text></View></View>
       <View style={s.feature}><Text style={s.featureIcon}>♟</Text><View style={s.featureCopy}><Text style={s.heading}>Play with friends</Text><Text style={s.body}>Find friends by username, flip a tee, and share completed scores on your terms.</Text></View></View>
      </View>
      <View style={s.galleryHeader}><Text style={s.sectionLabel}>A QUICK LOOK</Text><Text style={s.galleryTitle}>See Fairway in action</Text></View>
      <View style={s.gallery}><View style={s.shot}><View style={s.shotImage}><Image source={require('../../assets/mobile-preview.jpg')} contentFit="cover" style={[s.image]}/></View><Text style={s.captionTitle}>Rangefinder and scorecard</Text><Text style={s.caption}>Distances, hole navigation and scoring in one view.</Text></View><View style={s.shot}><View style={s.shotImage}><Image source={require('../../assets/mobile-account-preview.jpg')} contentFit="cover" style={[s.image]}/></View><Text style={s.captionTitle}>Your account and rounds</Text><Text style={s.caption}>Keep friends, favourites and completed games together.</Text></View></View>
      <View style={s.bottomNote}><Text style={s.bottomNoteTitle}>Ready when you are.</Text><Text style={s.bottomNoteText}>Open Fairway on your phone to use the rangefinder and start a round with the selected course.</Text></View>
     </ScrollView>
    </GlassPanel>
   </Animated.View>
  </View>
 </Modal>;
}

const s=StyleSheet.create({
 backdrop:{flex:1,backgroundColor:'rgba(13,31,24,.42)',alignItems:'center',justifyContent:'center',padding:18},
 sheet:{width:'100%',maxWidth:860,maxHeight:'92%',borderRadius:32,boxShadow:'0 20px 60px rgba(10,35,25,.28)'},
 panel:{padding:0,borderRadius:32,backgroundColor:'#F7FAF3',overflow:'hidden'},
 hero:{minHeight:285,flexDirection:'row',alignItems:'center',paddingHorizontal:30,paddingVertical:26,backgroundColor:'#183C32',position:'relative',overflow:'hidden'},heroCopy:{flex:1,maxWidth:510,gap:10,paddingRight:14},kickerHero:{fontSize:10,letterSpacing:1.5,color:'#C5EB65',fontWeight:'800'},heroTitle:{fontSize:36,lineHeight:40,fontWeight:'800',color:'#F8FBF5',letterSpacing:-1},heroSubtitle:{fontSize:15,lineHeight:22,color:'#D9E7D9',maxWidth:470},heroPill:{alignSelf:'flex-start',paddingHorizontal:13,paddingVertical:8,borderRadius:18,backgroundColor:'#2B5E4A',marginTop:4},heroPillText:{fontSize:11,fontWeight:'700',color:'#F8FBF5',letterSpacing:.2},heroPhone:{width:150,height:245,marginRight:28,borderRadius:25,padding:5,backgroundColor:'#0C241B',boxShadow:'0 10px 22px rgba(0,0,0,.24)',transform:[{rotate:'4deg'}]},heroImage:{width:'100%',height:'100%',borderRadius:20},close:{position:'absolute',right:18,top:18,width:38,height:38,borderRadius:19,backgroundColor:'#2B5E4A',alignItems:'center',justifyContent:'center'},closeText:{fontSize:27,lineHeight:28,color:'#F8FBF5'},
 content:{paddingHorizontal:30,paddingVertical:28,paddingBottom:32,gap:24},sectionIntro:{gap:5},sectionLabel:{fontSize:10,letterSpacing:1.4,fontWeight:'800',color:colors.green},sectionTitle:{fontSize:22,lineHeight:28,fontWeight:'700',color:colors.ink,maxWidth:610},features:{flexDirection:'row',flexWrap:'wrap',gap:12},feature:{flex:1,minWidth:215,flexDirection:'row',alignItems:'flex-start',gap:11,padding:16,borderRadius:18,backgroundColor:'#E8EEDD',boxShadow:'0 3px 10px rgba(24,60,50,.07)'},featureCopy:{flex:1},featureIcon:{width:32,height:32,borderRadius:16,backgroundColor:'#C5EB65',color:'#183C32',fontSize:19,lineHeight:32,textAlign:'center',fontWeight:'800'},heading:{fontSize:15,fontWeight:'700',color:colors.ink},body:{fontSize:13,lineHeight:19,color:colors.ink,marginTop:4},galleryHeader:{gap:4},galleryTitle:{fontSize:20,fontWeight:'700',color:colors.ink},gallery:{flexDirection:'row',gap:14,flexWrap:'wrap'},shot:{flex:1,minWidth:250,maxWidth:400,gap:5},shotImage:{height:210,borderRadius:20,overflow:'hidden',backgroundColor:'#E8EEDD',boxShadow:'0 5px 14px rgba(24,60,50,.12)'},image:{width:'100%',height:'100%'},captionTitle:{fontSize:14,fontWeight:'700',color:colors.ink,marginTop:4},caption:{fontSize:12,lineHeight:17,color:colors.muted},bottomNote:{padding:16,borderRadius:18,backgroundColor:'#183C32',gap:3},bottomNoteTitle:{fontSize:15,fontWeight:'700',color:'#F8FBF5'},bottomNoteText:{fontSize:12,lineHeight:18,color:'#D9E7D9'}
});
