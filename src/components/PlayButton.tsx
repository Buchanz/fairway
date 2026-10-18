import {GlassPressable as Pressable} from './Glass';
import {useState} from 'react';
import {StyleSheet,Text,View} from 'react-native';
import {router} from 'expo-router';
import {colors} from './ui';

export function PlayButton({courseIds}:{courseIds:string}){
 const [hovered,setHovered]=useState(false);
 return <View style={s.wrap}>
   <Pressable onPress={()=>router.push({pathname:'/play',params:{courseIds}})} accessibilityRole="button" accessibilityLabel="Play: scorecard and rangefinder" onHoverIn={()=>setHovered(true)} onHoverOut={()=>setHovered(false)} style={({pressed})=>[s.button,hovered&&s.highlight,pressed&&s.pressed]}>
    <Text numberOfLines={1} style={s.text}>Play</Text>
   </Pressable>
 </View>;
}
const s=StyleSheet.create({
 wrap:{flexGrow:1,flexBasis:76,minWidth:72,alignSelf:'stretch',borderRadius:12},
 button:{flex:1,minHeight:46,width:'100%',paddingHorizontal:12,borderRadius:12,backgroundColor:colors.green,justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:colors.green},
 highlight:{backgroundColor:'#28734c',boxShadow:'0 3px 10px rgba(24,60,50,0.16)'},
 pressed:{backgroundColor:'#12432e'},
 text:{fontSize:13,fontWeight:'600',color:'white'},
});
