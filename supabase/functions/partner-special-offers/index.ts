import {createClient} from 'npm:@supabase/supabase-js@2.93.0';
Deno.serve(async req=>{
 const key=req.headers.get('x-pace-api-key');
 if(!key)return Response.json({error:'API key required'},{status:401});
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
 const {data,error}=await db.rpc('v2_system_partner_special_offers',{p_api_key:key});
 if(error)return Response.json({error:'Unable to load discounted seats'},{status:503});
 if(!data?.authorized)return Response.json({error:'Invalid API key'},{status:403});
 if(data.rate_limited)return Response.json({error:'Rate limit exceeded'},{status:429});
 if(req.method==='GET')return Response.json({offers:data.offers??[]},{headers:{'Cache-Control':'no-store'}});
 if(req.method!=='POST')return Response.json({error:'Method not allowed'},{status:405});
 const input=await req.json().catch(()=>null),seats=input?.seats;
 if(!Number.isInteger(seats)||seats<1||seats>50)return Response.json({error:'Invalid seats'},{status:400});
 const offer=(data.offers??[]).find((o:any)=>o.id===input.departure_id);
 if(!offer||seats>offer.max_party_size)return Response.json({error:'Discounted seats are no longer available for this party'},{status:409});
 const {data:quote,error:qe}=await db.rpc('v2_public_quote',{p_departure_id:offer.id,p_party_size:seats});
 const q=quote?.[0];
 if(qe||q?.result_status!=='offer'||!q.discount_applied||q.all_in_unit_price_cents!==input.price_cents)
  return Response.json({error:'Price or availability changed. Please refresh the offer.'},{status:409});
 const {data:id,error:ie}=await db.rpc('v2_public_create_quote_intent',{p_departure_id:offer.id,p_party_size:seats});
 if(ie)return Response.json({error:'Unable to prepare journey booking'},{status:409});
 // Verify snapshot after creation: do not silently redirect to a full-price quote.
 const {data:created,error:ce}=await db.rpc('v2_public_get_quote_intent',{p_quote_id:id});
 if(ce||created?.[0]?.unit_price_cents!==input.price_cents)return Response.json({error:'Journey price changed; refresh your offer'},{status:409});
 return Response.json({checkout_url:`https://www.paceshuttles.com/checkout?q=${encodeURIComponent(id)}`});
});
