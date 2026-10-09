create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('antigua-seat-charter-t24','*/5 * * * *','select public.ab_process_seat_decisions()');
