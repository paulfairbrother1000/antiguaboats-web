export type SeatSettings = {
  target_revenue_cents: number;
  min_seats: number;
  max_seats: number;
  contribution_cents: number;
  max_surcharge_cents: number;
  discount_percent: number;
};
export function seatPrice(s: SeatSettings) {
  if (!Number.isSafeInteger(s.target_revenue_cents) || s.target_revenue_cents <= 0 ||
      !Number.isSafeInteger(s.min_seats) || s.min_seats < 1 || s.max_seats < s.min_seats ||
      s.contribution_cents < 0 || s.max_surcharge_cents < 0 || s.discount_percent < 0 || s.discount_percent >= 100)
    throw new Error('Invalid seat settings');
  return Math.ceil(s.target_revenue_cents / s.min_seats);
}
export function salePrice(s: SeatSettings, sold: number, hours: number) {
  const base = seatPrice(s);
  return sold >= s.min_seats && hours <= 72 && hours > 24
    ? Math.round(base * (100 - s.discount_percent) / 100) : base;
}
export function seatDecision(s: SeatSettings, seats: number, revenue: number) {
  seatPrice(s);
  if (!Number.isSafeInteger(seats) || seats < 0 || seats > s.max_seats || !Number.isSafeInteger(revenue) || revenue < 0)
    throw new Error('Invalid booked seats or revenue');
  const shortfall = Math.max(0, s.target_revenue_cents - revenue);
  const contribution = seats >= s.min_seats ? 0 : Math.min(shortfall, s.contribution_cents);
  const remaining = Math.max(0, shortfall - contribution);
  const viable = seats > 0 && remaining <= seats * s.max_surcharge_cents;
  const status = seats >= s.min_seats ? 'CONFIRMED' : viable ? 'SURCHARGE' : 'CANCELLED';
  const surcharge = status === 'SURCHARGE' ? remaining : 0;
  return {status, contribution_cents: status === 'SURCHARGE' ? contribution : 0,
    surcharge_total_cents: surcharge, per_seat_cents: seats ? Math.floor(surcharge / seats) : 0,
    extra_cent_seats: seats ? surcharge % seats : 0};
}
