import {validRounds, type Round} from './rounds.ts';

export interface RoundStorage {
  getItem(key:string):Promise<string|null>;
  setItem(key:string,value:string):Promise<void>;
}
export const legacyRoundsKey='fairway-rounds-v1';
/** Account caches never share a key with guest rounds or another account. */
export function roundsKey(userId:string|null){
  return userId===null?legacyRoundsKey:`fairway-rounds-v2:user:${encodeURIComponent(userId)}`;
}
export async function loadRounds(storage:RoundStorage,userId:string|null):Promise<Round[]>{
  const raw=await storage.getItem(roundsKey(userId));
  if(raw===null)return [];
  const rounds:unknown=JSON.parse(raw);
  if(!validRounds(rounds))throw new Error('Saved rounds could not be opened.');
  return rounds;
}
export async function saveRounds(storage:RoundStorage,userId:string|null,rounds:Round[]){
  if(!validRounds(rounds))throw new Error('Invalid round data.');
  await storage.setItem(roundsKey(userId),JSON.stringify(rounds));
}

/** Durable outbox: a failed cloud request must never erase a scorecard on restart. */
export async function stageRoundChanges(storage:RoundStorage,userId:string,before:Round[],after:Round[]){
 if(!validRounds(before)||!validRounds(after))throw Error('Invalid pending scorecard');
 await storage.setItem(`${roundsKey(userId)}:pending`,JSON.stringify({before,after}));
}
export async function pendingRoundChanges(storage:RoundStorage,userId:string){
 const raw=await storage.getItem(`${roundsKey(userId)}:pending`);
 if(!raw)return null;
 const value=JSON.parse(raw);
 if(value===null)return null;
 if(!validRounds(value.before)||!validRounds(value.after))throw Error('Invalid pending scorecard');
 return value as {before:Round[];after:Round[]};
}
export async function clearPendingRoundChanges(storage:RoundStorage,userId:string,expected?:Round[]){
 if(expected){const pending=await pendingRoundChanges(storage,userId);if(pending&&JSON.stringify(pending.after)!==JSON.stringify(expected))return;}
 await storage.setItem(`${roundsKey(userId)}:pending`,'null');
}
