import {Animated,Modal,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import {useEffect,useState} from 'react';
import {GlassPanel,GlassPressable as Pressable} from './Glass';
import {colors} from './ui';

type RequestState='idle'|'sending'|'sent'|'error';

export function WebCourseRequestSheet({
  open,
  onClose,
  name,
  city,
  notes,
  onNameChange,
  onCityChange,
  onNotesChange,
  onSubmit,
  state,
}: {
  open:boolean;
  onClose:()=>void;
  name:string;
  city:string;
  notes:string;
  onNameChange:(value:string)=>void;
  onCityChange:(value:string)=>void;
  onNotesChange:(value:string)=>void;
  onSubmit:()=>void;
  state:RequestState;
}){
 const [progress]=useState(()=>new Animated.Value(0));
 useEffect(()=>{
  if(!open)return;
  progress.setValue(0);
  Animated.spring(progress,{toValue:1,damping:24,stiffness:260,mass:.85,useNativeDriver:true}).start();
 },[open,progress]);
 if(!open)return null;
 return <Modal transparent visible animationType="none" onRequestClose={onClose}>
  <View style={s.backdrop}>
   <Pressable accessibilityRole="button" accessibilityLabel="Close course request" onPress={onClose} style={StyleSheet.absoluteFill}/>
   <Animated.View accessibilityViewIsModal style={[s.sheet,{opacity:progress,transform:[{scale:progress.interpolate({inputRange:[0,1],outputRange:[.94,1]})}]}]}>
    <GlassPanel style={s.panel}>
     <View style={s.header}>
      <View style={s.titleGroup}><Text style={s.kicker}>FAIRWAY COURSE DIRECTORY</Text><Text style={s.title}>Request a course</Text><Text style={s.subtitle}>Tell us which course you would like to see added to Fairway.</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Close course request" onPress={onClose} style={s.close}><Text style={s.closeText}>×</Text></Pressable>
     </View>
     <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <TextInput accessibilityLabel="Course name" placeholder="Course name" placeholderTextColor="#708078" value={name} onChangeText={onNameChange} style={s.input}/>
      <TextInput accessibilityLabel="City or region" placeholder="City or region (optional)" placeholderTextColor="#708078" value={city} onChangeText={onCityChange} style={s.input}/>
      <TextInput accessibilityLabel="Course request notes" placeholder="Anything we should know? (optional)" placeholderTextColor="#708078" value={notes} onChangeText={onNotesChange} multiline maxLength={1000} style={[s.input,s.notes]}/>
      <View style={s.actions}><Pressable accessibilityRole="button" onPress={onClose} style={s.cancel}><Text style={s.cancelText}>Cancel</Text></Pressable><Pressable accessibilityRole="button" disabled={state==='sending'} onPress={onSubmit} style={[s.submit,state==='sending'&&{opacity:.55}]}><Text style={s.submitText}>{state==='sending'?'Sending…':'Send request'}</Text></Pressable></View>
      {state==='sent'&&<Text accessibilityLiveRegion="polite" style={s.success}>Thanks — your course request was sent.</Text>}
      {state==='error'&&<Text accessibilityLiveRegion="polite" style={s.error}>Enter a course name and try again.</Text>}
     </ScrollView>
    </GlassPanel>
   </Animated.View>
  </View>
 </Modal>;
}

const s=StyleSheet.create({
 backdrop:{flex:1,backgroundColor:'rgba(25,48,39,.18)',alignItems:'center',justifyContent:'center',padding:20},
 sheet:{width:'100%',maxWidth:620,maxHeight:'88%',borderRadius:28,boxShadow:'0 16px 50px rgba(25,48,39,.22)'},
 panel:{padding:22,borderRadius:28,backgroundColor:'#F7FAF3',gap:14},
 header:{flexDirection:'row',alignItems:'flex-start',gap:14},titleGroup:{flex:1,gap:4},kicker:{fontSize:10,letterSpacing:1.2,color:colors.muted},title:{fontSize:28,fontWeight:'700',color:colors.ink},subtitle:{fontSize:13,lineHeight:19,color:colors.muted},
 close:{width:40,height:40,borderRadius:20,backgroundColor:'#E8EEDD',alignItems:'center',justifyContent:'center'},closeText:{fontSize:28,lineHeight:28,color:colors.ink},
 content:{paddingTop:2,paddingBottom:8,gap:10},input:{width:'100%',minHeight:44,paddingHorizontal:14,paddingVertical:10,borderRadius:22,borderWidth:0,backgroundColor:'#fff',fontSize:14,color:'#183C32',boxShadow:'0 2px 10px rgba(24,60,50,.08)'},notes:{minHeight:82,textAlignVertical:'top',borderRadius:18},actions:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,paddingTop:2},cancel:{minHeight:42,paddingHorizontal:14,justifyContent:'center'},cancelText:{fontSize:12,fontWeight:'600',color:colors.muted},submit:{minHeight:42,paddingHorizontal:16,paddingVertical:11,borderRadius:22,backgroundColor:'#C5EB65',justifyContent:'center',alignItems:'center'},submitText:{fontSize:12,fontWeight:'700',color:'#183C32'},success:{fontSize:12,color:'#28734c'},error:{fontSize:12,color:'#9b4824'},
});
