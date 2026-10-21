import {Link} from 'expo-router';
import {ScrollView,StyleSheet,Text,View} from 'react-native';
import {GlassPanel} from '../components/Glass';
import {useHideTabs} from '../components/GlassTabs';
import {colors} from '../components/ui';

export default function Privacy(){
  useHideTabs(true);
  return <ScrollView contentContainerStyle={s.page}>
    <Text style={s.kicker}>FAIRWAY GOLF GPS</Text>
    <Text style={s.title}>Privacy Policy</Text>
    <Text style={s.muted}>Last updated October 21, 2026</Text>
    <GlassPanel style={s.panel}>
      <Text style={s.heading}>What Fairway stores</Text>
      <Text style={s.body}>When you create an account, Fairway stores your email address, username, display name and password-managed account identifier. You may also add a profile photo, favourite courses, friends and completed scorecards.</Text>
      <Text style={s.heading}>Location and maps</Text>
      <Text style={s.body}>Fairway requests foreground location only when you use nearby-course search or the on-course rangefinder. Location is used on the device to sort courses and estimate distances. Fairway does not run background location tracking.</Text>
      <Text style={s.heading}>How information is used</Text>
      <Text style={s.body}>Account information is used to sign you in, sync your own rounds, manage friendships and apply sharing choices. Tee-time searches are sent to Fairway&apos;s backend and booking is completed on the course&apos;s website. Fairway does not process payments.</Text>
      <Text style={s.heading}>Sharing and retention</Text>
      <Text style={s.body}>Your profile and rounds are protected by account-scoped database policies. Friends only receive completed scorecards when you explicitly enable sharing with that friend. Deleting your account removes your cloud profile, friendships, favourites, avatar and account-owned rounds.</Text>
      <Text style={s.heading}>Contact</Text>
      <Text style={s.body}>Questions or privacy requests: tyler.buchanan.a@gmail.com</Text>
    </GlassPanel>
    <View style={s.links}><Link href="/delete-account" style={s.link}>Account deletion</Link><Link href="/support" style={s.link}>Support</Link><Link href="/" style={s.link}>Back to Fairway</Link></View>
  </ScrollView>;
}

const s=StyleSheet.create({page:{padding:24,gap:16,maxWidth:820,width:'100%',alignSelf:'center'},kicker:{fontSize:11,letterSpacing:1,color:colors.muted},title:{fontSize:38,fontWeight:'700',color:colors.ink},muted:{fontSize:14,color:colors.muted},panel:{padding:24,borderRadius:24,backgroundColor:'#E9EFDF',gap:16},heading:{fontSize:20,fontWeight:'700',color:colors.ink},body:{fontSize:16,lineHeight:25,color:colors.ink},links:{flexDirection:'row',flexWrap:'wrap',gap:18},link:{fontSize:16,color:colors.green,fontWeight:'600'}});
