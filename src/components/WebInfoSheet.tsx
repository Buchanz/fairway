import {GlassPanel,GlassPressable as Pressable} from './Glass';
import {colors} from './ui';
import {Animated,Modal,ScrollView,StyleSheet,Text,View} from 'react-native';
import {useEffect,useState} from 'react';

type SheetKind='privacy'|'support';
export function WebInfoSheet({kind,onClose}:{kind:SheetKind|null;onClose:()=>void}){
 const [progress]=useState(()=>new Animated.Value(0));
 useEffect(()=>{
  if(!kind)return;
  progress.setValue(0);
  Animated.spring(progress,{toValue:1,damping:24,stiffness:260,mass:.85,useNativeDriver:true}).start();
 },[kind,progress]);
 if(!kind)return null;
 const privacy=kind==='privacy';
 return <Modal transparent visible animationType="none" onRequestClose={onClose}>
  <View style={s.backdrop}>
   <Pressable accessibilityRole="button" accessibilityLabel="Close information menu" onPress={onClose} style={StyleSheet.absoluteFill}/>
   <Animated.View accessibilityViewIsModal style={[s.sheet,{opacity:progress,transform:[{scale:progress.interpolate({inputRange:[0,1],outputRange:[.94,1]})}]}]}>
    <GlassPanel style={s.panel}>
     <View style={s.header}><View style={s.titleGroup}><Text style={s.kicker}>FAIRWAY GOLF GPS</Text><Text style={s.title}>{privacy?'Privacy Policy':'Support'}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Close information menu" onPress={onClose} style={s.close}><Text style={s.closeText}>×</Text></Pressable></View>
     <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {privacy?<>
       <Text style={s.muted}>Last updated October 21, 2026</Text>
       <Text style={s.heading}>What Fairway stores</Text><Text style={s.body}>When you create an account, Fairway stores your email address, username, display name and password-managed account identifier. You may also add a profile photo, favourite courses, friends and completed scorecards.</Text>
       <Text style={s.heading}>Location and maps</Text><Text style={s.body}>Fairway requests foreground location only when you use nearby-course search or the on-course rangefinder. Location is used on the device to sort courses and estimate distances. Fairway does not run background location tracking.</Text>
       <Text style={s.heading}>How information is used</Text><Text style={s.body}>Account information is used to sign you in, sync your own rounds, manage friendships and apply sharing choices. Tee-time searches are sent to Fairway&apos;s backend and booking is completed on the course&apos;s website. Fairway does not process payments.</Text>
       <Text style={s.heading}>Sharing and retention</Text><Text style={s.body}>Your profile and rounds are protected by account-scoped database policies. Friends only receive completed scorecards when you explicitly enable sharing with that friend. Deleting your account removes your cloud profile, friendships, favourites, avatar and account-owned rounds.</Text>
       <Text style={s.heading}>Contact</Text><Text style={s.body}>Questions or privacy requests can be submitted through the Fairway account tools.</Text>
      </>:<>
       <Text style={s.heading}>Need help?</Text><Text style={s.body}>For account, privacy, tee-time or rangefinder questions, include the device model, app version and a short description of what happened. Please do not send your password.</Text>
       <Text style={s.body}>Support contact details will be published when Fairway&apos;s business email service is configured.</Text>
       <Text style={s.heading}>Common fixes</Text><Text style={s.body}>If tee times are slow, refresh once and allow the hosted service time to wake. If GPS is unavailable, enable Location Services and allow Fairway while using the app. Booking is completed on the course&apos;s official website.</Text>
      </>}
     </ScrollView>
    </GlassPanel>
   </Animated.View>
  </View>
 </Modal>;
}

const s=StyleSheet.create({backdrop:{flex:1,backgroundColor:'rgba(25,48,39,.18)',alignItems:'center',justifyContent:'center',padding:20},sheet:{width:'100%',maxWidth:720,maxHeight:'88%',borderRadius:28,boxShadow:'0 16px 50px rgba(25,48,39,.22)'},panel:{padding:22,borderRadius:28,backgroundColor:'#F7FAF3',gap:14},header:{flexDirection:'row',alignItems:'flex-start',gap:14},titleGroup:{flex:1,gap:3},kicker:{fontSize:10,letterSpacing:1.2,color:colors.muted},title:{fontSize:28,fontWeight:'700',color:colors.ink},close:{width:40,height:40,borderRadius:20,backgroundColor:'#E8EEDD',alignItems:'center',justifyContent:'center'},closeText:{fontSize:28,lineHeight:28,color:colors.ink},content:{paddingBottom:8,gap:14},muted:{fontSize:13,color:colors.muted},heading:{fontSize:18,fontWeight:'700',color:colors.ink},body:{fontSize:15,lineHeight:23,color:colors.ink}});
