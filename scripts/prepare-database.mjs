// Assemble the existing migrations for a NEW Supabase project. Never applies SQL remotely.
import {readdir,readFile,writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const directory=new URL('supabase/migrations/',root);
const files=(await readdir(directory)).filter(name=>/^\d+_.*\.sql$/.test(name)).sort();
if(!files.length)throw new Error('No database migrations found');
const sections=await Promise.all(files.map(async name=>{
 const sql=(await readFile(new URL(name,directory),'utf8')).replace(/^\s*(?:begin|commit);\s*$/gmi,'');
 return `-- Migration: ${name}\n${sql}`;
}));
await mkdir(new URL('supabase/generated/',root),{recursive:true});
const output=new URL('supabase/generated/new-project-setup.sql',root);
await writeFile(output,`-- Fairway: NEW Supabase project only. Existing projects must apply only pending migrations.\n-- Run in the Supabase SQL editor. Failure rolls back the entire setup.\nbegin;\n\n${sections.join('\n\n')}\n\ncommit;\n`);
console.log(`Prepared ${files.length} migrations: ${output.pathname}`);
console.log('No database connection was made. Configure Auth email templates and public app settings separately.');
