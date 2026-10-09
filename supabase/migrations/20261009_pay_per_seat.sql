-- Same mock-payment flow as existing Antigua Boats; Stripe comes in a later project.
create table public.charter_vehicles (
 id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null,
 model text not null, target_revenue_cents integer not null check(target_revenue_cents>0),
 contribution_cents integer not null check(contribution_cents>=0), min_seats integer not null check(min_seats>0),
 max_seats integer not null check(max_seats>=min_seats), max_surcharge_cents integer not null check(max_surcharge_cents>=0),
 discount_percent integer not null check(discount_percent between 0 and 99),
 operator_email text not null, active boolean not null default true
);
insert into public.charter_vehicles(slug,name,model,target_revenue_cents,contribution_cents,min_seats,max_seats,max_surcharge_cents,discount_percent,operator_email)
values('silver-lady','Silver Lady','Nor-Tech 390 Sport',180000,20000,6,8,10000,20,'hello@antigua-boats.com');
insert into public.charter_types(slug,title,subtitle,description,active,slot_mode,base_price_cents,currency)
values('full-day-pay-per-seat','Full Day Charter – Pay per seat','10:00 – 17:00 Full day adventure around Antigua for individuals and small groups.','Luxury full day charter for individuals and small groups.',true,'SEAT_FD',30000,'USD');
create table public.seat_trips (
 id uuid primary key default gen_random_uuid(), vehicle_id uuid not null references public.charter_vehicles(id),
 charter_date date not null, start_at timestamptz not null, end_at timestamptz not null,
 status text not null default 'UNDER_MINIMUM' check(status in('UNDER_MINIMUM','CONFIRMED','SURCHARGE','CANCELLED')),
 target_revenue_cents integer not null, contribution_cents integer not null, min_seats integer not null,
 max_seats integer not null, max_surcharge_cents integer not null, discount_percent integer not null,
 decision_at timestamptz, created_at timestamptz not null default now(), unique(vehicle_id,charter_date)
);
alter table public.bookings add column seat_trip_id uuid references public.seat_trips(id),
 add column seat_count integer check(seat_count>0), add column unit_price_cents integer check(unit_price_cents>0),
 add column surcharge_consent_at timestamptz, add column surcharge_cap_cents integer,
 add column seat_request_id uuid unique, add column seat_surcharge_cents integer not null default 0;
create index on public.bookings(seat_trip_id,status);
create table public.charter_email_queue (
 id uuid primary key default gen_random_uuid(), event_key text not null unique,
 recipient text not null, subject text not null, payload jsonb not null,
 state text not null default 'PENDING' check(state in('PENDING','SENDING','SENT')),
 attempts integer not null default 0, retry_at timestamptz not null default now(),
 locked_until timestamptz, delivery_id text, last_error text, created_at timestamptz not null default now()
);
alter table public.charter_vehicles enable row level security;
alter table public.seat_trips enable row level security;
alter table public.charter_email_queue enable row level security;
revoke all on public.charter_vehicles,public.seat_trips,public.charter_email_queue from anon,authenticated;
grant all on public.charter_vehicles,public.seat_trips,public.charter_email_queue to service_role;

-- One date lock protects both new seat trips and legacy charter inserts/updates.
create function public.ab_guard_seat_conflict() returns trigger language plpgsql set search_path='' as $$
declare d date; other_day date;
begin
 d := (new.start_at at time zone 'America/Antigua')::date;
 if tg_op='UPDATE' then
  other_day := (old.start_at at time zone 'America/Antigua')::date;
  perform pg_advisory_xact_lock(hashtextextended('ab-charter:'||least(d,other_day)::text,0));
  if d<>other_day then perform pg_advisory_xact_lock(hashtextextended('ab-charter:'||greatest(d,other_day)::text,0)); end if;
 else perform pg_advisory_xact_lock(hashtextextended('ab-charter:'||d::text,0)); end if;
 if new.status='CANCELLED' or (new.status='HOLD' and new.hold_expires_at<=now()) then return new; end if;
 if exists(select 1 from public.bookings b where b.id<>new.id and b.status<>'CANCELLED'
  and (b.status<>'HOLD' or b.hold_expires_at>now())
  and (b.start_at at time zone 'America/Antigua')::date=d
  and (new.seat_trip_id is not null or b.seat_trip_id is not null)
  and (new.seat_trip_id is null or b.seat_trip_id is distinct from new.seat_trip_id)) then
  raise exception 'This date is reserved for a different charter';
 end if;
 return new;
