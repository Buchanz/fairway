import type {Round} from './rounds.ts';
export function roundChanges(before:Round[],after:Round[]){
 const prior=new Map(before.map(r=>[r.id,JSON.stringify(r)]));
 const kept=new Set(after.map(r=>r.id));
 return {changed:after.filter(r=>prior.get(r.id)!==JSON.stringify(r)),removed:before.filter(r=>!kept.has(r.id)).map(r=>r.id)};
}
