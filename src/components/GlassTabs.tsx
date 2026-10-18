import {createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {Animated,Keyboard,Platform,Pressable,StyleSheet,Text,View,AccessibilityInfo,PanResponder} from 'react-native';
import {router,usePathname,useNavigation,useFocusEffect} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SymbolView} from 'expo-symbols';
import {GlassPanel,GlassPressable} from './Glass';
const Visibility=createContext({hidden:false,setHidden:(_hidden:boolean)=>{}});
export function TabVisibilityProvider({children}:{children:ReactNode}){const [hidden,setHidden]=useState(false);return <Visibility.Provider value={{hidden,setHidden}}>{children}</Visibility.Provider>;}
export function useHideTabs(hidden:boolean){const {setHidden}=useContext(Visibility);useEffect(()=>{setHidden(hidden);return()=>setHidden(false);},[hidden,setHidden]);}
const tabs=[{path:'/' as const,label:'Search',icon:{ios:'magnifyingglass',android:'search',web:'search'} as const},{path:'/play' as const,label:'Play',icon:{ios:'figure.golf',android:'sports_golf',web:'sports_golf'} as const},{path:'/games' as const,label:'Games',icon:{ios:'list.bullet.rectangle',android:'scoreboard',web:'scoreboard'} as const},{path:'/account' as const,label:'Account',icon:{ios:'person.crop.circle',android:'account_circle',web:'account_circle'} as const}];
export function GlassTabs(){
 const pathname=usePathname(),insets=useSafeAreaInsets(),{hidden}=useContext(Visibility);
 const [pressedScale]=useState(()=>new Animated.Value(1));
 const [width,setWidth]=useState(0),[progress]=useState(()=>new Animated.Value(0)),[reduced,setReduced]=useState(false);
 const selected=Math.max(0,tabs.findIndex(t=>t.path===pathname));
 useEffect(()=>{void AccessibilityInfo.isReduceMotionEnabled().then(setReduced);const sub=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduced);return()=>sub.remove();},[]);
 const dragging=useRef(false),dragIndex=useRef(selected),dragStart=useRef(0);
 const barRef=useRef<View>(null),barLeft=useRef(0),cellWidth=useRef(1),lastWidth=useRef(0);
 useEffect(()=>{
  if(dragging.current)return;
  if(dragIndex.current===selected&&lastWidth.current===width)return;
  dragIndex.current=selected;lastWidth.current=width;
  const motion=Animated.timing(progress,{toValue:selected*Math.max(0,(width-12)/tabs.length),duration:reduced?0:220,useNativeDriver:true});
  motion.start();
 },[selected,progress,reduced,width]);
 // Keep the responder stable while hovering changes the route beneath it.
 // PanResponder stores these callbacks; ref reads occur only in gesture events.
 // eslint-disable-next-line react-hooks/refs
 const [pan]=useState(()=>PanResponder.create({
  onMoveShouldSetPanResponderCapture:(_,g)=>Math.abs(g.dx)>6&&Math.abs(g.dx)>Math.abs(g.dy),
  onPanResponderGrant:(_,g)=>{
   Keyboard.dismiss();dragging.current=true;progress.stopAnimation();Animated.spring(pressedScale,{toValue:1.06,useNativeDriver:true,damping:22,stiffness:300}).start();
   const index=Math.min(3,Math.max(0,Math.floor((g.x0-barLeft.current-6)/cellWidth.current)));
   dragStart.current=index*cellWidth.current;dragIndex.current=index;
   router.navigate(tabs[index].path);
  },
  onPanResponderMove:(_,g)=>{
   const cell=cellWidth.current,x=Math.max(0,Math.min(3*cell,dragStart.current+g.dx));
   progress.setValue(x);
   const index=Math.round(x/cell);
   if(index!==dragIndex.current){dragIndex.current=index;router.navigate(tabs[index].path);}
  },
  onPanResponderRelease:()=>{
   dragging.current=false;Animated.spring(pressedScale,{toValue:1,useNativeDriver:true,damping:22,stiffness:300}).start();
   Animated.spring(progress,{toValue:dragIndex.current*cellWidth.current,useNativeDriver:true,damping:24,stiffness:240,mass:1}).start();
  },
  onPanResponderTerminationRequest:()=>false,
  onPanResponderTerminate:()=>{dragging.current=false;Animated.timing(pressedScale,{toValue:1,duration:150,useNativeDriver:true}).start();Animated.timing(progress,{toValue:dragIndex.current*cellWidth.current,duration:180,useNativeDriver:true}).start();},
 }));
 if(Platform.OS==='web'||hidden||!tabs.some(t=>t.path===pathname))return null;
 return <View style={[s.wrap,{paddingBottom:Math.max(insets.bottom,8)}]}><View ref={barRef} collapsable={false} style={{width:'100%',maxWidth:440,alignSelf:'center'}} onLayout={e=>{setWidth(e.nativeEvent.layout.width);cellWidth.current=Math.max(1,(e.nativeEvent.layout.width-12)/tabs.length);barRef.current?.measureInWindow(x=>{barLeft.current=x;});}}><GlassPanel interactive {...pan.panHandlers} style={s.bar}>
  {width>0&&<Animated.View style={[s.selection,{zIndex:2,width:(width-12)/tabs.length,transform:[{translateX:progress},{scale:pressedScale}]}]}><GlassPanel interactive style={{flex:1,borderRadius:28,backgroundColor:'#dce9df'}}><Pressable accessibilityRole="tab" accessibilityLabel={tabs[selected].label} accessibilityState={{selected:true}} onPressIn={()=>Animated.spring(pressedScale,{toValue:1.04,useNativeDriver:true,damping:24,stiffness:350}).start()} onPressOut={()=>{if(!dragging.current)Animated.spring(pressedScale,{toValue:1,useNativeDriver:true,damping:24,stiffness:350}).start();}} onPress={()=>Keyboard.dismiss()} style={s.tab}/></GlassPanel></Animated.View>}
  {tabs.map((tab,index)=><Pressable key={tab.path} accessibilityRole="tab" accessibilityLabel={tab.label} accessibilityState={{selected:pathname===tab.path}} accessible={pathname!==tab.path} onPress={()=>{
   Keyboard.dismiss();dragIndex.current=index;
   Animated.timing(progress,{toValue:index*cellWidth.current,duration:reduced?0:180,useNativeDriver:true}).start();
   if(pathname!==tab.path)requestAnimationFrame(()=>router.navigate(tab.path));
  }} style={s.tab}/>)}
  <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{position:'absolute',left:6,right:6,top:6,bottom:6,flexDirection:'row',zIndex:3}}>
   {tabs.map(tab=><View key={tab.path} style={s.tab}><SymbolView name={tab.icon} tintColor="#183C32" size={23} fallback={<Text>{tab.label==='Play'?'▶':tab.label==='Account'?'●':'⚑'}</Text>}/><Text style={s.label}>{tab.label}</Text></View>)}
  </View>
 </GlassPanel></View></View>;
}
export function BackButton(){
 const navigation=useNavigation();
 useFocusEffect(useCallback(()=>{navigation.setOptions({animation:'none'});},[navigation]));
 return <GlassPressable accessibilityRole="button" accessibilityLabel="Back to tee times" onPress={()=>{navigation.setOptions({animation:'slide_from_right'});requestAnimationFrame(()=>router.canGoBack()?router.dismissTo('/'):router.replace('/'));}} style={s.back}><SymbolView name="chevron.left" tintColor="#183C32" size={20} fallback={<Text style={{fontSize:28}}>‹</Text>}/></GlassPressable>;
}
const s=StyleSheet.create({wrap:{paddingHorizontal:24,paddingTop:6,backgroundColor:'#F5F6F2'},bar:{flexDirection:'row',borderRadius:36,padding:6,backgroundColor:'#ffffff',height:66,maxWidth:440,width:'100%',alignSelf:'center'},selection:{position:'absolute',left:6,top:6,bottom:6,borderRadius:28},tab:{flex:1,alignItems:'center',justifyContent:'center',gap:3},label:{fontSize:10,fontWeight:'600',color:'#183C32'},back:{width:44,height:44,borderRadius:22,backgroundColor:'#e8eedd',alignItems:'center',justifyContent:'center'}});
