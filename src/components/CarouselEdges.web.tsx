/** A masked backdrop blur softens only content crossing the carousel boundary. */
export function CarouselEdges(){
 return <>{(['left','right'] as const).map(side=><div key={side} aria-hidden style={{position:'absolute',top:0,bottom:0,[side]:0,width:24,pointerEvents:'none',backdropFilter:'blur(3px)',WebkitBackdropFilter:'blur(3px)',background:'rgba(255,255,255,.85)',maskImage:`linear-gradient(to ${side==='left'?'right':'left'}, black, transparent)`,WebkitMaskImage:`linear-gradient(to ${side==='left'?'right':'left'}, black, transparent)`}}/>)}</>;
}
