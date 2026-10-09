import { sbServer } from '@/lib/supabaseServer';
import { salePrice, seatPrice, type SeatSettings } from '@/lib/perSeatPricing';

export type SeatInventory = SeatSettings & {
  id: string | null; date: string; start_at: string; end_at: string; status: string;
  vehicle_name: string; vehicle_model: string; sold_seats: number; remaining_seats: number;
  needed_seats: number; unit_price_cents: number; base_price_cents: number; discounted: boolean; bookable: boolean;
};
export async function seatInventory(from: string, to: string): Promise<SeatInventory[]> {
  const db=sbServer();
  const {data:vehicle,error:ve}=await db.from('charter_vehicles').select('*').eq('slug','silver-lady').eq('active',true).single();
  if(ve) throw ve;
  const {data:trips,error:te}=await db.from('seat_trips').select('*').gte('charter_date',from).lte('charter_date',to);
  if(te) throw te;
  const {data:bookings,error:be}=await db.from('bookings').select('start_at,end_at,status,hold_expires_at,seat_trip_id,seat_count')
    .gte('start_at',`${from}T00:00:00-04:00`).lte('start_at',`${to}T23:59:59-04:00`).neq('status','CANCELLED');
  if(be) throw be;
  const active=(bookings??[]).filter(b=>b.status!=='HOLD'||Date.parse(b.hold_expires_at??'')>Date.now());
  const result: SeatInventory[]=[];
  for(let at=new Date(`${from}T12:00:00Z`);at<=new Date(`${to}T12:00:00Z`);at.setUTCDate(at.getUTCDate()+1)){
    const date=at.toISOString().slice(0,10),trip=trips?.find(t=>t.charter_date===date);
    const start_at=trip?.start_at??`${date}T10:00:00-04:00`,end_at=trip?.end_at??`${date}T17:00:00-04:00`;
    const settings=trip??vehicle;
    const dayBookings=active.filter(b=>new Date(Date.parse(b.start_at)-4*3600000).toISOString().slice(0,10)===date);
    const sold=dayBookings.filter(b=>b.seat_trip_id===trip?.id&&b.status==='CONFIRMED').reduce((a,b)=>a+(b.seat_count??0),0);
    const hours=(Date.parse(start_at)-Date.now())/3600000;
    const price=salePrice(settings,sold,hours),base=seatPrice(settings);
    const conflict=dayBookings.some(b=>!b.seat_trip_id || b.seat_trip_id!==trip?.id);
    const bookable=!conflict && hours>24 && hours<=366*24 && trip?.status!=='CANCELLED' && !trip?.decision_at && sold<settings.max_seats;
    result.push({id:trip?.id??null,date,start_at,end_at,status:trip?.status??'UNDER_MINIMUM',
      target_revenue_cents:settings.target_revenue_cents,contribution_cents:settings.contribution_cents,
      min_seats:settings.min_seats,max_seats:settings.max_seats,max_surcharge_cents:settings.max_surcharge_cents,discount_percent:settings.discount_percent,
      vehicle_name:vehicle.name,vehicle_model:vehicle.model,sold_seats:sold,remaining_seats:conflict?0:Math.max(0,settings.max_seats-sold),
      needed_seats:Math.max(0,settings.min_seats-sold),unit_price_cents:price,base_price_cents:base,discounted:bookable&&price<base,bookable});
  }
  return result;
}
export function dateRange(from: unknown,to: unknown) {
  if(typeof from!=='string'||typeof to!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(from)||!/^\d{4}-\d{2}-\d{2}$/.test(to))return false;
  const a=Date.parse(from),b=Date.parse(to);
  return Number.isFinite(a)&&Number.isFinite(b)&&new Date(a).toISOString().slice(0,10)===from&&new Date(b).toISOString().slice(0,10)===to&&b>=a&&b-a<=366*86400000;
}
