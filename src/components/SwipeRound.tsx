import {useState, type ReactNode} from 'react';
import {Animated, PanResponder, Pressable, StyleSheet, Text, View} from 'react-native';

/** Horizontal gestures reveal Delete without capturing vertical history scrolling. */
export default function SwipeRound({children,onDelete}:{children:ReactNode;onDelete:()=>void}) {
  const [offset]=useState(()=>new Animated.Value(0));
  const [open,setOpen]=useState(false);
  function settle(next:boolean){setOpen(next);Animated.timing(offset,{toValue:next?-88:0,duration:180,useNativeDriver:false}).start();}
  const responder=PanResponder.create({
    onMoveShouldSetPanResponderCapture:(_,g)=>Math.abs(g.dx)>12&&Math.abs(g.dx)>Math.abs(g.dy)*1.5,
    onPanResponderMove:(_,g)=>offset.setValue(Math.max(-88,Math.min(0,(open?-88:0)+g.dx))),
    onPanResponderRelease:(_,g)=>settle((open?-88:0)+g.dx < -40),
    onPanResponderTerminate:()=>settle(open),
  });
  return <View style={s.shadow}><View style={s.container}>
    <Pressable accessibilityRole="button" accessibilityLabel="Delete saved round" accessibilityElementsHidden={!open} importantForAccessibility={open?'auto':'no-hide-descendants'} onPress={onDelete} style={s.delete}><Text style={s.label}>Delete</Text></Pressable>
    <Animated.View {...responder.panHandlers} accessibilityActions={[{name:'delete',label:'Delete round'}]} onAccessibilityAction={e=>{if(e.nativeEvent.actionName==='delete')onDelete();}} style={{backgroundColor:'#f5f6f2',transform:[{translateX:offset}]}}>{children}</Animated.View>
  </View></View>;
}
const s=StyleSheet.create({shadow:{borderRadius:24,boxShadow:'0 5px 14px rgba(18,45,32,0.14)'},container:{overflow:'hidden',backgroundColor:'#b52d36',borderRadius:24},delete:{position:'absolute',right:0,top:0,bottom:0,width:88,alignItems:'center',justifyContent:'center'},label:{color:'white',fontWeight:'600'}});
