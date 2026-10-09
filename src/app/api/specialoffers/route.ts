import {NextResponse} from 'next/server';
import {charterOffers} from '@/lib/specialOffers';
import {paceShuttleOffers} from '@/lib/paceShuttleOffers';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 try{
  const all=(await Promise.all([charterOffers(),paceShuttleOffers()])).flat(),only=new URL(req.url).searchParams.get('discounted')!=='false';
  const offers=all.filter(o=>!only||o.discounted).map(o=>({...o,
   promotion_text:o.kind==='shuttle'&&o.discounted?`${o.discount_percent}% off ${o.title}. ${o.available} discounted seats available at $${(o.price_cents/100).toFixed(2)} each. ${o.description} Book now: ${o.booking_url}`:o.discounted?`${o.discount_percent}% off ${o.title} in Antigua on ${new Date(o.start_at).toLocaleDateString('en-GB',{timeZone:'America/Antigua',day:'numeric',month:'long'})}. 7 hour charter on ${o.vehicle_name}, ${o.vehicle_model}. $${(o.price_cents/100).toFixed(2)} per seat. Only ${o.available} seats left! Book now: ${o.booking_url}`:undefined}));
  return NextResponse.json({generated_at:new Date().toISOString(),currency:'USD',offers},{headers:{'Cache-Control':'no-store','Access-Control-Allow-Origin':'*'}});
 }catch{return NextResponse.json({error:'Live offers are temporarily unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
