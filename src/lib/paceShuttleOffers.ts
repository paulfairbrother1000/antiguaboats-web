import type { TripOffer } from '@/lib/specialOffers';
import {mapPaceOffers} from '@/lib/paceOfferMapping';
const endpoint='https://prvzgvkuefcflvmepuhd.supabase.co/functions/v1/partner-special-offers';
export async function paceShuttleOffers():Promise<TripOffer[]>{
 const key=process.env.PACE_OPERATOR_KEY;
 if(!key)throw new Error('Pace partner connection unavailable');
 const res=await fetch(endpoint,{headers:{'x-pace-api-key':key},cache:'no-store',signal:AbortSignal.timeout(12000)});
 if(!res.ok)throw new Error('Pace shuttle inventory unavailable');
 const data=await res.json();
 return mapPaceOffers(data.offers??[]);
}
export async function paceDiscountCheckout(input:{departure_id:string;seats:number;price_cents:number}){
 const key=process.env.PACE_OPERATOR_KEY;if(!key)throw new Error('Pace partner connection unavailable');
 const res=await fetch(endpoint,{method:'POST',headers:{'x-pace-api-key':key,'content-type':'application/json'},body:JSON.stringify(input),cache:'no-store',signal:AbortSignal.timeout(15000)});
 const data=await res.json();if(!res.ok)throw new Error(data.error??'Unable to prepare journey booking');
 const url=new URL(data.checkout_url);
 if(url.protocol!=='https:'||!['paceshuttles.com','www.paceshuttles.com'].includes(url.hostname)||url.pathname!=='/checkout')throw new Error('Invalid booking link');
 return url.toString();
}
