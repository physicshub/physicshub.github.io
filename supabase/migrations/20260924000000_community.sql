-- PhysicsHub community: accounts, community presets, likes, reports and
-- cross-device saved configurations.
--
-- The site is a static export, so the browser talks to Supabase directly with
-- the public anon key. Everything a visitor must not be able to do is enforced
-- here, by Row Level Security, column grants and triggers — never in the
-- client. See supabase/README.md for how to apply this and set up auth.

-- ---------------------------------------------------------------------------
-- Profiles: one row per auth user, holding only a public display name.
-- No avatars, bios or links: nothing free-form that would need moderation.
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null
    check (char_length(btrim(display_name)) between 2 and 32)
    check (display_name !~* '(https?://|www\.|<|>)'),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant update (display_name) on public.profiles to authenticated;

create policy "Profiles are public"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Users rename themselves"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- A new user gets a profile automatically. The default name is the GitHub
-- handle when there is one (already public by choice), otherwise a neutral
-- pseudonym — never the real name or the email, since many users are students.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(left(btrim(new.raw_user_meta_data ->> 'user_name'), 32), ''),
      'Physicist-' || substr(md5(new.id::text), 1, 6)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Presets: a named set of simulation inputs published by a user.
-- ---------------------------------------------------------------------------

create table public.presets (
  id uuid primary key default gen_random_uuid(),
  sim_id text not null check (sim_id ~ '^[A-Za-z0-9]{1,64}$'),
  title text not null check (char_length(btrim(title)) between 3 and 80),
  description text not null default ''
    check (char_length(description) <= 500),
  inputs jsonb not null
    check (jsonb_typeof(inputs) = 'object')
    check (pg_column_size(inputs) <= 4096),
  author_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  likes_count integer not null default 0,
  reports_count integer not null default 0,
  -- Set by maintainers from the dashboard, never by users (see grants below).
  featured boolean not null default false,
  -- Set automatically once enough users report a preset; maintainers can clear it.
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index presets_listing_idx
  on public.presets (sim_id, hidden, featured desc, likes_count desc, created_at desc);
create index presets_author_idx on public.presets (author_id, created_at desc);

alter table public.presets enable row level security;

-- Column grants: users can only ever write the content columns. The counters,
-- `featured` and `hidden` are out of their reach even if RLS would allow the row.
revoke all on public.presets from anon, authenticated;
grant select on public.presets to anon, authenticated;
grant insert (sim_id, title, description, inputs) on public.presets to authenticated;
grant update (title, description, inputs) on public.presets to authenticated;
grant delete on public.presets to authenticated;

create policy "Visible presets are public, authors see their own"
  on public.presets for select
  to anon, authenticated
  using (hidden = false or author_id = (select auth.uid()));

create policy "Users publish as themselves"
  on public.presets for insert
  to authenticated
  with check (author_id = (select auth.uid()));

create policy "Authors edit their presets"
  on public.presets for update
  to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

create policy "Authors delete their presets"
  on public.presets for delete
  to authenticated
  using (author_id = (select auth.uid()));

-- Anti-spam: at most 20 presets per user per 24 hours.
create function public.presets_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*) from public.presets
    where author_id = new.author_id
      and created_at > now() - interval '24 hours'
  ) >= 20 then
    raise exception 'rate_limited' using hint = 'Too many presets today, try again tomorrow.';
  end if;
  return new;
end;
$$;

create trigger presets_rate_limit
  before insert on public.presets
  for each row execute function public.presets_rate_limit();

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger presets_touch_updated_at
  before update on public.presets
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Likes: one per user per preset; the count on presets is kept by trigger.
-- ---------------------------------------------------------------------------

create table public.preset_likes (
  preset_id uuid not null references public.presets (id) on delete cascade,
  user_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (preset_id, user_id)
);

create index preset_likes_user_idx on public.preset_likes (user_id);

alter table public.preset_likes enable row level security;

revoke all on public.preset_likes from anon, authenticated;
grant select, delete on public.preset_likes to authenticated;
grant insert (preset_id) on public.preset_likes to authenticated;

create policy "Users see their own likes"
  on public.preset_likes for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Users like as themselves"
  on public.preset_likes for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users remove their own likes"
  on public.preset_likes for delete
  to authenticated
  using (user_id = (select auth.uid()));

create function public.preset_likes_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.presets set likes_count = likes_count + 1
    where id = new.preset_id;
  elsif tg_op = 'DELETE' then
    update public.presets set likes_count = greatest(likes_count - 1, 0)
    where id = old.preset_id;
  end if;
  return null;
end;
$$;

create trigger preset_likes_count
  after insert or delete on public.preset_likes
  for each row execute function public.preset_likes_count();

-- ---------------------------------------------------------------------------
-- Reports: moderation after the fact. Three reports hide a preset until a
-- maintainer looks at it (set hidden = false in the dashboard to restore it).
-- ---------------------------------------------------------------------------

create table public.preset_reports (
  preset_id uuid not null references public.presets (id) on delete cascade,
  user_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  reason text not null default '' check (char_length(reason) <= 200),
  created_at timestamptz not null default now(),
  primary key (preset_id, user_id)
);

alter table public.preset_reports enable row level security;

revoke all on public.preset_reports from anon, authenticated;
grant select on public.preset_reports to authenticated;
grant insert (preset_id, reason) on public.preset_reports to authenticated;

create policy "Users see their own reports"
  on public.preset_reports for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Users report as themselves"
  on public.preset_reports for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create function public.preset_reports_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.presets
  set reports_count = reports_count + 1,
      hidden = hidden or reports_count + 1 >= 3
  where id = new.preset_id;
  return null;
end;
$$;

create trigger preset_reports_count
  after insert on public.preset_reports
  for each row execute function public.preset_reports_count();

-- ---------------------------------------------------------------------------
-- Saved configurations: the "Save" button, synced across devices. Private.
-- ---------------------------------------------------------------------------

create table public.user_configs (
  user_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  sim_id text not null check (sim_id ~ '^[A-Za-z0-9]{1,64}$'),
  inputs jsonb not null
    check (jsonb_typeof(inputs) = 'object')
    check (pg_column_size(inputs) <= 4096),
  updated_at timestamptz not null default now(),
  primary key (user_id, sim_id)
);

alter table public.user_configs enable row level security;

revoke all on public.user_configs from anon, authenticated;
grant select, delete on public.user_configs to authenticated;
grant insert (sim_id, inputs, updated_at) on public.user_configs to authenticated;
-- sim_id is updatable only because an upsert re-sets every column it sends.
grant update (sim_id, inputs, updated_at) on public.user_configs to authenticated;

create policy "Users manage their own configs"
  on public.user_configs for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Self-service account deletion (GDPR). Deleting the auth user cascades to the
-- profile, presets, likes, reports and saved configs.
-- ---------------------------------------------------------------------------

create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- The trigger functions are only meant to run as triggers.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.presets_rate_limit() from public, anon, authenticated;
revoke execute on function public.preset_likes_count() from public, anon, authenticated;
revoke execute on function public.preset_reports_count() from public, anon, authenticated;
