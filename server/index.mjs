import { cedarBookingDates } from './booking-window.mjs';
import { createMarketSnapshot } from './market-snapshot.mjs';
import { readFile,readdir } from 'node:fs/promises';
import express from 'express';
import { fetchCedar } from './cedar.mjs';
import { localDate } from './olympic.mjs';
import { fileURLToPath } from 'node:url';
import { fetchAvailability } from './olympic.mjs';
const app=express();
app.disable('x-powered-by');
app.get('/api/health',(_req,res)=>res.set('Cache-Control','no-store').json({status:'ok',service:'fairway-api'}));
const cache=new Map(),pending=new Map();
const snapshot=createMarketSnapshot();
// Warm all provider adapters before the first mobile request. Without this,
// a cold server could return an empty snapshot and make the app display an
// empty state until its next polling interval.
const initialSnapshot= snapshot.refresh();
setInterval(()=>void snapshot.refresh(),30000).unref();
app.get('/api/availability-snapshot',async(_req,res)=>{await initialSnapshot;res.set('Cache-Control','no-store');res.json(snapshot.read());});
app.get('/',async(_req,res)=>{
 try{
  const html=await readFile(fileURLToPath(new URL('../dist/index.html',import.meta.url)),'utf8');
  const photoFiles=await readdir(fileURLToPath(new URL('../dist/assets/assets/course-photos/',import.meta.url))).catch(()=>[]);
  const photoPreloads=photoFiles.filter(name=>/^[a-z-]+\.[a-f0-9]+\.jpg$/.test(name)).map(name=>`<link rel="preload" as="image" href="/assets/assets/course-photos/${name}">`).join('');
  const payload=JSON.stringify(snapshot.read()).replaceAll('<','\\u003c');
  res.set('Cache-Control','no-store').send(html.replace('<head>',`<head>${photoPreloads}<script id="fairway-availability" type="application/json">${payload}</script>`));
 }catch{res.status(503).send('Fairway is unavailable. Please retry shortly.');}
});
app.get('/api/availability/:course',async(req,res)=>{
 res.set('Cache-Control','no-store');
 const date=String(req.query.date||localDate()),course=req.params.course;
 if(!['cedar-hill','olympic-view'].includes(course))return res.status(404).json({error:'Course not connected'});
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||(course==='cedar-hill'&&!cedarBookingDates().includes(date)))return res.status(400).json({error:'Choose a date within the course booking window.'});
 const key=course+date;
 try{
  let entry=cache.get(key);
  if(!entry||Date.now()-Date.parse(entry.checkedAt)>60000){
   if(!pending.has(key))pending.set(key,(course==='cedar-hill'?fetchCedar(date):fetchAvailability(date)).then(data=>{cache.set(key,data);return data;}).finally(()=>pending.delete(key)));
   entry=await pending.get(key);
   if(cache.size>20)cache.delete(cache.keys().next().value);
  }
  res.json(entry);
 }catch{res.status(502).json({error:'Could not retrieve live availability. Please refresh shortly.'});}
});
// Metro fingerprints exported assets, so browsers can safely retain these files.
app.use('/assets',express.static(fileURLToPath(new URL('../dist/assets/',import.meta.url)),{maxAge:'1y',immutable:true}));
app.use(express.static(fileURLToPath(new URL('../dist/',import.meta.url))));
app.get(['/course','/play','/games','/account','/privacy','/support','/delete-account','/explore','/web-preview'],(req,res)=>res.sendFile(fileURLToPath(new URL('../dist/index.html',import.meta.url))));
app.listen(Number(process.env.PORT||8787),process.env.HOST||'127.0.0.1',()=>console.log(`Fairway live preview: http://127.0.0.1:${process.env.PORT||8787}`));
