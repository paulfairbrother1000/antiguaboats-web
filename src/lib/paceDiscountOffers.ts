import type { TripOffer } from '@/lib/specialOffers';
const endpoint='https://prvzgvkuefcflvmepuhd.supabase.co/functions/v1/partner-special-offers';
export async function paceDiscountOffers():Promise<TripOffer[]>{
 const key=process.env.PACE_OPERATOR_KEY;
 if(!key)throw new Error('Pace partner connection unavailable');
 const res=await fetch(endpoint,{headers:{'x-pace-api-key':key},cache:'no-store',signal:AbortSignal.timeout(12000)});
 if(!res.ok)throw new Error('Pace discounted inventory unavailable');
 const data=await res.json();
 return (data.offers??[]).filter((o:{discounted:boolean;available:number;start_at:string})=>{
  const hours=(Date.parse(o.start_at)-Date.now())/3600000;return o.discounted&&o.available>0&&hours<=72&&hours>24;
 }).map((o:{id:string;title:string;start_at:string;pickup:string;destination:string;duration_mins:number;available:number;
  price_cents:number;discount_percent:number;expires_at:string;vehicle_name:string;max_party_size:number})=>({
   id:o.id,kind:'shuttle',title:o.title,start_at:o.start_at,
   description:`Shuttle journey from ${o.pickup} to ${o.destination}. Departs ${new Date(o.start_at).toLocaleTimeString('en-GB',{timeZone:'America/Antigua',hour:'2-digit',minute:'2-digit'})} Antigua time; approximately ${o.duration_mins} minutes.`,
   available:o.available,max_party_size:o.max_party_size,unit_label:'discounted seat',price_cents:o.price_cents,base_price_cents:0,
   discount_percent:o.discount_percent,discounted:true,expires_at:o.expires_at,vehicle_name:o.vehicle_name,
   booking_url:`https://www.antigua-boats.com/booking/shuttle?departure=${o.id}`,product_url:'https://www.antigua-boats.com/charters/restaurant-shuttle',
 }));
}
export async function paceDiscountCheckout(input:{departure_id:string;seats:number;price_cents:number}){
 const key=process.env.PACE_OPERATOR_KEY;if(!key)throw new Error('Pace partner connection unavailable');
 const res=await fetch(endpoint,{method:'POST',headers:{'x-pace-api-key':key,'content-type':'application/json'},body:JSON.stringify(input),cache:'no-store',signal:AbortSignal.timeout(15000)});
 const data=await res.json();if(!res.ok)throw new Error(data.error??'Unable to prepare journey booking');
 const url=new URL(data.checkout_url);
 if(url.protocol!=='https:'||!['paceshuttles.com','www.paceshuttles.com'].includes(url.hostname)||url.pathname!=='/checkout')throw new Error('Invalid booking link');
 return url.toString();
}
