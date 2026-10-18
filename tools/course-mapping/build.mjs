import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const draft=JSON.parse(readFileSync(new URL('./mount-douglas.json',import.meta.url)));
const {width,height,extent}=draft.image;
function coordinate([x,y]){
 if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>width||y<0||y>height)throw Error('Pixel outside source image');
 return {latitude:Number((extent.ymax-y/height*(extent.ymax-extent.ymin)).toFixed(7)),longitude:Number((extent.xmin+x/width*(extent.xmax-extent.xmin)).toFixed(7))};
}
if(draft.holes.length!==9||new Set(draft.holes.map(h=>h.number)).size!==9)throw Error('Expected nine unique holes');
const holes=draft.holes.map(h=>({number:h.number,par:h.par,path:h.pixels.map(coordinate),sourceUrl:draft.image.sourceUrl,sourceLabel:'Saanich aerial · Mt Doug routing · Pilot',pilot:true,scorecardYards:h.yards}));
writeFileSync(fileURLToPath(new URL('../../src/data/mount-douglas-holes.json',import.meta.url)),JSON.stringify(holes,null,2)+'\n');
console.log('Generated nine pilot hole paths; field verification remains required.');
