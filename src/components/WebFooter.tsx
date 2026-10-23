import {Link} from 'expo-router';
import {Image} from 'expo-image';
import {Platform,Pressable,StyleSheet,Text,View} from 'react-native';

/** Shared web-only footer. Store links stay intentionally disabled until the
 * corresponding public listings exist, so the site never points visitors at
 * a fake download page. */
export function WebFooter({onPrivacy,onSupport,onMobile}:{onPrivacy?:()=>void;onSupport?:()=>void;onMobile?:()=>void}={}){
  if(Platform.OS!=='web')return null;
  return <View accessibilityLabel="Fairway site footer" style={s.footer}>
    <View style={s.inner}>
      <View style={s.topLine}><View style={s.brandBlock}><Image source={require('../../assets/icon.png')} contentFit="cover" style={s.footerIcon}/><View><Text style={s.brand}>fairway<Text style={s.dot}>.</Text></Text><Text style={s.tagline}>More golf. Less searching.</Text></View></View><View style={s.links}>
        {onMobile&&<Pressable accessibilityRole="button" onPress={onMobile} style={s.linkButton}><Text style={s.link}>Mobile</Text></Pressable>}
        {onPrivacy?<Pressable accessibilityRole="button" onPress={onPrivacy} style={s.linkButton}><Text style={s.link}>Privacy</Text></Pressable>:<Link href="/privacy" style={s.link}>Privacy</Link>}
        {onSupport?<Pressable accessibilityRole="button" onPress={onSupport} style={s.linkButton}><Text style={s.link}>Support</Text></Pressable>:<Link href="/support" style={s.link}>Support</Link>}
      </View><Pressable accessibilityRole="button" accessibilityLabel="Open TestFlight access" onPress={onMobile} disabled={!onMobile} style={({pressed})=>[s.storeButton,pressed&&s.pressed]}><View style={s.testflightMark}><Image source={require('../../assets/testflight-logo.png')} contentFit="contain" style={s.testflightIcon}/><View><Text style={s.storeEyebrow}>Download on</Text><Text style={s.storeTitle}>TestFlight</Text></View></View></Pressable></View>
      <Text style={s.fine}>© {new Date().getFullYear()} Fairway · Course and tee-time information is provided for planning.</Text>
    </View>
  </View>;
}

const s=StyleSheet.create({
  footer:{position:'absolute',left:0,right:0,bottom:0,zIndex:40,width:'100%' as any,borderTopWidth:1,borderTopColor:'#dfe7df',backgroundColor:'#edf2ea'},
  inner:{width:'100%',maxWidth:1100,alignSelf:'center',paddingHorizontal:20,paddingVertical:12,gap:6},
  topLine:{minHeight:52,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:14,flexWrap:'wrap'},
  brandBlock:{flexDirection:'row',alignItems:'center',gap:8},footerIcon:{width:30,height:30,borderRadius:7},
  brand:{fontSize:16,fontWeight:'800',letterSpacing:-.6,color:'#183c32'},dot:{color:'#799544'},tagline:{fontSize:9,color:'#708078',marginTop:1},
  links:{flexDirection:'row',flexWrap:'wrap',gap:12,alignItems:'center'},linkButton:{padding:0},link:{fontSize:10,fontWeight:'600',color:'#276447',textDecorationLine:'none'},
  storeButton:{width:112,minWidth:112,minHeight:34,paddingHorizontal:6,paddingVertical:4,borderRadius:8,backgroundColor:'#050505',opacity:.96,boxShadow:'0 4px 12px rgba(10,25,18,.18)'},pressed:{opacity:.78,transform:[{scale:.97}]},testflightMark:{width:'100%',flexDirection:'row',alignItems:'center',gap:6},testflightIcon:{width:26,height:26,borderRadius:6},storeEyebrow:{fontSize:7,lineHeight:8,color:'#fff'},storeTitle:{fontSize:12,lineHeight:13,fontWeight:'700',color:'#fff'},
  fine:{width:'100%',fontSize:8,color:'#708078',marginTop:4,textAlign:'center'},
});
