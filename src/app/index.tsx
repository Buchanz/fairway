import {BottomFade} from '../components/BottomFade';
import {WebAccountMenu} from '../components/WebAccountMenu';
import {readAvailabilityCache,restoreAvailabilityCache,saveAvailabilityCache} from '../lib/availability-cache';
import {SearchField} from '../components/SearchField';
import {SymbolView} from 'expo-symbols';
import {GlassPressable as Pressable,GlassPanel} from '../components/Glass';
import {authClient} from '../auth/client';
import {Brand} from '../components/Brand';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Animated,Easing,Platform,Pressable as NativePressable,StyleSheet,Text,useWindowDimensions,View,ScrollView,AccessibilityInfo} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import {Chip,colors} from '../components/ui';
import {CourseCarousel,labelDate} from '../components/CourseCarousel';
import {MenuOverlay,type MenuAnchor} from '../components/MenuOverlay';
import {BookingSheet,type Selection} from '../components/BookingSheet';
import {cities,courses,type Point} from '../data/courses';
import {isFresh} from '../lib/availability';
import {nearbyCourses} from '../lib/geo';
import {decodeInventory,filterCourse,type Inventory,type SearchFilters} from '../lib/search';
import {WebFooter} from '../components/WebFooter';
import {WebInfoSheet} from '../components/WebInfoSheet';
import {WebMobileSheet} from '../components/WebMobileSheet';
import {WebCourseRequestSheet} from '../components/WebCourseRequestSheet';
import WebPreview from './web-preview';
import {router} from 'expo-router';

