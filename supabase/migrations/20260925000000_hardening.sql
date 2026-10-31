-- PhysicsHub community — hardening pass (run after 20260924000000_community.sql).
--
-- Closes the abuse paths the first migration left open:
--   1. rate limits on every write (not only on publishing presets);
--   2. strict validation of preset / saved-config `inputs` (flat, small,
--      scalar — they end up in other people's browsers);
--   3. no links in titles/descriptions (spam), presets immutable once published;
--   4. unique, non-impersonating nicknames;
--   5. no liking your own presets; no reporting from brand-new accounts, so a
--      handful of throwaway sign-ups can't hide someone else's preset.

-- ---------------------------------------------------------------------------
-- 1. Rate limits
--
-- Counters live in a `private` schema, which the Data API does not expose:
-- users cannot read, reset or even see them. One fixed-window counter per
-- (user, action).
-- ---------------------------------------------------------------------------

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table private.rate_limits (
  user_id uuid not null,
  action text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (user_id, action)
);

-- Counts one hit of `p_action` for the current user and raises `rate_limited`
-- once more than `p_max` happen inside `p_per`. Only direct user actions count:
-- rows removed by a cascade (deleting a preset takes its likes with it,
-- deleting an account takes everything) run at trigger depth > 1 and must
-- never be blocked.
create function private.hit_rate_limit(p_action text, p_max integer, p_per interval)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  current_hits integer;
begin
  -- No user: service-role / dashboard writes, never limited. Callers are
  -- triggers: depth 1 is the user's own statement, deeper means a cascade.
  if uid is null or pg_trigger_depth() > 1 then
    return;
  end if;

  insert into private.rate_limits as r (user_id, action, window_start, hits)
  values (uid, p_action, now(), 1)
  on conflict (user_id, action) do update
    set hits = case when r.window_start < now() - p_per then 1 else r.hits + 1 end,
        window_start = case when r.window_start < now() - p_per then now() else r.window_start end
  returning hits into current_hits;

  if current_hits > p_max then
    raise exception 'rate_limited' using hint = 'Too many requests, try again later.';
  end if;
end;
$$;

revoke all on function private.hit_rate_limit(text, integer, interval) from public, anon, authenticated;

-- Presets: replace the first migration's 20-per-day count with the shared
-- limiter, and add a burst limit.
drop trigger if exists presets_rate_limit on public.presets;
drop function if exists public.presets_rate_limit();

create function public.presets_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.hit_rate_limit('preset_burst', 3, interval '1 minute');
  perform private.hit_rate_limit('preset_daily', 20, interval '1 day');
  return new;
end;
$$;

create trigger presets_limits
  before insert on public.presets
  for each row execute function public.presets_limits();

-- Likes: liking and unliking both count (toggling is still a write each time).
create function public.preset_likes_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.hit_rate_limit('like', 120, interval '1 hour');
  return coalesce(new, old);
end;
$$;

create trigger preset_likes_limits
  before insert or delete on public.preset_likes
  for each row execute function public.preset_likes_limits();

-- Reports.
create function public.preset_reports_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.hit_rate_limit('report', 20, interval '1 day');
  return new;
end;
$$;

create trigger preset_reports_limits
  before insert on public.preset_reports
  for each row execute function public.preset_reports_limits();

-- Saved configurations (the Save button).
create function public.user_configs_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- An upsert fires both the insert and the update trigger: ~60 saves/hour.
  perform private.hit_rate_limit('config', 120, interval '1 hour');
  return new;
end;
$$;

create trigger user_configs_limits
  before insert or update on public.user_configs
  for each row execute function public.user_configs_limits();

-- Nickname changes.
create function public.profiles_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.display_name is distinct from old.display_name then
    perform private.hit_rate_limit('rename', 5, interval '1 day');
  end if;
  return new;
end;
$$;

create trigger profiles_limits
  before update on public.profiles
  for each row execute function public.profiles_limits();

revoke execute on function public.presets_limits() from public, anon, authenticated;
revoke execute on function public.preset_likes_limits() from public, anon, authenticated;
revoke execute on function public.preset_reports_limits() from public, anon, authenticated;
revoke execute on function public.user_configs_limits() from public, anon, authenticated;
revoke execute on function public.profiles_limits() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Inputs: a flat object of at most 64 short keys, each value a number, a
-- boolean, or a string of at most 32 characters. The browser re-validates
-- every value against the simulation's own config before using it
-- (utils/simulationUrl.js); this keeps junk and oversized payloads out of the
-- database in the first place.
-- ---------------------------------------------------------------------------

create function public.is_valid_inputs(inputs jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(inputs) = 'object'
    and (select count(*) from jsonb_object_keys(inputs)) between 1 and 64
    and not exists (
      select 1
      from jsonb_each(inputs) as e(key, value)
      where e.key !~ '^[A-Za-z0-9_]{1,40}$'
        or jsonb_typeof(e.value) not in ('number', 'boolean', 'string')
        or (jsonb_typeof(e.value) = 'string'
            and char_length(e.value #>> '{}') > 32)
    );
$$;

alter table public.presets
  add constraint presets_inputs_valid check (public.is_valid_inputs(inputs));
alter table public.user_configs
  add constraint user_configs_inputs_valid check (public.is_valid_inputs(inputs));

-- ---------------------------------------------------------------------------
-- 3. Preset text: no links (the classic spam payload), no control characters.
-- Presets can't be edited after publishing — no UI does it, and it would allow
-- a bait-and-switch after a preset collects likes or gets featured.
-- ---------------------------------------------------------------------------

alter table public.presets
  add constraint presets_title_clean
    check (title !~* '(https?://|www\.|[[:cntrl:]])'),
  add constraint presets_description_clean
    check (description !~* '(https?://|www\.)');

revoke update on public.presets from authenticated;
drop policy if exists "Authors edit their presets" on public.presets;
drop trigger if exists presets_touch_updated_at on public.presets;

-- ---------------------------------------------------------------------------
-- 4. Nicknames: unique regardless of case, and no posing as the site.
-- ---------------------------------------------------------------------------

create unique index profiles_display_name_lower
  on public.profiles (lower(display_name));

alter table public.profiles
  add constraint profiles_display_name_reserved
    check (lower(display_name) !~ '(physics ?hub|admin|moderator|official|staff|support)'),
  add constraint profiles_display_name_clean
    check (display_name !~ '[[:cntrl:]]');

-- The sign-up trigger must never fail (it would block the sign-up itself): a
-- GitHub handle that is too short, reserved or already taken falls back to a
-- pseudonym.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate text := left(btrim(coalesce(new.raw_user_meta_data ->> 'user_name', '')), 32);
  pseudonym text := 'Physicist-' || substr(md5(new.id::text), 1, 6);
begin
  if char_length(candidate) < 2
     or lower(candidate) ~ '(physics ?hub|admin|moderator|official|staff|support)'
     or candidate ~ '(https?://|www\.|<|>|[[:cntrl:]])'
     or exists (select 1 from public.profiles where lower(display_name) = lower(candidate))
  then
    candidate := pseudonym;
  end if;

  insert into public.profiles (id, display_name)
  values (new.id, candidate)
  on conflict do nothing;

  -- A pseudonym collision is astronomically unlikely, but never leave a user
  -- without a profile (every write references it).
  if not found then
    insert into public.profiles (id, display_name)
    values (new.id, 'Physicist-' || substr(md5(new.id::text || clock_timestamp()::text), 1, 8))
    on conflict do nothing;
  end if;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5. Likes and reports.
-- ---------------------------------------------------------------------------

drop policy if exists "Users like as themselves" on public.preset_likes;
create policy "Users like others' presets as themselves"
  on public.preset_likes for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and not exists (
      select 1 from public.presets p
      where p.id = preset_id and p.author_id = (select auth.uid())
    )
  );

-- Reporting needs an account at least a day old and can't target your own
-- preset. With three reports needed to hide a preset, this makes hiding
-- someone else's work with fresh throwaway accounts slow and visible.
create function public.preset_reports_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.presets
    where id = new.preset_id and author_id = new.user_id
  ) then
    raise exception 'cannot_report_own';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = new.user_id and created_at < now() - interval '1 day'
  ) then
    raise exception 'account_too_new';
  end if;
  return new;
end;
$$;

create trigger preset_reports_guard
  before insert on public.preset_reports
  for each row execute function public.preset_reports_guard();

revoke execute on function public.preset_reports_guard() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6. Least privilege on what's publicly readable: anonymous visitors only need
-- the columns the presets list shows.
-- ---------------------------------------------------------------------------

revoke select on public.presets from anon;
grant select (id, sim_id, title, description, inputs, author_id, likes_count,
              featured, hidden, created_at)
  on public.presets to anon;

revoke select on public.profiles from anon;
grant select (id, display_name) on public.profiles to anon;
