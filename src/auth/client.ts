import {createClient,processLock} from '@supabase/supabase-js';
import {Platform} from 'react-native';
import * as SecureStore from 'expo-secure-store';
const url=process.env.EXPO_PUBLIC_SUPABASE_URL;
const key=process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
// A new install starts signed out. After a user signs in, the session is kept
// in that device's secure storage so closing and reopening the app preserves it.
export const authClient=url&&key?createClient(url,key,{auth:{
  storage:Platform.OS==='web'?undefined:{getItem:SecureStore.getItemAsync,setItem:SecureStore.setItemAsync,removeItem:SecureStore.deleteItemAsync},
  persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,lock:processLock,
}}):null;
