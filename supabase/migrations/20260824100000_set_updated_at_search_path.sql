-- 트리거 함수 search_path 고정 (mutable search_path 경고 완화)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
