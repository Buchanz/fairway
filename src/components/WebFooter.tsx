import {Link} from 'expo-router';
import {Platform,Pressable,StyleSheet,Text,View} from 'react-native';

/** Shared web-only footer. Store links stay intentionally disabled until the
 * corresponding public listings exist, so the site never points visitors at
 * a fake download page. */
export function WebFooter({onPrivacy,onSupport}:{onPrivacy?:()=>void;onSupport?:()=>void}={}){
  if(Platform.OS!=='web')return null;
  return <View accessibilityLabel="Fairway site footer" style={s.footer}>
    <View style={s.inner}>
      <View style={s.topLine}><View><Text style={s.brand}>fairway<Text style={s.dot}>.</Text></Text><Text style={s.tagline}>More golf. Less searching.</Text></View><View style={s.links}>
        {onPrivacy?<Pressable accessibilityRole="button" onPress={onPrivacy} style={s.linkButton}><Text style={s.link}>Privacy</Text></Pressable>:<Link href="/privacy" style={s.link}>Privacy</Link>}
        {onSupport?<Pressable accessibilityRole="button" onPress={onSupport} style={s.linkButton}><Text style={s.link}>Support</Text></Pressable>:<Link href="/support" style={s.link}>Support</Link>}
      </View><Pressable accessibilityRole="button" accessibilityState={{disabled:true}} disabled style={s.storeButton}><View style={s.appleMark}><Text style={s.appleGlyph}></Text><View><Text style={s.storeEyebrow}>Download on the</Text><Text style={s.storeTitle}>App Store</Text></View></View></Pressable></View>
      <Text style={s.fine}>© {new Date().getFullYear()} Fairway · Course and tee-time information is provided for planning.</Text>
    </View>
  </View>;
}

const s=StyleSheet.create({
  footer:{width:'100vw' as any,marginLeft:'calc(50% - 50vw)' as any,borderTopWidth:1,borderTopColor:'#dfe7df',backgroundColor:'#edf2ea'},
  inner:{width:'100%',maxWidth:1100,alignSelf:'center',paddingHorizontal:20,paddingVertical:9,gap:4},
  topLine:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:14,flexWrap:'wrap'},
  brand:{fontSize:16,fontWeight:'800',letterSpacing:-.6,color:'#183c32'},dot:{color:'#799544'},tagline:{fontSize:9,color:'#708078',marginTop:1},
  links:{flexDirection:'row',flexWrap:'wrap',gap:12,alignItems:'center'},linkButton:{padding:0},link:{fontSize:10,fontWeight:'600',color:'#276447',textDecorationLine:'none'},
  storeButton:{minWidth:132,minHeight:34,paddingHorizontal:10,paddingVertical:5,borderRadius:7,backgroundColor:'#050505',opacity:.92},appleMark:{flexDirection:'row',alignItems:'center',gap:7},appleGlyph:{fontSize:20,lineHeight:21,color:'#fff'},storeEyebrow:{fontSize:8,lineHeight:9,color:'#fff'},storeTitle:{fontSize:13,lineHeight:14,fontWeight:'700',color:'#fff'},
  fine:{fontSize:8,color:'#708078',marginTop:2},
});
