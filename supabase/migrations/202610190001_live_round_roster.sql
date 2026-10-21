-- Only current, heartbeating rounds open on friends' devices. No location is
-- collected for membership or tee flips; membership comes from the scorecard.
create table public.live_round_sessions (
 owner_id uuid not null, round_id text not null, hole integer not null default 0,
 seen_at timestamptz not null default now(), flip_result jsonb,
 primary key(owner_id,round_id),
 foreign key(owner_id,round_id) references public.rounds(user_id,id) on delete cascade
);
alter table public.live_round_sessions enable row level security;
revoke all on public.live_round_sessions from public,anon,authenticated;

create function public.live_round_ping(game text, current_hole integer) returns void
language plpgsql security definer set search_path='' as $$
declare r jsonb; begin
 select data into r from public.rounds where user_id=auth.uid() and id=game;
 if r is null or r->>'finished'<>'false' then raise exception 'Round is not active'; end if;
 if current_hole is null or current_hole<0 or current_hole>=jsonb_array_length(r->'scores'->0) then raise exception 'Invalid hole'; end if;
 insert into public.live_round_sessions(owner_id,round_id,hole) values(auth.uid(),game,current_hole)
 on conflict(owner_id,round_id) do update set hole=excluded.hole,seen_at=now();
end; $$;

create function public.my_live_round() returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('ownerId',s.owner_id,'round',r.data,'hole',s.hole)
 from public.live_round_sessions s join public.rounds r on r.user_id=s.owner_id and r.id=s.round_id
 where s.seen_at>now()-interval '90 seconds' and r.data->>'finished'='false'
 and s.owner_id<>auth.uid() and r.data->'playerIds' @> jsonb_build_array(auth.uid()::text)
 and exists(select 1 from public.friendships f where f.status='accepted' and auth.uid() in(f.sender,f.recipient) and s.owner_id in(f.sender,f.recipient))
 order by s.seen_at desc limit 1;
$$;

create function public.live_round_flip(owner uuid, game text, do_flip boolean default false) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r jsonb; result jsonb; chosen integer; begin
 select data into r from public.rounds where user_id=owner and id=game for update;
 if auth.uid() is null or r is null or r->>'finished'<>'false' then raise exception 'Round is not active'; end if;
 if auth.uid()<>owner and (not coalesce(r->'playerIds' @> jsonb_build_array(auth.uid()::text),false) or not exists(select 1 from public.friendships f where f.status='accepted' and auth.uid() in(f.sender,f.recipient) and owner in(f.sender,f.recipient))) then raise exception 'Not a player in this round'; end if;
 select flip_result into result from public.live_round_sessions where owner_id=owner and round_id=game;
 if do_flip then
 if auth.uid()<>owner then raise exception 'The scorekeeper flips the tee'; end if;
 if jsonb_array_length(r->'names')<2 then raise exception 'Add at least two players'; end if;
 if (result->>'flippedAt')::timestamptz>now()-interval '5 seconds' then raise exception 'Wait a moment before flipping again'; end if;
 chosen:=floor(random()*jsonb_array_length(r->'names'))::integer;
 result:=jsonb_build_object('name',r->'names'->chosen,'playerIndex',chosen,'flippedAt',now());
 insert into public.live_round_sessions(owner_id,round_id,flip_result) values(owner,game,result)
 on conflict(owner_id,round_id) do update set flip_result=excluded.flip_result;
 end if;
 return result;
end; $$;

-- Every account already on the scorecard receives its completed score.
create or replace function public.save_joined_scorecards() returns trigger language plpgsql security definer set search_path='' as $$
declare member record; invite uuid; copy_id text; card jsonb; begin
 if not public.complete_scorecard(new.data) then return new; end if;
 for member in select value::uuid as id,ordinality::int-1 as idx from jsonb_array_elements_text(new.data->'playerIds') with ordinality where value is not null and value<>new.user_id::text loop
 if member.idx>0 and exists(select 1 from public.friendships f where f.status='accepted' and new.user_id in(f.sender,f.recipient) and member.id in(f.sender,f.recipient)) then
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

revoke all on function public.live_round_ping(text,integer),public.my_live_round(),public.live_round_flip(uuid,text,boolean) from public,anon;
grant execute on function public.live_round_ping(text,integer),public.my_live_round(),public.live_round_flip(uuid,text,boolean) to authenticated;
