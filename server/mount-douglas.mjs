import {mountDouglasConfig,teeOnDates,parseTeeOn,openTeeOnSearch,createTeeOnSnapshot} from './teeon.mjs';
export const mountDouglasUrl=mountDouglasConfig.url;
export const mountDouglasDates=teeOnDates;
export const parseMountDouglas=(html,date,now)=>parseTeeOn(html,date,now,mountDouglasConfig);
export const openMountDouglasSearch=()=>openTeeOnSearch(mountDouglasConfig);
export const createMountDouglasSnapshot=(openSearch=openMountDouglasSearch,now)=>createTeeOnSnapshot(openSearch,now);
