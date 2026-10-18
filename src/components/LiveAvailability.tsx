import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, Text, View } from 'react-native';
import { Chip, colors } from './ui';
type Slot = { id:string;date:string;time:string;price:number;players:number[];holes:number };
type Result = {date:string; checkedAt:string; slots:Slot[]};
const source='https://olympicviewgolf.totaleintegrated.com/Book-a-Tee-Time';
export function LiveAvailability() {
 const [data,setData]=useState<Result|null>(null), [error,setError]=useState(''), [busy,setBusy]=useState(false), [players,setPlayers]=useState(2), [clock,setClock]=useState(()=>Date.now());
 useEffect(()=>{const timer=setInterval(()=>setClock(Date.now()),30000);return()=>clearInterval(timer);},[]);
 async function refresh(){
  setBusy(true);setError('');setData(null);
  try {
   const base=Platform.OS==='web'?'':process.env.EXPO_PUBLIC_API_URL||null;
   if(base===null) throw new Error('Mobile API address is not configured yet.');
   const response=await fetch(`${base}/api/availability/olympic-view`,{signal:AbortSignal.timeout(20000)});
   if(!response.ok) throw new Error('Could not retrieve live availability. Try again or check the course website.');
   const result=await response.json();
   if(!Array.isArray(result.slots)||!result.checkedAt) throw new Error('Availability service returned an unexpected response.');
   setData(result);
  }catch(e){setError(e instanceof Error?e.message:'Availability request failed.');}finally{setBusy(false);}
 }
 async function book(){try{await Linking.openURL(source);}catch{setError('Could not open booking website.');}}
 // Re-evaluate age periodically so an old response is never presented as current.
 const stale=data && (clock-Date.parse(data.checkedAt)>120000);
 const slots=data?.slots.filter(t=>t.players.includes(players))??[];
 return <View style={{backgroundColor:'#E9EFDF',padding:20,borderRadius:20,gap:14}}>
  <Text style={{fontSize:23,fontWeight:'700',color:colors.ink}}>Live from Olympic View</Text>
  <Text style={{color:colors.muted,lineHeight:21}}>Today’s public tee times · Victoria local time. This first live connection is separate from the nearby-course filters above.</Text>
  <View style={{flexDirection:'row',gap:8,flexWrap:'wrap'}}>{[1,2,3,4].map(n=><Chip key={n} label={`${n} players`} selected={players===n} onPress={()=>setPlayers(n)}/>)}</View>
  <Pressable accessibilityRole="button" disabled={busy} onPress={refresh} style={{padding:15,backgroundColor:colors.green,borderRadius:12}}><Text style={{color:'#fff',fontWeight:'600'}}>{busy?'Checking course…':'Check live tee times'}</Text></Pressable>
  {!!error && <Text accessibilityLiveRegion="polite" style={{color:'#963C25'}}>{error}</Text>}
  {data && <Text style={{color:colors.muted}}>Date: {data.date} · Checked {new Date(data.checkedAt).toLocaleTimeString()} · Source: course booking page</Text>}
  {stale ? <Text style={{color:colors.ink}}>Results have expired. Check again for current availability.</Text> : data && <>
   <Text style={{color:colors.muted}}>Displayed CAD price per player; confirm taxes, carts, and final total with the course. Availability can change before booking.</Text>
   {!slots.length && <Text>No matching public times returned for this group today.</Text>}
   {slots.map(t=><View key={t.id} style={{backgroundColor:'#fff',padding:14,borderRadius:12,gap:5}}><Text style={{fontWeight:'700',fontSize:18,color:colors.ink}}>{t.time} · CAD ${t.price.toFixed(2)}</Text><Text>{t.holes} holes · accepts {t.players.join(', ')} players</Text></View>)}
  </>}
  <Pressable accessibilityRole="link" onPress={book} style={{paddingVertical:12}}><Text style={{fontWeight:'700',color:colors.green}}>Continue to Olympic View booking ↗</Text></Pressable>
 </View>;
}
