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
   // These updates mount the animated modal and reset the form for each opening.
   // eslint-disable-next-line react-hooks/set-state-in-effect
   setMounted(true);
   setRequestState('idle');
   progress.setValue(0);
   Animated.spring(progress,{toValue:1,damping:24,stiffness:260,mass:.85,useNativeDriver:true}).start();
   return;
  }
  if(!mounted)return;
  Animated.timing(progress,{toValue:0,duration:180,easing:value=>value,useNativeDriver:true}).start(({finished})=>{if(finished)setMounted(false);});
 // `mounted` is intentionally read as the previous render state while the close animation runs.
 // eslint-disable-next-line react-hooks/exhaustive-deps
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
     <View style={s.header}>
      <Text style={s.sheetTitle}>Fairway mobile</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Close mobile information" onPress={onClose} style={s.close}><Text style={s.closeText}>×</Text></Pressable>
     </View>
     <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={s.gallery}>
       <View style={s.productCard}><Text style={s.sectionTitle}>Tee times</Text><View style={s.mockupFrame}><Image source={require('../../assets/mobile-home-mockup.png')} contentFit="contain" style={s.mockup}/></View><Text style={s.body}>Search nearby courses, compare live tee times, filter by players and holes, then open a course to start a round.</Text></View>
       <View style={s.productCard}><Text style={s.sectionTitle}>Gameplay</Text><View style={s.mockupFrame}><Image source={require('../../assets/mobile-game-mockup.png')} contentFit="contain" style={s.mockup}/></View><Text style={s.body}>Use live GPS tracking as a rangefinder, keep score hole by hole, flip a tee with your group and track completed rounds.</Text></View>
      </View>
      <View style={s.accessCard}>
       <View style={s.accessHeader}>
        <Image source={require('../../assets/fairway-app-logo.png')} contentFit="contain" style={s.accessLogo}/>
        <View style={s.accessHeading}><Text style={s.accessTitle}>Request TestFlight access</Text><Text style={s.accessBody}>Leave your email and we’ll send an invite when the next build is ready.</Text></View>
       </View>
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
 sheet:{width:'100%',maxWidth:580,maxHeight:'84%',borderRadius:28,boxShadow:'0 20px 60px rgba(10,35,25,.28)'},
 panel:{padding:0,borderRadius:28,backgroundColor:'#F7FAF3',overflow:'hidden'},
 header:{height:58,paddingHorizontal:20,flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:'#F7FAF3',borderBottomWidth:1,borderColor:'#DCE6DB',position:'relative'},sheetTitle:{fontSize:16,fontWeight:'500',color:colors.ink,letterSpacing:-.2,textAlign:'center'},close:{position:'absolute',right:18,top:11,width:36,height:36,borderRadius:18,backgroundColor:'#E8EEDD',alignItems:'center',justifyContent:'center',boxShadow:'0 3px 9px rgba(24,60,50,.18)'},closeText:{fontSize:25,lineHeight:26,color:colors.ink},
 content:{paddingHorizontal:20,paddingVertical:20,paddingBottom:22,gap:20},gallery:{flexDirection:'row',alignItems:'flex-start',gap:14,flexWrap:'wrap'},productCard:{flex:1,minWidth:230,gap:10,paddingHorizontal:10},sectionTitle:{fontSize:22,lineHeight:27,fontWeight:'800',color:colors.ink,letterSpacing:-.4},mockupFrame:{height:420,alignItems:'center',justifyContent:'center'},mockup:{width:'100%',height:'100%'},body:{fontSize:13,lineHeight:19,color:colors.ink,minHeight:57},accessCard:{marginTop:2,padding:17,borderRadius:18,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#D7E2D5',boxShadow:'0 4px 12px rgba(24,60,50,.08)',gap:10},accessHeader:{flexDirection:'row',alignItems:'flex-start',gap:12},accessLogo:{width:48,height:48,borderRadius:11},accessHeading:{flex:1,gap:2},accessTitle:{fontSize:19,lineHeight:23,fontWeight:'700',color:colors.ink},accessBody:{fontSize:12,lineHeight:17,color:colors.muted,marginBottom:2},form:{flexDirection:'row',alignItems:'center',gap:8,flexWrap:'wrap'},input:{flex:1,minWidth:190,height:44,paddingHorizontal:15,borderRadius:22,backgroundColor:'#F2F6EF',fontSize:13,color:colors.ink,boxShadow:'0 3px 9px rgba(24,60,50,.12)'},requestButton:{height:44,paddingHorizontal:17,borderRadius:22,backgroundColor:'#C5EB65',alignItems:'center',justifyContent:'center',minWidth:125,boxShadow:'0 4px 10px rgba(24,60,50,.18)'},requestText:{fontSize:12,fontWeight:'800',color:'#183C32'},success:{fontSize:11,lineHeight:16,color:colors.green},error:{fontSize:11,lineHeight:16,color:'#9b4824'}
});
