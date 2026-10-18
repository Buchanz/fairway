import {roundChanges} from './round-changes';
import {authClient} from '../auth/client';
import {validRounds,isCompletedRound,roundInvitations,type Round} from './rounds';
const roundCache=new Map<string,Round[]>();
export function cachedCloudRounds(userId:string|null){return userId?roundCache.get(userId):undefined;}
const pendingReads=new Map<string,Promise<Round[]>>();
export function readCloudRounds(userId:string):Promise<Round[]>{
 const pending=pendingReads.get(userId);if(pending)return pending;
 const request=fetchCloudRounds(userId).finally(()=>pendingReads.delete(userId));
 pendingReads.set(userId,request);return request;
}
async function fetchCloudRounds(userId:string):Promise<Round[]>{
 if(!authClient)throw Error('Accounts are not configured yet.');
 const {data,error}=await authClient.from('rounds').select('data').eq('user_id',userId).order('updated_at',{ascending:false});
 if(error)throw Error('Could not load your saved rounds. Check your connection and retry.');
 const rounds=data.map(row=>row.data);
 if(!validRounds(rounds))throw Error('Saved rounds contain invalid data.');
 roundCache.set(userId,rounds);
 return rounds;
}
/** Save only changed rounds: an old device snapshot must not delete another device’s new games. */
export async function writeCloudChanges(userId:string,before:Round[],after:Round[]){
 if(!authClient||!validRounds(after))throw Error('Cannot save round data.');
 const {changed,removed}=roundChanges(before,after);
 if(changed.length){const {error}=await authClient.from('rounds').upsert(changed.map(r=>({user_id:userId,id:r.id,data:r})),{onConflict:'user_id,id'});if(error)throw Error('Cloud save failed. Check your connection and retry.');}
 for(const round of changed.filter(isCompletedRound)){
  const invitations=roundInvitations(round,userId);
  if(invitations.length){const {error}=await authClient.from('round_invitations').upsert(invitations,{onConflict:'owner_id,round_id,recipient',ignoreDuplicates:true});if(error)throw Error('Round saved, but friend invitations could not be sent. Please retry.');}
 }
 if(removed.length){const {error}=await authClient.from('rounds').delete().eq('user_id',userId).in('id',removed);if(error)throw Error('Could not delete this round from your account.');}
 roundCache.set(userId,after);
}
