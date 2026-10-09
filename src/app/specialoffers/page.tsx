import Link from 'next/link';
import {charterOffers,type TripOffer} from '@/lib/specialOffers';
import {paceShuttleOffers} from '@/lib/paceShuttleOffers';
export const dynamic='force-dynamic';
export const metadata={title:'Shared Trips & Special Offers | Antigua Boats',description:'Live shared charter availability, pay-per-seat adventures and special offers from Jolly Harbour, Antigua.'};
const money=(c:number)=>`$${(c/100).toLocaleString('en-US',{minimumFractionDigits:0,maximumFractionDigits:2})}`;
function Card({o}:{o:TripOffer}){return <article className="rounded-3xl border bg-white p-6 shadow-sm">
 <h3 className="text-xl font-bold">{new Date(o.start_at).toLocaleDateString('en-GB',{timeZone:'America/Antigua',weekday:'long',day:'numeric',month:'long',year:'numeric'})} — {o.title}</h3>
 <p className="mt-3 text-slate-700">{o.description}</p>
 {o.discounted&&<p className="mt-3 font-bold text-purple-800">{o.discount_percent}% OFF · {o.vehicle_name} · {o.vehicle_model}</p>}
 <p className="mt-4 text-lg font-bold">{o.available} {o.unit_label}{o.available!==1?'s':''} available: {o.discounted&&o.base_price_cents>o.price_cents&&<del className="mr-2 font-normal text-slate-500">{money(o.base_price_cents)}</del>}{money(o.price_cents)}{o.kind==='shared'?'':' each'}</p>
 <Link href={o.booking_url} className="mt-5 inline-flex rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white">Book now and reserve your {o.kind==='shared'?'charter':'seats'}</Link>
 </article>;}
export default async function SpecialOffers(){
 let offers:TripOffer[]=[],failed=false,shuttleFailed=false;
 const results=await Promise.allSettled([charterOffers(),paceShuttleOffers()]);
 if(results[0].status==='fulfilled')offers.push(...results[0].value);else failed=true;
 if(results[1].status==='fulfilled')offers.push(...results[1].value);else shuttleFailed=true;
 const groups=[{title:'Active discounted prices',href:'/charters/full-day-pay-per-seat',desc:'Special offers on remaining seats. Availability and prices update from live bookings.',rows:offers.filter(o=>o.discounted)},
 {title:'Shared Charter',href:'/charters/full-day-shared',desc:'2 bookings per charter with up to 4 seats per booking.',rows:offers.filter(o=>o.kind==='shared')},
 {title:'Pay per Seat Charters',href:'/charters/full-day-pay-per-seat',desc:'A full day on the water for individuals and small groups.',rows:offers.filter(o=>o.kind==='per-seat')},
 {title:'Shuttle Journeys',href:'/charters/restaurant-shuttle',desc:'Upcoming Pace Shuttles journeys in Antigua and Barbuda with guests already booked and seats still available.',rows:offers.filter(o=>o.kind==='shuttle')}];
 return <main className="mx-auto max-w-6xl px-4 py-10">
 <div className="relative overflow-hidden rounded-3xl"><img src="/charters/fullday/hero.jpg" alt="Shared adventures in Antigua" className="h-80 w-full object-cover md:h-96"/>
 <div className="absolute inset-0 flex items-end bg-black/30 p-7 md:p-10"><h1 className="text-3xl font-black text-white md:text-5xl">Shared Trips & Special Offers</h1></div></div>
 <h2 className="mt-8 text-2xl font-bold">Shared bookings underway and available</h2>
 <p className="mt-3 text-slate-700">Share the experience and the cost. Click a section heading to learn more about the charter on offer.</p>
 {failed&&<p role="alert" className="mt-5 rounded-xl bg-amber-50 p-4">Live availability is temporarily unavailable. Please try again shortly or contact us.</p>}
 {groups.map(g=><section key={g.title} className="mt-10"><h2 className="text-2xl font-extrabold"><Link href={g.href} className="text-purple-900 hover:underline">{g.title} →</Link></h2>
 <p className="mt-2 text-slate-700">{g.desc}</p><div className="mt-5 space-y-4">{g.rows.length?g.rows.map(o=><Card key={o.id} o={o}/>):<p className="rounded-2xl border bg-slate-50 p-5 text-slate-600">{(failed&&g.title!=='Shuttle Journeys')||(shuttleFailed&&g.title==='Shuttle Journeys')?'Availability could not be loaded.':g.title==='Active discounted prices'?'No active discounts at the moment.':g.title==='Shuttle Journeys'?'No part-booked shuttle journeys available at the moment.':'No part-booked charters available at the moment.'}</p>}</div></section>)}
 <Link href="/booking" className="mt-10 inline-block rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white">Start a new charter booking</Link>
 </main>;
}
