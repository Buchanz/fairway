import {useEffect,useState} from 'react';
import {Image,Text,View} from 'react-native';
import {SymbolView} from 'expo-symbols';
import {avatarUrl,cachedAvatar} from '../lib/avatar-cache';
export function PlayerIdentity({name,username,avatarPath}:{name:string;username?:string;avatarPath?:string|null}){
 const [photo,setPhoto]=useState(()=>cachedAvatar(avatarPath));
 useEffect(()=>{let alive=true;void Promise.resolve(avatarPath?avatarUrl(avatarPath).catch(()=>null):null).then(value=>{if(alive)setPhoto(value);});return()=>{alive=false;};},[avatarPath]);
 return <View style={{flexDirection:'row',alignItems:'center',gap:12,flex:1}}><View style={{width:44,height:44,borderRadius:22,backgroundColor:'#DCE5DD',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>{photo?<Image source={{uri:photo}} style={{width:44,height:44}}/>:<SymbolView name={{ios:'person.fill',android:'person',web:'person'}} size={24} tintColor="#557568"/>}</View><View style={{flex:1,gap:3}}><Text numberOfLines={1} style={{fontSize:16,fontWeight:'600',color:'#183C32'}}>{name}</Text>{!!username&&<Text numberOfLines={1} style={{fontSize:12,color:'#758279'}}>@{username}</Text>}</View></View>;
}
