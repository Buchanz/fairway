import type {Point} from '../data/courses';
export default function RangeMap({point}:{point:Point}){return <iframe title="Golf GPS rangefinder" allow="geolocation" src={`/rangefinder.html?lat=${point.latitude}&lng=${point.longitude}`} style={{width:'100%',height:530,border:0,borderRadius:16}}/>;}
