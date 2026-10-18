export type Round={id:string;courseId:string;date:string;names:string[];scores:(number|null)[][];finished:boolean;playerIds?:(string|null)[];teeId?:string;teeName?:string};
export function scoreTotal(scores:(number|null)[]){return {total:scores.reduce<number>((n,v)=>n+(v??0),0),played:scores.filter(v=>v!==null).length};}
export function validRounds(value:unknown):value is Round[]{return Array.isArray(value)&&value.every(r=>r&&typeof r.id==='string'&&typeof r.courseId==='string'&&typeof r.date==='string'&&typeof r.finished==='boolean'&&(r.teeId===undefined||typeof r.teeId==='string')&&(r.teeName===undefined||(typeof r.teeName==='string'&&r.teeName.length<=40))&&Array.isArray(r.names)&&r.names.length>=1&&r.names.length<=4&&r.names.every((n:unknown)=>typeof n==='string')&&(r.playerIds===undefined||(Array.isArray(r.playerIds)&&r.playerIds.length===r.names.length&&r.playerIds.every((id:unknown)=>id===null||(typeof id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)))&&new Set(r.playerIds.filter(Boolean)).size===r.playerIds.filter(Boolean).length))&&Array.isArray(r.scores)&&r.scores.length===r.names.length&&r.scores.every((s:unknown)=>Array.isArray(s)&&[9,18].includes(s.length)&&s.length===r.scores[0].length&&s.every(v=>v===null||(Number.isInteger(v)&&v>=1&&v<=30))));}

export function isCompletedRound(round:Round){return round.finished&&validRounds([round])&&round.scores.every(card=>card.every(score=>score!==null));}

/** Ending an incomplete round discards it; only complete scorecards enter history. */
export function endRound(rounds:Round[],id:string):Round[]{
 return rounds.flatMap(round=>{
  if(round.id!==id)return [round];
  const finished={...round,finished:true};
  return isCompletedRound(finished)?[finished]:[];
 });
}

export function roundInvitations(round:Round,ownerId:string){
 if(!isCompletedRound(round))return [];
 return (round.playerIds||[]).flatMap((recipient,player_index)=>recipient&&recipient!==ownerId&&player_index>0?[{owner_id:ownerId,round_id:round.id,recipient,player_index}]:[]);
}
