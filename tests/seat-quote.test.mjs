import test from 'node:test';
import assert from 'node:assert/strict';
import { quotedSettings, shuttlePartyLimit } from '../src/lib/seatQuote.ts';
test('quote binds the full surcharge economics, including unchanged seat-price cap changes',()=>{
 const t={target_revenue_cents:180000,min_seats:6,max_seats:8,contribution_cents:20000,max_surcharge_cents:10000,discount_percent:20,extra:'ignored'};
 assert.deepEqual(quotedSettings(t),{target_revenue_cents:180000,min_seats:6,max_seats:8,contribution_cents:20000,max_surcharge_cents:10000,discount_percent:20});
 assert.notDeepEqual(quotedSettings(t),quotedSettings({...t,max_surcharge_cents:20000}));
});
test('shuttle party choices do not aggregate seats across vehicles',()=>{assert.equal(shuttlePartyLimit({available:8,max_party_size:4}),4);});
