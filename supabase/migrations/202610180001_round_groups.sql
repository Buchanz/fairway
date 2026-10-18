-- Group membership is limited to the round owner's accepted friends.
create table public.round_presence (
 owner_id uuid not null, round_id text not null, user_id uuid not null references auth.users on delete cascade,
 latitude double precision not null check(latitude between -90 and 90),
 longitude double precision not null check(longitude between -180 and 180),
 seen_at timestamptz not null default now(),
 primary key(owner_id,round_id,user_id),
 foreign key(owner_id,round_id) references public.rounds(user_id,id) on delete cascade
);
create table public.round_flips (
 owner_id uuid not null, round_id text not null, winner uuid not null references auth.users,
 flipped_at timestamptz not null default now(),
 primary key(owner_id,round_id),
 foreign key(owner_id,round_id) references public.rounds(user_id,id) on delete cascade
);
alter table public.round_presence enable row level security;
alter table public.round_flips enable row level security;
revoke all on public.round_presence,public.round_flips from public,anon,authenticated;

create function public.my_active_groups() returns table(owner_id uuid,round_id text,course_id text,names jsonb)
language sql stable security definer set search_path='' as $$
 select r.user_id,r.id,r.data->>'courseId',r.data->'names' from public.rounds r
 where r.data->>'finished'='false' and r.updated_at>now()-interval '24 hours'
 and (r.user_id=auth.uid() or (
 r.data->'playerIds' @> jsonb_build_array(auth.uid()::text) and exists(
 select 1 from public.friendships f where f.status='accepted' and auth.uid() in(f.sender,f.recipient) and r.user_id in(f.sender,f.recipient))))
 order by r.updated_at desc limit 10;
$$;
create function public.round_group_state(owner uuid, game text, lat double precision default null, lng double precision default null, flip boolean default false)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r jsonb; p public.round_presence; h public.round_presence; ids uuid[]; chosen uuid; result jsonb; begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 select data into r from public.rounds where user_id=owner and id=game for update;
 if r is null or r->>'finished'<>'false' then raise exception 'Round has ended'; end if;
 if auth.uid()<>owner and (not coalesce(r->'playerIds' @> jsonb_build_array(auth.uid()::text),false) or not exists(select 1 from public.friendships f where f.status='accepted' and auth.uid() in(f.sender,f.recipient) and owner in(f.sender,f.recipient))) then raise exception 'Not a player in this round'; end if;
 if lat is not null and lng is not null then
 insert into public.round_presence values(owner,game,auth.uid(),lat,lng,now()) on conflict(owner_id,round_id,user_id) do update set latitude=excluded.latitude,longitude=excluded.longitude,seen_at=now();
 end if;
 if flip then
 if auth.uid()<>owner then raise exception 'The scorekeeper flips the tee'; end if;
 if jsonb_array_length(r->'names')<2 or jsonb_array_length(r->'playerIds')<>jsonb_array_length(r->'names') or exists(select 1 from jsonb_array_elements(r->'playerIds') x where x='null'::jsonb) then raise exception 'Link every player to an account first'; end if;
 select array_agg(value::uuid) into ids from jsonb_array_elements_text(r->'playerIds');
 select * into h from public.round_presence where owner_id=owner and round_id=game and user_id=owner and seen_at>now()-interval '45 seconds';
 if not found then raise exception 'Enable location and join this group'; end if;
 foreach chosen in array ids loop
 select * into p from public.round_presence where owner_id=owner and round_id=game and user_id=chosen and seen_at>now()-interval '45 seconds';
 if not found then raise exception 'Every player must have the group open with location enabled'; end if;
 if 6371000*2*asin(least(1.0,sqrt(power(sin(radians(p.latitude-h.latitude)/2),2)+cos(radians(h.latitude))*cos(radians(p.latitude))*power(sin(radians(p.longitude-h.longitude)/2),2))))>200 then raise exception 'All players must be within 200 metres of the scorekeeper'; end if;
 end loop;
 if exists(select 1 from public.round_flips where owner_id=owner and round_id=game and flipped_at>now()-interval '5 seconds') then raise exception 'Wait a moment before flipping again'; end if;
 chosen:=ids[1+floor(random()*array_length(ids,1))::int];
 insert into public.round_flips values(owner,game,chosen,now()) on conflict(owner_id,round_id) do update set winner=excluded.winner,flipped_at=excluded.flipped_at;
 end if;
 select jsonb_build_object('winner',f.winner,'flippedAt',f.flipped_at,'name',r->'names'->(select ordinality::int-1 from jsonb_array_elements_text(r->'playerIds') with ordinality where value=f.winner::text limit 1)) into result from public.round_flips f where f.owner_id=owner and f.round_id=game;
 return jsonb_build_object('result',result,'active', (select count(*) from public.round_presence where owner_id=owner and round_id=game and seen_at>now()-interval '45 seconds'));
end; $$;

-- Joining a group opts that player into receiving the completed scorecard.
create function public.save_joined_scorecards() returns trigger language plpgsql security definer set search_path='' as $$
declare member record; invite uuid; copy_id text; card jsonb; begin
 if not public.complete_scorecard(new.data) then return new; end if;
 for member in select value::uuid as id,ordinality::int-1 as idx from jsonb_array_elements_text(new.data->'playerIds') with ordinality where value is not null and value<>new.user_id::text loop
 if member.idx>0 and exists(select 1 from public.round_presence where owner_id=new.user_id and round_id=new.id and user_id=member.id) and exists(select 1 from public.friendships f where f.status='accepted' and new.user_id in(f.sender,f.recipient) and member.id in(f.sender,f.recipient)) then
 insert into public.round_invitations(owner_id,round_id,recipient,player_index,accepted) values(new.user_id,new.id,member.id,member.idx,true)
 on conflict(owner_id,round_id,recipient) do update set accepted=true returning id into invite;
 copy_id:='shared-'||invite::text;
 card:=new.data||jsonb_build_object('id',copy_id,'names',jsonb_build_array(new.data->'names'->member.idx),'scores',jsonb_build_array(new.data->'scores'->member.idx),'playerIds',jsonb_build_array(member.id));
 insert into public.rounds(user_id,id,data) values(member.id,copy_id,card) on conflict(user_id,id) do nothing;
 end if;
 end loop;
 delete from public.round_presence where owner_id=new.user_id and round_id=new.id;
 delete from public.round_flips where owner_id=new.user_id and round_id=new.id;
 return new;
end; $$;
create trigger save_group_scores after insert or update of data on public.rounds for each row execute function public.save_joined_scorecards();
revoke all on function public.my_active_groups(),public.round_group_state(uuid,text,double precision,double precision,boolean),public.save_joined_scorecards() from public,anon;
grant execute on function public.my_active_groups(),public.round_group_state(uuid,text,double precision,double precision,boolean) to authenticated;
