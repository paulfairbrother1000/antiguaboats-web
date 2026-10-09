import { NextResponse } from 'next/server';
import { sbServer } from '@/lib/supabaseServer';
import { dateRange } from '@/lib/perSeatServer';
export async function createSeatBooking(body: Record<string, unknown>) {
 const seats=body.guests,price=body.unit_price_cents;
 if(!dateRange(body.date,body.date)||typeof seats!=='number'||!Number.isInteger(seats)||seats<1||seats>100||
 typeof price!=='number'||!Number.isInteger(price)||price<=0||body.surcharge_consent!==true||!body.pricing_settings||typeof body.pricing_settings!=='object'||
 typeof body.customer_name!=='string'||body.customer_name.trim().length<2||body.customer_name.length>160||
 typeof body.customer_email!=='string'||body.customer_email.length>160||!/^\S+@\S+\.\S+$/.test(body.customer_email)||
 typeof body.request_id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.request_id))
 return NextResponse.json({error:'Complete your booking details and accept the surcharge commitment'},{status:400});
 const {data,error}=await sbServer().rpc('ab_book_seats',{
  p_date:body.date,p_seats:seats,p_name:body.customer_name,p_email:body.customer_email,
  p_phone:String(body.customer_phone??'').slice(0,80),p_notes:String(body.notes??'').slice(0,2000),
  p_consent:true,p_expected_unit_price:price,p_request:body.request_id,p_expected_settings:body.pricing_settings,
 });
 if(error)return NextResponse.json({error:error.message},{status:409});
 return NextResponse.json(data);
}
