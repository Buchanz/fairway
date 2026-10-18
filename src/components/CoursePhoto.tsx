import {Image} from 'expo-image';
import {useState} from 'react';
import {StyleSheet,Text,View,type StyleProp,type ViewStyle} from 'react-native';
import {coursePhotos} from '../data/course-photos';

/** Share the bundled photographs across course cards and compact search results. */
export function CoursePhoto({courseId,style}:{courseId:string;style?:StyleProp<ViewStyle>}){
 const photo=coursePhotos[courseId];
 const [size,setSize]=useState({width:0,height:0});
 const [failed,setFailed]=useState<string|null>(null);
 const scale=photo?.contentAspectRatio&&size.height?Math.max(1,size.width/(size.height*photo.contentAspectRatio)):1;
 return <View pointerEvents="none" accessible={false} style={[s.frame,style]} onLayout={photo?.contentAspectRatio?({nativeEvent:{layout}})=>setSize(old=>old.width===layout.width&&old.height===layout.height?old:{width:layout.width,height:layout.height}):undefined}>
  {photo&&failed!==courseId?<Image recyclingKey={courseId} source={photo.image} transition={0} cachePolicy="memory-disk" contentFit="cover" onError={()=>setFailed(courseId)} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',transform:[{scale}]}}/>:<Text style={s.fallback}>⚑</Text>}
 </View>;
}
const s=StyleSheet.create({frame:{overflow:'hidden',backgroundColor:'#E8EEDD',alignItems:'center',justifyContent:'center'},fallback:{fontSize:26,color:'#183C32'}});