type Panel='players'|'holes'|'calendar'|'filters'|'coverage'|null;
export function Explore(){
 const courseScroll=useRef<ScrollView>(null);
 const coursePositions=useRef<Record<string,number>>({});
 const courseGroupTop=useRef(0),scrollY=useRef(0);
 const [scrollSize,setScrollSize]=useState({viewport:0,content:0});
 const [atBottom,setAtBottom]=useState(false);

 const [players,setPlayers]=useState(4),[holes,setHoles]=useState<SearchFilters['holes']>('any');
 const [chosenDate,setChosenDate]=useState<string|null>(null);
 const [time,setTime]=useState<SearchFilters['time']>('any'),[maxPrice,setMaxPrice]=useState<number|null>(null);
 const [sort,setSort]=useState<'name'|'distance'>('distance'),[radius,setRadius]=useState<number|null>(null);
 const [viewMode,setViewMode]=useState<'list'|'grid'>('list');
 const [query,setQuery]=useState('');
 const [origin,setOrigin]=useState<Point>(cities[0]),[originName,setOriginName]=useState('Victoria');
 const [panel,setPanel]=useState<Panel>(null),[selection,setSelection]=useState<Selection|null>(null);
 const [clock,setClock]=useState(()=>Date.now()),[error,setError]=useState('');
 const [locationMessage,setLocationMessage]=useState(''),[locating,setLocating]=useState(false);
 const [requestOpen,setRequestOpen]=useState(false),[requestName,setRequestName]=useState(''),[requestCity,setRequestCity]=useState(''),[requestNotes,setRequestNotes]=useState('');
 const [requestState,setRequestState]=useState<'idle'|'sending'|'sent'|'error'>('idle');
 const [webSheet,setWebSheet]=useState<'privacy'|'support'|null>(null),[mobileSheet,setMobileSheet]=useState(false);
 const playCatalogCourse=useCallback((courseId:string)=>{
  if(Platform.OS==='web'){setMobileSheet(true);return;}
  router.push({pathname:'/play',params:{course:courseId}});
 },[]);
 const locationRequest=useRef(0);
 // Ask on mobile for nearest-first results; web can enable location through Filters.
 useEffect(()=>{
  let alive=true;const token=locationRequest.current;
  void (async()=>{
   try{
    let permission=await Location.getForegroundPermissionsAsync();
    if(!permission.granted&&permission.canAskAgain&&Platform.OS!=='web')permission=await Location.requestForegroundPermissionsAsync();
    if(!permission.granted)return;
    const position=await Promise.race([Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced}),new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error()),10000))]);
    if(alive&&token===locationRequest.current){setOrigin(position.coords);setOriginName('your location');}
   }catch{/* Keep city-based ordering when a location fix is unavailable. */}
  })();
  return()=>{alive=false;};
 },[]);
 const {width:screenWidth}=useWindowDimensions();
 const gridCardWidth=screenWidth>=900?(Math.min(screenWidth,1160)-40-28)/3:screenWidth>=620?(Math.min(screenWidth,1160)-40-14)/2:Math.max(240,Math.min(screenWidth,1160)-40);
 const menuButtons=useRef<Partial<Record<NonNullable<Panel>,View|null>>>({});
 const [menuOpen,setMenuOpen]=useState(false);
 const [menuAnchor,setMenuAnchor]=useState<MenuAnchor>({x:20,y:110,width:100,height:46});
 const menuLabel=panel==='players'?`${players} players ▾`:panel==='holes'?`${holes==='any'?'Any':holes} holes ▾`:panel==='calendar'?`▦ ${chosenDate?labelDate(chosenDate):(screenWidth<500?'Next':'Next available')} ▾`:panel==='filters'?`☷ Filters${time!=='any'||maxPrice!==null?' •':''}`:'Course coverage';
 const closeMenu=useCallback(()=>setMenuOpen(false),[]);
 const exitMenu=useCallback(()=>setPanel(null),[]);
 const [inventory,setInventory]=useState<Inventory>(()=>{
  const cached=readAvailabilityCache();
  if(Object.keys(cached).length||Platform.OS!=='web'||typeof document==='undefined')return cached;
  try{return decodeInventory(JSON.parse(document.getElementById('fairway-availability')?.textContent||'{}'));}catch{return {};}
 });
 const [availabilityReady,setAvailabilityReady]=useState(()=>Object.keys(inventory).length>0);
 useEffect(()=>{let active=true;void restoreAvailabilityCache().then(cached=>{if(active)setInventory(current=>Object.keys(current).length?current:cached);});return()=>{active=false;};},[]);
 const [refreshing,setRefreshing]=useState(false);
 const [spin]=useState(()=>new Animated.Value(0));
 const [fade]=useState(()=>new Animated.Value(1));
 async function manualRefresh(){
  if(refreshing)return;
  setRefreshing(true);
  let fetched=false;
  const request=refresh().finally(()=>{fetched=true;});
  Animated.timing(fade,{toValue:.35,duration:180,useNativeDriver:true}).start();
  try{
   // Finish every revolution, even when the cached response returns immediately.
   do {spin.setValue(0);await new Promise<void>(resolve=>Animated.timing(spin,{toValue:1,duration:700,easing:Easing.linear,useNativeDriver:true}).start(()=>resolve()));} while(!fetched);
   await request;
  } finally {setRefreshing(false);Animated.timing(fade,{toValue:1,duration:300,useNativeDriver:true}).start();}
 }

 const refreshPending=useRef(false);
 const refresh=useCallback(async(signal?:AbortSignal)=>{
  if(refreshPending.current)return;
  refreshPending.current=true;
  try{
   // Keep production builds functional if an EAS environment variable was
   // omitted; this is a public read-only endpoint and can still be overridden.
   const base=Platform.OS==='web'?'':process.env.EXPO_PUBLIC_API_URL||'https://fairway-bcsq.onrender.com';
   if(base===null)throw new Error();
   const response=await fetch(`${base}/api/availability-snapshot`,{signal:signal?AbortSignal.any([signal,AbortSignal.timeout(90000)]):AbortSignal.timeout(90000)});
   if(!response.ok)throw new Error();
   const next=decodeInventory(await response.json());
   if(!signal?.aborted){setInventory(next);saveAvailabilityCache(next);setClock(Date.now());setError('');}
  }catch{if(!signal?.aborted)setError('Tee times are still being refreshed. Tap reload to try again.');}finally{if(!signal?.aborted)setAvailabilityReady(true);refreshPending.current=false;}
 },[]);
 useEffect(()=>{const controller=new AbortController();const start=setTimeout(()=>void refresh(controller.signal),0);const timer=setInterval(()=>void refresh(controller.signal),30000);return()=>{controller.abort();clearTimeout(start);clearInterval(timer);};},[refresh]);
 useEffect(()=>{const timer=setInterval(()=>setClock(Date.now()),15000);return()=>clearInterval(timer);},[]);
 const filters=useMemo<SearchFilters>(()=>({players,holes,date:chosenDate,time,maxPrice}),[players,holes,chosenDate,time,maxPrice]);
 const nearby=useMemo(()=>nearbyCourses(courses.filter(c=>c.availability==='live'),origin,radius??20040,query),[origin,radius,query]);
 const catalogCourses=useMemo(()=>nearbyCourses(courses.filter(c=>c.availability!=='live'),origin,radius??20040,query).sort((a,b)=>sort==='name'?a.name.localeCompare(b.name):a.distance-b.distance),[origin,radius,query,sort]);
 const rows=useMemo(()=>nearby.map(course=>({...course,slots:filterCourse(inventory[course.id]||{},filters,clock)})).filter(c=>c.slots.length).sort((a,b)=>sort==='name'?a.name.localeCompare(b.name):a.distance-b.distance),[nearby,inventory,filters,clock,sort]);
 const calendarDates=useMemo(()=>[...new Set(nearby.flatMap(course=>filterCourse(inventory[course.id]||{},{...filters,date:null},clock).map(s=>s.date)))].sort(),[nearby,inventory,filters,clock]);
 const olympicRestricted=players===1&&nearby.some(c=>c.id==='olympic-view')&&filterCourse(inventory['olympic-view']||{},{...filters,players:2},clock).length>0&&!rows.some(c=>c.id==='olympic-view');
 const total=rows.reduce((n,c)=>n+c.slots.length,0);
 async function submitCourseRequest(){
  const courseName=requestName.trim();
  if(courseName.length<2){setRequestState('error');return;}
  if(!authClient){setRequestState('error');return;}
  setRequestState('sending');
  try{
   let requesterId:string|null=null;
   try{requesterId=(await authClient.auth.getUser()).data.user?.id??null;}catch{/* Anonymous requests are allowed. */}
   const {error:insertError}=await authClient.from('course_requests').insert({course_name:courseName,city:requestCity.trim()||null,notes:requestNotes.trim()||null,requester_id:requesterId});
   if(insertError)throw insertError;
   setRequestName('');setRequestCity('');setRequestNotes('');setRequestState('sent');
  }catch{setRequestState('error');}
 }
 async function submitTestFlightRequest(email:string){
  if(!authClient)return false;
  try{
   let requesterId:string|null=null;
   try{requesterId=(await authClient.auth.getUser()).data.user?.id??null;}catch{/* Anonymous access requests are allowed. */}
   const {error:insertError}=await authClient.from('course_requests').insert({course_name:'Fairway TestFlight access',notes:`Invite email: ${email}`,requester_id:requesterId});
   return !insertError;
  }catch{return false;}
 }
 async function nextCourse(){
  const positions=rows.map(course=>coursePositions.current[course.id]).filter((y):y is number=>typeof y==='number').map(y=>y+courseGroupTop.current);
  let current=0;
  positions.forEach((y,index)=>{if(y<=scrollY.current+16)current=index;});
  const reduceMotion=await AccessibilityInfo.isReduceMotionEnabled();
  if(current+1<positions.length)courseScroll.current?.scrollTo({y:positions[current+1],animated:!reduceMotion});
  else courseScroll.current?.scrollToEnd({animated:!reduceMotion});
 }
 const hasFreshData=nearby.some(c=>Object.values(inventory[c.id]||{}).some(r=>isFresh(r,clock)));
 const selectionValid=!!selection&&filterCourse(inventory[selection.course.id]||{},{players:selection.players,holes:selection.slot.holes as 9|18,date:selection.slot.date,time:'any',maxPrice:null},clock).some(s=>s.id===selection.slot.id&&s.holes===selection.slot.holes);
 function toggle(next:Panel){
  if(!next)return;
  if(panel===next){closeMenu();return;}
  menuButtons.current[next]?.measureInWindow((x,y,width,height)=>{
   setMenuAnchor({x,y,width,height});setPanel(next);setMenuOpen(true);
  });
 }
 async function locate(){
  const token=++locationRequest.current;setLocating(true);setLocationMessage('');
  try{
   if(!(await Location.requestForegroundPermissionsAsync()).granted)throw new Error();
   const position=await Promise.race([Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced}),new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error()),15000))]);
   if(token!==locationRequest.current)return;setOrigin(position.coords);setOriginName('your location');setSort('distance');
  }catch{if(token===locationRequest.current)setLocationMessage('Location unavailable. Choose a town below.');}
  finally{if(token===locationRequest.current)setLocating(false);}
 }
 const filterFace=(kind:Panel)=>{
  const textStyle={fontSize:12,fontWeight:'600' as const,color:colors.ink};
  return <View style={{flexDirection:'row',gap:4,alignItems:'center',justifyContent:'center'}}>
   {kind==='players'?<><Text style={textStyle}>{players}</Text><SymbolView name={{ios:'person.2.fill',android:'group',web:'group'}} size={22} tintColor={colors.ink}/></>:kind==='holes'?<><Text style={textStyle}>{holes==='any'?'Any':holes}</Text><SymbolView name={{ios:'flag.fill',android:'flag',web:'flag'}} size={22} tintColor={colors.ink}/></>:kind==='calendar'?<><SymbolView name={{ios:'calendar',android:'calendar_month',web:'calendar_month'}} size={21} tintColor={colors.ink}/><Text numberOfLines={1} style={textStyle}>{chosenDate?labelDate(chosenDate):(screenWidth<500?'Next':'Next available')} ▾</Text></>:<><SymbolView name={{ios:'line.3.horizontal.decrease',android:'tune',web:'tune'}} size={21} tintColor={colors.ink}/><Text style={textStyle}>Filters{time!=='any'||maxPrice!==null?' •':''}</Text></>}
  </View>;
 };
 const renderControls=(small:boolean,showSearch=true,showGrid=true,showFilters=true,bareSearch=false,controlsMaxWidth=560,align:'center'|'flex-start'='center')=>(
   <View style={{gap:10,width:'100%',maxWidth:controlsMaxWidth,alignSelf:align}}>
   {showSearch&&<SearchField bare={bareSearch} value={query} onChangeText={setQuery} autoCorrect={false} returnKeyType="search"/>}
   {showFilters&&<View style={[s.toolbar,small&&s.compactToolbar,screenWidth<500&&{gap:5}]}>
    {showGrid&&Platform.OS==='web'&&<NativePressable accessibilityRole="button" accessibilityLabel={viewMode==='list'?'Show courses as a grid':'Show courses as a list'} accessibilityState={{selected:viewMode==='grid'}} onPress={()=>setViewMode(mode=>mode==='list'?'grid':'list')} style={({pressed})=>[s.viewToggle,small&&s.compactControl,pressed&&{opacity:.72,transform:[{scale:.97}]}]}><SymbolView name={{ios:viewMode==='list'?'square.grid.2x2':'list.bullet',android:viewMode==='list'?'grid_view':'view_list',web:viewMode==='list'?'grid_view':'view_list'}} size={21} tintColor={colors.ink}/></NativePressable>}
    <Pressable accessibilityRole="button" ref={node=>{menuButtons.current.players=node;}} accessibilityLabel="Number of players" accessibilityState={{expanded:panel==='players'}} onPress={()=>toggle('players')} style={[s.control,small&&s.compactControl,screenWidth<500&&{paddingHorizontal:7,flexShrink:1},panel==='players'&&{opacity:Platform.OS==='ios'?0.01:0}]}>{filterFace('players')}</Pressable>
    <Pressable accessibilityRole="button" ref={node=>{menuButtons.current.holes=node;}} accessibilityLabel="Number of holes" accessibilityState={{expanded:panel==='holes'}} onPress={()=>toggle('holes')} style={[s.control,small&&s.compactControl,screenWidth<500&&{paddingHorizontal:7,flexShrink:1},panel==='holes'&&{opacity:Platform.OS==='ios'?0.01:0}]}>{filterFace('holes')}</Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="Choose a date" ref={node=>{menuButtons.current.calendar=node;}} accessibilityState={{expanded:panel==='calendar'}} onPress={()=>toggle('calendar')} style={[s.control,small&&s.compactControl,screenWidth<500&&{paddingHorizontal:7,flexShrink:1},panel==='calendar'&&{opacity:Platform.OS==='ios'?0.01:0}]}>{filterFace('calendar')}</Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="Filter and sort" ref={node=>{menuButtons.current.filters=node;}} accessibilityState={{expanded:panel==='filters'}} onPress={()=>toggle('filters')} style={[s.control,s.filterButton,small&&s.compactControl,screenWidth<500&&{paddingHorizontal:7,flexShrink:1},panel==='filters'&&{opacity:Platform.OS==='ios'?0.01:0}]}>{filterFace('filters')}</Pressable>

   </View>}
   </View>
 );
 return <SafeAreaView edges={['top','left','right']} style={s.safe}>
  <View style={[s.fixedHeader,Platform.OS==='web'&&s.webFixedHeader]}>
   {Platform.OS==='web'?<View style={s.webExploreHeader}>
    <View style={s.webExploreNav}>
     <NativePressable accessibilityRole="link" onPress={()=>router.push('/')} style={s.webExploreWordmark}><Text style={s.webExploreWordmarkText}>fairway<Text style={s.webExploreWordmarkDot}>.</Text></Text></NativePressable>
     {screenWidth>=850&&<View style={s.webExploreControls}>{renderControls(false,true,false,false,true)}</View>}
     <View style={s.webExploreAccount}><WebAccountMenu/></View>
     {screenWidth<850&&<View style={s.webExploreMobileControls}>{renderControls(false,true,false,false,true)}</View>}
    </View>
   </View>:<View style={{gap:8,backgroundColor:'#F7F8F2',paddingBottom:12,zIndex:20,borderBottomWidth:1,borderBottomColor:'#E2E7DD'}}>
    <View style={s.nav}><Brand small/></View>
    <View style={{width:'100%',maxWidth:560,flexShrink:1}}>{renderControls(false)}</View>
   </View>}
  </View>
  <Animated.ScrollView ref={courseScroll} style={{flex:1}} onLayout={event=>{const viewport=event.nativeEvent.layout.height;setScrollSize(size=>({...size,viewport}));}} onContentSizeChange={(_width,content)=>{setScrollSize(size=>({...size,content}));setAtBottom(scrollY.current+scrollSize.viewport>=content-8);}} scrollEventThrottle={32} onScroll={event=>{const {contentOffset,layoutMeasurement,contentSize}=event.nativeEvent;scrollY.current=contentOffset.y;setAtBottom(contentOffset.y+layoutMeasurement.height>=contentSize.height-8);}} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={[s.page,Platform.OS==='web'&&s.webPage,Platform.OS==='web'&&{paddingBottom:96}]}>
   {Platform.OS!=='web'&&<><View style={s.nativeIntro}><Text style={s.nativeKicker}>FAIRWAY / GOLF GPS</Text><Text style={s.nativeTitle}>More golf. Less searching.</Text><Text style={s.nativeBody}>Find a time, find your line and make more room for the part of golf that matters.</Text></View><View style={s.nativeSectionHeader}><Text style={s.nativeSectionKicker}>TEE TIMES</Text><Text style={s.nativeSectionTitle}>Find your next round.</Text><Text style={s.nativeSectionBody}>Compare live availability in one calm, focused view.</Text></View></>}
   {Platform.OS==='web'&&<View style={s.webResultsFilters}><View style={s.webResultsFilterControls}>{renderControls(false,false,false,true,false,560,'center')}</View><NativePressable accessibilityRole="button" accessibilityLabel={viewMode==='list'?'Show courses as a grid':'Show courses as a list'} accessibilityState={{selected:viewMode==='grid'}} onPress={()=>setViewMode(mode=>mode==='list'?'grid':'list')} style={({pressed})=>[s.viewToggle,pressed&&{opacity:.72,transform:[{scale:.97}]}]}><SymbolView name={{ios:viewMode==='list'?'square.grid.2x2':'list.bullet',android:viewMode==='list'?'grid_view':'view_list',web:viewMode==='list'?'grid_view':'view_list'}} size={21} tintColor={colors.ink}/></NativePressable></View>}
   <View style={s.resultsBar}><View><Text style={s.results}>{total} tee times<Text style={s.resultLight}> · {rows.length} {rows.length===1?'course':'courses'}</Text></Text><Text style={s.hint}>{sort==='distance'?`Nearest to ${originName} first`:'Courses A–Z'}{radius===null?' · All distances':` · Within ${radius} km`}</Text></View>{Platform.OS!=='web'&&<Pressable accessibilityRole="button" accessibilityLabel="Refresh availability" disabled={refreshing} onPress={()=>void manualRefresh()} style={{width:46,height:46,borderRadius:23,backgroundColor:'#E8EEDD',alignItems:'center',justifyContent:'center'}}><Animated.View style={{transform:[{rotate:spin.interpolate({inputRange:[0,1],outputRange:['0deg','360deg']})}]}}><SymbolView name={{ios:'arrow.clockwise',android:'refresh',web:'refresh'}} size={23} tintColor={colors.ink}/></Animated.View></Pressable>}</View>
   {olympicRestricted&&<Text style={s.notice}>Olympic View has times for larger groups, but its booking page currently does not offer those times for one player.</Text>}
   {!!error&&<Text accessibilityLiveRegion="polite" style={s.notice}>{error}</Text>}
   <Animated.View onLayout={event=>{courseGroupTop.current=event.nativeEvent.layout.y;}} style={[s.courseSection,{opacity:fade}]}>{viewMode==='list'?<>{rows.map(course=><View key={course.id} onLayout={event=>{coursePositions.current[course.id]=event.nativeEvent.layout.y;}}><CourseCarousel key={`${course.id}-${players}-${holes}-${chosenDate}-${time}-${maxPrice}`} course={course} slots={course.slots} players={players} now={clock} onSelect={slot=>setSelection({course,slot,players})}/></View>)}{catalogCourses.map(course=><View key={`catalog-${course.id}`} accessibilityLabel={`${course.name}, ${course.municipality}`}><CourseCarousel course={course} slots={[]} players={players} now={clock} onPlayCourse={()=>playCatalogCourse(course.id)} onSelect={()=>{}}/></View>)}</>:<View style={s.catalogGrid} accessibilityLabel="Course grid">{rows.map(course=><View key={`grid-live-${course.id}`} style={{width:gridCardWidth}}><CourseCarousel course={course} slots={course.slots} players={players} now={clock} onSelect={slot=>setSelection({course,slot,players})}/></View>)}{catalogCourses.map(course=><View key={`grid-catalog-${course.id}`} style={{width:gridCardWidth}} accessibilityLabel={`${course.name}, ${course.municipality}`}><CourseCarousel course={course} slots={[]} players={players} now={clock} onPlayCourse={()=>playCatalogCourse(course.id)} onSelect={()=>{}}/></View>)}</View>}</Animated.View>
   {!!catalogCourses.length&&<View style={s.requestSection} accessibilityLabel="Request a course">
    <View style={s.requestCollapsed}><Text style={s.results}>Don’t see your course?</Text><Text style={s.hint}>Tell us which course you want added and we’ll review it for Fairway.</Text><Pressable accessibilityRole="button" onPress={()=>{setRequestOpen(true);setRequestState('idle');}} style={s.requestButton}><Text style={s.requestButtonText}>Request a course</Text></Pressable></View>
   </View>}
   {!rows.length&&<GlassPanel style={s.empty}><Text style={s.emptyTitle}>{!availabilityReady?'Loading tee times…':hasFreshData?'No rounds match just yet.':'Tee times are being refreshed.'}</Text><Text style={s.emptyText}>{!availabilityReady?'Checking connected courses now.':hasFreshData?'Try fewer players, a different round length or broader filters.':'Tap reload to check the connected courses again.'}</Text><Pressable accessibilityRole="button" onPress={()=>{if(!availabilityReady)return;setChosenDate(null);setTime('any');setMaxPrice(null);setRadius(null);setQuery('');toggle('players');}} style={[s.smallButton,!availabilityReady&&{opacity:.45}]}><Text style={s.link}>{hasFreshData?'Adjust your search →':'Reload tee times →'}</Text></Pressable></GlassPanel>}
  </Animated.ScrollView>
  <WebFooter onMobile={()=>setMobileSheet(true)} onPrivacy={()=>setWebSheet('privacy')} onSupport={()=>setWebSheet('support')}/>
  <BottomFade/>
  {rows.length>0&&scrollSize.content>scrollSize.viewport+8&&!atBottom&&<View pointerEvents="box-none" style={{position:'absolute',bottom:Platform.OS==='web'?62:16,left:0,right:0,alignItems:'center',zIndex:45}}><Pressable accessibilityRole="button" accessibilityLabel="Scroll to next course" onPress={()=>void nextCourse()} style={{width:Platform.OS==='web'?36:34,height:Platform.OS==='web'?36:34,borderRadius:20,backgroundColor:'#175D3D',alignItems:'center',justifyContent:'center',boxShadow:'0 3px 10px rgba(24,60,50,0.24)'}}><SymbolView name={{ios:'arrow.down',android:'arrow_downward',web:'arrow_downward'}} size={18} tintColor="white"/></Pressable></View>}
  {panel!==null&&<MenuOverlay open={menuOpen} anchor={menuAnchor} onClose={closeMenu} onExited={exitMenu} label={menuLabel} headerContent={panel==='coverage'?undefined:filterFace(panel)} preferredWidth={panel==='players'?248:panel==='holes'?232:panel==='calendar'?320:360} tinted={panel==='filters'} footer={panel==='filters'?<Pressable accessibilityRole="button" onPress={closeMenu} style={s.apply}><Text style={s.applyText}>Show {total} tee times</Text></Pressable>:undefined}>
   {panel==='players'&&<View style={s.panel}><Text style={s.label}>YOUR GROUP</Text><View style={s.options}>{[1,2,3,4].map(n=><Chip key={n} label={`${n} ${n===1?'player':'players'}`} selected={n===players} onPress={()=>{setPlayers(n);setChosenDate(null);closeMenu();}}/>)}</View></View>}
   {panel==='holes'&&<View style={s.panel}><Text style={s.label}>LENGTH OF ROUND</Text><View style={s.options}>{(['any',9,18] as const).map(n=><Chip key={n} label={n==='any'?'Any holes':`${n} holes`} selected={n===holes} onPress={()=>{setHoles(n);setChosenDate(null);closeMenu();}}/>)}</View></View>}
   {panel==='calendar'&&<View style={s.panel}><View style={s.between}><Text style={s.label}>AVAILABLE DATES</Text><Pressable accessibilityRole="button" onPress={()=>{setChosenDate(null);closeMenu();}} style={s.smallButton}><Text style={s.link}>All upcoming</Text></Pressable></View><View style={s.options}>{calendarDates.map(date=><Pressable accessibilityRole="button" accessibilityLabel={`Show tee times on ${labelDate(date)}`} accessibilityState={{selected:chosenDate===date}} key={date} onPress={()=>{setChosenDate(date);closeMenu();}} style={[s.dateCell,chosenDate===date&&s.selectedDate]}><Text style={[s.dateText,chosenDate===date&&{color:'#183C32'}]}>{labelDate(date)}</Text></Pressable>)}</View>{!calendarDates.length&&<Text style={s.hint}>No dates match these filters. Try another group size or round length.</Text>}</View>}
   {panel==='filters'&&<View style={s.panel}>
    <View style={s.between}><Text style={s.label}>REFINE YOUR ROUND</Text><Pressable accessibilityRole="button" style={s.smallButton} onPress={()=>{setTime('any');setMaxPrice(null);setRadius(null);setQuery('');setSort('name');}}><Text style={s.link}>Reset filters</Text></Pressable></View>
    <Text style={s.hint}>Tee-off time</Text><View style={s.options}>{([['any','Any time'],['morning','Before noon'],['afternoon','Noon–4 pm'],['evening','After 4 pm']] as const).map(([value,label])=><Chip key={value} label={label} selected={time===value} onPress={()=>setTime(value)}/>)}</View>
    <Text style={s.hint}>Price per player</Text><View style={s.options}>{([null,50,100] as const).map(value=><Chip key={String(value)} label={value===null?'Any price':`Up to $${value}`} selected={maxPrice===value} onPress={()=>setMaxPrice(value)}/>)}</View>{maxPrice!==null&&<Text style={s.hint}>Times without a published price are excluded.</Text>}
    <Text style={s.hint}>Distance from {originName}</Text><View style={s.options}>{cities.map(city=><Chip key={city.name} label={city.name} selected={originName===city.name} onPress={()=>{locationRequest.current++;setLocating(false);setOrigin(city);setOriginName(city.name);setLocationMessage('');}}/>)}</View>
    <Pressable accessibilityRole="button" disabled={locating} onPress={locate} style={s.smallButton}><Text style={s.link}>{locating?'Finding your location…':'Use my location ↗'}</Text></Pressable>{!!locationMessage&&<Text style={s.hint}>{locationMessage}</Text>}
    <View style={s.options}><Chip label="All distances" selected={radius===null} onPress={()=>setRadius(null)}/>{[10,25,50,100].map(n=><Chip key={n} label={`${n} km`} selected={radius===n} onPress={()=>setRadius(n)}/>)}</View>
    <Text style={s.hint}>Course order</Text><View style={s.options}><Chip label="Name A–Z" selected={sort==='name'} onPress={()=>setSort('name')}/><Chip label="Nearest first" selected={sort==='distance'} onPress={()=>setSort('distance')}/></View>
   </View>}
   {panel==='coverage'&&<View style={s.panel}><Text style={s.label}>GROWING ACROSS BC</Text><Text style={s.coverageBody}>Royalwood · Public tee times and prices across its booking window.</Text><Text style={s.coverageBody}>Langley Golf Centre · Public 9 &amp; 18-hole times. Prices confirmed by the course.</Text><Text style={s.coverageBody}>Ardmore · Public 9 &amp; 18-hole rounds across its booking window.</Text><Text style={s.coverageBody}>Cedar Hill · Upcoming public 9 & 18-hole rounds.</Text><Text style={s.coverageBody}>Olympic View · Upcoming dates from its public booking calendar.</Text><Text style={s.coverageBody}>Mount Douglas · Public 9 &amp; 18-hole rounds across its booking window.</Text><Text style={s.coverageBody}>Duncan Meadows · Connection under development; automated live requests are blocked.</Text><Text style={s.hint}>Cordova Bay, Highland Pacific and Bear Mountain need supported feed access. Metchosin is being evaluated. They aren’t connected yet. Courses appear below only when matching times are available.</Text></View>}
  </MenuOverlay>}
  <BookingSheet selection={selection} valid={selectionValid} onClose={()=>setSelection(null)} onError={setError}/>
  <WebInfoSheet kind={webSheet} onClose={()=>setWebSheet(null)}/>
  <WebMobileSheet open={mobileSheet} onClose={()=>setMobileSheet(false)} onRequestAccess={submitTestFlightRequest}/>
  <WebCourseRequestSheet open={requestOpen} onClose={()=>setRequestOpen(false)} name={requestName} city={requestCity} notes={requestNotes} onNameChange={setRequestName} onCityChange={setRequestCity} onNotesChange={setRequestNotes} onSubmit={()=>void submitCourseRequest()} state={requestState}/>
 
 </SafeAreaView>;
}

