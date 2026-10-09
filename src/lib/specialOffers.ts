import { sbServer } from '@/lib/supabaseServer';
import { seatInventory } from '@/lib/perSeatServer';
export type TripOffer={id:string;kind:'shared'|'per-seat'|'shuttle';title:string;start_at:string;description:string;
 available:number;unit_label:string;price_cents:number;base_price_cents:number;discount_percent:number;discounted:boolean;
 booking_url:string;product_url:string;expires_at:string;vehicle_name?:string;vehicle_model?:string;return_at?:string;max_party_size?:number;};
export async function charterOffers():Promise<TripOffer[]>{
 const from=new Date(Date.now()-4*3600000).toISOString().slice(0,10),to=new Date(Date.now()+365*86400000).toISOString().slice(0,10);
 const seats=await seatInventory(from,to);
 const offers:TripOffer[]=seats.filter(t=>t.id&&t.sold_seats>0&&t.bookable).map(t=>({id:t.id!,kind:'per-seat',title:'Full Day Charter – Pay per seat',start_at:t.start_at,
 description:'Jolly Harbour pickup. 7 hour charter, swimming, snorkelling with a restaurant stop.',available:t.remaining_seats,
 unit_label:'seat',price_cents:t.unit_price_cents,base_price_cents:t.base_price_cents,discount_percent:t.discount_percent,discounted:t.discounted,
 booking_url:`https://www.antigua-boats.com/booking/per-seat?date=${t.date}`,product_url:'https://www.antigua-boats.com/charters/full-day-pay-per-seat',
 expires_at:new Date(Date.parse(t.start_at)-24*3600000).toISOString(),vehicle_name:t.vehicle_name,vehicle_model:t.vehicle_model}));
 const db=sbServer();
 const {data:rows,error}=await db.from('bookings').select('start_at,status,hold_expires_at,charter_types!inner(slug)')
 .eq('charter_types.slug','full-day-shared').gt('start_at',new Date(Date.now()+24*3600000).toISOString()).neq('status','CANCELLED');
 if(error)throw error;
 const {data:ct,error:ce}=await db.from('charter_types').select('base_price_cents').eq('slug','full-day-shared').eq('active',true).single();
 if(ce)throw ce;
 const days=new Map<string,{start:string;count:number}>();
 for(const b of rows??[]){if(b.status==='HOLD'&&Date.parse(b.hold_expires_at??'')<=Date.now())continue;
  const date=new Date(Date.parse(b.start_at)-4*3600000).toISOString().slice(0,10),entry=days.get(date)??{start:b.start_at,count:0};entry.count++;days.set(date,entry);}
 for(const [date,d]of days)if(d.count===1)offers.push({id:`shared-${date}`,kind:'shared',title:'Full Day Shared Charter',start_at:d.start,
 description:'Jolly Harbour pickup. 7 hour charter, swimming, snorkelling with a restaurant stop.',available:1,unit_label:'booking of up to 4 seats',
 price_cents:ct.base_price_cents,base_price_cents:ct.base_price_cents,discount_percent:0,discounted:false,
 booking_url:`https://www.antigua-boats.com/booking?date=${date}&charter=full-day-shared`,product_url:'https://www.antigua-boats.com/charters/full-day-shared',
 expires_at:new Date(Date.parse(d.start)-24*3600000).toISOString()});
 return offers.sort((a,b)=>Date.parse(a.start_at)-Date.parse(b.start_at));
}
