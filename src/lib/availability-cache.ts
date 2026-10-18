import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAvailabilityCache} from './availability-cache-core';
const cache=createAvailabilityCache(AsyncStorage);
export const readAvailabilityCache=cache.read;
// Hydrate once at module load, before the home screen mounts. Concurrent callers
// share the same read; a returning screen uses the synchronous memory cache.
const restored=cache.restore();
export const restoreAvailabilityCache=()=>restored.then(()=>cache.read());
export const saveAvailabilityCache=cache.save;
