-- Server-only resolution: never grant email lookup to app clients.
create table if not exists public.username_login_attempts (
 username text primary key, window_start timestamptz not null, attempts integer not null
);
alter table public.username_login_attempts enable row level security;
revoke all on public.username_login_attempts from public, anon, authenticated;
create or replace function public.resolve_login_username(handle text) returns text
language plpgsql security definer set search_path='' as $$
declare n integer; address text;
begin
 if handle !~ '^[a-z0-9_]{3,24}$' then return null; end if;
 delete from public.username_login_attempts where window_start < now()-interval '1 day';
 insert into public.username_login_attempts as a values(handle,now(),1)
 on conflict(username) do update set
 attempts=case when a.window_start < now()-interval '15 minutes' then 1 else a.attempts+1 end,
 window_start=case when a.window_start < now()-interval '15 minutes' then now() else a.window_start end
 returning attempts into n;
 if n>20 then return null; end if;
 select u.email into address from public.player_profiles p join auth.users u on u.id=p.user_id where p.username=handle;
 return address;
end; $$;
revoke all on function public.resolve_login_username(text) from public,anon,authenticated;
grant execute on function public.resolve_login_username(text) to service_role;
