# Community backend (Supabase)

Accounts, community presets, likes/reports and cloud-saved configurations run on
one free Supabase project. The site stays a static export: the browser talks to
Supabase directly with the public anon key, and **all rules live in the
database** (`migrations/`), never in the client.

Without `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` the whole
community layer switches itself off, so forks and local checkouts need none of this.

## What the database enforces

| Threat                                        | Defence (migration)                                                                                                                                                                                                        |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reading someone's private data                | RLS: saved configs, likes and reports are readable only by their owner; anon sees only the public columns of presets and nicknames (column grants)                                                                         |
| Writing as someone else / to protected fields | RLS `with check (auth.uid())`; column grants make `featured`, `hidden` and the counters unwritable by users                                                                                                                |
| Spam / flooding                               | Per-user rate limits in the hidden `private` schema: presets 3/min & 20/day, likes 120/h, reports 20/day, saved configs ~60 saves/h, renames 5/day                                                                         |
| Malicious preset payloads                     | `inputs` must be a flat object of ≤64 short keys with number/boolean/≤32-char string values; the browser re-validates each value against the simulation's config (hex colours only, select values only from their options) |
| Link spam                                     | No URLs in preset titles/descriptions or nicknames                                                                                                                                                                         |
| Bait-and-switch                               | Presets can't be edited after publishing, only deleted                                                                                                                                                                     |
| Impersonation                                 | Nicknames unique (case-insensitive); nothing like "PhysicsHub", "admin", "moderator", "official"                                                                                                                           |
| Like inflation / griefing by report           | No liking your own presets; reporting needs an account ≥ 24 h old and never your own preset; 3 reports hide a preset pending review                                                                                        |
| GDPR                                          | Data export and self-service account deletion on `/account` (cascades to everything)                                                                                                                                       |

## One-time setup

1. **Create a project** at <https://supabase.com> (free plan; pick an EU region
   if most readers are in Europe). Tick _Enable automatic RLS_.
2. **Apply the schema** in order, in _SQL Editor → New query → Run_ (or
   `supabase db push` with the CLI linked to the project):
   1. `migrations/20260924000000_community.sql`
   2. `migrations/20260925000000_hardening.sql`
3. **Auth → URL Configuration**
   - Site URL: `https://physicshub.github.io`
   - Redirect URLs — exactly these, no broader wildcards:
     `https://physicshub.github.io/**`, `http://localhost:3000/**`, and your
     Vercel domain `https://<app>.vercel.app/**`.
4. **Auth → Providers**
   - _Email_: on by default (magic link). The built-in mailer is heavily
     rate-limited (a few emails per hour). For real traffic, add free SMTP
     under _Auth → SMTP Settings_ (e.g. Resend or Brevo free tiers).
   - _GitHub_: create an OAuth App at <https://github.com/settings/developers>
     with callback `https://<project-ref>.supabase.co/auth/v1/callback`; paste
     client id/secret. (This is a separate app from the blog editor's
     `GITHUB_CLIENT_ID`, whose callback points at `/api/auth/github/callback`.)
   - _Google_ (not enabled yet): create an OAuth client (Web) in Google Cloud
     Console with the same Supabase callback URL; paste client id/secret, then
     add `"google"` to `OAUTH_PROVIDERS` in `app/(core)/lib/supabase.ts` so the
     sign-in dialog shows its button.
   - Leave _Anonymous sign-ins_ **off**.
5. **Hardening settings** (dashboard, one-off):
   - _Project Settings → Data API → Max rows_: `100` (caps what any single
     request can return; the site never asks for more than 60).
   - _Database → Extensions_: disable `pg_graphql` if it is enabled — the site
     only uses the REST API, so it is attack surface for nothing.
   - _Authentication → Rate Limits_: keep the defaults (they cap sign-in
     emails and sign-ups per IP).
   - _Advisors → Security Advisor_: run it after the migrations; it should
     report no errors.
6. **Env vars** (_Project Settings → API Keys_: URL + **publishable** key, never
   the secret one):
   - local: `.env` or `.env.local`
   - GitHub Pages: repo _Settings → Secrets and variables → Actions →
     Variables_ → `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     (read by `release.yml` and `supabase-keepalive.yml`)
   - Vercel: _Project → Settings → Environment Variables_, same two names.

## Moderation (no dashboard to build)

Everything is in _Table Editor → presets_:

- **Feature a preset**: set `featured = true` (shown first, with a badge).
- **Review hidden presets**: filter `hidden = true`. They were reported by 3
  users. Set `hidden = false` to restore, or delete the row.
- **Ban a user**: _Authentication → Users → … → Ban_, or delete the user (cascades
  to everything they published).

## Staying free

- Free projects pause after ~7 days without requests. Normal traffic prevents
  it; `.github/workflows/supabase-keepalive.yml` pings every 3 days as a
  safety net.
- The site's request budget is small by design (see the header of
  `app/(core)/lib/community.ts`): the SDK isn't even downloaded for visitors
  who never signed in until they open sign-in or scroll to the presets; a
  simulation's presets cost one request per visit, only once the section is
  near the viewport.
- The free plan has a hard spend cap: exceeding a quota degrades the service
  until the next month, it never produces a bill.
