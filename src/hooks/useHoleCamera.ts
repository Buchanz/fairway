import {useCallback,useEffect,useRef,type RefObject} from 'react';
import {AccessibilityInfo} from 'react-native';
import type MapView from 'react-native-maps';
import {interpolateCamera,type HoleCamera} from '../lib/camera-transition';

export function useHoleCamera(map:RefObject<MapView|null>){
 const moving=useRef(false);
 const frame=useRef<number|null>(null),generation=useRef(0),reduceMotion=useRef(false);
 const cancel=useCallback(()=>{generation.current++;moving.current=false;if(frame.current!==null)cancelAnimationFrame(frame.current);frame.current=null;},[]);
 useEffect(()=>{
  let active=true;
  void AccessibilityInfo.isReduceMotionEnabled().then(value=>{if(active)reduceMotion.current=value;});
  const listener=AccessibilityInfo.addEventListener('reduceMotionChanged',value=>{reduceMotion.current=value;});
  return()=>{active=false;listener.remove();cancel();};
 },[cancel]);
 const move=useCallback(async(to:HoleCamera)=>{
  cancel();const request=generation.current;
  try{
   const from=await map.current?.getCamera();
   if(!from||request!==generation.current)return;
   if(reduceMotion.current){map.current?.setCamera(to);return;}
   // iOS Fabric ignores animateCamera's duration. Drive the camera explicitly.
   moving.current=true;
   let started:number|undefined;
   const tick=(now:number)=>{
    if(request!==generation.current)return;
    started??=now;
    const progress=Math.min(1,(now-started)/1400);
    map.current?.setCamera(interpolateCamera({...from,zoom:from.zoom??to.zoom,altitude:from.altitude??to.altitude},to,progress));
    if(progress<1)frame.current=requestAnimationFrame(tick);else {frame.current=null;moving.current=false;}
   };
   frame.current=requestAnimationFrame(tick);
  }catch{/* Map may be unmounted while getCamera resolves. */}
 },[cancel,map]);
 return {move,cancel,moving};
}
