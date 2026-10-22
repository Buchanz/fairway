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
       <Text style={s.accessTitle}>Request TestFlight access</Text><Text style={s.accessBody}>Leave your email and we’ll send an invite when the next build is ready.</Text>
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
 header:{height:72,paddingHorizontal:24,flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:'#F7FAF3',borderBottomWidth:1,borderColor:'#DCE6DB'},sheetTitle:{fontSize:22,fontWeight:'800',color:colors.ink,letterSpacing:-.4},close:{width:36,height:36,borderRadius:18,backgroundColor:'#E8EEDD',alignItems:'center',justifyContent:'center'},closeText:{fontSize:25,lineHeight:26,color:colors.ink},
 content:{paddingHorizontal:24,paddingVertical:22,paddingBottom:24,gap:20},gallery:{flexDirection:'row',alignItems:'flex-start',gap:18,flexWrap:'wrap'},productCard:{flex:1,minWidth:270,gap:10},sectionTitle:{fontSize:25,lineHeight:29,fontWeight:'800',color:colors.ink,letterSpacing:-.5},mockupFrame:{height:350,alignItems:'center',justifyContent:'center',borderRadius:22,backgroundColor:'#E8EEDD',boxShadow:'0 7px 18px rgba(24,60,50,.12)'},mockup:{width:'100%',height:'100%'},body:{fontSize:13,lineHeight:19,color:colors.ink},accessCard:{marginTop:2,padding:17,borderRadius:18,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#D7E2D5',boxShadow:'0 4px 12px rgba(24,60,50,.08)',gap:5},accessTitle:{fontSize:19,lineHeight:23,fontWeight:'700',color:colors.ink},accessBody:{fontSize:12,lineHeight:17,color:colors.muted,marginBottom:5},form:{flexDirection:'row',alignItems:'center',gap:8,flexWrap:'wrap'},input:{flex:1,minWidth:190,height:44,paddingHorizontal:15,borderRadius:22,backgroundColor:'#F2F6EF',fontSize:13,color:colors.ink},requestButton:{height:44,paddingHorizontal:17,borderRadius:22,backgroundColor:'#C5EB65',alignItems:'center',justifyContent:'center',minWidth:125},requestText:{fontSize:12,fontWeight:'800',color:'#183C32'},success:{fontSize:11,lineHeight:16,color:colors.green},error:{fontSize:11,lineHeight:16,color:'#9b4824'}
});
