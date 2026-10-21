import {Link} from 'expo-router';
import {ScrollView,StyleSheet,Text,View} from 'react-native';
import {GlassPanel} from '../components/Glass';
import {useHideTabs} from '../components/GlassTabs';
import {colors} from '../components/ui';

export default function DeleteAccount(){
  useHideTabs(true);
  return <ScrollView contentContainerStyle={s.page}>
    <Text style={s.kicker}>FAIRWAY GOLF GPS</Text><Text style={s.title}>Delete your account</Text>
    <GlassPanel style={s.panel}>
      <Text style={s.heading}>From the app</Text>
      <Text style={s.body}>Sign in, open Account, open the menu in the top-right corner, choose Delete account, and confirm. This permanently removes your Fairway account and cloud data, including your profile, avatar, favourites, friendships and account-owned rounds.</Text>
      <Text style={s.heading}>If you cannot sign in</Text>
      <Text style={s.body}>If you cannot sign in, use the in-app support flow after recovering access. We may ask you to verify ownership before processing a deletion request.</Text>
      <Text style={s.heading}>Device-only data</Text>
      <Text style={s.body}>Guest rounds and local caches are stored on the device and are not imported into an account. Remove them from the app where available, or uninstall Fairway to clear device-only data.</Text>
    </GlassPanel>
    <View style={s.links}><Link href="/privacy" style={s.link}>Privacy policy</Link><Link href="/support" style={s.link}>Support</Link><Link href="/" style={s.link}>Back to Fairway</Link></View>
  </ScrollView>;
}

const s=StyleSheet.create({page:{padding:24,gap:16,maxWidth:820,width:'100%',alignSelf:'center'},kicker:{fontSize:11,letterSpacing:1,color:colors.muted},title:{fontSize:38,fontWeight:'700',color:colors.ink},panel:{padding:24,borderRadius:24,backgroundColor:'#E9EFDF',gap:16},heading:{fontSize:20,fontWeight:'700',color:colors.ink},body:{fontSize:16,lineHeight:25,color:colors.ink},links:{flexDirection:'row',flexWrap:'wrap',gap:18},link:{fontSize:16,color:colors.green,fontWeight:'600'}});
