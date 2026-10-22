import {CoursePhoto} from './CoursePhoto';
import {GlassPressable as Pressable} from './Glass';
import {colors} from './ui';
import {Linking,Platform,StyleSheet,Text,View} from 'react-native';
import type {Course} from '../data/courses';
import type {LiveSlot} from '../lib/availability';

type GridCourse = Course & {distance:number};

/** A fixed-size course tile used for both connected and rangefinder-only courses. */
export function CourseGridCard({course,slots,width,onSelect}:{course:GridCourse;slots:LiveSlot[];width:number;onSelect:(slot:LiveSlot)=>void}){
 const visibleSlots=slots.slice(0,3);
 const lengths=[...new Set(slots.map(slot=>slot.holes))].sort((a,b)=>a-b);
 return <View accessibilityLabel={`${course.name}, ${course.municipality}`} style={[s.card,{width}]}>
  <View style={s.photoWrap}>
   <CoursePhoto courseId={course.id} style={s.photo}/>
   <View style={s.photoShade}/>
   <View style={s.photoCopy}><Text numberOfLines={1} style={s.name}>{course.name}</Text><Text numberOfLines={1} style={s.meta}>{course.municipality} · {course.distance.toFixed(1)} km away</Text></View>
   <View style={s.holeBadge}><Text style={s.holeBadgeText}>{lengths.length?`${lengths.join(' / ')} holes`:'Rangefinder'}</Text></View>
  </View>
  <View style={s.body}>
   {visibleSlots.length?<View style={s.slotList}>{visibleSlots.map(slot=><Pressable key={`${slot.date}-${slot.id}-${slot.holes}`} accessibilityRole="button" accessibilityLabel={`${course.name}, ${slot.time}, ${slot.holes} holes. Review booking.`} onPress={()=>onSelect(slot)} style={({pressed})=>[s.slot,pressed&&s.slotPressed]}><Text style={s.slotTime}>{slot.time}</Text><Text style={s.slotHoles}>{slot.holes} holes</Text><Text style={s.slotPrice}>{slot.price===null?'At course':`$${slot.price.toFixed(0)}`}</Text></Pressable>)}</View>:<View style={s.unavailable}><Text style={s.status}>Rangefinder available</Text><Text numberOfLines={2} style={s.statusDetail}>Tee times aren’t connected yet.</Text>{course.bookingUrl&&<Pressable accessibilityRole="link" onPress={()=>void Linking.openURL(course.bookingUrl)} style={s.booking}><Text style={s.bookingText}>Open booking ↗</Text></Pressable>}</View>}
   {visibleSlots.length>0&&<Text style={s.footer}>{slots.length} tee times available{lengths.length>1?` · ${lengths.join(' / ')} holes`:''}</Text>}
  </View>
 </View>;
}

const s=StyleSheet.create({
 card:{height:292,borderRadius:20,overflow:'hidden',backgroundColor:'#fff',boxShadow:Platform.OS==='web'?'0 5px 16px rgba(24,60,50,0.14)':'none'},
 photoWrap:{height:126,position:'relative',overflow:'hidden'},photo:{position:'absolute',inset:0},photoShade:{...StyleSheet.absoluteFill,backgroundColor:'rgba(12,35,28,.32)'},photoCopy:{position:'absolute',left:13,right:12,bottom:11,gap:3},name:{fontSize:16,fontWeight:'800',color:'#fff',letterSpacing:-.2},meta:{fontSize:10,color:'#f1f5ef'},holeBadge:{position:'absolute',top:10,right:10,paddingHorizontal:8,paddingVertical:5,borderRadius:14,backgroundColor:'#C5EB65'},holeBadgeText:{fontSize:9,fontWeight:'800',color:'#183C32'},body:{height:166,padding:11,gap:8},slotList:{gap:6},slot:{height:32,paddingHorizontal:9,borderRadius:10,backgroundColor:'#F3F7EF',flexDirection:'row',alignItems:'center',gap:7},slotPressed:{backgroundColor:'#DFEACD',transform:[{scale:.98}]},slotTime:{fontSize:12,fontWeight:'800',color:colors.ink,flex:1},slotHoles:{fontSize:9,color:colors.muted},slotPrice:{fontSize:10,fontWeight:'700',color:colors.green},footer:{fontSize:10,color:colors.muted,marginTop:'auto'},unavailable:{flex:1,gap:5},status:{fontSize:13,fontWeight:'700',color:colors.ink},statusDetail:{fontSize:11,lineHeight:16,color:colors.muted},booking:{alignSelf:'flex-start',paddingVertical:4},bookingText:{fontSize:11,fontWeight:'700',color:colors.green}
});
