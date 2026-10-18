import {useCallback,useEffect,useRef,useState} from 'react';
import {Image,Text,View} from 'react-native';
import {SymbolView} from 'expo-symbols';
import {GlassPressable} from './Glass';
import {MenuOverlay,type MenuAnchor} from './MenuOverlay';
import AccountScreen from './AccountScreen';
import {useAuth} from '../auth/AuthProvider';
import {avatarUrl,cachedAvatar} from '../lib/avatar-cache';
export function WebAccountMenu(){
 const {session}=useAuth();
 const button=useRef<View>(null);
 const [photo,setPhoto]=useState<string|null>(()=>cachedAvatar(session?.user.user_metadata.avatar_path)),[anchor,setAnchor]=useState<MenuAnchor|null>(null),[open,setOpen]=useState(false);
 const close=useCallback(()=>setOpen(false),[]),exited=useCallback(()=>setAnchor(null),[]);
 useEffect(()=>{
  let active=true;
  const path=session?.user.user_metadata.avatar_path;
  if(session&&typeof path==='string'&&path.startsWith(session.user.id+'/')){
   void avatarUrl(path).then(url=>{if(active)setPhoto(url);}).catch(()=>{});
  }else{void Promise.resolve().then(()=>{if(active)setPhoto(null);});}
  return()=>{active=false;};
 },[session]);
 useEffect(()=>{
  if(!anchor)return;
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape')close();};
  window.addEventListener('keydown',key);
  return()=>window.removeEventListener('keydown',key);
 },[anchor,close]);
 const avatar=photo?<Image source={{uri:photo}} style={{width:44,height:44,borderRadius:22}}/>:<SymbolView name={{ios:'person.crop.circle',android:'account_circle',web:'account_circle'}} size={28} tintColor="#183C32"/>;
 return <View style={{marginLeft:'auto'}}>
  <GlassPressable ref={button} accessibilityRole="button" accessibilityLabel="Account" accessibilityState={{expanded:open}} onPress={()=>button.current?.measureInWindow((x,y,width,height)=>{setAnchor({x,y,width,height});setOpen(true);})} style={{width:44,height:44,borderRadius:22,backgroundColor:'#ffffff',alignItems:'center',justifyContent:'center',boxShadow:'0 3px 12px rgba(24,60,50,.12)',opacity:anchor?0:1}}>{avatar}</GlassPressable>
  {anchor&&<MenuOverlay open={open} anchor={anchor} onClose={close} onExited={exited} preferredWidth={460} label="Close account" headerContent={<View style={{width:44,height:44,alignItems:'center',justifyContent:'center'}}>{open?<Text style={{fontSize:26,color:'#183C32'}}>×</Text>:avatar}</View>}><AccountScreen embedded onClose={close}/></MenuOverlay>}
 </View>;
}
