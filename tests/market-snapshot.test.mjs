import test from 'node:test';
import assert from 'node:assert/strict';
import {createMarketSnapshot} from '../server/market-snapshot.mjs';
test('provider failures do not prevent other courses or future dates being published',async()=>{
 const days={'2026-10-03':{date:'2026-10-03',slots:[]}},future={'2026-12-01':{date:'2026-12-01',slots:[]}};
 let mounted=false;
 const market=createMarketSnapshot({read:()=>({days}),refresh:async()=>{}},{read:()=>future,refresh:async()=>{throw Error();}},{read:()=>days,refresh:async()=>{mounted=true;}},{read:()=>days,refresh:async()=>{}},{});
 await market.refresh();assert.equal(mounted,true);assert.deepEqual(market.read().courses,{'cedar-hill':days,'olympic-view':future,'mount-douglas':days,'ardmore':days});
});
