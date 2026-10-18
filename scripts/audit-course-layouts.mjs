import fs from 'node:fs';
import {courses} from '../src/data/courses.ts';
import {yardage} from '../src/lib/hole-map.ts';
const aliases={'cedar-hill':'cedar'};
const rows=courses.map(c=>{
 const file=`src/data/${aliases[c.id]||c.id}-holes.json`;
 if(!fs.existsSync(file))return `| ${c.name} | Missing | Hole mapping required |`;
 const holes=JSON.parse(fs.readFileSync(file));
 const problems=[];
 if(holes.length!==c.holes)problems.push('Hole count mismatch');
 holes.forEach((h,i)=>{if(h.number!==i+1)problems.push(`Hole ${i+1}: numbering`);if(h.path.length<2||h.path.some(p=>!Number.isFinite(p.latitude)||!Number.isFinite(p.longitude)))problems.push(`Hole ${i+1}: coordinates`);else{const d=yardage(h.path[0],h.path.at(-1));if(d<40||d>850)problems.push(`Hole ${i+1}: check ${d} yd`);}});
 return `| ${c.name} | ${holes.length} holes | ${problems.join('; ')||'Geometry checks pass; physical tee accuracy requires review'} |`;
});
fs.writeFileSync('docs/COURSE-LAYOUT-AUDIT.md',`# Course layout audit\n\nGenerated from the bundled data. Geometry checks do not verify real tee positions, selected tee colours, routing, or map imagery. No coordinates are invented to make a check pass.\n\n| Course | Layout | Review status |\n|---|---|---|\n${rows.join('\n')}\n`);
console.log(rows.join('\n'));
