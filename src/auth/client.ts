import {createClient,processLock} from '@supabase/supabase-js';
import {Platform} from 'react-native';
import * as SecureStore from 'expo-secure-store';
const url=process.env.EXPO_PUBLIC_SUPABASE_URL;
const key=process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
// Native tokens stay in Keychain/Keystore; web sessions persist in browser storage.
export const authClient=url&&key?createClient(url,key,{auth:{
  storage:Platform.OS==='web'?undefined:{getItem:SecureStore.getItemAsync,setItem:SecureStore.setItemAsync,removeItem:SecureStore.deleteItemAsync},
  persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,lock:processLock,
}}):null;
