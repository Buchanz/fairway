import {SymbolView} from 'expo-symbols';
import {MenuOverlay,type MenuAnchor} from './MenuOverlay';
import {GlassPressable as Pressable} from './Glass';
import {useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref} from 'react';
import {AppState, Linking, Platform, StyleSheet, Text, View} from 'react-native';
import MapView, {Circle, Marker, Polygon, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import * as Location from 'expo-location';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useHoleCamera} from '../hooks/useHoleCamera';
import type {Point} from '../data/courses';
import {holeCamera,greenDistances,yardage,suggestedTarget,type MappedHole} from '../lib/hole-map';

export type RangeMapHandle = {recenter:()=>void};

// Native providers keep map rendering independent of the tee-time server.
export default function RangeMap({point, fullScreen=false, topInset=12, bottomInset=12, targetKey="default", controlsRef, hole,teeColor='#173d2c'}: {point: Point;fullScreen?:boolean;topInset?:number;bottomInset?:number;targetKey?:string;controlsRef?:Ref<RangeMapHandle>;hole?:MappedHole;teeColor?:string}) {
  const [help,setHelp]=useState<MenuAnchor|null>(null),[helpOpen,setHelpOpen]=useState(false);
  const helpRef=useRef<View>(null);
  function openHelp(){helpRef.current?.measureInWindow((x,y,width,height)=>{setHelp({x,y,width,height});setHelpOpen(true);});}
  const insets = useSafeAreaInsets();
  const map = useRef<MapView>(null);
  const {move:moveCamera,cancel:cancelCamera,moving:cameraMoving}=useHoleCamera(map);
  const [heading,setHeading]=useState(0);
  const [yardageHeight,setYardageHeight]=useState(240);
  const [mapReady,setMapReady]=useState(false);
  const [size,setSize]=useState({width:390,height:800});
  const tee=hole?.path[0], green=hole?.path[hole.path.length-1];
  const camera=hole?holeCamera(hole,size.width-32,Math.max(180,size.height-topInset-bottomInset-80)):null;
  const frameHole=useCallback(()=>{if(hole)void moveCamera(holeCamera(hole,size.width-32,Math.max(180,size.height-topInset-bottomInset-80)));},[hole,size,topInset,bottomInset,moveCamera]);
  useEffect(()=>{if(mapReady)frameHole();return cancelCamera;},[mapReady,frameHole,cancelCamera]);
  const watcher = useRef<Location.LocationSubscription | null>(null);
  const generation = useRef(0);
  const [fix, setFix] = useState<Location.LocationObject | null>(null);
  const [targets, setTargets] = useState<Record<string, Point | null>>({});
  const suggestion=hole?suggestedTarget(hole):null;
  const target = targets[targetKey]===undefined?suggestion:targets[targetKey];
  const [targetScreen,setTargetScreen]=useState<{x:number;y:number;key:string}|null>(null);
  const projectionRequest=useRef(0);
  const targetLatitude=target?.latitude,targetLongitude=target?.longitude;
  const projectionKey=`${targetKey}:${targetLatitude}:${targetLongitude}`;
  const projectTarget=useCallback(()=>{
    const request=++projectionRequest.current;
    if(!mapReady||targetLatitude===undefined||targetLongitude===undefined)return;
    void map.current?.pointForCoordinate({latitude:targetLatitude,longitude:targetLongitude}).then(point=>{
      if(request===projectionRequest.current&&Number.isFinite(point.x)&&Number.isFinite(point.y))
        setTargetScreen({...point,key:projectionKey});
    }).catch(()=>{});
  },[mapReady,targetLatitude,targetLongitude,projectionKey]);
  useEffect(()=>{const requests=projectionRequest;projectTarget();return()=>{requests.current++;};},[projectTarget,size]);
  const previewPoint=targetScreen?.key===projectionKey?targetScreen:null;
  const setTarget = (value:Point | null) => setTargets(previous => ({...previous,[targetKey]:value}));
  const [tracking, setTracking] = useState(false);
  const [message, setMessage] = useState('Turn on GPS, then tap the map to measure a target.');
  const [now, setNow] = useState(0);

  const stop = useCallback(() => {
    generation.current++;
    watcher.current?.remove();
    watcher.current = null;
    setTracking(false);
    setFix(null);
  }, []);
  const start = useCallback(async (askPermission=true) => {
    watcher.current?.remove();
    watcher.current = null;
    const request = ++generation.current;
    setTracking(true);
    setMessage('Finding your position…');
    try {
      let permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted && askPermission && permission.canAskAgain) permission = await Location.requestForegroundPermissionsAsync();
      if (request !== generation.current) return;
      if (permission.status !== 'granted') throw new Error('Allow location access in Settings to measure from your position.');
      const subscription = await Location.watchPositionAsync(
        {accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 1, timeInterval: 2000},
        location => {
          if (request !== generation.current) return;
          setFix(location);
          setNow(Date.now());
          setMessage('Tap the map to choose a target.');
        },
        () => {
          if (request !== generation.current) return;
          stop();
          setMessage('GPS is unavailable. Check location services and try again.');
        },
      );
      if (request !== generation.current) subscription.remove();
      else watcher.current = subscription;
    } catch (error) {
      if (request !== generation.current) return;
      stop();
      setMessage(error instanceof Error ? error.message : 'Could not start GPS. Please try again.');
    }
  }, [stop]);

  useEffect(() => {
    const counter = generation;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    const initial = setTimeout(() => void start(false), 0);
    const listener = AppState.addEventListener('change', state => {
      if (state === 'active') void start(false);
      else {stop();setMessage('GPS paused while the app is in the background.');}
    });
    return () => {counter.current++;watcher.current?.remove();clearTimeout(initial);clearInterval(timer);listener.remove();};
  }, [start, stop]);

  function recenter(){
    if(hole){frameHole();return;}
    if(!tracking)void start();
    map.current?.animateToRegion({...(fix?.coords || point), latitudeDelta:0.003, longitudeDelta:0.003},350);
  }
  useImperativeHandle(controlsRef,()=>({recenter}));

  const stale = !!fix && now - fix.timestamp > 30000;
  const origin=fix&&!stale?fix.coords:tee;
  const originLabel=fix&&!stale?'From you':'Tee preview';
  const distances=origin&&green?greenDistances(origin,green,hole?.greenBoundary):null;
  const yards=origin&&target?yardage(origin,target):null;
  return <View onLayout={e=>{const {width,height}=e.nativeEvent.layout;setSize(previous=>previous.width===width&&previous.height===height?previous:{width,height});}} style={fullScreen ? {flex:1} : s.frame}>
    <MapView ref={map} style={StyleSheet.absoluteFill} provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      onMapReady={()=>setMapReady(true)} initialCamera={camera??undefined} mapType="satellite" initialRegion={hole?undefined:{...point, latitudeDelta: 0.009, longitudeDelta: 0.009}}
      onPress={event => setTarget(event.nativeEvent.coordinate)} showsCompass={Platform.OS!=='ios'} showsScale onRegionChange={projectTarget} onRegionChangeComplete={()=>{projectTarget();if(cameraMoving.current)return;void map.current?.getCamera().then(camera=>setHeading(camera.heading)).catch(()=>{});}}
      onPanDrag={cancelCamera} toolbarEnabled={false}
      compassOffset={Platform.OS==='ios'?{x:-(size.width-76),y:topInset-76}:undefined}
      appleLogoInsets={{top:0,right:16,bottom:distances?bottomInset+12+yardageHeight+12:bottomInset+12,left:0}}
      legalLabelInsets={{top:0,right:12,bottom:8,left:0}}
      mapPadding={{top:topInset,right:12,bottom:bottomInset+24,left:12}}>
      {origin&&green&&!target&&<Polyline coordinates={[origin,green]} strokeColor="#EF4444" strokeWidth={3}/>}
      {hole?.greenBoundary&&<Polygon coordinates={hole.greenBoundary} fillColor="rgba(88,180,69,0.28)" strokeColor="#8cce70" strokeWidth={2}/>}
      {tee&&<Marker coordinate={tee} anchor={{x:0.5,y:0.5}}><View style={{alignItems:'center',width:42,height:60}}><View style={{width:17,height:17,borderRadius:9,borderWidth:2,borderColor:'white',backgroundColor:teeColor}}/><View style={{width:19,height:3,backgroundColor:teeColor,borderRadius:2,marginTop:3}}/><View style={{width:3,height:9,backgroundColor:teeColor}}/><Text style={{color:'white',fontSize:10,fontWeight:'700',backgroundColor:'#12231ecc',paddingHorizontal:5,borderRadius:4}}>TEE</Text></View></Marker>}
      {green&&<Marker coordinate={green} anchor={{x:0.5,y:0.5}}><View style={{width:19,height:19,borderRadius:10,borderWidth:5,borderColor:'#175d3d',backgroundColor:'white'}}/></Marker>}
      {origin&&target&&<Polyline coordinates={[origin,target]} strokeColor="#EF4444" strokeWidth={3}/>}
      {target&&green&&<Polyline coordinates={[target,green]} strokeColor="#EF4444" strokeWidth={3}/>}

      {fix && <Marker coordinate={fix.coords} title="Your GPS position" pinColor="#168459"/>}
      {fix && fix.coords.accuracy !== null && fix.coords.accuracy >= 0 && <Circle center={fix.coords} radius={fix.coords.accuracy} fillColor="rgba(22,132,89,0.12)" strokeColor="#168459"/>}
      {target && <Marker coordinate={target} draggable onDragStart={cancelCamera} onDragEnd={event=>setTarget(event.nativeEvent.coordinate)} anchor={{x:0.5,y:0.5}}><View style={{width:16,height:16,backgroundColor:'#f2d466',borderWidth:2,borderColor:'white',transform:[{rotate:'45deg'}]}}/></Marker>}
    </MapView>
    {target&&previewPoint&&previewPoint.x>=0&&previewPoint.x<=size.width&&previewPoint.y>=0&&previewPoint.y<=size.height&&<Pressable accessibilityRole="button" accessibilityLabel="Shot yardage preview. Open map key" onPress={openHelp} style={[s.mapLabel,{position:'absolute',left:Math.max(12,Math.min(size.width-144,previewPoint.x-66)),top:Math.max(topInset+40,previewPoint.y-88),width:132}]}>
      <Text style={s.mapLabelText}>{originLabel}</Text>
      <Text style={s.targetDistance}>{yards!==null?`${yards} yd`:'Target'}</Text>
      {green&&<Text style={s.mapLabelText}>{yardage(target,green)} yd to green</Text>}
    </Pressable>}
    {distances&&<Pressable accessibilityRole="button" accessibilityLabel="Explain green distances" onPress={openHelp} onLayout={event=>setYardageHeight(event.nativeEvent.layout.height)} style={[s.yardageCard,{bottom:bottomInset+12}]}>
      <Text style={s.cardLabel}>BACK</Text><Text numberOfLines={1} adjustsFontSizeToFit style={s.cardNumber}>{distances.back??'—'}</Text>
      <View style={s.divider}/><Text style={[s.cardLabel,{color:'#17653e'}]}>CENTER</Text><Text numberOfLines={1} adjustsFontSizeToFit style={s.centerNumber}>{distances.center}</Text><Text style={s.cardSource}>YARDS</Text>
      <View style={s.divider}/><Text style={s.cardLabel}>FRONT</Text><Text numberOfLines={1} adjustsFontSizeToFit style={s.cardNumber}>{distances.front??'—'}</Text>
      <View style={s.sourcePill}><View style={[s.sourceDot,{backgroundColor:fix&&!stale?'#C5EB65':teeColor}]}/><Text numberOfLines={1} style={s.sourceText}>{fix&&!stale?'Live GPS':'From tee'}</Text></View>
    </Pressable>}
    {Platform.OS==='ios'&&<Pressable accessibilityRole="button" accessibilityLabel="Compass: point map north" onPress={()=>{cancelCamera();map.current?.animateCamera({heading:0},{duration:350});}} style={[s.circle,{position:'absolute',left:16,top:topInset-76}]}><View style={{alignItems:'center',transform:[{rotate:`${-heading}deg`}]}}><Text style={{color:'white',fontSize:10,fontWeight:'700'}}>N</Text><Text style={{color:'#EF4444',fontSize:22,lineHeight:23}}>▲</Text></View></Pressable>}
    <View pointerEvents="box-none" style={{position:'absolute',top:topInset-14,left:76,right:76,alignItems:'center'}}>
      <Pressable accessibilityRole="button" accessibilityLabel={tracking?'Pause GPS':'Enable GPS'} hitSlop={8} onPress={()=>{if(tracking)stop();else void start();}} style={s.gps}><Text style={{color:tracking&&!stale?'#94e1ae':'#d3e1d8',fontSize:10,fontWeight:'600'}}>{tracking ? stale ? '● GPS stale' : fix ? `● GPS ±${Math.round(fix.coords.accuracy ?? 0)}m` : '● GPS locating' : '○ GPS off'}</Text></Pressable>
    </View>
    <View style={{position:'absolute',right:16,top:topInset-18,gap:10,alignItems:'center'}}>
      <Pressable accessibilityRole="button" accessibilityLabel={hole?'Frame hole':'Recenter map'} onPress={recenter} style={s.circle}><SymbolView name={{ios:'arrow.up.left.and.arrow.down.right',android:'zoom_out_map',web:'zoom_out_map'}} size={22} tintColor="white"/></Pressable>
      {(target||suggestion)&&<Pressable accessibilityRole="button" accessibilityLabel={target?'Clear target':'Show target'} onPress={()=>{if(target)setTarget(null);else setTargets(previous=>{const next={...previous};delete next[targetKey];return next;});}} style={s.circle}><SymbolView name={target?{ios:'mappin.slash',android:'wrong_location',web:'wrong_location'}:{ios:'mappin',android:'location_on',web:'location_on'}} size={23} tintColor="white"/></Pressable>}
      <Pressable ref={helpRef} accessibilityRole="button" accessibilityLabel="Rangefinder guide" onPress={openHelp} style={s.circle}><SymbolView name={{ios:'questionmark',android:'question_mark',web:'question_mark'}} size={23} tintColor="white"/></Pressable>
    </View>
    {help&&<MenuOverlay open={helpOpen} anchor={help} label="Map key" preferredWidth={340} onClose={()=>setHelpOpen(false)} onExited={()=>setHelp(null)}>
      <View style={{padding:20,gap:18}}>
        <View style={s.keyRow}><View style={s.keyIcon}><View style={{width:28,height:3,backgroundColor:'#EF4444',borderRadius:2}}/></View><View style={s.keyCopy}><Text style={s.keyTitle}>Shot distance</Text><Text style={s.note}>Red lines connect your position, aiming point and green.</Text></View></View>
        <View style={s.keyRow}><View style={s.keyIcon}><View style={{width:14,height:14,backgroundColor:'#f2d466',borderWidth:1,borderColor:'white',transform:[{rotate:'45deg'}]}}/></View><View style={s.keyCopy}><Text style={s.keyTitle}>Aim here</Text><Text style={s.note}>Tap the map or drag the yellow diamond. The label shows distance to it and yards left to the green.</Text></View></View>
        <View style={s.keyRow}><View style={s.keyIcon}><View style={{width:17,height:17,borderRadius:9,borderWidth:2,borderColor:'white',backgroundColor:teeColor}}/><View style={{width:19,height:3,backgroundColor:teeColor,marginTop:3}}/><View style={{width:3,height:9,backgroundColor:teeColor}}/></View><View style={s.keyCopy}><Text style={s.keyTitle}>Your tee</Text><Text style={s.note}>Matches your selected tee colour. Mapped tee positions are approximate.</Text></View></View>
        <View style={s.keyRow}><View style={s.keyIcon}><View style={{width:19,height:19,borderRadius:10,borderWidth:5,borderColor:'#175d3d',backgroundColor:'white'}}/></View><View style={s.keyCopy}><Text style={s.keyTitle}>The green</Text><Text style={s.note}>Back, center and front distances are in yards. A dash means the green edge is not mapped.</Text></View></View>
        <View style={s.keyRow}><View style={s.keyIcon}><SymbolView name={{ios:'location.fill',android:'my_location',web:'my_location'}} size={22} tintColor="#168459"/></View><View style={s.keyCopy}><Text style={s.keyTitle}>Live GPS / tee preview</Text><Text style={s.note}>Distances use your current location when available. “From tee” means you’re previewing the hole without a live GPS fix.</Text></View></View>
        {hole?.pilot&&<Text style={s.note}>Pilot map: positions have not been field verified.</Text>}
      </View>
    </MenuOverlay>}
    {(!tracking||stale)&&<Text accessibilityLiveRegion="polite" style={[s.badge,{position:'absolute',left:12,right:distances?132:12,bottom:bottomInset+34,fontSize:11}]}>{stale?'GPS position is stale; live yardage unavailable.':message}</Text>}
    {hole&&<Text onPress={()=>void Linking.openURL(hole.sourceUrl||'https://www.openstreetmap.org/copyright')} accessibilityRole="link" style={{position:'absolute',bottom:fullScreen?Math.max(4,insets.bottom-14):4,left:12,fontSize:10,color:'white',backgroundColor:'#163d2cbb',padding:3,borderRadius:4}}>{hole.sourceLabel||'© OpenStreetMap contributors · Approximate hole positions'}</Text>}
    {!hole&&<Text style={[s.badge,{position:'absolute',bottom:bottomInset+4,left:12,right:12,fontSize:11}]}>Manual map · Tap a target to measure from your GPS position. This course’s tees and greens are not mapped yet.</Text>}
  </View>;
}
const s = StyleSheet.create({yardageCard:{position:'absolute',right:16,width:102,borderRadius:22,backgroundColor:'#fffffff5',paddingVertical:14,paddingHorizontal:10,alignItems:'center',gap:3},cardLabel:{fontSize:10,fontWeight:'700',letterSpacing:1.5,color:'#87939f'},cardNumber:{width:'100%',textAlign:'center',fontSize:22,fontWeight:'700',color:'#354454'},centerNumber:{width:'100%',textAlign:'center',fontSize:34,fontWeight:'800',color:'#175d3d'},cardSource:{fontSize:9,letterSpacing:1.3,color:'#65766d'},sourcePill:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,marginTop:8,paddingVertical:6,paddingHorizontal:7,borderRadius:14,backgroundColor:'#183C32'},sourceDot:{width:6,height:6,borderRadius:3,borderWidth:0.5,borderColor:'#ffffffaa'},sourceText:{fontSize:10,fontWeight:'600',color:'white'},targetDistance:{color:'#183C32',fontSize:18,fontWeight:'800',fontVariant:['tabular-nums']},keyRow:{flexDirection:'row',gap:12,alignItems:'center'},keyIcon:{width:38,minHeight:38,alignItems:'center',justifyContent:'center'},keyCopy:{flex:1,gap:3},keyTitle:{fontSize:14,fontWeight:'700',color:'#183C32'},divider:{height:1,backgroundColor:'#e3e9e4',width:'85%',marginVertical:5},circle:{width:48,height:48,borderRadius:24,backgroundColor:'#12231ee8',alignItems:'center',justifyContent:'center'},icon:{color:'white',fontSize:24},gps:{backgroundColor:'#12231ee8',paddingHorizontal:12,paddingVertical:7,borderRadius:20},mapLabel:{backgroundColor:'#ffffff',paddingHorizontal:12,paddingVertical:8,borderRadius:20,alignItems:'flex-start',gap:2},mapLabelText:{color:'#526459',fontSize:11,fontWeight:'700'},frame:{height:570,borderRadius:20,overflow:'hidden',backgroundColor:'#dce5db'},top:{position:'absolute',top:12,left:12},badge:{backgroundColor:'#ffffffed',padding:12,borderRadius:20,color:'#164c36',fontWeight:'600'},panel:{position:'absolute',bottom:12,left:12,right:12,backgroundColor:'#fffffff5',padding:16,borderRadius:18,gap:10},distance:{fontSize:24,fontWeight:'700',color:'#164c36'},note:{fontSize:12,lineHeight:18,color:'#526459'},actions:{flexDirection:'row',gap:8,flexWrap:'wrap'},button:{minHeight:44,padding:12,borderRadius:12,backgroundColor:'#e8eedd',justifyContent:'center'}});
