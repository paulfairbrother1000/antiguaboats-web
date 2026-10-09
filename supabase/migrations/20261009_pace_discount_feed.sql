-- Apply to Pace Shuttles V2, not Antigua Boats.
create function public.v2_system_partner_special_offers(p_api_key text) returns jsonb
language plpgsql set search_path='' as $$
declare catalog jsonb; dep record; q record; capacity integer; max_party integer; normal_price integer;
 items jsonb:='[]'::jsonb;
begin
 catalog:=public.v2_system_partner_shuttle_catalog(p_api_key);
 if (catalog->>'authorized')::boolean is distinct from true or (catalog->>'rate_limited')::boolean then return catalog; end if;
 for dep in select d.* from public.v2_public_departures d
  where d.country_id=(catalog->>'country_id')::uuid and d.scheduled_departure_ts<=now()+interval '72 hours'
   and d.scheduled_departure_ts>now()+interval '24 hours' order by d.scheduled_departure_ts limit 30 loop
  select * into q from public.v2_public_quote(dep.departure_id,1);
  if q.result_status<>'offer' or not q.discount_applied or q.discount_bps<=0 then continue; end if;
  select coalesce(sum(c.remaining_capacity),0),coalesce(max(c.remaining_capacity),0),max(c.normal_price_cents)
   into capacity,max_party,normal_price from pace_v2.get_live_party_offer_candidates(dep.departure_id,1) c
   where c.discount_applied and c.offered_price_cents=q.net_unit_price_cents and c.post_min_discount_bps=q.discount_bps;
  if capacity<=0 then continue; end if;
  items:=items||jsonb_build_array(jsonb_build_object('id',dep.departure_id,'kind','shuttle','title',dep.route_name,
    'start_at',dep.scheduled_departure_ts,'pickup',dep.pickup_name,'destination',dep.destination_name,
    'duration_mins',dep.approx_duration_mins,'available',capacity,'max_party_size',max_party,
    'price_cents',q.all_in_unit_price_cents,'discount_percent',q.discount_bps::numeric/100,
    'discounted',true,'expires_at',least(q.quote_expires_at,dep.t24_ts),'vehicle_name',q.vehicle_name));
 end loop;
 return jsonb_build_object('authorized',true,'offers',items);
end $$;
revoke all on function public.v2_system_partner_special_offers(text) from public,anon,authenticated;
grant execute on function public.v2_system_partner_special_offers(text) to service_role;
