import {avatarUrl,cachedAvatar,invalidateAvatar} from '../lib/avatar-cache';
import {normalizeUsername,usernamePattern} from '../auth/validation';
import {useCallback,useState} from 'react';
import {Image,Text,View,StyleSheet,ScrollView} from 'react-native';
import {useFocusEffect} from 'expo-router';
import {SymbolView} from 'expo-symbols';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GlassPanel,GlassPressable,GlassInput} from './Glass';
import {useAuth} from '../auth/AuthProvider';
import {authClient} from '../auth/client';
import {SearchField} from './SearchField';
import {CoursePhoto} from './CoursePhoto';
import {courses} from '../data/courses';

export function ProfileDashboard(){
 const {session}=useAuth(),user=session?.user;
 const [username,setUsername]=useState(''),[savedUsername,setSavedUsername]=useState('');
 const [favorites,setFavorites]=useState<string[]>([]),[photo,setPhoto]=useState<string|null>(()=>cachedAvatar(user?.user_metadata.avatar_path)),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[email,setEmail]=useState(''),[editEmail,setEditEmail]=useState(false),[favoriteQuery,setFavoriteQuery]=useState(''),[editProfile,setEditProfile]=useState(false),[displayName,setDisplayName]=useState('');
 useFocusEffect(useCallback(()=>{let alive=true;
  void (async()=>{try{
   const values=user?user.user_metadata.favorite_courses:JSON.parse(await AsyncStorage.getItem('fairway-guest-favorites')||'[]');
   const profile=user?user.user_metadata:JSON.parse(await AsyncStorage.getItem('fairway-guest-profile')||'{}');
   if(!alive)return;setDisplayName(typeof profile.display_name==='string'?profile.display_name:'');setFavorites(Array.isArray(values)?values.filter((v:unknown)=>typeof v==='string'&&courses.some(c=>c.id===v)):[]);
   if(!user){const saved=await AsyncStorage.getItem('fairway-guest-avatar');if(alive)setPhoto(saved);}
   if(user){const result=await authClient!.from('player_profiles').select('username').eq('user_id',user.id).single();if(result.error)throw result.error;if(alive){setUsername(result.data.username||'');setSavedUsername(result.data.username||'');}}
   const path=user?.user_metadata.avatar_path;
   if(user&&typeof path==='string'&&path.startsWith(user.id+'/')){const url=await avatarUrl(path);if(alive)setPhoto(url);}
  }catch{if(alive)setMessage('Could not load your profile history. Return to this tab to retry.');}})();return()=>{alive=false;};
 },[user]));
 async function saveProfile(){if(busy)return;const handle=normalizeUsername(username);if(user&&!usernamePattern.test(handle)){setMessage('Use 3–24 letters, numbers or underscores for your username.');return;}setBusy(true);try{const data={display_name:displayName.trim()};if(user){if(handle!==savedUsername){const result=await authClient!.rpc('set_username',{requested_username:handle});if(result.error)throw result.error;setSavedUsername(handle);setUsername(handle);}const {error}=await authClient!.auth.updateUser({data});if(error)throw error;}else await AsyncStorage.setItem('fairway-guest-profile',JSON.stringify(data));setEditProfile(false);setMessage('Profile saved.');}catch(error){setMessage(error instanceof Error?error.message:'Could not save profile. Please retry.');}finally{setBusy(false);}}
 async function toggleFavorite(id:string){if(busy)return;setBusy(true);try{const next=favorites.includes(id)?favorites.filter(v=>v!==id):[...favorites,id];if(user){const {error}=await authClient!.auth.updateUser({data:{favorite_courses:next}});if(error)throw error;}else await AsyncStorage.setItem('fairway-guest-favorites',JSON.stringify(next));setFavorites(next);setMessage('');}catch{setMessage('Could not save favourites. Please retry.');}finally{setBusy(false);}}
 async function uploadPhoto(){if(busy)return;setBusy(true);setMessage('');try{
  const permission=await ImagePicker.requestMediaLibraryPermissionsAsync();
  if(!permission.granted){setMessage('Allow photo access in Settings to choose a profile picture.');return;}
  const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsEditing:true,aspect:[1,1],quality:0.6,base64:true});
  if(result.canceled)return;const asset=result.assets[0];if(!asset.base64)throw Error('Could not read this photo. Try a different image.');
  const bytes=Uint8Array.from(atob(asset.base64),c=>c.charCodeAt(0));if(bytes.length>3*1024*1024)throw Error('Choose a photo smaller than 3 MB.');
  const mime=asset.mimeType||'image/jpeg';const extension=mime==='image/png'?'png':mime==='image/webp'?'webp':mime==='image/jpeg'?'jpg':null;if(!extension)throw Error('Choose a JPEG, PNG or WebP photo.');
  if(!user){const uri=`data:${mime};base64,${asset.base64}`;await AsyncStorage.setItem('fairway-guest-avatar',uri);setPhoto(uri);setMessage('Profile photo saved on this device.');return;}
  if(!authClient)throw Error('Sign in again to upload your photo.');
  const path=`${user.id}/avatar.${extension}`;
  const upload=await authClient.storage.from('avatars').upload(path,bytes.buffer,{contentType:mime,upsert:true});if(upload.error)throw upload.error;
  const updated=await authClient.auth.updateUser({data:{avatar_path:path}});if(updated.error)throw updated.error;
  invalidateAvatar(path);setPhoto(await avatarUrl(path));setMessage('Profile photo updated.');
 }catch(e){setMessage(e instanceof Error?e.message:'Could not upload photo.');}finally{setBusy(false);}}
 async function changeEmail(){if(!authClient||busy)return;setBusy(true);try{const {error}=await authClient.auth.updateUser({email:email.trim().toLowerCase()});if(error)throw error;setMessage('Follow the confirmation instructions sent to your current and new email addresses.');setEditEmail(false);setEmail('');}catch(e){setMessage(e instanceof Error?e.message:'Could not change email.');}finally{setBusy(false);}}
 return <View style={{flex:1,minHeight:0,gap:12}}>
  <View style={s.profile}>
   <View style={{width:92,height:92,marginBottom:4}}>
    <GlassPressable accessibilityRole="button" accessibilityLabel="Upload profile photo" disabled={busy} onPress={()=>void uploadPhoto()} style={s.avatar}>{photo?<Image source={{uri:photo}} style={s.photo}/>:<SymbolView name="person.crop.circle.fill" size={72} tintColor="#557568"/>}</GlassPressable>
    <View style={{position:'absolute',right:-3,bottom:-3}}><GlassPressable accessibilityRole="button" accessibilityLabel="Edit profile photo, name, email and username" accessibilityState={{expanded:editProfile}} disabled={busy} hitSlop={8} onPress={()=>{setEditProfile(v=>!v);setEditEmail(false);}} style={s.editCircle}><SymbolView name="pencil" size={14} tintColor="#183C32" fallback={<Text>✎</Text>}/></GlassPressable></View>
   </View>
   <View style={s.identity}><Text style={[s.title,{textAlign:'center'}]}>{displayName||'Your Profile'}</Text><Text style={[s.muted,{textAlign:'center'}]}>{user?.email||'Guest golfer'}</Text></View>
  </View>
  <ScrollView style={{flex:1,minHeight:0}} contentContainerStyle={{gap:18,paddingHorizontal:4,paddingBottom:16}} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
  {editProfile&&<GlassPanel style={s.card}><Text style={s.heading}>Edit Profile</Text><GlassPressable accessibilityRole="button" disabled={busy} onPress={()=>void uploadPhoto()} style={s.button}><Text style={s.white}>Change profile photo</Text></GlassPressable>{user&&<GlassInput accessibilityLabel="Username" placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} maxLength={24} style={s.input}/>}<GlassInput accessibilityLabel="Display name" placeholder="Display name" value={displayName} onChangeText={setDisplayName} maxLength={80} style={s.input}/><GlassPressable disabled={busy} onPress={()=>void saveProfile()} style={s.button}><Text style={s.white}>Save Profile</Text></GlassPressable>
   {user&&<GlassPressable accessibilityRole="button" onPress={()=>setEditEmail(v=>!v)}><Text style={s.link}>Edit email address</Text></GlassPressable>}
   {editEmail&&<><GlassInput accessibilityLabel="New email address" placeholder="New email address" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={s.input}/><GlassPressable disabled={busy} onPress={()=>void changeEmail()} style={s.button}><Text style={s.white}>Send confirmation</Text></GlassPressable></>}
  </GlassPanel>}
  <View style={{gap:12}}><Text style={s.heading}>Favourite Courses</Text><SearchField placeholder="Search Courses" accessibilityLabel="Search favourite courses or add a course" value={favoriteQuery} onChangeText={setFavoriteQuery} autoCorrect={false}/>
   {courses.filter(c=>favoriteQuery.trim()?`${c.name} ${c.municipality}`.toLowerCase().includes(favoriteQuery.trim().toLowerCase()):favorites.includes(c.id)).map(c=><View key={c.id} style={s.favorite}><GlassPanel interactive style={{width:76,height:76,padding:5,borderRadius:20,backgroundColor:'#E8EEDD'}}><CoursePhoto courseId={c.id} style={{width:66,height:66,borderRadius:15}}/></GlassPanel><Text style={{flex:1,color:'#183C32',fontWeight:'600'}}>{c.name}</Text><GlassPressable accessibilityRole="button" accessibilityLabel={`${favorites.includes(c.id)?'Remove':'Add'} ${c.name} ${favorites.includes(c.id)?'from':'to'} favourites`} accessibilityState={{selected:favorites.includes(c.id)}} disabled={busy} onPress={()=>void toggleFavorite(c.id)} style={{width:44,height:44,borderRadius:22,backgroundColor:'#E8EEDD',alignItems:'center',justifyContent:'center'}}><SymbolView name={{ios:favorites.includes(c.id)?'star.fill':'star',android:favorites.includes(c.id)?'star':'star_border',web:favorites.includes(c.id)?'star':'star_border'}} tintColor="#557568" size={22} fallback={<Text>{favorites.includes(c.id)?'★':'☆'}</Text>}/></GlassPressable></View>)}
   {!favoriteQuery.trim()&&!favorites.length&&<Text style={s.muted}>Search for a course and tap its star to add a favourite.</Text>}
   {!!favoriteQuery.trim()&&!courses.some(c=>`${c.name} ${c.municipality}`.toLowerCase().includes(favoriteQuery.trim().toLowerCase()))&&<Text style={s.muted}>No matching courses.</Text>}
  </View>
  {!!message&&<Text accessibilityRole="alert" style={s.muted}>{message}</Text>}
  </ScrollView>
 </View>;
}
const s=StyleSheet.create({identity:{width:'100%',alignItems:'center',gap:4},editCircle:{width:28,height:28,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:'#C5EB65'},profile:{alignItems:'center',gap:8,paddingVertical:8},avatar:{width:92,height:92,borderRadius:46,backgroundColor:'#e8eedd',alignItems:'center',justifyContent:'center'},photo:{width:92,height:92,borderRadius:46},title:{fontSize:24,fontWeight:'700',color:'#183C32'},heading:{fontSize:16,fontWeight:'600',color:'#183C32'},muted:{fontSize:13,color:'#65766D',lineHeight:19},card:{backgroundColor:'#E8EEDD',borderRadius:26,padding:18,gap:12},row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},link:{color:'#1F503F',fontWeight:'600'},input:{backgroundColor:'#E8EEDD',borderRadius:24,padding:14,fontSize:16},button:{backgroundColor:'#C5EB65',borderRadius:24,padding:14,alignItems:'center'},white:{color:'#183C32',fontWeight:'600'},favorite:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:12}});
