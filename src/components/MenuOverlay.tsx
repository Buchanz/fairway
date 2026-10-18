import {GlassPressable as Pressable,AnimatedGlassPanel} from './Glass';
import {type ReactNode, useEffect, useState} from 'react';
import {AccessibilityInfo, Animated, Modal, ScrollView, StyleSheet, Text, useWindowDimensions, View, Platform, StatusBar} from 'react-native';

export type MenuAnchor = {x:number; y:number; width:number; height:number};
/** Keep the menu mounted during its return journey to the originating control. */
export function MenuOverlay({open, anchor, onClose, onExited, children, label, headerContent, preferredWidth, footer}: {
  open:boolean; anchor:MenuAnchor; onClose:()=>void; onExited:()=>void; children:ReactNode; label:string; headerContent?:ReactNode; preferredWidth:number; tinted?:boolean; footer?:ReactNode;
}) {
  const {height, width} = useWindowDimensions();
  const [progress] = useState(() => new Animated.Value(0));
  const [contentHeight, setContentHeight] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const menuWidth = Math.max(anchor.width, Math.min(width - 32, preferredWidth));
  const left = Math.max(16,Math.min(anchor.x,width-menuWidth-16));
  // Android window measurements exclude the status bar; this translucent modal includes it.
  const anchorY = anchor.y + (Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0);
  const top = Math.max(16, Math.min(anchorY, height - 200));
  const footerHeight = footer ? 80 : 0;
  const menuHeight = Math.min(contentHeight + anchor.height + footerHeight + 2, height - top - 24);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    if (!contentHeight) return;
    const animation = reduceMotion?Animated.timing(progress,{toValue:open?1:0,duration:0,useNativeDriver:false}):Animated.spring(progress,{toValue:open?1:0,damping:26,stiffness:240,mass:0.9,overshootClamping:true,useNativeDriver:false});
    animation.start(({finished}) => {if (finished && !open) onExited();});
    return () => animation.stop();
  }, [open, contentHeight, progress, reduceMotion, onExited]);
  const morph = (from:number,to:number) => progress.interpolate({inputRange:[0,1],outputRange:[from,to]});
  return <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
    <View style={styles.layer}>
      <Animated.View style={[styles.backdrop,{opacity:progress}]}><Pressable accessibilityRole="button" accessibilityLabel="Dismiss menu" onPress={onClose} style={styles.layer}/></Animated.View>
      <AnimatedGlassPanel accessibilityViewIsModal style={[styles.menu, {
        left:morph(anchor.x,left), top:morph(anchorY,top), width:morph(anchor.width,menuWidth),
        height:morph(anchor.height,menuHeight), borderRadius:morph(anchor.height/2,28), backgroundColor:'#E8EEDD',
      }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close menu" onPress={onClose} style={{height:anchor.height,width:headerContent?anchor.width:menuWidth,justifyContent:'center',paddingHorizontal:headerContent?0:14}}>
          {headerContent??<Text numberOfLines={1} style={styles.label}>{label}</Text>}
        </Pressable>
        <Animated.View style={{width:menuWidth-2, height:Math.max(1,menuHeight-anchor.height-2), opacity:progress.interpolate({inputRange:[0,.25,1],outputRange:[0.01,0.01,1]})}}>
          <ScrollView bounces={false} keyboardShouldPersistTaps="handled" onContentSizeChange={(_w,h)=>setContentHeight(h)} style={styles.scroll}>{children}</ScrollView>
          {footer&&<View style={styles.footer}>{footer}</View>}
        </Animated.View>

      </AnimatedGlassPanel>
    </View>
  </Modal>;
}
const styles = StyleSheet.create({
  layer:{flex:1},
  backdrop:{position:'absolute',top:0,right:0,bottom:0,left:0,backgroundColor:'rgba(25,48,39,0.12)'},
  menu:{position:'absolute',backgroundColor:'#fff',borderWidth:1,borderColor:'#DFE5DB',overflow:'hidden',boxShadow:'0 12px 40px rgba(25,48,39,0.16)'},
  label:{fontSize:12,fontWeight:'600',color:'#183C32'},
  footer:{height:80,padding:14,borderTopWidth:1,borderTopColor:'#D5DDD1',justifyContent:'center'},
  closePosition:{position:'absolute',right:2,top:4},
  close:{width:40,height:36,alignItems:'center',justifyContent:'center'},
  closeText:{fontSize:25,color:'#66756B'},scroll:{flex:1},
});
