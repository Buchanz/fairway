begin;
-- Each golfer controls access to their own completed performances, per connection.
create table public.friend_round_sharing (
 connection_id uuid not null references public.friendships(id) on delete cascade,
 owner_id uuid not null references auth.users(id) on delete cascade,
 enabled boolean not null default false,
 primary key(connection_id,owner_id)
);
alter table public.friend_round_sharing enable row level security;
revoke all on public.friend_round_sharing from public,anon,authenticated;
grant select on public.friend_round_sharing to authenticated;
create policy own_sharing_preferences on public.friend_round_sharing for select to authenticated using(owner_id=auth.uid());
-- Preserve existing opt-ins only for existing accepted connections.
insert into public.friend_round_sharing(connection_id,owner_id,enabled)
 select f.id,p.user_id,true from public.friendships f join public.player_profiles p on p.user_id in(f.sender,f.recipient)
 where f.status='accepted' and p.share_performance;
create function public.set_friend_round_sharing(friend uuid,enabled boolean) returns void
language plpgsql security definer set search_path='' as $$
declare connection uuid;
begin
 if auth.uid() is null or friend=auth.uid() then raise exception 'Sign in and choose a friend'; end if;
 select f.id into connection from public.friendships f where auth.uid() in(f.sender,f.recipient) and friend in(f.sender,f.recipient);
 if connection is null then raise exception 'Send a friend request first'; end if;
 insert into public.friend_round_sharing(connection_id,owner_id,enabled) values(connection,auth.uid(),enabled)
 on conflict(connection_id,owner_id) do update set enabled=excluded.enabled;
end; $$;
revoke all on function public.set_friend_round_sharing(uuid,boolean) from public,anon;
grant execute on function public.set_friend_round_sharing(uuid,boolean) to authenticated;
create or replace function public.friend_performances(friend uuid) returns table(course_id text,played_at text,holes int,total numeric)
language sql stable security definer set search_path='' as $$
 select r.data->>'courseId',r.data->>'date',jsonb_array_length(r.data->'scores'->0),(select sum((value::text)::numeric) from jsonb_array_elements(r.data->'scores'->0))
 from public.rounds r
 where r.user_id=friend and public.complete_scorecard(r.data)
 and exists(select 1 from public.friendships f join public.friend_round_sharing s on s.connection_id=f.id and s.owner_id=friend and s.enabled
 where f.status='accepted' and auth.uid() in(f.sender,f.recipient) and friend in(f.sender,f.recipient))
 order by r.data->>'date' desc limit 20;
$$;
commit;
