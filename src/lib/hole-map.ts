import type {Point} from '../data/courses';
import {distanceKm} from './geo.ts';
export type MappedHole={number:number;par:number|null;path:Point[];teePositions?:Record<string,Point>;osmWayId?:string;sourceUrl?:string;sourceLabel?:string;pilot?:boolean;scorecardYards?:number;greenBoundary?:Point[];greenOsmWayId?:string};
const rad=(n:number)=>n*Math.PI/180;
export function bearing(a:Point,b:Point){
 const delta=rad(b.longitude-a.longitude);
 return (Math.atan2(Math.sin(delta)*Math.cos(rad(b.latitude)),Math.cos(rad(a.latitude))*Math.sin(rad(b.latitude))-Math.sin(rad(a.latitude))*Math.cos(rad(b.latitude))*Math.cos(delta))*180/Math.PI+360)%360;
}
export function yardage(a:Point,b:Point){return Math.round(distanceKm(a,b)*1093.6133);}
// Rotate path into the tee-to-green frame so doglegs also fit the viewport.
export function holeCamera(hole:MappedHole,width:number,height:number){
 const tee=hole.path[0],green=hole.path[hole.path.length-1];
 const heading=bearing(tee,green),theta=rad(heading);
 const points=hole.path.map(p=>{const east=rad(p.longitude-tee.longitude)*6371008.8*Math.cos(rad(tee.latitude));const north=rad(p.latitude-tee.latitude)*6371008.8;return {x:east*Math.cos(theta)-north*Math.sin(theta),y:east*Math.sin(theta)+north*Math.cos(theta)};});
 const minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x)),minY=Math.min(...points.map(p=>p.y)),maxY=Math.max(...points.map(p=>p.y));
 const x=(minX+maxX)/2,y=(minY+maxY)/2;
 const east=x*Math.cos(theta)+y*Math.sin(theta),north=-x*Math.sin(theta)+y*Math.cos(theta);
 const center={latitude:tee.latitude+north/6371008.8*180/Math.PI,longitude:tee.longitude+east/(6371008.8*Math.cos(rad(tee.latitude)))*180/Math.PI};
 const metersPerPixel=1.25*Math.max((maxX-minX+120)/Math.max(width,120),(maxY-minY+150)/Math.max(height,180));
 return {center,heading,pitch:0,zoom:Math.min(20,Math.max(14,Math.log2(156543.03392*Math.cos(rad(center.latitude))/metersPerPixel))),altitude:metersPerPixel*Math.max(height,180)*1.6};
}

// A planning target halfway along the mapped playing line, including doglegs.
// This is not a hazard-aware or player-specific shot recommendation.
export function suggestedTarget(hole:MappedHole):Point|null{
 if(hole.path.length<2)return null;
 const lengths=hole.path.slice(1).map((p,i)=>distanceKm(hole.path[i],p));
 const total=lengths.reduce((sum,n)=>sum+n,0);
 if(total<=0)return null;
 let remaining=total/2;
 for(let i=0;i<lengths.length;i++){
  const length=lengths[i];
  if(length===0)continue;
  if(remaining<=length){const a=hole.path[i],b=hole.path[i+1],fraction=remaining/length;return {latitude:a.latitude+(b.latitude-a.latitude)*fraction,longitude:a.longitude+(b.longitude-a.longitude)*fraction};}
  remaining-=length;
 }
 return null;
}

// Intersect the origin-to-centre line with mapped green edges; no assumed green size.
export function greenDistances(origin:Point,center:Point,boundary?:Point[]){
 const centre=yardage(origin,center);
 if(!boundary||boundary.length<4)return {center:centre,front:null,back:null};
 const dx=center.longitude-origin.longitude,dy=center.latitude-origin.latitude;
 if(Math.abs(dx)+Math.abs(dy)<1e-12)return {center:0,front:0,back:null};
 const hits:number[]=[];
 for(let i=0;i<boundary.length-1;i++){
  const a=boundary[i],b=boundary[i+1],ex=b.longitude-a.longitude,ey=b.latitude-a.latitude;
  const ax=a.longitude-origin.longitude,ay=a.latitude-origin.latitude;
  const cross=dx*ey-dy*ex;if(Math.abs(cross)<1e-16)continue;
  const t=(ax*ey-ay*ex)/cross,u=(ax*dy-ay*dx)/cross;
  if(t>=0&&u>=0&&u<=1)hits.push(t);
 }
 if(hits.length<2)return {center:centre,front:null,back:null};
 const distance=(t:number)=>yardage(origin,{latitude:origin.latitude+dy*t,longitude:origin.longitude+dx*t});
 return {center:centre,front:distance(Math.min(...hits)),back:distance(Math.max(...hits))};
}

/** Use a reviewed tee coordinate when available; never infer a colour from distance. */
export function holeForTee(hole:MappedHole|undefined,teeId?:string):MappedHole|undefined{
 const tee=teeId&&hole?.teePositions?.[teeId];
 return hole&&tee?{...hole,path:[tee,...hole.path.slice(1)]}:hole;
}
