import test from 'node:test';
import assert from 'node:assert/strict';
import { seatPrice, seatDecision, salePrice } from '../src/lib/perSeatPricing.ts';
const settings={target_revenue_cents:180000,min_seats:6,max_seats:8,contribution_cents:20000,max_surcharge_cents:10000,discount_percent:20};
test('target/minimum sets price dynamically',()=>{assert.equal(seatPrice(settings),30000);assert.equal(seatPrice({...settings,target_revenue_cents:200000,min_seats:5}),40000);});
test('six meets threshold, five pays $20, four pays $100, three cancels',()=>{
 for(const [seats,outcome,extra] of [[6,'CONFIRMED',0],[5,'SURCHARGE',2000],[4,'SURCHARGE',10000],[3,'CANCELLED',0]]){
 const d=seatDecision(settings,seats,seats*30000);assert.equal(d.status,outcome);assert.equal(d.per_seat_cents,extra);
 }
});
test('discount only after minimum and during T-72..T-24',()=>{
 for(const [seats,hours,expected] of [[5,48,30000],[6,73,30000],[6,72,24000],[6,24.001,24000],[6,24,30000],[6,23,30000]])assert.equal(salePrice(settings,seats,hours),expected);
 assert.equal(salePrice({...settings,discount_percent:10},6,48),27000);
});
test('impossible shortfall cancels, no cap is exceeded',()=>{assert.equal(seatDecision({...settings,contribution_cents:0},4,120000).status,'CANCELLED');});
test('integer cents cover exactly the remainder',()=>{
 const d=seatDecision({...settings,target_revenue_cents:180001},5,150000);
 assert.equal(d.surcharge_total_cents,10001);assert.equal(d.per_seat_cents,2000);assert.equal(d.extra_cent_seats,1);
});
test('variable minimum derives viability without a fixed four-seat rule',()=>{assert.equal(seatDecision({...settings,min_seats:5},4,144000).per_seat_cents,4000);});
test('discounted extra seats cannot undo confirmation',()=>{assert.equal(seatDecision(settings,7,204000).status,'CONFIRMED');});
test('invalid configuration and seat counts are rejected',()=>{assert.throws(()=>seatPrice({...settings,min_seats:0}));assert.throws(()=>seatDecision(settings,1.5,45000));});