end $$;
create trigger ab_seat_conflict before insert or update of status,start_at,seat_trip_id on public.bookings
for each row execute function public.ab_guard_seat_conflict();

create function public.ab_queue_seat_email(p_key text,p_booking uuid,p_subject text,p_extra jsonb default '{}'::jsonb)
returns void language sql set search_path='' as $$
 insert into public.charter_email_queue(event_key,recipient,subject,payload)
 select p_key,b.customer_email,p_subject,jsonb_build_object('booking_id',b.id,'customer_name',b.customer_name,
  'charter_date',t.charter_date,'start_at',t.start_at,'end_at',t.end_at,'seat_count',b.seat_count,
  'total_amount_cents',b.total_amount_cents,'trip_status',t.status,'min_seats',t.min_seats,
  'max_surcharge_cents',b.surcharge_cap_cents,'vehicle_name',v.name)||p_extra
 from public.bookings b join public.seat_trips t on t.id=b.seat_trip_id join public.charter_vehicles v on v.id=t.vehicle_id
 where b.id=p_booking and b.customer_email is not null on conflict(event_key) do nothing;
$$;
create function public.ab_sync_seat_trip(p_trip uuid) returns void language plpgsql set search_path='' as $$
declare t public.seat_trips; seats integer; v public.charter_vehicles; b record;
begin
 select * into t from public.seat_trips where id=p_trip;
 perform pg_advisory_xact_lock(hashtextextended('ab-charter:'||t.charter_date::text,0));
 select coalesce(sum(seat_count),0) into seats from public.bookings where seat_trip_id=p_trip and status='CONFIRMED';
 if seats>=t.min_seats and t.status='UNDER_MINIMUM' and t.decision_at is null then
  update public.seat_trips set status='CONFIRMED' where id=p_trip;
  for b in select id from public.bookings where seat_trip_id=p_trip and status='CONFIRMED' loop
   perform public.ab_queue_seat_email('confirmed:'||b.id,b.id,'Your Antigua Boats pay-per-seat charter is confirmed');
  end loop;
  select * into v from public.charter_vehicles where id=t.vehicle_id;
  insert into public.charter_email_queue(event_key,recipient,subject,payload)
  values('operator-confirmed:'||p_trip,v.operator_email,'Confirmed: Pay-per-seat charter on '||t.charter_date,
   jsonb_build_object('charter_date',t.charter_date,'start_at',t.start_at,'seat_count',seats,'vehicle_name',v.name,
    'trip_status','CONFIRMED','operator',true)) on conflict(event_key) do nothing;
 end if;
end $$;

create function public.ab_book_seats(p_date date,p_seats integer,p_name text,p_email text,p_phone text,
 p_notes text,p_consent boolean,p_expected_unit_price integer,p_request uuid)
returns jsonb language plpgsql set search_path='' as $$
declare v public.charter_vehicles; t public.seat_trips; ct uuid; b public.bookings;
 sold integer; price integer; hours numeric; booking_id uuid;
