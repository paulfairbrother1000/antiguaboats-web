export function seatEmailText(p: Record<string, unknown>) {
 const money=(n:unknown)=>`$${(Number(n??0)/100).toFixed(2)} USD`;
 const lines=[p.operator?'Antigua Boats operator update':`Hello ${String(p.customer_name??'')},`,
 'Full Day Charter – Pay per seat',`${String(p.charter_date??'')} · Jolly Harbour pickup · 10:00–17:00 Antigua time`,
 `${Number(p.seat_count??0)} seats · ${String(p.vehicle_name??'Silver Lady')}`];
 if(p.decision==='CANCELLED')lines.push(`Unfortunately the charter cannot run because the minimum revenue requirement was not met. Your full booking amount is ${money(p.refund_amount_cents)}. A full mock refund has been recorded; no real card payment or refund has been processed in this booking flow.`);
 else if(p.decision==='SURCHARGE')lines.push(`Your charter will go ahead. The additional charge for your ${Number(p.seat_count??0)} seats is ${money(p.surcharge_cents)} in total, within the maximum per-seat commitment you accepted. Antigua Boats is contributing towards the revenue shortfall. This additional charge is recorded as a mock payment; no real card charge has been processed.`);
 else if(p.trip_status==='CONFIRMED')lines.push('The minimum number of booked seats has been met and your charter is confirmed to go ahead.');
 else lines.push(`Your booking has been received. The charter is awaiting the minimum of ${Number(p.min_seats??6)} booked seats. We will email you when it is confirmed and again 24 hours before departure. You accepted a maximum additional charge of ${money(p.max_surcharge_cents)} per seat if needed. If the charter cannot run, your booking is cancelled with a full refund.`);
 if(!p.operator && !p.decision)lines.push('This booking uses the current mock payment flow. No real card payment has been taken.');
 lines.push('Please arrive 15 minutes before departure.','Contact us: hello@antigua-boats.com','https://www.antigua-boats.com/specialoffers');
 return lines.join('\n\n');
}
