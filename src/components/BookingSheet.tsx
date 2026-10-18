import {GlassPressable as Pressable,GlassPanel} from './Glass';
import {Linking,Modal,StyleSheet,Text,View} from 'react-native';
import type {Course} from '../data/courses';
import type {LiveSlot} from '../lib/availability';
import {bookingLink} from '../lib/booking';
import {colors} from './ui';
import {labelDate} from './CourseCarousel';
export type Selection={course:Course;slot:LiveSlot;players:number};
export function BookingSheet({selection,onClose,onError,valid}:{selection:Selection|null;onClose:()=>void;onError:(message:string)=>void;valid:boolean}){
 return <Modal visible={selection!==null} transparent animationType="fade" onRequestClose={onClose}>
  <View style={s.backdrop}><GlassPanel accessibilityViewIsModal style={s.sheet}>
   <View style={s.top}><Text style={s.eyebrow}>YOUR NEXT ROUND</Text><Pressable accessibilityRole="button" accessibilityLabel="Close booking review" onPress={onClose} style={s.close}><Text style={s.closeText}>×</Text></Pressable></View>
   {selection&&<><Text style={s.title}>{selection.course.name}</Text><Text style={s.date}>{labelDate(selection.slot.date,true)}</Text><Text style={s.time}>{selection.slot.time}</Text>
   <View style={s.details}><Text style={s.detail}>{selection.players} players</Text><Text style={s.detail}>{selection.slot.holes} holes</Text><Text style={s.detail}>{selection.slot.price===null?'Price at course':`$${selection.slot.price.toFixed(2)} CAD / player`}</Text></View>
   <Text style={s.note}>{selection.course.id==='cedar-hill'?'Your selected date and tee time will be sent to Tee-On. Confirm players, holes and final price after signing in.':'Finish on the course booking website. Reselect this date and time there and confirm the final price.'}</Text>
   {!valid&&<Text accessibilityLiveRegion="polite" style={s.error}>This time is no longer confirmed in the latest results. Close this view and choose another time.</Text>}
   <Pressable accessibilityRole="button" disabled={!valid} onPress={()=>{void Linking.openURL(bookingLink(selection.course,selection.slot)).catch(()=>onError('Could not open the booking website. Please try again.'));onClose();}} style={[s.button,!valid&&{opacity:.4}]}><Text style={s.buttonText}>Continue to {selection.course.provider} ↗</Text></Pressable>
   <Text style={s.fine}>No reservation has been made. Availability is confirmed by the course when you book.</Text></>}
  </GlassPanel></View>
 </Modal>;
}
const s=StyleSheet.create({backdrop:{flex:1,backgroundColor:'#10271ED9',justifyContent:'center',alignItems:'center',padding:20},sheet:{backgroundColor:'#fff',borderRadius:24,padding:24,width:'100%',maxWidth:440,gap:15},top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},eyebrow:{fontSize:10,fontWeight:'700',letterSpacing:1.5,color:colors.muted},close:{borderRadius:20,width:40,height:40,justifyContent:'center',alignItems:'center'},closeText:{fontSize:28,color:colors.ink},title:{fontSize:25,fontWeight:'700',color:colors.ink},date:{fontSize:15,color:colors.muted},time:{fontSize:34,fontWeight:'700',color:colors.green},details:{flexDirection:'row',flexWrap:'wrap',gap:12},detail:{fontSize:13,color:colors.ink},note:{fontSize:13,color:colors.muted,lineHeight:21},button:{backgroundColor:colors.lime,borderRadius:13,padding:17,alignItems:'center'},buttonText:{fontSize:14,fontWeight:'700',color:colors.ink},fine:{fontSize:11,color:colors.muted,lineHeight:17},error:{fontSize:13,lineHeight:20,color:'#A34625'}});
