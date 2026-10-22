import {Image} from 'expo-image';
import {Animated,ActivityIndicator,Modal,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import {useEffect,useState} from 'react';
import {GlassPanel,GlassPressable as Pressable} from './Glass';
import {colors} from './ui';

type RequestState='idle'|'sending'|'sent'|'error';

/** Web-only product sheet for the Fairway mobile experience. */
export function WebMobileSheet({open,onClose,onRequestAccess}:{open:boolean;onClose:()=>void;onRequestAccess?:(email:string)=>Promise<boolean>} ){
 const [progress]=useState(()=>new Animated.Value(0));
 const [mounted,setMounted]=useState(open);
 const [email,setEmail]=useState('');
 const [requestState,setRequestState]=useState<RequestState>('idle');
 useEffect(()=>{
  if(open){
   setMounted(true);setRequestState('idle');
   progress.setValue(0);
   Animated.spring(progress,{toValue:1,damping:24,stiffness:260,mass:.85,useNativeDriver:true}).start();
   return;
  }
  if(!mounted)return;
  Animated.timing(progress,{toValue:0,duration:180,easing:value=>value,useNativeDriver:true}).start(({finished})=>{if(finished)setMounted(false);});
 },[open,progress]);
 async function requestAccess(){
  const address=email.trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)){setRequestState('error');return;}
  if(!onRequestAccess){setRequestState('error');return;}
  setRequestState('sending');
  try{if(!await onRequestAccess(address))throw new Error();setEmail('');setRequestState('sent');}catch{setRequestState('error');}
 }
 if(!mounted)return null;
 return <Modal transparent visible={mounted} animationType="none" onRequestClose={onClose}>
  <View style={s.backdrop}>
   <Pressable accessibilityRole="button" accessibilityLabel="Close mobile information" onPress={onClose} style={StyleSheet.absoluteFill}/>
   <Animated.View accessibilityViewIsModal style={[s.sheet,{opacity:progress,transform:[{scale:progress.interpolate({inputRange:[0,1],outputRange:[.95,1]})}]}]}>
    <GlassPanel style={s.panel}>
     <View style={s.hero}>
      <View style={s.heroCopy}><Text style={s.kicker}>FAIRWAY MOBILE</Text><Text style={s.title}>Your round, in your pocket.</Text><Text style={s.subtitle}>GPS distances, scorekeeping and friends built for the course.</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Close mobile information" onPress={onClose} style={s.close}><Text style={s.closeText}>×</Text></Pressable>
     </View>
     <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={s.intro}><Text style={s.sectionLabel}>THE FAIRWAY MOBILE APP</Text><Text style={s.introTitle}>Everything you need before and during your round.</Text></View>
      <View style={s.productSection}><View style={s.sectionCopy}><Text style={s.sectionLabel}>TEE TIMES</Text><Text style={s.sectionTitle}>Find a time that works.</Text><Text style={s.body}>Search nearby courses, compare live tee times, filter by players and holes, then open a course to start a round when you’re ready.</Text><View style={s.detail}><Text style={s.detailDot}>✓</Text><Text style={s.detailText}>Live availability and course search</Text></View><View style={s.detail}><Text style={s.detailDot}>✓</Text><Text style={s.detailText}>Nearest courses shown first</Text></View></View><View style={s.mockupFrame}><Image source={require('../../assets/mobile-home-mockup.png')} contentFit="contain" style={s.mockup}/></View></View>
      <View style={s.productSection}><View style={s.sectionCopy}><Text style={s.sectionLabel}>GAMEPLAY</Text><Text style={s.sectionTitle}>Play with a rangefinder in your hand.</Text><Text style={s.body}>Use live GPS tracking to see your tee, front, centre and back distances, keep score hole by hole, flip a tee with your group and revisit every completed round.</Text><View style={s.detail}><Text style={s.detailDot}>✓</Text><Text style={s.detailText}>Hole-by-hole GPS distances</Text></View><View style={s.detail}><Text style={s.detailDot}>✓</Text><Text style={s.detailText}>Friends, guests and shared scorecards</Text></View></View><View style={s.mockupFrame}><Image source={require('../../assets/mobile-game-mockup.png')} contentFit="contain" style={s.mockup}/></View></View>
      <View style={s.accessCard}>
       <Text style={s.accessKicker}>TESTFLIGHT ACCESS</Text><Text style={s.accessTitle}>Want to try Fairway on iPhone?</Text><Text style={s.accessBody}>Leave your email and we’ll send an invite when the next build is ready.</Text>
       <View style={s.form}><TextInput accessibilityLabel="Email for TestFlight access" value={email} onChangeText={value=>{setEmail(value);if(requestState!=='idle')setRequestState('idle');}} placeholder="you@example.com" placeholderTextColor="#789087" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" style={s.input}/><Pressable accessibilityRole="button" disabled={requestState==='sending'} onPress={()=>void requestAccess()} style={[s.requestButton,requestState==='sending'&&{opacity:.6}]}>{requestState==='sending'?<ActivityIndicator color="#F8FBF5"/>:<Text style={s.requestText}>Request access</Text>}</Pressable></View>
       {requestState==='sent'&&<Text accessibilityLiveRegion="polite" style={s.success}>Request received. We’ll use this email for the TestFlight invite.</Text>}
       {requestState==='error'&&<Text accessibilityLiveRegion="polite" style={s.error}>Enter a valid email address and try again.</Text>}
      </View>
     </ScrollView>
    </GlassPanel>
   </Animated.View>
  </View>
 </Modal>;
}

