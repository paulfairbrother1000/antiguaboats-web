import Link from 'next/link';
import CharterTemplate from '@/components/CharterTemplate';
import { sbServer } from '@/lib/supabaseServer';
import { seatPrice } from '@/lib/perSeatPricing';
export const dynamic='force-dynamic';
export default async function PayPerSeatPage(){
 const {data:s,error}=await sbServer().from('charter_vehicles').select('*').eq('slug','silver-lady').eq('active',true).single();
 if(error||!s)throw new Error('Charter settings unavailable');
 const cap=`$${(s.max_surcharge_cents/100).toFixed(0)}`;
 return <CharterTemplate title="Full Day Charter – Pay per seat" subtitle="" body={[
  'The pay per seat luxury charter is ideal for couples and single travellers who do not want or need to charter the entire boat – just the seat!'
 ]} folder="/charters/fullday" priceUSD={seatPrice(s)/100} hoursLine="10:00 – 17:00 – 7 hours"
 tagline="Full day adventure around Antigua for individuals and small groups. Price per seat."
 beforeImages={<div className="space-y-6">
 <section className="rounded-3xl border bg-white p-7">
 <h2 className="text-xl font-black text-slate-900">How it works</h2>
 <p className="mt-4 leading-relaxed text-slate-700">The shared pay per seat charter normally runs once a minimum of {s.min_seats} seats has been booked. The booking process explains your commitment if fewer seats are sold.</p>
 <ol className="mt-5 list-decimal space-y-4 pl-6 leading-relaxed text-slate-700">
 <li>Select this charter type on your chosen day and book the seats you need. Every booking must accept an additional charge of up to {cap} per seat if needed to make the trip viable.</li>
 <li>Other clients can see the charter as a purple shaded day on the booking calendar. Purple indicates that a Pay per Seat charter is available on this day.</li>
 <li>Clicking the day reveals how many seats are already booked, how many more are needed to reach the minimum and how many remain available.</li>
 <li>Other clients book their required seats and accept the same commitment.</li>
 <li>The day remains purple while seats remain, up to the boat’s maximum of {s.max_seats} passengers. Once all seats are booked, it turns black to indicate no more availability.</li>
 <li>Once the minimum number of seats has been booked, you are notified by email and the trip is confirmed.</li>
 <li>If the minimum has not been reached 24 hours before departure, Antigua Boats contributes up to ${(s.contribution_cents/100).toFixed(0)} towards the shortfall. The remaining shortfall is split equally across booked seats, capped at {cap} extra per seat. Your email states the exact additional amount for your booking.</li>
 <li>If the charter cannot run within that commitment, it is cancelled. You are notified by email and your booking receives a full refund.</li>
 </ol>
 </section>
 <section className="rounded-3xl border bg-white p-7"><h2 className="text-xl font-black">What does this mean for you?</h2>
 <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-slate-700">
 <li>The seat price is based on a minimum of {s.min_seats} seats, giving you the best possible value for money.</li>
 <li>A charter with fewer seats can still run if the shortfall is covered by Antigua Boats’ contribution and the agreed additional charge of no more than {cap} per seat.</li>
 <li>You receive a full refund if the charter cannot run.</li>
 </ul>
 <Link href="/booking/per-seat" className="mt-6 inline-flex rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white">Choose your date and seats</Link>
 </section></div>} />;
}
