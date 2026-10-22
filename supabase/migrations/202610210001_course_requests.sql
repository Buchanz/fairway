create table if not exists public.course_requests (
  id uuid primary key default gen_random_uuid(),
  course_name text not null check (char_length(btrim(course_name)) between 2 and 120),
  city text check (city is null or char_length(btrim(city)) <= 120),
  region text check (region is null or char_length(btrim(region)) <= 120),
  notes text check (notes is null or char_length(notes) <= 1000),
  requester_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists course_requests_created_at_idx
  on public.course_requests (created_at desc);

alter table public.course_requests enable row level security;

drop policy if exists "Anyone can submit course requests" on public.course_requests;
create policy "Anyone can submit course requests"
  on public.course_requests
  for insert
  to anon, authenticated
  with check (
    char_length(btrim(course_name)) between 2 and 120
    and (requester_id is null or requester_id = auth.uid())
  );

-- There is intentionally no public select policy. Requests are reviewed by the
-- project owner in the Supabase dashboard (or by a future authenticated admin
-- workflow), so visitors cannot read other users' submissions.
