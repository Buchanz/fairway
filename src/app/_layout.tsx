import {LiveRoundArrival} from '../components/LiveRoundArrival';
import {View,Image as NativeImage,Platform} from 'react-native';
import {useEffect} from 'react';
import {Image} from 'expo-image';
import {coursePhotos} from '../data/course-photos';
import {GlassTabs,TabVisibilityProvider} from '../components/GlassTabs';
import {GlassProvider} from '../components/Glass';
import {AuthProvider} from '../auth/AuthProvider';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
export default function Layout() {
  useEffect(()=>{if(Platform.OS==='web')return;const urls=Object.values(coursePhotos).map(photo=>NativeImage.resolveAssetSource(photo.image)?.uri).filter((uri):uri is string=>!!uri);void Image.prefetch(urls,{cachePolicy:'memory-disk'}).catch(()=>{});},[]);
  return <AuthProvider><GlassProvider><TabVisibilityProvider><View style={{flex:1}}><StatusBar style="dark" /><Stack screenOptions={{ animation:'none', headerStyle: { backgroundColor: '#F7F7F0' }, headerTintColor: '#183C32', contentStyle: { backgroundColor: '#F7F7F0' } }}><Stack.Screen name="index" options={{ headerShown: false }} /><Stack.Screen name="play" options={{ headerShown: false }} /><Stack.Screen name="course" options={{ title: 'Your next round' }} /><Stack.Screen name="games" options={{headerShown:false}} /><Stack.Screen name="account" options={{headerShown:false}} /></Stack><GlassTabs/><LiveRoundArrival/></View></TabVisibilityProvider></GlassProvider></AuthProvider>;
}
