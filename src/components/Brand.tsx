import {useState} from 'react';
import {Text,View} from 'react-native';
export function Brand({small=false}:{small?:boolean}){
 const [width,setWidth]=useState(small?94:136);
 return <View style={{alignItems:'center',gap:5}}><Text onLayout={e=>setWidth(e.nativeEvent.layout.width)} style={{fontSize:small?25:36,fontWeight:'800',lineHeight:small?28:46,paddingHorizontal:4,paddingTop:2,letterSpacing:small?-1:-1.6,color:'#183C32',textAlign:'center'}}>fairway<Text style={{color:'#799544'}}>.</Text></Text><View accessibilityLabel="More golf. Less searching." style={{width,flexDirection:'row',justifyContent:'space-between'}}>{Array.from('More golf. Less searching.').map((c,i)=><Text key={i} style={{fontSize:small?6:9,color:'#708078'}}>{c===' '?'\u00a0':c}</Text>)}</View></View>;
}
