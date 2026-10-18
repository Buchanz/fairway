import {royalwoodConfig,langleyConfig,ardmoreConfig,openTeeOnSearch,createTeeOnSnapshot} from './teeon.mjs';
import {createSnapshot} from './snapshot.mjs';
import {createOlympicSnapshot} from './olympic.mjs';
import {createMountDouglasSnapshot} from './mount-douglas.mjs';
// Each provider owns its window, freshness and refresh schedule.
export function createMarketSnapshot(cedar=createSnapshot(),olympic=createOlympicSnapshot(),mountDouglas=createMountDouglasSnapshot(),ardmore=createTeeOnSnapshot(()=>openTeeOnSearch(ardmoreConfig)),additional={'royalwood':createTeeOnSnapshot(()=>openTeeOnSearch(royalwoodConfig)),'langley-golf-centre':createTeeOnSnapshot(()=>openTeeOnSearch(langleyConfig))}){
 return {
  read(){const days=cedar.read().days;return {days,courses:{'cedar-hill':days,'olympic-view':olympic.read(),'mount-douglas':mountDouglas.read(),'ardmore':ardmore.read(),...Object.fromEntries(Object.entries(additional).map(([id,provider])=>[id,provider.read()]))}};},
  async refresh(){await Promise.allSettled([cedar.refresh(),olympic.refresh(),mountDouglas.refresh(),ardmore.refresh(),...Object.values(additional).map(provider=>provider.refresh())]);}
 };
}
