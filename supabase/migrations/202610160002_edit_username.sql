-- Apply after 202610160001_usernames.sql. Account-only username editor.
create or replace function public.set_username(requested_username text) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 if requested_username is null or lower(trim(requested_username)) !~ '^[a-z0-9_]{3,24}$' then raise exception 'Use 3–24 letters, numbers or underscores'; end if;
 update public.player_profiles set username=lower(trim(requested_username)) where user_id=auth.uid();
 if not found then raise exception 'Profile not found'; end if;
 exception when unique_violation then raise exception 'Username is already taken';
end; $$;
revoke all on function public.set_username(text) from public,anon;
grant execute on function public.set_username(text) to authenticated;
revoke execute on function public.claim_username(text) from authenticated;
