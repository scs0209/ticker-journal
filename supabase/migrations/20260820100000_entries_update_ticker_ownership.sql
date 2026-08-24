-- entries UPDATE 시 ticker_id가 본인 소유 tickers만 가리키도록 보강
drop policy if exists "entries_update_own" on public.entries;

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
