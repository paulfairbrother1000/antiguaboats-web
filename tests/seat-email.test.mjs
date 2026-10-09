import test from 'node:test';
import assert from 'node:assert/strict';
import { seatEmailText } from '../src/lib/seatEmail.ts';
test('surcharge email specifies total, passenger count and mock payment state',()=>{
 const s=seatEmailText({customer_name:'Paul',seat_count:2,charter_date:'2026-11-30',decision:'SURCHARGE',surcharge_cents:4000,payment_mode:'MOCK'});
 assert.match(s,/\$40\.00/);assert.match(s,/2 seats/);assert.match(s,/mock/i);
});
test('cancel email does not claim a real refund was executed',()=>{
 const s=seatEmailText({decision:'CANCELLED',refund_amount_cents:60000,payment_mode:'MOCK'});assert.match(s,/\$600\.00/);assert.match(s,/mock/i);
});
