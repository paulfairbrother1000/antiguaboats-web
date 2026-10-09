'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {shuttlePartyLimit} from '@/lib/seatQuote';
import type {TripOffer} from '@/lib/specialOffers';
export default function ShuttleBooking(){
 const [offer,setOffer]=useState<TripOffer|null>(null),[seats,setSeats]=useState(1),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{const id=new URLSearchParams(location.search).get('departure');fetch('/api/specialoffers/shuttle',{cache:'no-store'}).then(async r=>{const j=await r.json();if(!r.ok)throw new Error(j.error);const o=j.offers.find((v:TripOffer)=>v.id===id);if(!o)throw new Error('This journey is no longer available.');setOffer(o);}).catch(e=>setError(e.message));},[]);
 async function book(){if(!offer)return;setBusy(true);setError('');try{
 const r=await fetch('/api/specialoffers/shuttle',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({departure_id:offer.id,seats,price_cents:offer.price_cents})});
 const j=await r.json();if(!r.ok)throw new Error(j.error);location.href=j.checkout_url;
 }catch(e){setError(e instanceof Error?e.message:'Unable to prepare booking');setBusy(false);}}
 return <main className="mx-auto max-w-3xl px-4 py-10"><Link href="/specialoffers" className="text-purple-800 underline">← Shared trips & offers</Link><h1 className="mt-5 text-3xl font-bold">Shuttle Journey</h1>
 {offer?<section className="mt-6 space-y-4 rounded-3xl border p-6"><h2 className="text-xl font-bold">{offer.title}</h2><p>{offer.description}</p><p className="font-semibold">{offer.available} {offer.discounted?'discounted seats':'seats'} available · ${(offer.price_cents/100).toFixed(2)} USD each</p>
 <label className="block">Seats<select value={seats} onChange={e=>setSeats(Number(e.target.value))} className="ml-4 rounded-xl border p-3">{Array.from({length:shuttlePartyLimit(offer)},(_,i)=><option key={i+1}>{i+1}</option>)}</select></label>
 <p>Total: ${(offer.price_cents*seats/100).toFixed(2)} USD. Live price and whole-party availability are checked again before checkout.</p><button disabled={busy} onClick={book} className="rounded-xl bg-purple-700 px-5 py-3 font-bold text-white disabled:opacity-50">{busy?'Preparing booking…':'Continue to Pace Shuttles booking'}</button></section>:!error&&<p className="mt-5">Loading journey…</p>}
 {error&&<p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}</main>;
}
