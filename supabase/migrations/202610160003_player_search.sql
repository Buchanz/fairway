-- Username uniqueness is case-insensitive, including Account edits.
create unique index if not exists player_profiles_username_unique on public.player_profiles(lower(username));
-- Only signed-in players can search; return no email or other account metadata.
create or replace function public.search_players(search_username text)
returns table(user_id uuid,username text,avatar_path text)
language sql stable security definer set search_path='' as $$
 select p.user_id,p.username,
 case when u.raw_user_meta_data->>'avatar_path' like p.user_id::text||'/%'
 then u.raw_user_meta_data->>'avatar_path' else null end
 from public.player_profiles p join auth.users u on u.id=p.user_id
 where auth.uid() is not null and p.user_id<>auth.uid()
 and lower(trim(search_username)) ~ '^[a-z0-9_]{3,24}$'
 and starts_with(p.username,lower(trim(search_username)))
 order by p.username limit 10;
$$;
revoke all on function public.search_players(text) from public,anon;
grant execute on function public.search_players(text) to authenticated;
-- Profile pictures are visible to signed-in players in username search.
-- Permit only the current avatar path registered by its owner, not other files.
create or replace function public.is_player_avatar(object_path text)
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(
 select 1 from auth.users u where u.raw_user_meta_data->>'avatar_path'=object_path
 and object_path like u.id::text||'/%');
$$;
revoke all on function public.is_player_avatar(text) from public,anon;
grant execute on function public.is_player_avatar(text) to authenticated;
drop policy if exists player_avatar_search on storage.objects;
create policy player_avatar_search on storage.objects for select to authenticated
 using(bucket_id='avatars' and public.is_player_avatar(name));
