import {SymbolView} from 'expo-symbols';
import {MenuOverlay,type MenuAnchor} from './MenuOverlay';
import {usernamePattern,normalizeUsername,validNewPassword,passwordHint} from '../auth/validation';
import {ProfileDashboard} from './ProfileDashboard';

import {GlassPanel,GlassInput as TextInput,GlassPressable as Pressable} from './Glass';
import {useCallback,useEffect,useRef,useState} from 'react';
import * as Linking from 'expo-linking';
import {parseEmailLink} from '../auth/email-link';
import {ScrollView,Text,StyleSheet,View,Platform,KeyboardAvoidingView,ActivityIndicator,Animated,Pressable as PlainPressable} from 'react-native';
import {Link,router,useLocalSearchParams} from 'expo-router';
import {SafeAreaView} from 'react-native-safe-area-context';
import {authClient} from '../auth/client';
import {useAuth} from '../auth/AuthProvider';
import {colors} from './ui';
type Mode='login'|'signup'|'verify'|'reset'|'recover'|'password';
export default function AccountScreen({embedded=false,onClose}:{embedded?:boolean;onClose?:()=>void}){
 const {session,ready,error:sessionError}=useAuth();
 const link=Linking.useLinkingURL();
 const {view}=useLocalSearchParams<{view?:string}>();
 const [slider]=useState(()=>new Animated.Value(0));
 const [tabsWidth,setTabsWidth]=useState(0);
 const redirectTo=(Platform.OS!=='web'&&process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL)||Linking.createURL('account');
 const handledLink=useRef<string|null>(null);
 const [showCode,setShowCode]=useState(false),[showPassword,setShowPassword]=useState(false);
 const actionButton=useRef<View>(null);
 const [actionAnchor,setActionAnchor]=useState<MenuAnchor|null>(null),[actionsOpen,setActionsOpen]=useState(false);
 const [mode,setMode]=useState<Mode>('login'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState(''),[code,setCode]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[confirmDelete,setConfirmDelete]=useState(false);
 const closeActions=useCallback(()=>setActionsOpen(false),[]),exitActions=useCallback(()=>{setActionAnchor(null);setConfirmDelete(false);},[]);
 useEffect(()=>{
  void Promise.resolve().then(()=>{
  if(!link||!authClient||handledLink.current===link)return;
  handledLink.current=link;
  let callback:ReturnType<typeof parseEmailLink>;
  try{callback=parseEmailLink(link,redirectTo);}catch(error){setMessage(error instanceof Error?error.message:'Invalid email link.');return;}
  if(!callback)return;
  if(Platform.OS==='web'&&typeof window!=='undefined')window.history.replaceState(null,'',window.location.pathname);
  const recovery=callback.recovery;
  if(recovery)setMode('password');
  setBusy(true);setMessage('Verifying your email link…');
  void authClient.auth.setSession({access_token:callback.access_token,refresh_token:callback.refresh_token}).then(({error})=>{
   if(error){setMode(recovery?'reset':'login');setMessage('This link is invalid or expired. Request another email.');}
   else{setMode(recovery?'password':'login');setMessage(recovery?'Choose your new password.':'Email confirmed. You are signed in.');if(!recovery&&Platform.OS==='web'){if(embedded)onClose?.();else router.replace('/');}}
  }).catch(()=>{setMode(recovery?'reset':'login');setMessage('Could not verify the link. Please try again.');}).finally(()=>setBusy(false));
  });
 },[link,redirectTo,embedded,onClose]);
 // Restore signed-in web visitors to Search; deliberate profile visits remain available.
 useEffect(()=>{
  const recoveryLink=!!link&&/[#&?]type=recovery(?:&|$)/.test(link);
  if(Platform.OS==='web'&&ready&&session&&!embedded&&view!=='profile'&&!busy&&mode!=='password'&&mode!=='recover'&&!recoveryLink){
   router.replace('/');
  }
 },[ready,session,view,busy,mode,link,embedded]);
 async function submit(){
  if(!authClient||busy)return;setBusy(true);setMessage('');
  try{
   const address=email.trim().toLowerCase();
   if(mode!=='password'&&mode!=='login'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))throw Error('Enter a valid email address.');
   if(mode==='signup'&&!usernamePattern.test(normalizeUsername(name)))throw Error('Choose a username with 3–24 letters, numbers or underscores.');
   if(['signup','password'].includes(mode)&&!validNewPassword(password))throw Error(passwordHint);
   if(mode==='signup'){
    const {data,error}=await authClient.auth.signUp({email:address,password,options:{emailRedirectTo:redirectTo,data:{username:normalizeUsername(name),display_name:normalizeUsername(name)}}});if(error)throw error;
    setPassword('');if(data.session&&Platform.OS==='web'){if(embedded)onClose?.();else router.replace('/');}if(!data.session){setMode('verify');setMessage('Open the confirmation link in your email, then return here to sign in. If your email includes a code, you can enter it below.');}
   }else if(mode==='login'){if(address.includes('@')&&!address.startsWith('@')){const {error}=await authClient.auth.signInWithPassword({email:address,password});if(error)throw error;}else{const username=normalizeUsername(address);if(!usernamePattern.test(username))throw Error('Enter your username or email address.');const {data,error}=await authClient.functions.invoke('username-login',{body:{username,password}});if(error){let detail;try{detail=await error.context?.json();}catch{}throw Error(detail?.error||'Username sign-in is unavailable. Please use your email.');}if(!data?.access_token||!data?.refresh_token)throw Error('Unable to sign in.');const {error:sessionError}=await authClient.auth.setSession(data);if(sessionError)throw sessionError;}setPassword('');if(Platform.OS==='web'){if(embedded)onClose?.();else router.replace('/');}}
   else if(mode==='reset'){const {error}=await authClient.auth.resetPasswordForEmail(address,{redirectTo});if(error)throw error;setMode('recover');setMessage('If this address has an account, you will receive a password-reset link. Open it to choose a new password.');}
   else if(mode==='verify'||mode==='recover'){const {error}=await authClient.auth.verifyOtp({email:address,token:code.trim(),type:mode==='recover'?'recovery':'signup'});if(error)throw error;setCode('');if(mode==='recover')setMode('password');else {setMode('login');if(Platform.OS==='web'){if(embedded)onClose?.();else router.replace('/');}}}
   else {const {error}=await authClient.auth.updateUser({password});if(error)throw error;setPassword('');setMode('login');setMessage('Password updated.');}
  }catch(e){setMessage(e instanceof Error?e.message:'Please try again.');}finally{setBusy(false);}
 }
 async function removeAccount(){if(!authClient)return;setBusy(true);try{const folder=session!.user.id;const listed=await authClient.storage.from('avatars').list(folder);if(listed.error)throw listed.error;if(listed.data.length){const removed=await authClient.storage.from('avatars').remove(listed.data.map(item=>`${folder}/${item.name}`));if(removed.error)throw removed.error;}const {error}=await authClient.rpc('delete_my_account');if(error)throw error;await authClient.auth.signOut({scope:'local'});setConfirmDelete(false);setMode('login');setMessage('Your account and cloud rounds have been deleted.');}catch{setMessage('Could not delete your account. Please retry.');}finally{setBusy(false);}}
 async function resend(){if(!authClient)return;setBusy(true);try{const result=mode==='recover'?await authClient.auth.resetPasswordForEmail(email.trim().toLowerCase(),{redirectTo}):await authClient.auth.resend({type:'signup',email:email.trim().toLowerCase(),options:{emailRedirectTo:redirectTo}});if(result.error)throw result.error;setMessage('If eligible, a new email has been sent.');}catch(e){setMessage(e instanceof Error?e.message:'Could not resend.');}finally{setBusy(false);}}
 async function signOut(){setBusy(true);try{const {error}=await authClient!.auth.signOut();if(error)throw error;setMode('login');}catch{setMessage('Could not sign out. Please retry.');}finally{setBusy(false);}}
 function switchMode(next:Mode){Animated.timing(slider,{toValue:next==='signup'?1:0,duration:180,useNativeDriver:true}).start();setMode(next);setMessage('');setPassword('');setCode('');setShowCode(false);setShowPassword(false);}
 const waiting=mode==='verify'||mode==='recover';
 const title=mode==='signup'?'Create your account':mode==='login'?'Welcome back':mode==='password'?'Choose a new password':mode==='reset'?'Forgot your password?':'Check your inbox';
 const subtitle=mode==='signup'?'Your rounds, favourite courses and friends. All in one place.':mode==='login'?'Sign in to your Fairway account.':mode==='reset'?'We’ll email you a link to reset your password.':mode==='password'?passwordHint:`We sent instructions to ${email||'your email address'}.`;
 return <SafeAreaView edges={['top','left','right']} style={[s.page,embedded&&{height:620,backgroundColor:'transparent'}]}>
  {Platform.OS==='web'&&!embedded&&<Link href="/" style={{padding:20,color:colors.green,fontWeight:'600'}}>← Home</Link>}
  <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
   {ready&&session&&mode!=='password'?<View style={s.signedIn}>
    <View style={{height:44,justifyContent:'center'}}><Text style={s.pageTitle}>Account</Text><Pressable ref={actionButton} accessibilityLabel="Account actions" accessibilityRole="button" onPress={()=>actionButton.current?.measureInWindow((x,y,width,height)=>{setActionAnchor({x,y,width,height});setActionsOpen(true);})} style={{position:'absolute',right:0,width:44,height:44,borderRadius:22,alignItems:'center',justifyContent:'center',backgroundColor:'#E8EEDD',opacity:actionAnchor?0:1}}><SymbolView name={{ios:'rectangle.portrait.and.arrow.right',android:'logout',web:'logout'}} size={22} tintColor="#B83232"/></Pressable></View>
    <ProfileDashboard key={session.user.id}/>
    {actionAnchor&&<MenuOverlay open={actionsOpen} anchor={actionAnchor} onClose={closeActions} onExited={exitActions} preferredWidth={280} label="Account actions" headerContent={<View style={{width:44,height:44,alignItems:'center',justifyContent:'center'}}><SymbolView name={{ios:'rectangle.portrait.and.arrow.right',android:'logout',web:'logout'}} size={22} tintColor="#B83232"/></View>}><View style={s.accountActions}>
     <Pressable accessibilityRole="button" disabled={busy} onPress={()=>void signOut()} style={s.accountAction}><Text style={s.link}>Sign out</Text></Pressable>
     {confirmDelete?<GlassPanel style={s.card}><Text style={s.label}>Delete your account and all cloud-saved rounds permanently?</Text><Pressable disabled={busy} onPress={()=>void removeAccount()} style={s.accountAction}><Text style={s.danger}>Delete my account</Text></Pressable><Pressable disabled={busy} onPress={()=>setConfirmDelete(false)} style={s.accountAction}><Text style={s.link}>Cancel</Text></Pressable></GlassPanel>:<Pressable disabled={busy} onPress={()=>setConfirmDelete(true)} style={s.accountAction}><Text style={s.danger}>Delete account</Text></Pressable>}
     {!!(message||sessionError)&&<Text accessibilityRole="alert" style={s.notice}>{message||sessionError}</Text>}
    </View></MenuOverlay>}
   </View>:
   <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={[s.content,!session&&s.authContent]}>
    {!ready?<View style={s.loading}><ActivityIndicator color={colors.green}/><Text style={s.subtitle}>Opening your account…</Text></View>:<>
     <View style={s.brand}><Text style={s.logo}>fairway</Text><Text style={s.tagline}>More golf. Less searching.</Text></View>
     <GlassPanel style={s.card}>
      {(mode==='login'||mode==='signup')&&<GlassPanel interactive style={s.tabs} onLayout={event=>setTabsWidth(event.nativeEvent.layout.width)}><Animated.View pointerEvents="none" style={[s.activeTab,{width:Math.max(0,(tabsWidth-12)/2),transform:[{translateX:slider.interpolate({inputRange:[0,1],outputRange:[0,(tabsWidth-4)/2]})}]}]}><GlassPanel interactive style={{flex:1,borderRadius:22,backgroundColor:Platform.OS==='web'?colors.green:'#C5EB65'}}/></Animated.View>{(['login','signup'] as const).map(next=><PlainPressable key={next} accessibilityRole="button" accessibilityState={{selected:mode===next}} disabled={busy} onPress={()=>switchMode(next)} style={s.tab}><Text style={[s.tabText,mode===next&&{color:Platform.OS==='web'?'white':colors.ink}]}>{next==='login'?'Sign in':'Create account'}</Text></PlainPressable>)}</GlassPanel>}
      <View style={{gap:8}}><Text accessibilityRole="header" style={s.title}>{title}</Text><Text style={s.subtitle}>{subtitle}</Text></View>
      {!authClient&&<Text accessibilityRole="alert" style={s.notice}>Account service is not configured. Please try again later.</Text>}
      {mode==='signup'&&<View style={s.field}><Text style={s.label}>Username</Text><TextInput accessibilityLabel="Username" placeholder="Choose Username" value={name} onChangeText={setName} maxLength={24} autoCapitalize="none" autoCorrect={false} autoComplete="username" style={s.input}/></View>}
      {!waiting&&mode!=='password'&&<View style={s.field}><Text style={s.label}>{mode==='login'?'Username or email':'Email address'}</Text><TextInput accessibilityLabel={mode==='login'?'Username or email':'Email address'} placeholder={mode==='login'?'Username or email':'you@example.com'} autoCapitalize="none" autoCorrect={false} keyboardType={mode==='login'?'default':'email-address'} autoComplete={mode==='login'?'username':'email'} value={email} onChangeText={setEmail} style={s.input}/></View>}
      {['login','signup','password'].includes(mode)&&<View style={s.field}><View style={s.fieldHeading}><Text style={s.label}>Password</Text><Pressable accessibilityRole="button" accessibilityLabel={showPassword?'Hide password':'Show password'} onPress={()=>setShowPassword(v=>!v)} hitSlop={8}><Text style={s.smallLink}>{showPassword?'Hide':'Show'}</Text></Pressable></View><TextInput accessibilityLabel="Password" placeholder="Password" secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} autoComplete={mode==='login'?'current-password':'new-password'} value={password} onChangeText={setPassword} onSubmitEditing={()=>void submit()} returnKeyType="go" style={s.input}/>{mode!=='login'&&<Text style={s.subtitle}>{passwordHint}</Text>}</View>}
      {mode==='login'&&<Pressable disabled={busy} onPress={()=>switchMode('reset')} style={s.forgot}><Text style={s.smallLink}>Forgot password?</Text></Pressable>}
      {waiting&&<>
       <Text style={s.subtitle}>{mode==='verify'?'Open the confirmation link in your email, then sign in here.':'Open the reset link in your email to choose a new password.'}</Text>
       <Pressable disabled={busy} onPress={()=>switchMode('login')} style={s.button}><Text style={s.white}>{mode==='verify'?'Back to sign in':'Return to sign in'}</Text></Pressable>
       <Pressable disabled={busy} onPress={()=>void resend()} style={s.textButton}><Text style={s.link}>Resend email</Text></Pressable>
       <Pressable onPress={()=>setShowCode(v=>!v)} style={s.textButton}><Text style={s.smallLink}>{showCode?'Hide code entry':'Have a verification code?'}</Text></Pressable>
       {showCode&&<TextInput accessibilityLabel="Email verification code" placeholder="Verification code" keyboardType="number-pad" textContentType="oneTimeCode" value={code} onChangeText={setCode} style={s.input}/>}
      </>}
      {(!waiting||showCode)&&<Pressable accessibilityRole="button" disabled={busy||!authClient} onPress={()=>void submit()} style={[s.button,(busy||!authClient)&&{opacity:0.5}]}>{busy?<ActivityIndicator color="white"/>:<Text style={s.white}>{mode==='signup'?'Create account':mode==='login'?'Sign in':mode==='password'?'Save password':mode==='reset'?'Send reset email':'Verify code'}</Text>}</Pressable>}
      {mode==='reset'&&<Pressable disabled={busy} onPress={()=>switchMode('login')} style={s.textButton}><Text style={s.link}>Back to sign in</Text></Pressable>}
     </GlassPanel>
     <Link href="/" onPress={onClose} style={s.guest}>Continue browsing tee times</Link>
    </>}
    {!!(message||sessionError)&&<Text accessibilityRole="alert" style={s.notice}>{message||sessionError}</Text>}
   </ScrollView>}
  </KeyboardAvoidingView>
 </SafeAreaView>;
}
const s=StyleSheet.create({
 signedIn:{flex:1,minHeight:0,width:'100%',maxWidth:480,alignSelf:'center',paddingHorizontal:20,paddingTop:16,gap:12},accountAction:{height:48,borderRadius:24,paddingHorizontal:18,backgroundColor:'#E8EEDD',alignItems:'center',justifyContent:'center'},accountActions:{flexShrink:0,gap:12,paddingHorizontal:12,paddingTop:8,paddingBottom:12},
 page:{flex:1,backgroundColor:colors.paper},content:{paddingHorizontal:20,paddingTop:24,paddingBottom:40,flexGrow:1,gap:20,width:'100%',maxWidth:480,alignSelf:'center'},authContent:{justifyContent:'flex-start',paddingTop:48},
 loading:{alignItems:'center',gap:16},pageTitle:{fontSize:16,fontWeight:'600',textAlign:'center',color:colors.ink},brand:{alignItems:'center',gap:4,marginBottom:8},logo:{fontSize:44,lineHeight:56,paddingHorizontal:5,paddingTop:2,fontWeight:'800',letterSpacing:-2,color:colors.ink},tagline:{fontSize:13,color:colors.muted},
 card:{padding:24,borderRadius:28,backgroundColor:'#ffffff',gap:20,boxShadow:'0 8px 30px rgba(24,60,50,0.07)'},title:{fontSize:26,fontWeight:'700',letterSpacing:-0.6,color:colors.ink},subtitle:{fontSize:14,lineHeight:21,color:colors.muted},
 tabs:{flexDirection:'row',padding:4,gap:4,borderRadius:26,backgroundColor:'#edf1eb'},tab:{flex:1,minHeight:44,borderRadius:22,alignItems:'center',justifyContent:'center'},activeTab:{position:'absolute',top:4,bottom:4,left:4,borderRadius:22},tabText:{fontSize:14,fontWeight:'600',color:colors.ink},
 field:{gap:8},fieldHeading:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},label:{fontSize:13,fontWeight:'600',color:colors.ink},input:{height:52,paddingHorizontal:16,borderRadius:26,backgroundColor:'#f0f3ee',fontSize:16,color:colors.ink},
 button:{minHeight:52,padding:15,borderRadius:28,backgroundColor:colors.green,alignItems:'center',justifyContent:'center'},white:{color:'white',fontSize:16,fontWeight:'700'},secondary:{minHeight:48,padding:14,borderRadius:24,backgroundColor:'#e8eedd',alignItems:'center'},textButton:{minHeight:36,justifyContent:'center',alignItems:'center'},forgot:{alignSelf:'flex-end',minHeight:30,justifyContent:'center',marginTop:-12},link:{color:colors.green,fontSize:15,fontWeight:'600'},smallLink:{color:colors.green,fontSize:13,fontWeight:'600'},guest:{textAlign:'center',color:colors.muted,fontSize:14,padding:12},danger:{color:'#a83e3e',fontSize:14},notice:{backgroundColor:'#e8eedd',padding:16,borderRadius:18,color:colors.ink,fontSize:14,lineHeight:21}
});
