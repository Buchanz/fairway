export type HoleCamera={center:{latitude:number;longitude:number};heading:number;pitch:number;zoom:number;altitude:number};
/** Smooth start/stop, with the shortest turn across north instead of a full spin. */
export function interpolateCamera(from:HoleCamera,to:HoleCamera,progress:number):HoleCamera{
 const t=Math.max(0,Math.min(1,progress));
 if(t===1)return to;
 const eased=t*t*(3-2*t),mix=(a:number,b:number)=>a+(b-a)*eased;
 const turn=((to.heading-from.heading+540)%360)-180;
 return {center:{latitude:mix(from.center.latitude,to.center.latitude),longitude:mix(from.center.longitude,to.center.longitude)},heading:(from.heading+turn*eased+360)%360,pitch:mix(from.pitch,to.pitch),zoom:mix(from.zoom,to.zoom),altitude:mix(from.altitude,to.altitude)};
}
