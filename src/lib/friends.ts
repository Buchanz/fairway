import {authClient} from '../auth/client';
export type Friend={id:string;name:string;connectionId:string;incoming:boolean;accepted:boolean};
function client(){if(!authClient)throw Error('Connect the account database to use friends.');return authClient;}
export async function listFriends(userId:string):Promise<Friend[]>{
 const c=client(),{data,error}=await c.from('friendships').select('*');if(error)throw error;
 const ids=data.map(f=>f.sender===userId?f.recipient:f.sender);
 if(!ids.length)return [];
 const profiles=await c.from('player_profiles').select('user_id,username,display_name').in('user_id',ids);if(profiles.error)throw profiles.error;
 return data.map(f=>{const id=f.sender===userId?f.recipient:f.sender;return {id,name:profiles.data.find(p=>p.user_id===id)?.username||profiles.data.find(p=>p.user_id===id)?.display_name||'Golfer',connectionId:f.id,incoming:f.recipient===userId,accepted:f.status==='accepted'};});
}
export async function requestFriend(username:string){const {error}=await client().rpc('request_friend_by_username',{requested_username:username.trim().replace(/^@/,'').toLowerCase()});if(error)throw error;}
export async function acceptFriend(id:string){const {error}=await client().from('friendships').update({status:'accepted'}).eq('id',id);if(error)throw error;}
