import {decodeInventory,type Inventory} from './search.ts';
import {isFresh} from './availability.ts';
export function createAvailabilityCache(storage:{getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<unknown>},now:()=>number=Date.now){
const key='fairway-public-availability-v1';
let memory:Inventory={};
let revision=0;
function fresh(inventory:Inventory):Inventory{
 const at=now();
 return Object.fromEntries(Object.entries(inventory).map(([id,days])=>[id,Object.fromEntries(Object.entries(days).filter(([,result])=>isFresh(result,at)))]).filter(([,days])=>Object.keys(days).length));
}
function readAvailabilityCache(){return fresh(memory);}
async function restoreAvailabilityCache(){
 const started=revision;
 try{const raw=await storage.getItem(key);if(raw&&revision===started)memory=fresh(decodeInventory(JSON.parse(raw)));}catch{/* A corrupt cache must never prevent live availability. */}
 return readAvailabilityCache();
}
function saveAvailabilityCache(inventory:Inventory){
 revision++;memory=inventory;
 void storage.setItem(key,JSON.stringify({courses:fresh(inventory)})).catch(()=>{});
}

return {read:readAvailabilityCache,restore:restoreAvailabilityCache,save:saveAvailabilityCache};
}
