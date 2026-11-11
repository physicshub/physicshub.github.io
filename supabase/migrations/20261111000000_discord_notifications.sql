-- PhysicsHub community — Discord notifications (run after
-- 20260926000000_official_presets.sql).
--
-- Every community event posts an embed to the maintainers' Discord. It is sent
-- by the database itself (pg_net), not by the browser: nobody can fake or
-- suppress an event, the webhook URLs stay secret (Supabase Vault), and it
-- works on the static GitHub Pages export. pg_net queues the request inside
-- the user's transaction, so a write that fails (rate limit, check, RLS)
-- never notifies.
--
-- Setup (once, SQL Editor):
--   select vault.create_secret('https://discord.com/api/webhooks/…', 'discord_webhook_activity');
--   select vault.create_secret('https://discord.com/api/webhooks/…', 'discord_webhook_moderation');
-- `moderation` (reports, auto-hide, maintainer actions, rate limits) falls back
-- to `activity` when unset; with neither set nothing is sent.
--
-- Channel   Event
-- activity  new account · nickname change · account deleted · new preset ·
--           preset deleted · like · unlike · like milestone · first cloud save
--           (blog proposals come from app/api/publish, not from here)
-- moderation report · auto-hidden preset · featured/hidden by a maintainer ·
--           rate limit hit (via report_rate_limit(), see section 4)

create extension if not exists pg_net with schema extensions;

-- ---------------------------------------------------------------------------
-- 1. Sending and embed building blocks
-- ---------------------------------------------------------------------------

create function private.discord_post(p_channel text, p_embed jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  url text;
begin
  select decrypted_secret into url
  from vault.decrypted_secrets
  where name in ('discord_webhook_' || p_channel, 'discord_webhook_activity')
  order by name = 'discord_webhook_' || p_channel desc
  limit 1;
  if url is null then
    return;
  end if;

  perform net.http_post(
    url := url,
    body := jsonb_build_object(
      'username', 'PhysicsHub',
      -- user text reaches the embed: never let it ping @everyone or a role
      'allowed_mentions', jsonb_build_object('parse', '[]'::jsonb),
      'embeds', jsonb_build_array(p_embed)
    ),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
exception when others then
  -- A notification must never block the user's action.
  raise warning 'discord_post failed: %', sqlerrm;
end;
$$;

create function private.embed(
  p_title text, p_color integer, p_description text, p_fields jsonb,
  p_url text default null, p_footer text default null
)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'title', left(p_title, 256),
    'url', p_url,
    'color', p_color,
    'description', left(p_description, 4096),
    'fields', p_fields,
    'footer', jsonb_build_object('text', coalesce(p_footer, 'PhysicsHub community')),
    'timestamp', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  ));
$$;

create function private.field(p_name text, p_value text, p_inline boolean default true)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select jsonb_build_object(
    'name', p_name,
    'value', left(coalesce(nullif(btrim(p_value), ''), '—'), 1024),
    'inline', p_inline
  );
$$;

-- User text is shown literally: escape Discord markdown.
create function private.md(p text)
returns text
language sql
immutable
set search_path = ''
as $$
  select regexp_replace(coalesce(p, ''), '([\\*_~`|>\[\]])', '\\\1', 'g');
$$;

-- Discord renders <t:…:R> as a live relative time ("3 days ago").
create function private.ago(p timestamptz)
returns text
language sql
immutable
set search_path = ''
as $$
  select format('<t:%s:R>', floor(extract(epoch from p))::bigint);
$$;

create function private.nick(p_user uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select '**' || private.md(display_name) || '**' from public.profiles where id = p_user),
    '_deleted user_'
  );
$$;

create function private.urlencode(p text)
returns text
language sql
immutable
set search_path = ''
as $$
  select coalesce(string_agg(
    case when ch ~ '^[A-Za-z0-9_.~-]$' then ch
         else regexp_replace(upper(encode(convert_to(ch, 'UTF8'), 'hex')), '(..)', '%\1', 'g')
    end, '' order by ord), '')
  from unnest(string_to_array(p, null)) with ordinality as t(ch, ord);
