import {Link} from 'expo-router';
import {Platform,Pressable,StyleSheet,Text,View} from 'react-native';

/** Shared web-only footer. Store links stay intentionally disabled until the
 * corresponding public listings exist, so the site never points visitors at
 * a fake download page. */
export function WebFooter(){
  if(Platform.OS!=='web')return null;
  return <View accessibilityLabel="Fairway site footer" style={s.footer}>
    <View style={s.inner}>
      <Text style={s.brand}>fairway<Text style={s.dot}>.</Text></Text>
      <Text style={s.tagline}>More golf. Less searching.</Text>
      <View style={s.links}>
        <Link href="/privacy" style={s.link}>Privacy</Link>
        <Link href="/support" style={s.link}>Support</Link>
        <Link href="/delete-account" style={s.link}>Delete account</Link>
      </View>
      <View style={s.downloads}>
        <Pressable accessibilityRole="button" accessibilityState={{disabled:true}} disabled style={s.storeButton}>
          <Text style={s.storeTitle}>Download on iOS</Text>
          <Text style={s.storeNote}>Coming soon</Text>
        </Pressable>
      </View>
      <Text style={s.fine}>© {new Date().getFullYear()} Fairway · Course and tee-time information is provided for planning.</Text>
    </View>
  </View>;
}

const s=StyleSheet.create({
  footer:{width:'100%',borderTopWidth:1,borderTopColor:'#dfe7df',backgroundColor:'#edf2ea'},
  inner:{width:'100%',maxWidth:1000,alignSelf:'center',paddingHorizontal:20,paddingVertical:14,gap:4},
  brand:{fontSize:18,fontWeight:'800',letterSpacing:-.6,color:'#183c32'},dot:{color:'#799544'},tagline:{fontSize:10,color:'#708078'},
  links:{flexDirection:'row',flexWrap:'wrap',gap:14,marginTop:4},link:{fontSize:11,fontWeight:'600',color:'#276447',textDecorationLine:'none'},
  downloads:{marginTop:4,alignItems:'flex-start'},storeButton:{minWidth:140,minHeight:34,paddingHorizontal:13,paddingVertical:5,borderRadius:18,backgroundColor:'#d9e3d7',opacity:.76},storeTitle:{fontSize:11,fontWeight:'700',color:'#183c32'},storeNote:{fontSize:9,color:'#708078',marginTop:1},
  fine:{fontSize:9,color:'#708078',marginTop:4},
});
