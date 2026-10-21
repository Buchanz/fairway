import {createContext,forwardRef,useContext,useEffect,useState,type ReactNode} from 'react';
import {AccessibilityInfo,Animated,Keyboard,Platform,Pressable,StyleSheet,View,TextInput,type TextInputProps,type PressableProps,type ViewProps,type ViewStyle} from 'react-native';
import {GlassView,isGlassEffectAPIAvailable,isLiquidGlassAvailable} from 'expo-glass-effect';

const GlassContext=createContext(false);
const ReducedMotionContext=createContext(false);
const AnimatedPressable=Animated.createAnimatedComponent(Pressable);
export function GlassProvider({children}:{children:ReactNode}){
 const [reducedMotion,setReducedMotion]=useState(false);
 useEffect(()=>{void AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);const listener=AccessibilityInfo.addEventListener('reduceMotionChanged',setReducedMotion);return()=>listener.remove();},[]);
 const [reduceTransparency,setReduceTransparency]=useState(true);
 useEffect(()=>{
  if(Platform.OS!=='ios')return;
  void AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency);
  const listener=AccessibilityInfo.addEventListener('reduceTransparencyChanged',setReduceTransparency);
  return()=>listener.remove();
 },[]);
 const enabled=Platform.OS==='ios'&&!reduceTransparency&&isGlassEffectAPIAvailable()&&isLiquidGlassAvailable();
 return <ReducedMotionContext.Provider value={reducedMotion}><GlassContext.Provider value={enabled}>{children}</GlassContext.Provider></ReducedMotionContext.Provider>;
}
const useGlass=()=>useContext(GlassContext);
function appearance(style:ViewStyle,selected=false){
 const color=typeof style.backgroundColor==='string'?style.backgroundColor:'#ffffff';
 const dark=['#12231e','#163d2c','#175d3d','#1f503f','#2460ae','#b52d36','#183c32','#12432e','#28734c'].some(c=>color.toLowerCase().startsWith(c));
 const tint=/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(color)?color.slice(0,7)+(selected||color.toLowerCase()==='#c5eb65'?'ee':dark?'99':'66'):color;
 return {tintColor:tint,colorScheme:dark?'dark' as const:'light' as const};
}
/** Only material surfaces are replaced; layout-only Views remain ordinary Views. */
export const GlassPanel=forwardRef<View,ViewProps & {interactive?:boolean}>(function GlassPanel({style,children,interactive=false,...props},ref){
 const enabled=useGlass(),flat=StyleSheet.flatten(style)||{};
 if(!enabled||!flat.backgroundColor||!flat.borderRadius)return <View ref={ref} {...props} style={[Platform.OS==='android'&&flat.backgroundColor&&flat.backgroundColor!=='transparent'&&flat.borderRadius?{elevation:3,shadowColor:'#183C32'}:undefined,style]}>{children}</View>;
 if(interactive)return <GlassView ref={ref} {...props} isInteractive glassEffectStyle="regular" {...appearance(flat)} style={[style,{backgroundColor:'transparent',borderWidth:0,boxShadow:'none',shadowOpacity:0,elevation:0}]}>{children}</GlassView>;
 return <View ref={ref} {...props} style={[style,{backgroundColor:'transparent',boxShadow:'none',shadowOpacity:0,elevation:0,borderWidth:0,borderTopWidth:0,borderBottomWidth:0,borderLeftWidth:0,borderRightWidth:0}]}><GlassView pointerEvents="none" glassEffectStyle="regular" {...appearance(flat)} style={[StyleSheet.absoluteFill,{borderRadius:flat.borderRadius}]} />{children}</View>;
});
/** Animate the drawing, not the layout, so selection never shifts neighbouring controls. */
const FeedbackPressable=forwardRef<View,PressableProps>(function FeedbackPressable({style,onPressIn,onPressOut,onHoverIn,onHoverOut,disabled,...props},ref){
 const reducedMotion=useContext(ReducedMotionContext);
 const [scale]=useState(()=>new Animated.Value(1));
 const [pressed,setPressed]=useState(false);
 const [hovered,setHovered]=useState(false);
 const animate=(pressed:boolean)=>{scale.stopAnimation();Animated.timing(scale,{toValue:pressed&&!reducedMotion ? 0.97 : 1,duration:reducedMotion?0:pressed?90:160,useNativeDriver:true}).start();};
 useEffect(()=>{if(disabled)scale.setValue(1);},[disabled,scale]);
 const base=typeof style==='function'?style({pressed:pressed&&!disabled}):style;
 const flat=StyleSheet.flatten(base)||{};
 const surface=flat.borderRadius&&flat.backgroundColor&&flat.backgroundColor!=='transparent';
 return <AnimatedPressable ref={ref} {...props} disabled={disabled}
  onHoverIn={event=>{setHovered(true);onHoverIn?.(event);}}
  onHoverOut={event=>{setHovered(false);onHoverOut?.(event);}}
  onPressIn={event=>{setPressed(true);animate(true);onPressIn?.(event);}}
  onPressOut={event=>{setPressed(false);animate(false);onPressOut?.(event);}}
  style={[Platform.OS==='android'&&surface?{elevation:pressed&&!disabled?1:4,shadowColor:'#183C32'}:undefined,base,Platform.OS==='web'?{cursor:disabled?'auto':'pointer',filter:!disabled&&hovered?'brightness(1.06)':'none',...(surface&&hovered&&!disabled?{boxShadow:pressed?'0 2px 5px rgba(24,60,50,0.16)':'0 6px 16px rgba(24,60,50,0.22)'}:{})}:undefined,{opacity:(typeof flat.opacity==='number'?flat.opacity:1)*(pressed&&!disabled?0.86:1),transform:[...(Array.isArray(flat.transform)?flat.transform:[]),{scale}]}]}/>;
});
export const GlassPressable=forwardRef<View,PressableProps>(function GlassPressable({style,children,onPress,...props},ref){
 const enabled=useGlass();
 const press:PressableProps['onPress']=event=>{Keyboard.dismiss();onPress?.(event);};
 // Put the touch target INSIDE the interactive material so UIKit sees the touches.
 const normal=typeof style==='function'?style({pressed:false}):style;
 const flat=StyleSheet.flatten(normal)||{};
 if(Platform.OS==='android'||Platform.OS==='web')return <FeedbackPressable ref={ref} {...props} onPress={onPress?press:undefined} style={style}>{children}</FeedbackPressable>;
 if(!enabled||!flat.borderRadius)return <Pressable ref={ref} {...props} onPress={onPress?press:undefined} style={style}>{children}</Pressable>;
 const {padding,paddingHorizontal,paddingVertical,paddingTop,paddingBottom,paddingLeft,paddingRight,alignItems,justifyContent,flexDirection,gap,...outer}=flat;
 const layout={padding,paddingHorizontal,paddingVertical,paddingTop,paddingBottom,paddingLeft,paddingRight,alignItems,justifyContent,flexDirection,gap};
 return <GlassView isInteractive glassEffectStyle={typeof flat.opacity==='number'&&flat.opacity<.02?'none':'regular'} {...appearance(flat,props.accessibilityState?.selected)} style={[outer,{backgroundColor:'transparent',boxShadow:'none',shadowOpacity:0,elevation:0,borderWidth:0,borderTopWidth:0,borderBottomWidth:0,borderLeftWidth:0,borderRightWidth:0}]}>
  <Pressable ref={ref} {...props} onPress={onPress?press:undefined} style={[layout,{flexGrow:1,alignSelf:'stretch',borderRadius:flat.borderRadius,backgroundColor:'transparent'}]}>{children}</Pressable>
 </GlassView>;
});
export const AnimatedGlassPanel=Animated.createAnimatedComponent(GlassPanel);

export const GlassInput=forwardRef<TextInput,TextInputProps>(function GlassInput({style,...props},ref){
 const enabled=useGlass();
 const flat=StyleSheet.flatten(style)||{};
 if(!enabled)return <TextInput ref={ref} {...props} style={style}/>;
 return <GlassView isInteractive glassEffectStyle="regular" {...appearance(flat)} style={[style,{justifyContent:'center',backgroundColor:'transparent',borderWidth:0,boxShadow:'none',shadowOpacity:0,elevation:0}]}><TextInput ref={ref} {...props} style={{padding:0,fontSize:flat.fontSize||16,color:flat.color||'#183C32',textAlign:flat.textAlign,minHeight:22,backgroundColor:'transparent'}}/></GlassView>;
});
