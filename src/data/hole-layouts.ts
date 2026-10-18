import ardmore from './ardmore-holes.json';
import langley from './langley-golf-centre-holes.json';
import duncan from './duncan-meadows-holes.json';
import layout0 from './highland-pacific-holes.json';
import layout1 from './cordova-bay-holes.json';
import layout2 from './bear-mountain-holes.json';
import layout3 from './bear-valley-holes.json';
import mountDouglas from './mount-douglas-holes.json';
import cedar from './cedar-holes.json';
import olympic from './olympic-view-holes.json';
import royalwood from './royalwood-holes.json';
import type {MappedHole} from '../lib/hole-map';
// Only complete numbered layouts are enabled. Missing pars are not guessed.
export const courseHoles:Record<string,MappedHole[]>={
 'ardmore':ardmore,
 'langley-golf-centre':langley,
 'duncan-meadows':duncan,
 'cedar-hill':cedar,
 'highland-pacific':layout0,
 'cordova-bay':layout1,
 'bear-mountain':layout2,
 'bear-valley':layout3,

 'mount-douglas':mountDouglas,
 'olympic-view':olympic,
 'royalwood':royalwood,
};

// Nine-hole courses reuse physical holes on a second circuit.
export function mappedRoundHole(courseId:string,roundHole:number){
 const layout=courseHoles[courseId];
 return layout?.find(h=>h.number===(layout.length===9?roundHole%9:roundHole)+1);
}