begin
 if p_consent is distinct from true then raise exception 'Surcharge acceptance is required'; end if;
 if p_seats is null or p_seats<1 or nullif(trim(p_name),'') is null or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or p_request is null then
  raise exception 'Invalid booking details'; end if;
 perform pg_advisory_xact_lock(hashtextextended('ab-charter:'||p_date::text,0));
 select * into b from public.bookings where seat_request_id=p_request;
 if b.id is not null then
  if b.seat_count<>p_seats or b.customer_email<>lower(trim(p_email)) or (b.start_at at time zone 'America/Antigua')::date<>p_date then
   raise exception 'Booking request does not match original'; end if;
  return jsonb_build_object('id',b.id,'repeated',true);
 end if;
 select * into v from public.charter_vehicles where slug='silver-lady' and active;
 if v.id is null then raise exception 'Vehicle is unavailable'; end if;
 hours:=extract(epoch from (((p_date::text||' 10:00')::timestamp at time zone 'America/Antigua')-now()))/3600;
 if hours<=24 or p_date>(now() at time zone 'America/Antigua')::date+366 then raise exception 'Bookings close 24 hours before departure'; end if;
 select id into ct from public.charter_types where slug='full-day-pay-per-seat' and active;
 if ct is null then raise exception 'Charter is unavailable'; end if;
 insert into public.seat_trips(vehicle_id,charter_date,start_at,end_at,target_revenue_cents,contribution_cents,min_seats,max_seats,max_surcharge_cents,discount_percent)
 values(v.id,p_date,(p_date::text||' 10:00')::timestamp at time zone 'America/Antigua',(p_date::text||' 17:00')::timestamp at time zone 'America/Antigua',
 v.target_revenue_cents,v.contribution_cents,v.min_seats,v.max_seats,v.max_surcharge_cents,v.discount_percent)
 on conflict(vehicle_id,charter_date) do nothing;
 select * into t from public.seat_trips where vehicle_id=v.id and charter_date=p_date for update;
 if t.status='CANCELLED' or t.decision_at is not null then raise exception 'Charter is closed'; end if;
 select coalesce(sum(seat_count),0) into sold from public.bookings where seat_trip_id=t.id and status='CONFIRMED';
 if sold+p_seats>t.max_seats then raise exception 'Not enough seats remain'; end if;
 price:=ceil(t.target_revenue_cents::numeric/t.min_seats);
 if sold>=t.min_seats and hours<=72 and hours>24 then price:=round(price*(100-t.discount_percent)::numeric/100); end if;
 if p_expected_unit_price is distinct from price then raise exception 'Price changed. Refresh your quotation'; end if;
 insert into public.bookings(charter_type_id,start_at,end_at,status,customer_name,customer_email,customer_phone,notes,
 total_amount_cents,currency,seat_trip_id,seat_count,unit_price_cents,surcharge_consent_at,surcharge_cap_cents,seat_request_id)
 values(ct,t.start_at,t.end_at,'CONFIRMED',trim(p_name),lower(trim(p_email)),p_phone,p_notes,price*p_seats,'USD',t.id,p_seats,price,now(),t.max_surcharge_cents,p_request)
 returning id into booking_id;
 insert into public.booking_billing_events(booking_id,event_type,description,amount_cents,currency,event_data)
 values(booking_id,'ORIGINAL_PAYMENT','Mock payment received for pay-per-seat charter',price*p_seats,'USD','{"payment_status":"PAID_MOCK"}');
 insert into public.booking_events(booking_id,event_type,event_data)
 values(booking_id,'SEAT_BOOKING_CREATED',jsonb_build_object('seats',p_seats,'unit_price_cents',price,'surcharge_cap_cents',t.max_surcharge_cents,'consent',true));
 perform public.ab_sync_seat_trip(t.id);
 perform public.ab_queue_seat_email('booked:'||booking_id,booking_id,'Your Antigua Boats pay-per-seat booking');
 if t.status='CONFIRMED' then perform public.ab_queue_seat_email('confirmed:'||booking_id,booking_id,'Your Antigua Boats pay-per-seat charter is confirmed'); end if;
 return jsonb_build_object('id',booking_id,'trip_id',t.id,'total_amount_cents',price*p_seats,'payment_status','PAID_MOCK');
end $$;

create function public.ab_process_seat_decisions() returns integer language plpgsql set search_path='' as $$
declare t public.seat_trips; b public.bookings; v public.charter_vehicles;
 seats integer; revenue integer; shortfall integer; contribution integer; remainder integer; per integer; cents integer;
 booking_extra integer; result text; processed integer:=0;
