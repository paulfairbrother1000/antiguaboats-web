import type { SeatSettings } from './perSeatPricing';
export function quotedSettings(s: SeatSettings): SeatSettings {
 return {target_revenue_cents:s.target_revenue_cents,min_seats:s.min_seats,max_seats:s.max_seats,
 contribution_cents:s.contribution_cents,max_surcharge_cents:s.max_surcharge_cents,discount_percent:s.discount_percent};
}
export function shuttlePartyLimit(o:{available:number;max_party_size?:number}){
 return Math.max(0,Math.min(o.available,o.max_party_size??o.available,50));
}
