'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {quotedSettings} from '@/lib/seatQuote';
import type {SeatInventory} from '@/lib/perSeatServer';
const money=(cents:number)=>`$${(cents/100).toFixed(2)}`;
export default function PerSeatBooking(){
 const [date,setDate]=useState(''),[trip,setTrip]=useState<SeatInventory|null>(null),[seats,setSeats]=useState(1);
 const [name,setName]=useState(''),[email,setEmail]=useState(''),[phone,setPhone]=useState(''),[notes,setNotes]=useState('');
 const [consent,setConsent]=useState(false),[terms,setTerms]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false);
 const [booking,setBooking]=useState<null|{id:string;status:string;trip_status:string;seat_count:number;date:string}>(null),[requestId,setRequestId]=useState('');
 useEffect(()=>{setDate(new URLSearchParams(window.location.search).get('date')??'');setRequestId(crypto.randomUUID());},[]);
 useEffect(()=>{
  if(!date){setTrip(null);return;}
  const controller=new AbortController();setTrip(null);setLoading(true);setError('');setConsent(false);
  fetch(`/api/per-seat?date=${encodeURIComponent(date)}`,{cache:'no-store',signal:controller.signal}).then(async r=>{
   const j=await r.json();if(!r.ok)throw new Error(j.error);setTrip(j.trips[0]);setSeats(1);
  }).catch(e=>{if(e.name!=='AbortError')setError(e.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return ()=>controller.abort();
 },[date]);
 async function submit(e:React.FormEvent){
  e.preventDefault();if(!trip||!consent||!terms)return;setBusy(true);setError('');
  try{
   const res=await fetch('/api/bookings/create',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
    date,slot_mode:'SEAT_FD',guests:seats,unit_price_cents:trip.unit_price_cents,customer_name:name,customer_email:email,customer_phone:phone,
    notes,surcharge_consent:consent,request_id:requestId,pricing_settings:quotedSettings(trip),
   })});
   const data=await res.json();if(!res.ok)throw new Error(data.error);setBooking(data);
  }catch(e){setError(e instanceof Error?e.message:'Unable to complete booking');}finally{setBusy(false);}
 }
 return <main className="mx-auto max-w-6xl px-4 py-10">
 <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-black">Full Day Charter – Pay per seat</h1><Link href="/booking" className="rounded-xl border px-4 py-2">Back to calendar</Link></div>
 <img src="/charters/fullday/hero.jpg" alt="Full day charter around Antigua" className="mt-8 h-64 w-full rounded-3xl object-cover md:h-96"/>
 <p className="mt-6 text-slate-700">Jolly Harbour pickup · 10:00–17:00 Antigua time · Swimming, snorkelling and a restaurant stop.</p>
 {booking?<section className="mt-6 rounded-3xl border border-purple-200 bg-purple-50 p-7"><h2 className="text-xl font-bold">{booking.status==='CANCELLED'?'Booking cancelled':'Booking received'}</h2>
 <p className="mt-3">{booking.seat_count} {booking.seat_count===1?'seat':'seats'} on {booking.date}. Booking reference: {booking.id}.</p>
 <p className="mt-3">{booking.status==='CANCELLED'?'This booking is cancelled. A full mock refund is recorded.':booking.trip_status==='CONFIRMED'?'The minimum seat requirement has been met. Your charter is confirmed.':booking.trip_status==='SURCHARGE'?'Your charter will run with the agreed additional charge.':'Your seats are booked; the charter is awaiting the minimum seat requirement.'}</p>
 <p className="mt-3">Booking emails are queued. You will receive a further update 24 hours before departure.</p><p className="mt-3 text-sm text-slate-600">Payment is mocked for now, matching the current booking flow. No real card charge has been taken.</p>
 <Link href="/specialoffers" className="mt-5 inline-block font-semibold text-purple-800">View shared trips and special offers →</Link></section>:
 <form onSubmit={submit} className="mt-8 grid gap-6 md:grid-cols-2">
 <section className="space-y-5 rounded-3xl border p-6"><h2 className="text-xl font-bold">Choose your date and seats</h2>
 <label className="block">Charter date<input required type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-2 block w-full rounded-xl border p-3"/></label>
 {loading&&<p role="status">Loading availability…</p>}
 {trip&&<><div className="rounded-2xl bg-purple-50 p-4 text-purple-950"><p>{trip.sold_seats} seats booked · {trip.remaining_seats} seats remaining</p>
 <p className="mt-2">{trip.needed_seats?`${trip.needed_seats} more seats needed to confirm the charter`:'Minimum met — charter confirmed'}</p>
 {trip.discounted&&<p className="mt-2 font-bold">{trip.discount_percent}% off remaining seats</p>}</div>
 {!trip.bookable?<p className="font-semibold">{trip.remaining_seats===0?'No seats available on this date.':'Bookings are closed or this date is unavailable. Please choose another date.'}</p>:
 <label className="block">Number of seats<select value={seats} onChange={e=>setSeats(Number(e.target.value))} className="mt-2 block w-full rounded-xl border p-3">{Array.from({length:trip.remaining_seats},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select></label>}
 <div className="border-t pt-4"><p>{trip.discounted&&<del className="mr-2 text-slate-500">{money(trip.base_price_cents)}</del>}{money(trip.unit_price_cents)} per seat</p>
 <p className="mt-2 text-xl font-bold">Total: {money(trip.unit_price_cents*seats)} USD</p></div></>}
 <Link href="/charters/full-day-pay-per-seat" className="inline-block text-purple-800 underline">Read how pay-per-seat charters work</Link></section>
 <section className="space-y-4 rounded-3xl border p-6"><h2 className="text-xl font-bold">Your details</h2>
 <label className="block">Full name<input required minLength={2} maxLength={160} value={name} onChange={e=>setName(e.target.value)} autoComplete="name" className="mt-1 block w-full rounded-xl border p-3"/></label>
 <label className="block">Email<input required type="email" maxLength={160} value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" className="mt-1 block w-full rounded-xl border p-3"/></label>
 <label className="block">Phone<input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} autoComplete="tel" className="mt-1 block w-full rounded-xl border p-3"/></label>
 <label className="block">Comments<textarea maxLength={2000} value={notes} onChange={e=>setNotes(e.target.value)} className="mt-1 block w-full rounded-xl border p-3"/></label>
 {trip&&<label className="flex items-start gap-3"><input required type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1"/><span>I accept the compulsory additional charge of up to {money(trip.max_surcharge_cents)} per seat ({money(trip.max_surcharge_cents*seats)} maximum for this booking) if the minimum is not met 24 hours before departure. Antigua Boats contributes up to {money(trip.contribution_cents)} towards the shortfall. If the charter cannot run within this commitment, it is cancelled with a full refund.</span></label>}
 <label className="flex items-start gap-3"><input required type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)}/><span>I accept the <Link href="/terms" className="underline">terms and conditions</Link>.</span></label>
 <p className="text-sm text-slate-500">Payments use the existing mock booking flow for now.</p>
 <button disabled={busy||!trip?.bookable||!consent||!terms} className="w-full rounded-xl bg-purple-700 p-3 font-bold text-white disabled:opacity-40">{busy?'Processing…':'Pay now (mock)'}</button>
 </section></form>}
 {error&&<p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
 </main>;
}