begin
 for t in select * from public.seat_trips where decision_at is null and status<>'CANCELLED' and start_at<=now()+interval '24 hours' order by charter_date loop
  perform pg_advisory_xact_lock(hashtextextended('ab-charter:'||t.charter_date::text,0));
  select * into t from public.seat_trips where id=t.id for update;
  if t.decision_at is not null then continue; end if;
  select coalesce(sum(seat_count),0),coalesce(sum(total_amount_cents),0) into seats,revenue from public.bookings where seat_trip_id=t.id and status='CONFIRMED';
  shortfall:=greatest(0,t.target_revenue_cents-revenue);
  contribution:=least(t.contribution_cents,shortfall);
  remainder:=greatest(0,shortfall-contribution);
  if seats>=t.min_seats then result:='CONFIRMED'; remainder:=0;
  elsif seats>0 and remainder<=seats*t.max_surcharge_cents then result:='SURCHARGE';
  else result:='CANCELLED'; remainder:=0; end if;
  if t.start_at<=now() and t.status='UNDER_MINIMUM' then result:='CANCELLED'; remainder:=0; end if;
  per:=case when seats>0 then remainder/seats else 0 end;
  cents:=case when seats>0 then remainder%seats else 0 end;
  update public.seat_trips set status=result,decision_at=now() where id=t.id;
  for b in select * from public.bookings where seat_trip_id=t.id and status='CONFIRMED' order by created_at,id loop
   if result='CANCELLED' then
    update public.bookings set status='CANCELLED',cancelled_at=now(),cancelled_reason='Pay-per-seat minimum revenue not met at T-24',
     refund_status='mock_pending',refund_amount_cents=total_amount_cents where id=b.id;
    insert into public.booking_billing_events(booking_id,event_type,description,amount_cents,currency,event_data)
     values(b.id,'REFUND_DUE','Mock full refund due after charter cancellation',b.total_amount_cents,'USD','{"payment_status":"REFUND_MOCK_PENDING"}');
   elsif result='SURCHARGE' then
    booking_extra:=per*b.seat_count+least(cents,b.seat_count); cents:=greatest(0,cents-b.seat_count);
    update public.bookings set seat_surcharge_cents=booking_extra where id=b.id;
    insert into public.booking_billing_events(booking_id,event_type,description,amount_cents,currency,event_data)
     values(b.id,'SEAT_SURCHARGE','Mock surcharge for pay-per-seat charter',booking_extra,'USD',jsonb_build_object('payment_status','PAID_MOCK','operator_contribution_cents',contribution));
   else booking_extra:=0; end if;
   perform public.ab_queue_seat_email('t24:'||b.id,b.id,
    case when result='CANCELLED' then 'Your Antigua Boats charter has been cancelled' else 'Your Antigua Boats charter is tomorrow' end,
    jsonb_build_object('decision',result,'surcharge_cents',case when result='SURCHARGE' then booking_extra else 0 end,
     'refund_amount_cents',case when result='CANCELLED' then b.total_amount_cents else 0 end,'payment_mode','MOCK'));
   insert into public.booking_events(booking_id,event_type,event_data)
    values(b.id,'SEAT_T24_DECISION',jsonb_build_object('decision',result,'mock',true));
  end loop;
  select * into v from public.charter_vehicles where id=t.vehicle_id;
  insert into public.charter_email_queue(event_key,recipient,subject,payload)
   values('operator-t24:'||t.id,v.operator_email,'Pay-per-seat charter: '||result||' on '||t.charter_date,
    jsonb_build_object('operator',true,'vehicle_name',v.name,'charter_date',t.charter_date,'seat_count',seats,'trip_status',result,'decision',result))
   on conflict(event_key) do nothing;
  processed:=processed+1;
 end loop;
 return processed;
end $$;

create function public.ab_claim_charter_emails() returns setof public.charter_email_queue language sql set search_path='' as $$
 update public.charter_email_queue q set state='SENDING',locked_until=now()+interval '5 minutes',attempts=attempts+1
 where id in(select id from public.charter_email_queue where (state='PENDING' and retry_at<=now())
 or (state='SENDING' and locked_until<now()) order by created_at for update skip locked limit 50) returning q.*;
$$;
revoke all on function public.ab_guard_seat_conflict(),public.ab_queue_seat_email(text,uuid,text,jsonb),public.ab_sync_seat_trip(uuid),
 public.ab_book_seats(date,integer,text,text,text,text,boolean,integer,uuid),public.ab_process_seat_decisions(),public.ab_claim_charter_emails() from public,anon,authenticated;
grant execute on function public.ab_guard_seat_conflict(),public.ab_queue_seat_email(text,uuid,text,jsonb),public.ab_sync_seat_trip(uuid),
 public.ab_book_seats(date,integer,text,text,text,text,boolean,integer,uuid),public.ab_process_seat_decisions(),public.ab_claim_charter_emails() to service_role;
