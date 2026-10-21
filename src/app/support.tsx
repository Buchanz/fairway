import {Link} from 'expo-router';
import {Linking,ScrollView,StyleSheet,Text,View} from 'react-native';
import {GlassPanel,GlassPressable as Pressable} from '../components/Glass';
import {useHideTabs} from '../components/GlassTabs';
import {colors} from '../components/ui';

export default function Support(){
  useHideTabs(true);
  return <ScrollView contentContainerStyle={s.page}>
    <Text style={s.kicker}>FAIRWAY GOLF GPS</Text><Text style={s.title}>Support</Text>
    <GlassPanel style={s.panel}>
      <Text style={s.heading}>Need help?</Text>
      <Text style={s.body}>For account, privacy, tee-time or rangefinder questions, contact us and include the device model, app version and a short description of what happened. Please do not send your password.</Text>
      <Pressable accessibilityRole="link" onPress={()=>void Linking.openURL('mailto:tyler.buchanan.a@gmail.com?subject=Fairway%20support')} style={s.button}><Text style={s.buttonText}>Email Fairway support</Text></Pressable>
      <Text style={s.heading}>Common fixes</Text>
      <Text style={s.body}>If tee times are slow, refresh once and allow the hosted service time to wake. If GPS is unavailable, enable Location Services and allow Fairway while using the app. Booking is completed on the course&apos;s official website.</Text>
    </GlassPanel>
    <View style={s.links}><Link href="/privacy" style={s.link}>Privacy policy</Link><Link href="/delete-account" style={s.link}>Account deletion</Link><Link href="/" style={s.link}>Back to Fairway</Link></View>
  </ScrollView>;
}

const s=StyleSheet.create({page:{padding:24,gap:16,maxWidth:820,width:'100%',alignSelf:'center'},kicker:{fontSize:11,letterSpacing:1,color:colors.muted},title:{fontSize:38,fontWeight:'700',color:colors.ink},panel:{padding:24,borderRadius:24,backgroundColor:'#E9EFDF',gap:16},heading:{fontSize:20,fontWeight:'700',color:colors.ink},body:{fontSize:16,lineHeight:25,color:colors.ink},button:{backgroundColor:colors.green,borderRadius:18,padding:16},buttonText:{textAlign:'center',fontWeight:'700',color:'#fff'},links:{flexDirection:'row',flexWrap:'wrap',gap:18},link:{fontSize:16,color:colors.green,fontWeight:'600'}});
