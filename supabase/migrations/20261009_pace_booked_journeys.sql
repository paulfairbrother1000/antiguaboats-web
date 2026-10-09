-- Apply to Pace Shuttles V2, not Antigua Boats.
-- Private helper exposes only commercial inventory aggregates to the server role.
create schema if not exists antigua_partner_internal;
revoke all on schema antigua_partner_internal from public,anon,authenticated;
grant usage on schema antigua_partner_internal to service_role;
create or replace function antigua_partner_internal.booked_journey_offers(p_country_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare dep record; q record; capacity integer; max_party integer; normal_price integer; booked integer;
 items jsonb:='[]'::jsonb;
begin
 for dep in select d.* from public.v2_public_departures d
  where d.country_id=p_country_id and d.scheduled_departure_ts>now()+interval '24 hours'
   and exists (select 1 from pace_v2.bookings b where b.departure_id=d.departure_id and b.status in ('booked','at_risk','confirmed') and b.seats>0)
   order by d.scheduled_departure_ts loop
  select * into q from public.v2_public_quote(dep.departure_id,1);
  if q.result_status<>'offer' then continue; end if;
  -- Keep genuine discounts in the established sale window.
  if q.discount_applied and (dep.scheduled_departure_ts>now()+interval '72 hours' or q.discount_bps<=0) then continue; end if;
  select coalesce(sum(b.seats),0) into booked from pace_v2.bookings b
   where b.departure_id=dep.departure_id and b.status in ('booked','at_risk','confirmed');
  select coalesce(sum(c.remaining_capacity),0),coalesce(max(c.remaining_capacity),0),max(c.normal_price_cents)
   into capacity,max_party,normal_price from pace_v2.get_live_party_offer_candidates(dep.departure_id,1) c
   where c.discount_applied=q.discount_applied and c.offered_price_cents=q.net_unit_price_cents and (not q.discount_applied or c.post_min_discount_bps=q.discount_bps);
  if capacity<=0 then continue; end if;
  items:=items||jsonb_build_array(jsonb_build_object('id',dep.departure_id,'kind','shuttle','title',dep.route_name,
    'start_at',dep.scheduled_departure_ts,'pickup',dep.pickup_name,'destination',dep.destination_name,
    'duration_mins',dep.approx_duration_mins,'available',capacity,'max_party_size',max_party,
    'price_cents',q.all_in_unit_price_cents,'discount_percent',case when q.discount_applied then q.discount_bps::numeric/100 else 0 end,
    'booked_seats',booked,'discounted',q.discount_applied,'expires_at',least(q.quote_expires_at,dep.t24_ts),'vehicle_name',q.vehicle_name));
 end loop;
 return items;
end $$;
revoke all on function antigua_partner_internal.booked_journey_offers(uuid) from public,anon,authenticated;
grant execute on function antigua_partner_internal.booked_journey_offers(uuid) to service_role;

create or replace function public.v2_system_partner_special_offers(p_api_key text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare catalog jsonb;
begin
 catalog:=public.v2_system_partner_shuttle_catalog(p_api_key);
 if (catalog->>'authorized')::boolean is distinct from true or (catalog->>'rate_limited')::boolean then return catalog; end if;
 return jsonb_build_object('authorized',true,'offers',antigua_partner_internal.booked_journey_offers((catalog->>'country_id')::uuid));
end $$;
revoke all on function public.v2_system_partner_special_offers(text) from public,anon,authenticated;
grant execute on function public.v2_system_partner_special_offers(text) to service_role;