const s=StyleSheet.create({
 backdrop:{flex:1,backgroundColor:'rgba(13,31,24,.42)',alignItems:'center',justifyContent:'center',padding:16},
 sheet:{width:'100%',maxWidth:650,maxHeight:'78%',borderRadius:28,boxShadow:'0 20px 60px rgba(10,35,25,.28)'},
 panel:{padding:0,borderRadius:28,backgroundColor:'#F7FAF3',overflow:'hidden'},
 hero:{paddingHorizontal:26,paddingVertical:23,backgroundColor:'#183C32',position:'relative'},heroCopy:{paddingRight:42,gap:6},kicker:{fontSize:9,letterSpacing:1.5,color:'#C5EB65',fontWeight:'800'},title:{fontSize:30,lineHeight:34,fontWeight:'800',color:'#F8FBF5',letterSpacing:-.7},subtitle:{fontSize:13,lineHeight:19,color:'#D9E7D9'},close:{position:'absolute',right:16,top:16,width:36,height:36,borderRadius:18,backgroundColor:'#2B5E4A',alignItems:'center',justifyContent:'center'},closeText:{fontSize:25,lineHeight:26,color:'#F8FBF5'},
 content:{paddingHorizontal:24,paddingVertical:21,paddingBottom:24,gap:20},intro:{gap:4},sectionLabel:{fontSize:9,letterSpacing:1.4,fontWeight:'800',color:colors.green},introTitle:{fontSize:20,lineHeight:25,fontWeight:'700',color:colors.ink,maxWidth:470},productSection:{flexDirection:'row',alignItems:'center',gap:20,minHeight:316},sectionCopy:{flex:1,gap:7},sectionTitle:{fontSize:26,lineHeight:29,fontWeight:'800',color:colors.ink,letterSpacing:-.5},body:{fontSize:12,lineHeight:18,color:colors.ink},detail:{flexDirection:'row',alignItems:'center',gap:7,marginTop:2},detailDot:{width:19,height:19,borderRadius:10,backgroundColor:'#C5EB65',color:'#183C32',fontSize:12,lineHeight:19,textAlign:'center',fontWeight:'800'},detailText:{flex:1,fontSize:11,lineHeight:15,fontWeight:'600',color:colors.green},mockupFrame:{width:145,height:303,alignItems:'center',justifyContent:'center',borderRadius:28,backgroundColor:'#E8EEDD',boxShadow:'0 8px 18px rgba(24,60,50,.12)'},mockup:{width:145,height:303},accessCard:{marginTop:2,padding:16,borderRadius:18,backgroundColor:'#183C32',gap:5},accessKicker:{fontSize:9,letterSpacing:1.2,fontWeight:'800',color:'#C5EB65'},accessTitle:{fontSize:19,lineHeight:23,fontWeight:'700',color:'#F8FBF5'},accessBody:{fontSize:12,lineHeight:17,color:'#D9E7D9',marginBottom:5},form:{flexDirection:'row',alignItems:'center',gap:8,flexWrap:'wrap'},input:{flex:1,minWidth:190,height:44,paddingHorizontal:15,borderRadius:22,backgroundColor:'#F7FAF3',fontSize:13,color:colors.ink},requestButton:{height:44,paddingHorizontal:17,borderRadius:22,backgroundColor:'#C5EB65',alignItems:'center',justifyContent:'center',minWidth:125},requestText:{fontSize:12,fontWeight:'800',color:'#183C32'},success:{fontSize:11,lineHeight:16,color:'#C5EB65'},error:{fontSize:11,lineHeight:16,color:'#FFB59C'}
});
