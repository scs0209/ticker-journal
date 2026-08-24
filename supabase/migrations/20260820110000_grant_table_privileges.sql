-- authenticated/anon 역할에 테이블 권한 부여 (RLS 정책과 함께 필요)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.tickers to authenticated;
grant select, insert, update, delete on table public.entries to authenticated;
grant select on table public.tickers to anon;
grant select on table public.entries to anon;
