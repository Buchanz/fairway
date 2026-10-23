import {Image} from 'expo-image';
import {coursePhotos} from '../data/course-photos';
import {SymbolView} from 'expo-symbols';
import {GlassPressable as Pressable,GlassPanel} from './Glass';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Linking,Platform,FlatList,StyleSheet,Text,View} from 'react-native';
import type {Course} from '../data/courses';
import type {LiveSlot} from '../lib/availability';
import {searchDate} from '../lib/availability';
import {colors} from './ui';
import {CarouselEdges} from './CarouselEdges';
export function labelDate(date:string,long=false){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Vancouver',weekday:long?'long':'short',month:'short',day:'numeric'}).format(new Date(`${date}T12:00:00Z`));}
export function CourseCarousel({course,slots,players,now,onSelect,onPlayCourse}:{course:Course&{distance:number};slots:LiveSlot[];players:number;now:number;onSelect:(slot:LiveSlot)=>void;onPlayCourse?:()=>void}){
 const photo=coursePhotos[course.id];
 const [photoFailed,setPhotoFailed]=useState(false);
 const [headerWidth,setHeaderWidth]=useState(0);
 const photoHeight=headerWidth>600?210:180;
 // Cedar Hill's source banner has white side gutters. Only wide cards need
 // additional cropping; mobile cover already crops those gutters away.
 const photoScale=photo?.contentAspectRatio?Math.max(1,headerWidth/(photoHeight*photo.contentAspectRatio)):1;
 const showPhoto=!!photo&&!photoFailed;
 const [activeDate,setActiveDate]=useState(slots[0]?.date??'');
 const [highlighted,setHighlighted]=useState<string|null>(null);
 const scroll=useRef<FlatList<LiveSlot>>(null);
 const offset=useRef(0);
 const dragSurface=useRef<View>(null);
 const suppressClickUntil=useRef(0);
 useEffect(()=>{
  if(Platform.OS!=='web')return;
  const surface=dragSurface.current as unknown as HTMLElement|null;
  if(!surface?.addEventListener)return;
  let startX=0,startOffset=0,dragging=false,pointer:number|null=null;
  surface.style.cursor='grab';surface.style.userSelect='none';
  const down=(event:PointerEvent)=>{
   if(event.pointerType!=='mouse'||event.button!==0)return;
   pointer=event.pointerId;startX=event.clientX;startOffset=offset.current;dragging=false;
  };
  const move=(event:PointerEvent)=>{
   if(pointer!==event.pointerId)return;
   const delta=event.clientX-startX;
   if(!dragging&&Math.abs(delta)<6)return;
   dragging=true;surface.style.cursor='grabbing';event.preventDefault();
   suppressClickUntil.current=Date.now()+300;
   scroll.current?.scrollToOffset({offset:Math.max(0,startOffset-delta),animated:false});
  };
  const up=()=>{if(dragging)suppressClickUntil.current=Date.now()+300;pointer=null;dragging=false;surface.style.cursor='grab';};
  const click=(event:MouseEvent)=>{if(Date.now()<suppressClickUntil.current){event.preventDefault();event.stopPropagation();}};
  surface.addEventListener('pointerdown',down);
  surface.addEventListener('click',click,true);
  window.addEventListener('pointermove',move,{passive:false});
  window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);window.addEventListener('blur',up);
  return()=>{surface.removeEventListener('pointerdown',down);surface.removeEventListener('click',click,true);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);window.removeEventListener('blur',up);};
 },[]);
 const dates=[...new Set(slots.map(s=>s.date))];
 const lengths=[...new Set(slots.map(slot=>slot.holes))].sort((a,b)=>a-b);
 const mixedLengths=lengths.length>1;
 const date=dates.includes(activeDate)?activeDate:dates[0]||'';
 const {layouts,starts}=useMemo(()=>{
  let x=20;const starts:[string,number][]=[];
  const layouts=[];
  for(let index=0;index<slots.length;index++){const slot=slots[index],first=index===0||slots[index-1].date!==slot.date;const length=142+(first&&index>0?50:0);if(first)starts.push([slot.date,x]);layouts.push({index,length,offset:x});x+=length;}
  return {layouts,starts};
 },[slots]);
 return <View style={s.cardShadow}><GlassPanel style={s.card}>
  <View onLayout={event=>setHeaderWidth(event.nativeEvent.layout.width)} style={showPhoto?{height:photoHeight,width:'100%',position:'relative',overflow:'hidden',borderTopLeftRadius:22,borderTopRightRadius:22}:s.heading}>
   {showPhoto&&<Image accessibilityLabel={`${course.name} course photograph`} source={photo.image} transition={0} cachePolicy="memory-disk" onError={()=>setPhotoFailed(true)} contentFit="cover" style={{position:'absolute',left:0,top:0,width:headerWidth||'100%',height:photoHeight,transform:[{scale:photoScale}]}}/>}
   <View style={[s.grow,showPhoto&&{position:'absolute',flex:0,bottom:10,left:12,maxWidth:'90%',borderRadius:12,overflow:'hidden',paddingHorizontal:12,paddingVertical:8}]}>
    {showPhoto&&<><Image accessible={false} source={photo.image} transition={0} cachePolicy="memory-disk" blurRadius={16} contentFit="cover" style={{position:'absolute',left:-12,width:headerWidth,bottom:-10,height:photoHeight,transform:[{scale:photoScale}]}}/><View style={[StyleSheet.absoluteFill,{backgroundColor:'#12231e70'}]}/></>}
    <Text style={[s.name,showPhoto&&{color:'white'}]}>{course.name}</Text><Text style={[s.meta,showPhoto&&{color:'#f1f5ef'}]}>{course.municipality} · {course.distance.toFixed(1)} km away</Text>
   </View>
   <View style={[{alignItems:'flex-end',gap:4},showPhoto&&{position:'absolute',top:10,right:12}]}>{!slots.length&&onPlayCourse?<Pressable accessibilityRole="button" accessibilityLabel={`${Platform.OS==='web'?'Open mobile preview for':'Play'} ${course.name}`} onPress={onPlayCourse} style={s.playCourse}><SymbolView name={{ios:'play.fill',android:'play_arrow',web:'play_arrow'}} size={18} tintColor={colors.ink}/><Text style={s.playCourseText}>{Platform.OS==='web'?'Mobile':'Play'}</Text></Pressable>:<View style={s.arrows}>
   <Pressable accessibilityRole="button" accessibilityLabel={`Earlier tee times at ${course.name}`} onPress={()=>scroll.current?.scrollToOffset({offset:Math.max(0,offset.current-320),animated:true})} style={s.arrow}><SymbolView name={{ios:'chevron.left',android:'chevron_left',web:'chevron_left'}} size={20} tintColor={colors.ink}/></Pressable>
   <Pressable accessibilityRole="button" accessibilityLabel={`Later tee times at ${course.name}`} onPress={()=>scroll.current?.scrollToOffset({offset:offset.current+320,animated:true})} style={s.arrow}><SymbolView name={{ios:'chevron.right',android:'chevron_right',web:'chevron_right'}} size={20} tintColor={colors.ink}/></Pressable>
   </View>}<GlassPanel style={s.badge}><Text style={s.badgeText}>{lengths.length?`${lengths.join(' / ')} Holes`:'Tee times'}</Text></GlassPanel></View></View>
  {showPhoto&&<Text accessibilityRole="link" onPress={()=>void Linking.openURL(photo.source)} style={{alignSelf:'flex-end',fontSize:9,color:colors.muted,paddingHorizontal:12,paddingTop:3}}>Photo: {course.name}</Text>}
  <View style={s.dayBar}><View><Text accessibilityLiveRegion="polite" style={s.day}>{date?labelDate(date,true):'Tee times'}</Text></View></View>
  <View ref={dragSurface} style={s.carousel}>
  {!slots.length?<View style={s.unavailable}><Text style={s.unavailableTitle}>Tee times aren’t connected yet</Text><Text style={s.unavailableBody}>Use the rangefinder now, or open the course booking page for current availability.</Text>{course.bookingUrl&&<Pressable accessibilityRole="link" onPress={()=>void Linking.openURL(course.bookingUrl)} style={s.bookingLink}><Text style={s.bookingLinkText}>Open course booking ↗</Text></Pressable>}</View>:
  <FlatList ref={scroll} data={slots} keyExtractor={slot=>`${slot.date}-${slot.id}-${slot.holes}`} getItemLayout={(_,index)=>layouts[index]} initialNumToRender={10} maxToRenderPerBatch={12} windowSize={5} extraData={highlighted} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.times} accessibilityLabel={`${course.name} tee times, earliest to latest`} scrollEventThrottle={32} onScroll={e=>{
   const x=e.nativeEvent.contentOffset.x;offset.current=x;
   const entries=starts;
   const end=x>0&&x+e.nativeEvent.layoutMeasurement.width>=e.nativeEvent.contentSize.width-4;
   const next=end?entries.at(-1)?.[0]:entries.filter(([,p])=>p<=x+90).at(-1)?.[0];
   if(next)setActiveDate(next);
  }} renderItem={({item:slot,index})=>{
    const first=index===0||slots[index-1].date!==slot.date;
    return <View key={`${slot.date}-${slot.id}-${slot.holes}`} style={[s.slotWrap,first&&index>0&&s.newDay]}>
     <Text style={s.dateLabel}>{first?(slot.date===searchDate(now,0)?'TODAY':slot.date===searchDate(now,1)?'TOMORROW':labelDate(slot.date).toUpperCase()):' '}</Text>
     <Pressable accessibilityRole="button" accessibilityLabel={`${course.name}, ${labelDate(slot.date)}, ${slot.time}, ${slot.holes} holes. Review booking.`} onPress={()=>{if(Date.now()>=suppressClickUntil.current)onSelect(slot);}} onHoverIn={()=>setHighlighted(`${slot.date}-${slot.id}-${slot.holes}`)} onHoverOut={()=>setHighlighted(null)} onFocus={()=>setHighlighted(`${slot.date}-${slot.id}-${slot.holes}`)} onBlur={()=>setHighlighted(null)} style={({pressed})=>[s.slot,Platform.OS==='web'&&highlighted===`${slot.date}-${slot.id}-${slot.holes}`&&s.hovered,pressed&&s.pressed]}>
      <Text style={s.time}>{slot.time}</Text>{mixedLengths&&<Text style={s.spaces}>{slot.holes} holes</Text>}<Text style={s.price}>{slot.price===null?'Price at course':`$${slot.price.toFixed(0)} CAD`}</Text>
     </Pressable>
    </View>;
   }}/>
  }
  <CarouselEdges/>
  </View>

 </GlassPanel></View>;
}
const s=StyleSheet.create({carousel:{position:'relative',borderBottomLeftRadius:28,borderBottomRightRadius:28,overflow:'hidden'},cardShadow:{borderRadius:28,backgroundColor:'#E8EFE4',boxShadow:'0 10px 26px rgba(24,60,50,0.16)'},hovered:{boxShadow:'0 6px 14px rgba(24,60,50,0.22)',transform:[{scale:1.045}],zIndex:2},card:{backgroundColor:'#F7FAF3',borderWidth:0,borderRadius:28,overflow:'visible'},heading:{paddingHorizontal:22,paddingTop:16,paddingBottom:10,flexDirection:'row',alignItems:'center',gap:12},grow:{flex:1},name:{fontSize:21,fontWeight:'700',color:colors.ink,letterSpacing:-.5},meta:{fontSize:12,color:colors.muted,marginTop:5},badge:{paddingHorizontal:10,paddingVertical:5,backgroundColor:'#C5EB65',borderRadius:20},badgeText:{fontSize:10,fontWeight:'700',color:colors.green,letterSpacing:.7},dayBar:{paddingHorizontal:22,paddingTop:6,flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:10},day:{fontSize:14,fontWeight:'600',color:colors.ink},count:{fontSize:12,color:colors.muted,marginTop:4},arrows:{flexDirection:'row',gap:6},arrow:{backgroundColor:'#C5EB65',width:40,height:40,alignItems:'center',justifyContent:'center',borderRadius:20},playCourse:{backgroundColor:'#C5EB65',minHeight:40,paddingHorizontal:13,borderRadius:20,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5},playCourseText:{fontSize:11,fontWeight:'800',color:colors.ink},arrowText:{fontSize:25,color:colors.green},times:{paddingHorizontal:22,paddingTop:10,paddingBottom:Platform.OS==='web'?24:12},slotWrap:{width:150,marginRight:12},newDay:{marginLeft:30,borderLeftWidth:1,borderColor:'#CDD8CE',paddingLeft:20,width:170},dateLabel:{fontSize:9,fontWeight:'700',letterSpacing:.7,color:colors.muted,height:22},slot:{boxShadow:Platform.OS==='web'?'0 4px 12px rgba(24,60,50,0.12)':'none',borderRadius:16,borderWidth:1,borderColor:'#E0E8DE',backgroundColor:'#FFFFFF',padding:12,gap:5},pressed:{backgroundColor:'#DFEACD'},time:{fontSize:17,fontWeight:'700',color:colors.ink},price:{fontSize:12,color:colors.green},spaces:{fontSize:10,color:colors.muted,marginTop:3},unavailable:{paddingHorizontal:20,paddingTop:13,paddingBottom:18,gap:5},unavailableTitle:{fontSize:15,fontWeight:'700',color:colors.ink},unavailableBody:{fontSize:12,lineHeight:18,color:colors.muted,maxWidth:520},bookingLink:{alignSelf:'flex-start',marginTop:3,paddingVertical:5},bookingLinkText:{fontSize:12,fontWeight:'700',color:colors.green},bottom:{paddingHorizontal:20,paddingBottom:17,color:colors.muted,fontSize:10}});
