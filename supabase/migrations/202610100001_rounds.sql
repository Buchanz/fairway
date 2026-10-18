-- Each row belongs to the authenticated user; the client cannot transfer ownership.
create table public.rounds (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null check (length(id) between 1 and 100),
  data jsonb not null check (jsonb_typeof(data) = 'object' and data->>'id' = id),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
alter table public.rounds enable row level security;
revoke all on public.rounds from anon;
grant select, insert, update, delete on public.rounds to authenticated;
create policy own_rounds on public.rounds for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create function public.stamp_round_update() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger round_updated before update on public.rounds for each row execute function public.stamp_round_update();

-- Self-service account removal; no caller-supplied user ID or privileged client key.
create function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
