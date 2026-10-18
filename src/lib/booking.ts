// Tee-On's public portal login preserves these parameters through authentication.
export function bookingLink(course:{id:string;bookingUrl:string},slot:{id:string;date:string}){
 if(course.id==='cedar-hill'&&/^\d+$/.test(slot.id)){
  const query=new URLSearchParams({id:slot.id,date:slot.date,facility:'cedarhill'});
  return `https://admin.teeon.com/portal/lakeland/login?${query}`;
 }
 return course.bookingUrl;
}
