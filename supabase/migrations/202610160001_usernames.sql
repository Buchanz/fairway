-- Apply once to the existing project. Existing users claim a username in Friends.
begin;
alter table public.player_profiles add column username text unique
 check(username ~ '^[a-z0-9_]{3,24}$');
create or replace function public.create_player_profile() returns trigger language plpgsql security definer set search_path='' as $$
declare handle text := lower(trim(new.raw_user_meta_data->>'username'));
begin
 if TG_OP='INSERT' and (handle is null or handle !~ '^[a-z0-9_]{3,24}$') then
  raise exception 'Choose a username with 3–24 letters, numbers or underscores';
 end if;
 insert into public.player_profiles(user_id,display_name,username)
 values(new.id,coalesce(nullif(left(new.raw_user_meta_data->>'display_name',80),''),'Golfer'),handle)
 on conflict(user_id) do update set display_name=excluded.display_name;
 return new;
end; $$;
create function public.claim_username(requested_username text) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 if requested_username is null or lower(trim(requested_username)) !~ '^[a-z0-9_]{3,24}$' then raise exception 'Use 3–24 letters, numbers or underscores'; end if;
 update public.player_profiles set username=lower(trim(requested_username)) where user_id=auth.uid() and username is null;
 if not found then raise exception 'Username already set'; end if;
 exception when unique_violation then raise exception 'Username is already taken';
end; $$;
create function public.request_friend_by_username(requested_username text) returns void language plpgsql security definer set search_path='' as $$
declare target uuid;
begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 select user_id into target from public.player_profiles where username=lower(trim(requested_username));
 if target is null or target=auth.uid() then raise exception 'Check the username'; end if;
 insert into public.friendships(sender,recipient) values(auth.uid(),target) on conflict do nothing;
end; $$;
revoke all on function public.claim_username(text),public.request_friend_by_username(text) from public,anon;
grant execute on function public.claim_username(text),public.request_friend_by_username(text) to authenticated;
revoke execute on function public.request_friend(uuid) from authenticated;
commit;
