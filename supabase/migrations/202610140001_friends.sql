-- Friends opt in to connections and separately accept each shared scorecard.
create table public.player_profiles (
 user_id uuid primary key references auth.users on delete cascade,
 friend_code uuid not null unique default gen_random_uuid(),
 display_name text not null default 'Golfer' check(length(display_name)<=80),
 share_performance boolean not null default false
);
alter table public.player_profiles enable row level security;
revoke all on public.player_profiles from anon,authenticated;
grant select on public.player_profiles to authenticated;
grant update(display_name,share_performance) on public.player_profiles to authenticated;
create policy own_profile on public.player_profiles for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create function public.create_player_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.player_profiles(user_id,display_name) values(new.id,coalesce(nullif(left(new.raw_user_meta_data->>'display_name',80),''),'Golfer')) on conflict(user_id) do update set display_name=excluded.display_name; return new; end; $$;
create trigger sync_player_profile after insert or update of raw_user_meta_data on auth.users for each row execute function public.create_player_profile();
insert into public.player_profiles(user_id,display_name) select id,coalesce(nullif(left(raw_user_meta_data->>'display_name',80),''),'Golfer') from auth.users;

create table public.friendships (
 id uuid primary key default gen_random_uuid(),
 sender uuid not null references auth.users on delete cascade,
 recipient uuid not null references auth.users on delete cascade,
 status text not null default 'pending' check(status in ('pending','accepted')),
 check(sender<>recipient)
);
create unique index friendship_pair on public.friendships(least(sender,recipient),greatest(sender,recipient));
alter table public.friendships enable row level security;
revoke all on public.friendships from anon,authenticated;
grant select,delete on public.friendships to authenticated;
grant update(status) on public.friendships to authenticated;
create policy participants_read on public.friendships for select to authenticated using(auth.uid() in (sender,recipient));
create policy recipient_accept on public.friendships for update to authenticated using(recipient=auth.uid()) with check(recipient=auth.uid() and status='accepted');
create policy participants_remove on public.friendships for delete to authenticated using(auth.uid() in (sender,recipient));
create policy friend_profiles on public.player_profiles for select to authenticated using(exists(select 1 from public.friendships f where auth.uid() in(f.sender,f.recipient) and user_id in(f.sender,f.recipient)));
create function public.request_friend(code uuid) returns void language plpgsql security definer set search_path='' as $$
declare target uuid; begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 select user_id into target from public.player_profiles where friend_code=code;
 if target is null or target=auth.uid() then raise exception 'Check the friend code'; end if;
 insert into public.friendships(sender,recipient) values(auth.uid(),target) on conflict do nothing;
end; $$;
revoke all on function public.request_friend(uuid) from public,anon;
grant execute on function public.request_friend(uuid) to authenticated;

create function public.complete_scorecard(data jsonb) returns boolean language plpgsql immutable set search_path='' as $$
declare card jsonb; score jsonb; holes int; begin
 if data->'finished' is distinct from 'true'::jsonb or jsonb_typeof(data->'scores') is distinct from 'array' or jsonb_typeof(data->'names') is distinct from 'array' then return false; end if;
 if jsonb_typeof(data->'courseId') is distinct from 'string' or jsonb_typeof(data->'date') is distinct from 'string' then return false; end if;
 if exists(select 1 from jsonb_array_elements(data->'names') n where jsonb_typeof(n) <> 'string') then return false; end if;
 if jsonb_array_length(data->'scores') not between 1 and 4 or jsonb_array_length(data->'scores')<>jsonb_array_length(data->'names') then return false; end if;
 holes:=jsonb_array_length(data->'scores'->0); if holes not in(9,18) then return false; end if;
 for card in select value from jsonb_array_elements(data->'scores') loop
  if jsonb_array_length(card)<>holes then return false; end if;
  for score in select value from jsonb_array_elements(card) loop
   if jsonb_typeof(score)<>'number' or (score::text)::numeric not between 1 and 30 or (score::text)::numeric<>trunc((score::text)::numeric) then return false; end if;
  end loop;
 end loop; return true;
 exception when others then return false;
end; $$;
create table public.round_invitations (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null,
 round_id text not null,
 recipient uuid not null references auth.users on delete cascade,
 player_index int not null check(player_index between 1 and 3),
 accepted boolean not null default false,
 unique(owner_id,round_id,recipient),
 foreign key(owner_id,round_id) references public.rounds(user_id,id) on delete cascade
);
alter table public.round_invitations enable row level security;
revoke all on public.round_invitations from anon,authenticated;
grant select on public.round_invitations to authenticated;
grant insert(owner_id,round_id,recipient,player_index) on public.round_invitations to authenticated;
create policy invite_read on public.round_invitations for select to authenticated using(auth.uid() in(owner_id,recipient));
create policy invite_insert on public.round_invitations for insert to authenticated with check(
 owner_id=auth.uid() and exists(select 1 from public.friendships f where f.status='accepted' and owner_id in(f.sender,f.recipient) and round_invitations.recipient in(f.sender,f.recipient))
 and exists(select 1 from public.rounds r where r.user_id=owner_id and r.id=round_id and public.complete_scorecard(r.data) and player_index<jsonb_array_length(r.data->'names'))
);
create function public.accept_round_invitation(invitation uuid) returns void language plpgsql security definer set search_path='' as $$
declare invite public.round_invitations; source jsonb; copy_id text; begin
 select * into invite from public.round_invitations where id=invitation and recipient=auth.uid() for update;
 if not found then raise exception 'Invitation not found'; end if;
 if invite.accepted then return; end if;
 select data into source from public.rounds where user_id=invite.owner_id and id=invite.round_id;
 if not public.complete_scorecard(source) or invite.player_index>=jsonb_array_length(source->'names') then raise exception 'Round is not complete'; end if;
 copy_id:='shared-'||invite.id::text;
 source:=source||jsonb_build_object('id',copy_id,'names',jsonb_build_array(source->'names'->invite.player_index),'scores',jsonb_build_array(source->'scores'->invite.player_index),'playerIds',jsonb_build_array(auth.uid()));
 insert into public.rounds(user_id,id,data) values(auth.uid(),copy_id,source);
 update public.round_invitations set accepted=true where id=invitation;
end; $$;
revoke all on function public.accept_round_invitation(uuid) from public,anon;
grant execute on function public.accept_round_invitation(uuid) to authenticated;
create function public.friend_performances(friend uuid) returns table(course_id text,played_at text,holes int,total numeric)
language sql stable security definer set search_path='' as $$
 select r.data->>'courseId',r.data->>'date',jsonb_array_length(r.data->'scores'->0),(select sum((value::text)::numeric) from jsonb_array_elements(r.data->'scores'->0))
 from public.rounds r join public.player_profiles p on p.user_id=r.user_id
 where r.user_id=friend and p.share_performance and public.complete_scorecard(r.data)
 and exists(select 1 from public.friendships f where f.status='accepted' and auth.uid() in(f.sender,f.recipient) and friend in(f.sender,f.recipient))
 order by r.data->>'date' desc limit 20;
$$;
revoke all on function public.friend_performances(uuid) from public,anon;
grant execute on function public.friend_performances(uuid) to authenticated;
