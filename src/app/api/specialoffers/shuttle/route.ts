import {NextResponse} from 'next/server';
import {paceDiscountCheckout,paceDiscountOffers} from '@/lib/paceDiscountOffers';
export const dynamic='force-dynamic';
export async function GET(){try{return NextResponse.json({offers:await paceDiscountOffers()},{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:'Shuttle offers are temporarily unavailable'},{status:503});}}
export async function POST(req:Request){
 const b=await req.json().catch(()=>null);
 if(!b||typeof b.departure_id!=='string'||!Number.isInteger(b.seats)||b.seats<1||b.seats>50||!Number.isInteger(b.price_cents)||b.price_cents<1)
  return NextResponse.json({error:'Invalid booking details'},{status:400});
 try{return NextResponse.json({checkout_url:await paceDiscountCheckout(b)});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Unable to prepare booking'},{status:409});}
}
