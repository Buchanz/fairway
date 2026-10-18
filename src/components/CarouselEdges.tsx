import {View} from 'react-native';
/** Native edge fade keeps partially clipped cards soft without intercepting swipes. */
export function CarouselEdges(){
 return <>{(['left','right'] as const).map(side=><View key={side} pointerEvents="none" style={{position:'absolute',top:0,bottom:0,[side]:0,width:24,flexDirection:side==='left'?'row':'row-reverse'}}>{Array.from({length:24},(_,i)=>Math.pow(1-i/23,2)).map((opacity,index)=><View key={index} style={{width:1,backgroundColor:'#fff',opacity}}/>)}</View>)}</>;
}
