import {Image} from 'expo-image';
import {useWindowDimensions,Pressable,StyleSheet,Text,View} from 'react-native';

export function WebLandingHero({onExplore}:{onExplore:()=>void}){
 const {width}=useWindowDimensions();
 const compact=width<700;
 return <View style={s.wrap}>
  <View style={s.hero}>
   <Image source={require('../../assets/course-photos/olympic-view.jpg')} contentFit="cover" style={s.heroImage}/>
   <View style={s.scrim}/>
   <View style={s.heroCopy}>
    <Text style={s.kicker}>FAIRWAY / GOLF GPS</Text>
    <Text style={[s.title,compact&&s.titleCompact]}>More golf.{"\n"}Less searching.</Text>
    <Text style={s.body}>Find a time. Find your line. Make more room for the part of golf that matters.</Text>
    <View style={s.actions}><Pressable accessibilityRole="button" onPress={onExplore} style={({pressed})=>[s.primary,pressed&&s.pressed]}><Text style={s.primaryText}>Find a tee time</Text><Text style={s.primaryArrow}>→</Text></Pressable><Text style={s.actionHint}>Live courses across BC</Text></View>
   </View>
  </View>
  <View style={[s.rail,compact&&s.railCompact]}>
   {[['01','Tee times','Search nearby and compare live availability.'],['02','Rangefinder','Take your round from the first tee to the final putt.'],['03','Friends & rounds','Keep your group, scores and rounds together.']].map(([number,title,body])=><View style={s.railItem} key={number}><Text style={s.railNumber}>{number}</Text><View style={s.railCopy}><Text style={s.railTitle}>{title}</Text><Text style={s.railBody}>{body}</Text></View><Text style={s.railArrow}>↗</Text></View>)}
  </View>
 </View>;
}

const s=StyleSheet.create({
 wrap:{width:'100%',gap:12,marginBottom:12},
 hero:{height:450,borderRadius:28,overflow:'hidden',position:'relative',justifyContent:'flex-end'},
 heroImage:{...StyleSheet.absoluteFill,width:'100%',height:'100%'},
 scrim:{...StyleSheet.absoluteFill,backgroundColor:'rgba(7,27,19,.5)'},
 heroCopy:{paddingHorizontal:30,paddingBottom:34,maxWidth:650},
 kicker:{fontSize:10,fontWeight:'800',letterSpacing:1.8,color:'#d4f183',marginBottom:11},
 title:{fontSize:64,lineHeight:62,fontWeight:'700',letterSpacing:-3.3,color:'#fff'},
 titleCompact:{fontSize:48,lineHeight:48,letterSpacing:-2.3},
 body:{fontSize:15,lineHeight:22,color:'rgba(255,255,255,.84)',maxWidth:430,marginTop:16},
 actions:{flexDirection:'row',alignItems:'center',gap:16,flexWrap:'wrap',marginTop:22},
 primary:{height:44,paddingHorizontal:17,borderRadius:23,backgroundColor:'#c8f26c',flexDirection:'row',alignItems:'center',gap:16},
 primaryText:{fontSize:12,fontWeight:'800',color:'#183c32'},primaryArrow:{fontSize:18,color:'#183c32'},pressed:{opacity:.75,transform:[{scale:.98}]},actionHint:{fontSize:11,fontWeight:'700',color:'rgba(255,255,255,.75)'},
 rail:{flexDirection:'row',gap:10},railCompact:{flexDirection:'column'},railItem:{flex:1,minHeight:86,paddingHorizontal:15,paddingVertical:14,borderRadius:18,backgroundColor:'#fff',borderWidth:1,borderColor:'#e1e8de',flexDirection:'row',alignItems:'flex-start',gap:10,boxShadow:'0 6px 18px rgba(24,60,50,.07)'},railNumber:{fontSize:10,fontWeight:'800',letterSpacing:1,color:'#90a96f',paddingTop:2},railCopy:{flex:1,gap:3},railTitle:{fontSize:14,fontWeight:'800',color:'#183c32'},railBody:{fontSize:11,lineHeight:16,color:'#708078'},railArrow:{fontSize:17,color:'#276447',paddingTop:1}
});