$$;

create function private.sim_link(p_sim text)
returns text
language sql
immutable
set search_path = ''
as $$
  select format('[%s](https://physicshub.github.io/simulations/%s)', p_sim, p_sim);
$$;

-- The simulation opened with the preset's values (utils/simulationUrl.js reads them).
create function private.preset_url(p_sim text, p_inputs jsonb)
returns text
language sql
immutable
set search_path = ''
as $$
  select 'https://physicshub.github.io/simulations/' || p_sim || coalesce('?' || (
    select string_agg(private.urlencode(key) || '=' || private.urlencode(value #>> '{}'), '&' order by key)
    from jsonb_each(p_inputs)
  ), '');
$$;

create function private.preset_values(p_inputs jsonb)
returns text
language sql
immutable
set search_path = ''
as $$
  select string_agg(format('`%s` = %s', key, private.md(value #>> '{}')), E'\n' order by key)
  from jsonb_each(p_inputs);
$$;

-- Colours: green 0x22c55e, blue 0x3b82f6, grey 0x6b7280, purple 0x8b5cf6,
-- pink 0xec4899, light grey 0x9ca3af, gold 0xf59e0b, orange 0xf97316, red 0xef4444.

-- ---------------------------------------------------------------------------
-- 2. Accounts
-- ---------------------------------------------------------------------------

-- 🎉 New account. Never the email: many users are students.
create function private.notify_profile_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  provider text;
begin
  select coalesce(raw_app_meta_data ->> 'provider', 'email') into provider
  from auth.users where id = new.id;

  perform private.discord_post('activity', private.embed(
    '🎉 New account', 2278750,
    format('%s just joined PhysicsHub.', private.nick(new.id)),
    jsonb_build_array(
      private.field('Signed in with', case provider
        when 'github' then 'GitHub' when 'google' then 'Google'
        when 'email' then 'Email link' else initcap(provider) end),
      private.field('Nickname', case when new.display_name like 'Physicist-%'
        then 'Pseudonym (auto)' else 'GitHub handle' end),
      private.field('Members', (select count(*) from public.profiles)::text)
    ),
    null, 'User ' || left(new.id::text, 8)
  ));
  return null;
end;
$$;

create trigger profiles_notify_created
  after insert on public.profiles
  for each row execute function private.notify_profile_created();

-- ✏️ Nickname change.
create function private.notify_profile_renamed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.discord_post('activity', private.embed(
    '✏️ Nickname changed', 3900150,
    format('**%s** → **%s**', private.md(old.display_name), private.md(new.display_name)),
    jsonb_build_array(
      private.field('Member since', private.ago(new.created_at)),
      private.field('Presets', (select count(*) from public.presets where author_id = new.id)::text)
    ),
    null, 'User ' || left(new.id::text, 8)
  ));
  return null;
end;
$$;

create trigger profiles_notify_renamed
  after update of display_name on public.profiles
  for each row
  when (old.display_name is distinct from new.display_name)
  execute function private.notify_profile_renamed();

-- 👋 Account deleted. Before delete, so its presets and likes can still be counted.
create function private.notify_profile_deleted()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.discord_post('activity', private.embed(
    '👋 Account deleted', 7041664,
    format('**%s** %s.', private.md(old.display_name),
      case when auth.uid() is null then 'was deleted from the dashboard' else 'deleted their account' end),
    jsonb_build_array(
      private.field('Member since', private.ago(old.created_at)),
      private.field('Presets removed', (select count(*) from public.presets where author_id = old.id)::text),
      private.field('Likes received', (select coalesce(sum(likes_count), 0) from public.presets where author_id = old.id)::text),
      private.field('Likes given', (select count(*) from public.preset_likes where user_id = old.id)::text),
      private.field('Saved configs', (select count(*) from public.user_configs where user_id = old.id)::text),
      private.field('Members left', ((select count(*) from public.profiles) - 1)::text)
    ),
    null, 'User ' || left(old.id::text, 8)
  ));
  return old;
end;
$$;

create trigger profiles_notify_deleted
  before delete on public.profiles
  for each row execute function private.notify_profile_deleted();

-- ---------------------------------------------------------------------------
-- 3. Presets, likes, reports, saved configs
--
-- Rows removed by a cascade (a deleted preset takes its likes, a deleted
-- account takes everything) run at trigger depth > 1 and are not notified:
-- the parent's own embed already says it.
-- ---------------------------------------------------------------------------

-- ✨ New preset.
create function private.notify_preset_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.discord_post('activity', private.embed(
    '✨ New preset: ' || new.title, 9133302,
    coalesce(nullif(private.md(new.description), ''), '_No description._'),
    jsonb_build_array(
      private.field('Simulation', private.sim_link(new.sim_id)),
      private.field('Author', private.nick(new.author_id)),
      private.field('Author''s presets', (select count(*) from public.presets where author_id = new.author_id)::text),
      private.field('Values it sets', private.preset_values(new.inputs), false),
      private.field('Try it', format('[Open with these values](%s)', private.preset_url(new.sim_id, new.inputs)), false)
    ),
    private.preset_url(new.sim_id, new.inputs),
    case when new.featured then '⭐ Featured · ' else '' end || 'Preset ' || new.id
  ));
  return null;
end;
$$;

create trigger presets_notify_created
  after insert on public.presets
  for each row execute function private.notify_preset_created();

-- 🗑️ Preset deleted (by its author or from the dashboard).
create function private.notify_preset_deleted()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if pg_trigger_depth() > 1 then
    return null;
  end if;
  perform private.discord_post('activity', private.embed(
    '🗑️ Preset deleted: ' || old.title, 7041664,
    format('%s %s.', private.nick(old.author_id),
      case when auth.uid() = old.author_id then 'deleted their preset'
           else 'had a preset deleted from the dashboard' end),
    jsonb_build_array(
      private.field('Simulation', private.sim_link(old.sim_id)),
      private.field('Likes', old.likes_count::text),
      private.field('Reports', old.reports_count::text),
      private.field('Published', private.ago(old.created_at))
    ),
    null, 'Preset ' || old.id
  ));
  return null;
end;
$$;

create trigger presets_notify_deleted
  after delete on public.presets
  for each row execute function private.notify_preset_deleted();

-- ❤️ Like · 💔 unlike · 🏆 milestone. Named after preset_likes_count, so the
-- counter is already updated when this runs (same-event triggers fire by name).
create function private.notify_preset_like()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  like_row public.preset_likes := coalesce(new, old);
  preset public.presets;
begin
  if pg_trigger_depth() > 1 then
    return null;
  end if;
  select * into preset from public.presets where id = like_row.preset_id;
  if not found then
    return null;
  end if;

  perform private.discord_post('activity', private.embed(
    case when tg_op = 'INSERT' then '❤️ New like' else '💔 Like removed' end,
    case when tg_op = 'INSERT' then 15485081 else 10265519 end,
    format('%s %s **%s** by %s.', private.nick(like_row.user_id),
      case when tg_op = 'INSERT' then 'liked' else 'unliked' end,
      private.md(preset.title), private.nick(preset.author_id)),
    jsonb_build_array(
      private.field('Simulation', private.sim_link(preset.sim_id)),
      private.field('Total likes', preset.likes_count::text)
    ),
    private.preset_url(preset.sim_id, preset.inputs), 'Preset ' || preset.id
  ));

  if tg_op = 'INSERT' and preset.likes_count in (10, 25, 50, 100, 250, 500, 1000) then
    perform private.discord_post('activity', private.embed(
      format('🏆 %s likes!', preset.likes_count), 16096779,
      format('**%s** by %s just reached **%s likes**.',
        private.md(preset.title), private.nick(preset.author_id), preset.likes_count),
      jsonb_build_array(
        private.field('Simulation', private.sim_link(preset.sim_id)),
        private.field('Published', private.ago(preset.created_at)),
        private.field('Featured', case when preset.featured then 'Yes' else 'Not yet' end)
      ),
      private.preset_url(preset.sim_id, preset.inputs), 'Preset ' || preset.id
    ));
  end if;
  return null;
end;
$$;

create trigger preset_likes_notify
  after insert or delete on public.preset_likes
  for each row execute function private.notify_preset_like();

-- 🚩 Report. Named after preset_reports_count, so the count is current.
create function private.notify_preset_reported()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  preset public.presets;
  reporter_since timestamptz;
begin
  select * into preset from public.presets where id = new.preset_id;
  select created_at into reporter_since from public.profiles where id = new.user_id;

  perform private.discord_post('moderation', private.embed(
    '🚩 Preset reported: ' || preset.title, 16347926,
    coalesce('> ' || nullif(private.md(new.reason), ''), '_No reason given._'),
    jsonb_build_array(
      private.field('Simulation', private.sim_link(preset.sim_id)),
      private.field('Author', private.nick(preset.author_id)),
      private.field('Reported by', private.nick(new.user_id)),
      private.field('Reporter member since', private.ago(reporter_since)),
      private.field('Reports', format('%s / 3%s', preset.reports_count,
        case when preset.hidden then ' · hidden' else '' end)),
      private.field('Likes', preset.likes_count::text),
      private.field('Preset ID', '`' || preset.id || '`', false)
    ),
    private.preset_url(preset.sim_id, preset.inputs), 'Moderation'
  ));
  return null;
end;
$$;

create trigger preset_reports_notify
  after insert on public.preset_reports
  for each row execute function private.notify_preset_reported();

-- 🚫 Auto-hidden (third report) · 🛠️ featured / hidden / restored by a maintainer.
create function private.notify_preset_moderated()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  changes text[] := '{}';
begin
  if new.hidden and not old.hidden and new.reports_count > old.reports_count then
    perform private.discord_post('moderation', private.embed(
      '🚫 Preset auto-hidden: ' || new.title, 15680580,
      format('**%s** by %s was hidden after %s reports. It stays hidden until a maintainer reviews it.',
        private.md(new.title), private.nick(new.author_id), new.reports_count),
      jsonb_build_array(
        private.field('Simulation', private.sim_link(new.sim_id)),
        private.field('Likes', new.likes_count::text),
        private.field('Published', private.ago(new.created_at)),
        private.field('Reports', (
          select string_agg(format('• %s: %s', private.nick(user_id),
            coalesce(nullif(private.md(reason), ''), '_no reason_')), E'\n' order by created_at)
          from public.preset_reports where preset_id = new.id), false),
        private.field('Review', format(
          'Table Editor → presets → id `%s` → set `hidden = false` to restore, or delete the row.', new.id), false)
      ),
      private.preset_url(new.sim_id, new.inputs), 'Moderation'
    ));
    return null;
  end if;

  if new.featured is distinct from old.featured then
    changes := changes || case when new.featured then '⭐ featured' else 'unfeatured' end;
  end if;
  if new.hidden is distinct from old.hidden then
    changes := changes || case when new.hidden then '🙈 hidden' else '♻️ restored' end;
  end if;

  perform private.discord_post('moderation', private.embed(
    '🛠️ Preset ' || array_to_string(changes, ' and ') || ': ' || new.title,
    case when new.hidden then 7041664 else 2278750 end,
    format('A maintainer changed **%s** by %s.', private.md(new.title), private.nick(new.author_id)),
    jsonb_build_array(
      private.field('Simulation', private.sim_link(new.sim_id)),
      private.field('Featured', case when new.featured then 'Yes' else 'No' end),
      private.field('Visible', case when new.hidden then 'No' else 'Yes' end),
      private.field('Likes', new.likes_count::text),
      private.field('Reports', new.reports_count::text)
    ),
    private.preset_url(new.sim_id, new.inputs), 'Moderation · Preset ' || new.id
  ));
  return null;
end;
$$;

-- The column list + WHEN keep the like/report counter updates from firing it.
create trigger presets_notify_moderated
  after update of featured, hidden on public.presets
  for each row
  when (old.featured is distinct from new.featured or old.hidden is distinct from new.hidden)
  execute function private.notify_preset_moderated();

-- ☁️ First cloud save of a simulation (an upsert's insert; re-saves are updates).
create function private.notify_config_saved()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.discord_post('activity', private.embed(
    '☁️ First cloud save', 3900150,
    format('%s saved their %s setup to their account.', private.nick(new.user_id), private.sim_link(new.sim_id)),
    jsonb_build_array(
      private.field('Simulations saved', (select count(*) from public.user_configs where user_id = new.user_id)::text)
    ),
    null, 'User ' || left(new.user_id::text, 8)
  ));
  return null;
end;
$$;

create trigger user_configs_notify_saved
  after insert on public.user_configs
  for each row execute function private.notify_config_saved();

-- ---------------------------------------------------------------------------
-- 4. Rate limits. hit_rate_limit raises, which rolls back everything in the
-- transaction — a notification queued there included. So the browser calls
-- report_rate_limit() after it gets `rate_limited` (lib/community.ts), and it
-- alerts only for counters that really are at their limit, once per window.
-- ---------------------------------------------------------------------------

alter table private.rate_limits
  add column max_hits integer,
  add column per interval;

create or replace function private.hit_rate_limit(p_action text, p_max integer, p_per interval)
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

  insert into private.rate_limits as r (user_id, action, window_start, hits, max_hits, per)
  values (uid, p_action, now(), 1, p_max, p_per)
  on conflict (user_id, action) do update
    set hits = case when r.window_start < now() - p_per then 1 else r.hits + 1 end,
        window_start = case when r.window_start < now() - p_per then now() else r.window_start end,
        max_hits = p_max,
        per = p_per
  returning hits into current_hits;

  if current_hits > p_max then
    raise exception 'rate_limited' using hint = 'Too many requests, try again later.';
  end if;
end;
$$;

create table private.rate_limit_alerts (
  user_id uuid not null,
  action text not null,
  window_start timestamptz not null,
  primary key (user_id, action, window_start)
);

create function public.report_rate_limit()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  hit record;
  lines text[] := '{}';
begin
  if uid is null then
    return;
  end if;

  for hit in
    insert into private.rate_limit_alerts (user_id, action, window_start)
    select user_id, action, window_start from private.rate_limits
    where user_id = uid and hits >= max_hits and window_start > now() - per
    on conflict do nothing
    returning action, window_start
  loop
    lines := lines || (
      select format('• `%s`: %s per %s, window opened %s', r.action, r.max_hits,
        case r.per when interval '1 minute' then 'minute' when interval '1 hour' then 'hour'
                   when interval '1 day' then 'day' else r.per::text end,
        private.ago(r.window_start))
      from private.rate_limits r where r.user_id = uid and r.action = hit.action);
  end loop;

  if cardinality(lines) = 0 then
    return;
  end if;

  perform private.discord_post('moderation', private.embed(
    '⏱️ Rate limit hit', 15680580,
    format('%s was blocked for doing something too often.', private.nick(uid)),
    jsonb_build_array(
      private.field('Limits reached', array_to_string(lines, E'\n'), false),
      private.field('Member since', (select private.ago(created_at) from public.profiles where id = uid)),
      private.field('Presets today', (select count(*) from public.presets
        where author_id = uid and created_at > now() - interval '1 day')::text),
      private.field('User ID', '`' || uid || '`', false)
    ),
    null, 'Moderation'
  ));
end;
$$;

revoke all on function public.report_rate_limit() from public, anon;
grant execute on function public.report_rate_limit() to authenticated;

-- Everything in `private` is internal (triggers and helpers).
revoke all on all functions in schema private from public, anon, authenticated;
