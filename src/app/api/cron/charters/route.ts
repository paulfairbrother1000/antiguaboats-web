import { NextResponse } from 'next/server';
import { sbServer } from '@/lib/supabaseServer';
import { seatEmailText } from '@/lib/seatEmail';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function GET(req:Request){
 const secret=process.env.CRON_SECRET;
 if(!secret||req.headers.get('authorization')!==`Bearer ${secret}`)return NextResponse.json({error:'Unauthorized'},{status:401});
 const db=sbServer();
 const {data:decisions,error:de}=await db.rpc('ab_process_seat_decisions');
 if(de)return NextResponse.json({error:'Charter decisions failed'},{status:500});
 if(!process.env.RESEND_API_KEY || !process.env.CHARTER_EMAIL_FROM)
  return NextResponse.json({decisions,email_delivery:'awaiting_configuration'},{status:503});
 const {data:rows,error:qe}=await db.rpc('ab_claim_charter_emails');
 if(qe)return NextResponse.json({error:'Unable to claim emails'},{status:500});
 let sent=0,failed=0;
 for(const row of rows??[]){
  try{
   // Recheck queued confirmations after cancellations; never send stale confirmed state.
   let payload=row.payload;
   if(payload.booking_id){
    const {data:current,error:readError}=await db.from('bookings').select('status,seat_surcharge_cents,refund_amount_cents,seat_trips(status)').eq('id',payload.booking_id).single();
    if(readError)throw readError;
    const tripStatus=Array.isArray(current.seat_trips)?current.seat_trips[0]?.status:(current.seat_trips as {status?:string}|null)?.status;
    payload={...payload,trip_status:tripStatus};
    if(current.status==='CANCELLED')payload={...payload,decision:'CANCELLED',refund_amount_cents:current.refund_amount_cents??0,payment_mode:'MOCK'};
   }
   const res=await fetch('https://api.resend.com/emails',{method:'POST',headers:{authorization:`Bearer ${process.env.RESEND_API_KEY}`,
    'content-type':'application/json','Idempotency-Key':`ab-${row.id}`},
    body:JSON.stringify({from:process.env.CHARTER_EMAIL_FROM,to:[row.recipient],subject:row.subject,text:seatEmailText(payload)}),signal:AbortSignal.timeout(8000)});
   const data=await res.json();
   if(!res.ok)throw new Error(`Email provider status ${res.status}`);
   const {error}=await db.from('charter_email_queue').update({state:'SENT',delivery_id:data.id,locked_until:null,last_error:null}).eq('id',row.id);
   if(error)throw error;
   sent++;
  }catch{
   failed++;
   await db.from('charter_email_queue').update({state:'PENDING',locked_until:null,last_error:'Email delivery failed; retry queued',
    retry_at:new Date(Date.now()+Math.min(3600,60*2**Math.min(row.attempts,6))*1000).toISOString()}).eq('id',row.id);
  }
 }
 return NextResponse.json({decisions,sent,failed},{status:failed?503:200});
}
