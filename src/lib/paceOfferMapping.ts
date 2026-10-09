import type {TripOffer} from './specialOffers';
export type PaceOffer={id:string;title:string;start_at:string;pickup:string;destination:string;duration_mins:number;available:number;
 price_cents:number;discount_percent:number;discounted:boolean;expires_at:string;vehicle_name:string;max_party_size:number;booked_seats:number};
export function mapPaceOffers(rows:PaceOffer[],now=Date.now()):TripOffer[]{
 return rows.filter(o=>{
  const hours=(Date.parse(o.start_at)-now)/3600000;
  return o.booked_seats>0&&o.available>0&&o.max_party_size>0&&hours>24&&(!o.discounted||(hours<=72&&o.discount_percent>0));
 }).map(o=>({id:o.id,kind:'shuttle',title:o.title,start_at:o.start_at,
  description:`Shuttle journey from ${o.pickup} to ${o.destination}. Departs ${new Date(o.start_at).toLocaleTimeString('en-GB',{timeZone:'America/Antigua',hour:'2-digit',minute:'2-digit'})} Antigua time; approximately ${o.duration_mins} minutes. ${o.booked_seats} ${o.booked_seats===1?'guest has':'guests have'} already booked.`,
  available:o.available,max_party_size:o.max_party_size,unit_label:o.discounted?'discounted seat':'seat',price_cents:o.price_cents,base_price_cents:0,
  discount_percent:o.discount_percent,discounted:o.discounted,expires_at:o.expires_at,vehicle_name:o.vehicle_name,
  booking_url:`https://www.antigua-boats.com/booking/shuttle?departure=${o.id}`,product_url:'https://www.antigua-boats.com/charters/restaurant-shuttle',
 }));
}