export default function Home(){
 return Platform.OS==='web'?<WebPreview/>:<Explore/>;
}
const s=StyleSheet.create({webExploreHeader:{backgroundColor:'rgba(247,248,242,.98)',borderBottomWidth:1,borderBottomColor:'#E2E7DD'},webExploreNav:{width:'calc(100% - 40px)' as any,maxWidth:1160,minHeight:68,alignSelf:'center',paddingHorizontal:20,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:18},webExploreControls:{flex:1,minWidth:260,maxWidth:560,marginHorizontal:40},webExploreAccount:{width:170,alignItems:'flex-end'},webExploreMobileControls:{width:'100%',flexBasis:'100%',paddingTop:4,alignItems:'center'},webExploreWordmark:{width:170,padding:0},webExploreWordmarkText:{fontSize:24,fontWeight:'700',letterSpacing:-1.4,color:'#183C32'},webExploreWordmarkDot:{color:'#9BB65A'},webExploreLinks:{flex:1,flexDirection:'row',justifyContent:'center',gap:28},webExploreLink:{fontSize:12,fontWeight:'600',color:'#5F7168'},webExploreActions:{flexDirection:'row',alignItems:'center',gap:8},webOpenButton:{height:38,paddingHorizontal:14,borderRadius:20,backgroundColor:'#183C32',flexDirection:'row',alignItems:'center',gap:8,boxShadow:'0 5px 16px rgba(24,60,50,.18)'},webOpenButtonText:{fontSize:12,fontWeight:'700',color:'#fff'},webOpenButtonArrow:{fontSize:15,color:'#C8F26C'},fixedHeader:{flexShrink:0,zIndex:30,backgroundColor:'#F7F8F2',width:'100%',maxWidth:1000,alignSelf:'center',paddingHorizontal:20,paddingTop:8},webFixedHeader:{maxWidth:'100%',paddingHorizontal:0,paddingTop:0},sticky:{borderRadius:24,position:'absolute',left:0,right:0,zIndex:20,backgroundColor:'#F7F8F2',borderBottomWidth:1,borderBottomColor:'#E0E7E2',boxShadow:'0 4px 18px rgba(24,60,50,.06)'},stickyInner:{width:'100%',maxWidth:1200,alignSelf:'center',minHeight:80,paddingHorizontal:20,paddingVertical:12,justifyContent:'center',alignItems:'center'},stickyNarrow:{alignItems:'stretch',gap:12},compactBrandBlock:{alignItems:'flex-start'},desktopBrand:{position:'absolute',left:24},compactBrand:{fontSize:25,fontWeight:'800',letterSpacing:-1,color:colors.ink},compactTagline:{fontSize:10,color:colors.muted,marginTop:2},compactToolbar:{justifyContent:'center',gap:6},compactControl:{paddingHorizontal:14,paddingVertical:13,minHeight:46},safe:{flex:1,backgroundColor:'#F7F8F2'},nav:{height:44,width:'100%',alignItems:'flex-start',justifyContent:'center',paddingHorizontal:4},brand:{fontSize:36,fontWeight:'800',letterSpacing:-1.6,color:colors.ink},brandDot:{color:'#799544'},tagline:{fontSize:12,fontWeight:'400',color:colors.muted,letterSpacing:.15},page:{width:'100%',maxWidth:1160,alignSelf:'center',paddingHorizontal:20,paddingTop:8,paddingBottom:40,gap:18},webPage:{width:'calc(100% - 40px)' as any},nativeIntro:{paddingTop:28,paddingBottom:24,gap:9},nativeSectionHeader:{paddingHorizontal:18,paddingVertical:18,borderRadius:28,backgroundColor:'#E8EFE4',gap:5},nativeSectionKicker:{fontSize:10,fontWeight:'800',letterSpacing:1.8,color:'#6E866E'},nativeSectionTitle:{fontSize:28,lineHeight:32,fontWeight:'700',letterSpacing:-1.1,color:'#183C32'},nativeSectionBody:{fontSize:13,lineHeight:19,color:'#617067'},courseSection:{gap:26,padding:12,marginHorizontal:-8,borderRadius:32,backgroundColor:'#E8EFE4'},nativeKicker:{fontSize:10,fontWeight:'800',letterSpacing:1.8,color:'#6E866E'},nativeTitle:{fontSize:38,lineHeight:42,fontWeight:'700',letterSpacing:-1.8,color:'#183C32',maxWidth:520},nativeBody:{fontSize:15,lineHeight:23,color:'#617067',maxWidth:500},intro:{gap:7,marginBottom:4},title:{fontSize:27,fontWeight:'700',letterSpacing:-.9,color:colors.ink},subtitle:{fontSize:13,color:colors.muted},toolbar:{flexDirection:'row',flexWrap:'nowrap',gap:8},webResultsFilters:{width:'100%',maxWidth:1160,alignSelf:'center',marginTop:2,marginBottom:0,position:'relative',alignItems:'center',minHeight:46},webResultsFilterControls:{width:'100%',alignItems:'center'},viewToggle:{position:'absolute',right:0,top:0,width:46,minHeight:46,paddingHorizontal:8,paddingVertical:13,backgroundColor:'#ffffff',borderRadius:28,alignItems:'center',justifyContent:'center',boxShadow:'0 3px 12px rgba(24,60,50,0.12)'},control:{flexDirection:'row',gap:4,flex:1,minWidth:0,alignItems:'center',minHeight:46,paddingHorizontal:14,paddingVertical:13,backgroundColor:Platform.OS==='web'?'#ffffff':'#E8EEDD',borderWidth:0,boxShadow:Platform.OS==='web'?'0 3px 12px rgba(24,60,50,0.12)':'none',borderRadius:28,justifyContent:'center'},filterButton:{backgroundColor:Platform.OS==='web'?'#ffffff':'#E8EEDD'},controlText:{fontSize:12,fontWeight:'600',color:colors.ink},panel:{padding:14,paddingTop:8,gap:13},label:{fontSize:10,fontWeight:'700',letterSpacing:1.2,color:colors.muted},options:{flexDirection:'row',flexWrap:'wrap',gap:8},hint:{fontSize:11,color:colors.muted,lineHeight:17},between:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},smallButton:{minHeight:42,paddingHorizontal:6,justifyContent:'center'},link:{fontSize:12,fontWeight:'600',color:colors.green},dateCell:{borderWidth:1,borderColor:'#DCE3D9',borderRadius:10,paddingVertical:15,paddingHorizontal:16},selectedDate:{backgroundColor:'#C5EB65',borderColor:'#8EBA36'},dateText:{fontSize:13,fontWeight:'600',color:colors.ink},apply:{borderRadius:12,padding:16,backgroundColor:colors.lime,alignItems:'center'},applyText:{fontSize:13,fontWeight:'700',color:colors.ink},coverageBody:{fontSize:13,lineHeight:21,color:colors.ink},resultsBar:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12,marginTop:6},results:{fontSize:14,fontWeight:'700',color:colors.ink,marginBottom:5},resultLight:{fontWeight:'400',color:colors.muted},refresh:{fontSize:25,color:colors.green},notice:{fontSize:12,color:'#8B552D',lineHeight:18},empty:{backgroundColor:'#fff',borderRadius:20,padding:25,gap:12},emptyTitle:{fontSize:20,fontWeight:'600',color:colors.ink},emptyText:{fontSize:13,lineHeight:21,color:colors.muted},requestSection:{alignItems:'center',gap:8,marginTop:-10,paddingTop:0},requestCollapsed:{alignItems:'center',gap:8},requestButton:{minHeight:42,paddingHorizontal:16,paddingVertical:11,borderRadius:22,backgroundColor:'#C5EB65',justifyContent:'center',alignItems:'center'},requestButtonText:{fontSize:12,fontWeight:'700',color:'#183C32'},requestMenu:{width:'100%',maxWidth:600,padding:16,gap:10,borderRadius:24,backgroundColor:'#ffffff',boxShadow:'0 6px 20px rgba(24,60,50,0.16)'},requestMenuHeader:{flexDirection:'row',alignItems:'flex-start',gap:10},requestClose:{width:38,height:38,borderRadius:19,backgroundColor:'#E8EEDD',alignItems:'center',justifyContent:'center'},requestInput:{width:'100%',minHeight:44,paddingHorizontal:14,paddingVertical:10,borderRadius:18,borderWidth:1,borderColor:'#d7e1d7',backgroundColor:'#fff',fontSize:14,color:'#183C32'},requestNotes:{minHeight:76,textAlignVertical:'top'},requestActions:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8},requestCancel:{minHeight:42,paddingHorizontal:14,justifyContent:'center'},requestCancelText:{fontSize:12,fontWeight:'600',color:colors.muted},requestSuccess:{fontSize:12,color:'#28734c'},requestError:{fontSize:12,color:'#9b4824'},catalogSection:{gap:12,marginTop:4},catalogHeading:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',gap:12},catalogCount:{fontSize:12,fontWeight:'700',color:colors.green,backgroundColor:'#E8EEDD',paddingHorizontal:10,paddingVertical:6,borderRadius:16},catalogGrid:{flexDirection:'row',flexWrap:'wrap',gap:12},catalogCard:{flexGrow:1,flexBasis:260,minWidth:240,maxWidth:490,backgroundColor:'#fff',borderRadius:20,overflow:'hidden',boxShadow:Platform.OS==='web'?'0 4px 14px rgba(24,60,50,0.12)':'none'},catalogPhoto:{width:'100%',height:124},catalogCopy:{padding:13,gap:4},catalogName:{fontSize:16,fontWeight:'700',color:colors.ink},catalogMeta:{fontSize:11,color:colors.muted},catalogStatus:{fontSize:11,lineHeight:16,color:colors.green},catalogSource:{fontSize:10,fontWeight:'600',color:colors.muted,marginTop:2},fine:{fontSize:10,lineHeight:16,textAlign:'center',color:colors.muted,maxWidth:420}});
