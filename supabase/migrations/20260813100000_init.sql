-- Phase 0: tickers / entries + RLS
create extension if not exists "pgcrypto";

create type public.market as enum ('US', 'KR');
create type public.entry_type as enum ('memo', 'link', 'trade');
create type public.trade_side as enum ('buy', 'sell');

create table public.tickers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  market public.market not null,
  symbol text not null,
  name text,
  created_at timestamptz not null default now(),
  unique (user_id, market, symbol)
);

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  ticker_id uuid not null references public.tickers (id) on delete cascade,
  type public.entry_type not null,
  body text,
  url text,
  title text,
  note text,
  side public.trade_side,
  traded_at timestamptz,
  price numeric,
  qty numeric,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint entries_payload_check check (
    (type = 'memo' and body is not null)
    or (type = 'link' and url is not null)
    or (type = 'trade' and side is not null and traded_at is not null)
  )
);

create index entries_ticker_created_idx on public.entries (ticker_id, created_at desc);
create index entries_user_created_idx on public.entries (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger entries_set_updated_at
before update on public.entries
for each row
execute function public.set_updated_at();

alter table public.tickers enable row level security;
alter table public.entries enable row level security;

create policy "tickers_select_own"
  on public.tickers for select
  using (user_id = auth.uid());

create policy "tickers_insert_own"
  on public.tickers for insert
  with check (user_id = auth.uid());

create policy "tickers_update_own"
  on public.tickers for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "tickers_delete_own"
  on public.tickers for delete
  using (user_id = auth.uid());

create policy "entries_select_own"
  on public.entries for select
  using (user_id = auth.uid());

create policy "entries_insert_own"
  on public.entries for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.tickers t
      where t.id = ticker_id
        and t.user_id = auth.uid()
    )
  );

create policy "entries_update_own"
  on public.entries for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.tickers t
      where t.id = ticker_id
        and t.user_id = auth.uid()
    )
  );

create policy "entries_delete_own"
  on public.entries for delete
  using (user_id = auth.uid());

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.tickers to authenticated;
grant select, insert, update, delete on table public.entries to authenticated;
grant select on table public.tickers to anon;
grant select on table public.entries to anon;
