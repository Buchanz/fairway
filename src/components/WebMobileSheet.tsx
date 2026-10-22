import {Image} from 'expo-image';
import {Animated,Modal,ScrollView,StyleSheet,Text,View} from 'react-native';
import {useEffect,useState} from 'react';
import {GlassPanel,GlassPressable as Pressable} from './Glass';
import {colors} from './ui';

/** Web-only product sheet for the mobile rangefinder and future watch companion. */
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
     <View style={s.header}><View style={s.titleGroup}><Text style={s.kicker}>FAIRWAY MOBILE</Text><Text style={s.title}>Take the rangefinder with you</Text><Text style={s.subtitle}>Live GPS distances, scorekeeping and group play designed for the course.</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Close mobile information" onPress={onClose} style={s.close}><Text style={s.closeText}>×</Text></Pressable></View>
     <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.features}><View style={s.feature}><Text style={s.featureIcon}>⌖</Text><View><Text style={s.heading}>Hole-by-hole GPS</Text><Text style={s.body}>See tee, front, centre and back distances as you move through a round.</Text></View></View><View style={s.feature}><Text style={s.featureIcon}>✓</Text><View><Text style={s.heading}>Keep every score</Text><Text style={s.body}>Add friends or guests, flip a tee, and save completed rounds to your account.</Text></View></View></View>
      <View style={s.gallery}><View style={s.shot}><Image source={require('../../assets/mobile-preview.jpg')} contentFit="cover" style={s.image}/><Text style={s.caption}>Rangefinder and scorecard</Text></View><View style={s.shot}><Image source={require('../../assets/mobile-account-preview.jpg')} contentFit="cover" style={s.image}/><Text style={s.caption}>Account, friends and rounds</Text></View></View>
      <View style={s.watch}><View style={s.watchIcon}><Text style={s.watchGlyph}>⌚</Text></View><View style={s.watchCopy}><Text style={s.kicker}>COMING NEXT</Text><Text style={s.heading}>Fairway on your wrist</Text><Text style={s.body}>A paired watch companion is planned for quick centre-of-green yardage, score entry and tee-flip results while your phone stays in your pocket.</Text></View></View>
      <Text style={s.note}>Mobile downloads will be linked here when the App Store and Google Play listings are live.</Text>
     </ScrollView>
    </GlassPanel>
   </Animated.View>
  </View>
 </Modal>;
}

const s=StyleSheet.create({
 backdrop:{flex:1,backgroundColor:'rgba(25,48,39,.18)',alignItems:'center',justifyContent:'center',padding:20},
 sheet:{width:'100%',maxWidth:760,maxHeight:'90%',borderRadius:28,boxShadow:'0 16px 50px rgba(25,48,39,.22)'},
 panel:{padding:22,borderRadius:28,backgroundColor:'#F7FAF3',gap:14},
 header:{flexDirection:'row',alignItems:'flex-start',gap:14},titleGroup:{flex:1,gap:4},kicker:{fontSize:10,letterSpacing:1.2,color:colors.muted},title:{fontSize:28,fontWeight:'700',color:colors.ink},subtitle:{fontSize:14,lineHeight:20,color:colors.muted},
 close:{width:40,height:40,borderRadius:20,backgroundColor:'#E8EEDD',alignItems:'center',justifyContent:'center'},closeText:{fontSize:28,lineHeight:28,color:colors.ink},
 content:{paddingBottom:8,gap:16},features:{gap:10},feature:{flexDirection:'row',alignItems:'flex-start',gap:12,padding:14,borderRadius:18,backgroundColor:'#E8EEDD'},featureIcon:{width:30,height:30,borderRadius:15,backgroundColor:'#C5EB65',color:'#183C32',fontSize:20,lineHeight:30,textAlign:'center',fontWeight:'700'},heading:{fontSize:16,fontWeight:'700',color:colors.ink},body:{fontSize:13,lineHeight:19,color:colors.ink,marginTop:3},gallery:{flexDirection:'row',gap:12,flexWrap:'wrap',justifyContent:'center'},shot:{flex:1,minWidth:220,maxWidth:320,gap:6},image:{width:'100%',height:280,borderRadius:20,backgroundColor:'#E8EEDD'},caption:{fontSize:11,color:colors.muted,textAlign:'center'},watch:{flexDirection:'row',alignItems:'center',gap:12,padding:16,borderRadius:20,backgroundColor:'#183C32'},watchIcon:{width:48,height:48,borderRadius:16,backgroundColor:'#C5EB65',alignItems:'center',justifyContent:'center'},watchGlyph:{fontSize:27},watchCopy:{flex:1},note:{fontSize:12,lineHeight:18,color:colors.muted,textAlign:'center',paddingHorizontal:10}
});
