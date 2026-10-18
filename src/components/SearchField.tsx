import {useRef,useState} from 'react';
import {Platform,Pressable,Text,TextInput,type TextInputProps} from 'react-native';
import {SymbolView} from 'expo-symbols';
import {GlassPanel} from './Glass';

/** Icon, editable text and clear control share one interactive material. */
export function SearchField(props:TextInputProps){
 const [focused,setFocused]=useState(false);
 const input=useRef<TextInput>(null);
 return <GlassPanel interactive style={{width:'100%',height:44,minHeight:44,maxHeight:44,flexShrink:0,borderRadius:22,backgroundColor:Platform.OS==='web'?'#ffffff':focused?'#dce9df':'#E8EEDD',borderWidth:0,boxShadow:Platform.OS==='web'?'0 3px 12px rgba(24,60,50,0.12)':'none',flexDirection:'row',alignItems:'center'}}>
  <Pressable accessibilityRole="button" accessibilityLabel="Focus search" onPress={()=>input.current?.focus()} style={{width:46,height:44,alignItems:'center',justifyContent:'center'}}><SymbolView name={{ios:'magnifyingglass',android:'search',web:'search'}} size={26} tintColor="#183C32" fallback={<Text style={{fontSize:25}}>⌕</Text>}/></Pressable>
  <TextInput ref={input} {...props} placeholderTextColor="#52675C" placeholder={props.placeholder??'Search Courses & Cities'} accessibilityLabel={props.accessibilityLabel??'Search Courses & Cities'} onFocus={e=>{setFocused(true);props.onFocus?.(e);}} onBlur={e=>{setFocused(false);props.onBlur?.(e);}} style={{flex:1,height:44,minWidth:0,padding:0,paddingRight:props.value?0:14,backgroundColor:'transparent',color:'#183C32',fontSize:16,textAlignVertical:'center'}}/>
  {!!props.value&&<Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={()=>{props.onChangeText?.('');input.current?.focus();}} style={{width:44,height:44,justifyContent:'center',alignItems:'center'}}><Text style={{fontSize:23,color:'#183C32'}}>×</Text></Pressable>}
 </GlassPanel>;
}
