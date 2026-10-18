import {StyleSheet,Platform} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';

/** A continuous edge fade avoids seams from stacking clipped blur surfaces. */
export function BottomFade(){
 if(Platform.OS==='web')return null;
 return <LinearGradient
  pointerEvents="none"
  colors={['rgba(245,246,242,0)','rgba(245,246,242,0.15)','rgba(245,246,242,0.65)','#F5F6F2']}
  locations={[0,0.35,0.75,1]}
  style={s.edge}
 />;
}
const s=StyleSheet.create({edge:{position:'absolute',bottom:0,left:0,right:0,height:48,zIndex:10}});
