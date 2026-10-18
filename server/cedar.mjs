export function parseCedar(payload,date,now=new Date()){
 const rows=Array.isArray(payload)?payload:payload.data;
 if(!Array.isArray(rows))throw new Error('Invalid Tee-On response');
 const slots=[];
 for(const row of rows){
  if(row.date!==date||!/^\d{2}:\d{2}$/.test(row.start_time)||!Number.isInteger(row.quantity_remaining))throw new Error('Invalid tee time');
  if(row.blocked_type!=='open'||row.bookings_prevent_guests)continue;
  const [hour,minute]=row.start_time.split(':').map(Number);
  if(hour>23||minute>59)throw new Error('Invalid tee time clock');
  for(const holes of [18,9]){
   if(!row.divisions_available?.includes(holes===18?2:1))continue;
   if(holes===18&&!row.turn_tee_time)continue;
   const spaces=holes===18?Math.min(row.quantity_remaining,row.turn_tee_time.quantity_remaining):row.quantity_remaining;
   if(!Number.isInteger(spaces)||spaces<1||spaces>4)continue;
   slots.push({id:String(row.id),date,time:`${hour%12||12}:${String(minute).padStart(2,'0')} ${hour>=12?'PM':'AM'}`,minuteOfDay:hour*60+minute,price:null,players:Array.from({length:spaces},(_,i)=>i+1),holes});
  }
 }
 return {date,checkedAt:now.toISOString(),slots};
}
export async function fetchCedar(date){
 const query=new URLSearchParams({facility_id:'503',date,extended:'true',turn_tee_time:'true'});
 // Non-secret guest identifier shipped in Tee-On's public portal JavaScript.
 const response=await fetch(`https://admin.teeon.com/api/2024-04/guest/tee-time?${query}`,{headers:{'Api-Key':'12345'},signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error('Tee-On request failed');
 return parseCedar(await response.json(),date);
}
