import {authClient} from '../auth/client';
const cache=new Map<string,{url:string;expires:number}>();
const pending=new Map<string,Promise<string|null>>();
export function cachedAvatar(path:unknown):string|null{
 if(typeof path!=='string')return null;
 const entry=cache.get(path);return entry&&entry.expires>Date.now()?entry.url:null;
}
export function invalidateAvatar(path:string){cache.delete(path);pending.delete(path);}
export function avatarUrl(path:string):Promise<string|null>{
 const cached=cachedAvatar(path);if(cached)return Promise.resolve(cached);
 const loading=pending.get(path);if(loading)return loading;
 const request=(async()=>{if(!authClient)return null;const {data,error}=await authClient.storage.from('avatars').createSignedUrl(path,3600);if(error)throw error;if(data){cache.set(path,{url:data.signedUrl,expires:Date.now()+3300000});return data.signedUrl;}return null;})().finally(()=>pending.delete(path));
 pending.set(path,request);return request;
}
