import test from 'node:test';
import assert from 'node:assert/strict';
import {mapPaceOffers} from '../src/lib/paceOfferMapping.ts';
const now=Date.parse('2026-10-09T19:00:00Z');
const offer=(hours,extra={})=>({id:'trip',title:'Jolly Harbour → Boom',start_at:new Date(now+hours*3600000).toISOString(),pickup:'Jolly Harbour',destination:'Boom',duration_mins:30,available:10,max_party_size:10,price_cents:2500,discount_percent:0,discounted:false,expires_at:'2026-10-15T14:30:00Z',vehicle_name:'Boat',booked_seats:2,...extra});
test('booked shuttle guests make full-price journeys visible outside the promotion window',()=>{
 const [o]=mapPaceOffers([offer(168)],now);assert.equal(o.available,10);assert.equal(o.price_cents,2500);assert.equal(o.discounted,false);assert.match(o.description,/2 guests have already booked/);assert.match(o.booking_url,/departure=trip/);
});
test('shuttle feed excludes empty, full and closed journeys',()=>{assert.deepEqual(mapPaceOffers([offer(168,{booked_seats:0}),offer(168,{available:0}),offer(24),offer(-1)],now),[]);});
test('discounts retain the 72 to 24 hour promotion window',()=>{
 assert.equal(mapPaceOffers([offer(48,{discounted:true,discount_percent:20})],now).length,1);
 assert.equal(mapPaceOffers([offer(168,{discounted:true,discount_percent:20})],now).length,0);
});
