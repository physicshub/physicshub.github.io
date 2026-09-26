// app/(core)/lib/community.ts
//
// Every read and write of the community tables goes through here, so the
// components never build queries themselves. The rules (who may write what,
// rate limits, auto-hiding reported presets) live in the database — see
// supabase/migrations — and these helpers only surface their errors.
//
// Request budget — keep it this way, the anon key is public and every request
// counts against the free quota:
//   - a simulation's presets: 1 request per visit (cached 5 min), sorted and
//     paged in the browser; the section only asks once it is near the viewport;
//   - "which did I like": 1 request per list, only when signed in;
//   - saved configurations: 1 request per session for all simulations;
//   - the profile: 1 request per sign-in.
"use client";
import { getSupabase } from "./supabase";

export type PresetInputs = Record<string, string | number | boolean>;

export interface Preset {
  id: string;
  sim_id: string;
  title: string;
  description: string;
  inputs: PresetInputs;
  author_id: string;
  likes_count: number;
  featured: boolean;
  hidden: boolean;
  created_at: string;
  author: { display_name: string } | null;
}

export type PresetSort = "top" | "new";

/** Cards shown per "Show more" step (client-side; see listPresets). */
export const PRESET_PAGE_SIZE = 12;
/** Presets fetched per simulation, in one request, then sorted in the browser. */
export const PRESET_FETCH_LIMIT = 60;
/** How long a fetched list is reused before the next visit refetches it. */
const PRESET_CACHE_MS = 5 * 60 * 1000;
export const PRESET_TITLE_MAX = 80;
export const PRESET_DESCRIPTION_MAX = 500;

// The author join names its foreign key: presets and profiles are also linked
// through preset_likes and preset_reports, and PostgREST refuses to guess.
const PRESET_COLUMNS =
  "id, sim_id, title, description, inputs, author_id, likes_count, featured, hidden, created_at, author:profiles!presets_author_id_fkey(display_name)";

type Result<T> = { data: T; error: string | null };

async function client() {
  const supabase = await getSupabase();
  if (!supabase) throw new Error("Community features are not configured.");
  return supabase;
}

// Database errors are terse; turn the ones a user can act on into sentences.
// The rate-limit and rule names come from the triggers in supabase/migrations.
// Components show these through t(); the i18n marker comment before each one
// is what lets `npm run i18n:extract` find them.
function friendly(message: string | undefined | null): string | null {
  if (!message) return null;
  if (message.includes("rate_limited"))
    return /* i18n */ "You're doing that too often. Please wait a while and try again.";
  if (message.includes("account_too_new"))
    return /* i18n */ "New accounts can report presets after 24 hours.";
  if (
    message.includes("display_name_taken") ||
    message.includes("profiles_display_name_lower")
  )
    return /* i18n */ "That nickname is already taken.";
  if (message.includes("duplicate key"))
    return /* i18n */ "You've already done that for this preset.";
  if (message.includes("violates check constraint"))
    return /* i18n */ "Some of the text isn't allowed (too long, too short, or it contains a link).";
  if (message.includes("row-level security"))
    return /* i18n */ "You can't do that.";
  if (message.includes("JWT") || message.includes("not_authenticated"))
    return /* i18n */ "Your session expired. Please sign in again.";
  return message;
}

// --- Presets ----------------------------------------------------------------

// One request per simulation per visit: the list is fetched once (the best
// PRESET_FETCH_LIMIT by the "top" order), cached in memory, and both orders
// plus "Show more" are computed from it in the browser. Switching Top/New or
// paging never touches the network; only a publish/delete invalidates it.
const presetCache = new Map<string, { at: number; data: Preset[] }>();
const presetInflight = new Map<string, Promise<Result<Preset[]>>>();

export function listPresets(simId: string): Promise<Result<Preset[]>> {
  const cached = presetCache.get(simId);
  if (cached && Date.now() - cached.at < PRESET_CACHE_MS) {
    return Promise.resolve({ data: cached.data, error: null });
  }
  // Two callers at once (a remount, StrictMode) share one request.
  const pending = presetInflight.get(simId);
  if (pending) return pending;

  const request = (async () => {
    const { data, error } = await (await client())
      .from("presets")
      .select(PRESET_COLUMNS)
      .eq("sim_id", simId)
      .eq("hidden", false)
      .order("featured", { ascending: false })
      .order("likes_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(PRESET_FETCH_LIMIT);

    const presets = (data as unknown as Preset[]) ?? [];
    if (!error) presetCache.set(simId, { at: Date.now(), data: presets });
    return { data: presets, error: friendly(error?.message) };
  })().finally(() => presetInflight.delete(simId));

  presetInflight.set(simId, request);
  return request;
}

/** Drop a simulation's cached list (after a publish or delete). */
export function invalidatePresets(simId: string) {
  presetCache.delete(simId);
}

/** Keep the cached list in step with local edits (likes) without refetching. */
export function updateCachedPreset(
  simId: string,
  id: string,
  patch: Partial<Preset>
) {
  const cached = presetCache.get(simId);
  if (!cached) return;
  cached.data = cached.data.map((p) => (p.id === id ? { ...p, ...patch } : p));
}

/** Order a fetched list for display. Ties fall back to newest first. */
export function sortPresets(presets: Preset[], sort: PresetSort): Preset[] {
  const newest = (a: Preset, b: Preset) =>
    b.created_at.localeCompare(a.created_at);
  return [...presets].sort(
    sort === "top"
      ? (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          b.likes_count - a.likes_count ||
          newest(a, b)
      : newest
  );
}

export async function listMyPresets(userId: string): Promise<Result<Preset[]>> {
  const { data, error } = await (await client())
    .from("presets")
    .select(PRESET_COLUMNS)
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);
  return {
    data: (data as unknown as Preset[]) ?? [],
    error: friendly(error?.message),
  };
}

export async function publishPreset(preset: {
  simId: string;
  title: string;
  description: string;
  inputs: PresetInputs;
}): Promise<Result<Preset | null>> {
  const { data, error } = await (
    await client()
  )
    .from("presets")
    .insert({
      sim_id: preset.simId,
      title: preset.title.trim(),
      description: preset.description.trim(),
      inputs: preset.inputs,
    })
    .select(PRESET_COLUMNS)
    .single();
  if (!error) invalidatePresets(preset.simId);
  return {
    data: (data as unknown as Preset) ?? null,
    error: friendly(error?.message),
  };
}

export async function deletePreset(
  id: string,
  simId: string
): Promise<Result<null>> {
  const { error } = await (await client())
    .from("presets")
    .delete()
    .eq("id", id);
  if (!error) invalidatePresets(simId);
  return { data: null, error: friendly(error?.message) };
}

// --- Likes & reports ----------------------------------------------------------

/** Which of these presets the signed-in user has liked. */
export async function getMyLikes(
  presetIds: string[]
): Promise<Result<Set<string>>> {
  if (presetIds.length === 0) return { data: new Set(), error: null };
  const { data, error } = await (await client())
    .from("preset_likes")
    .select("preset_id")
    .in("preset_id", presetIds);
  return {
    data: new Set((data ?? []).map((row) => row.preset_id as string)),
    error: friendly(error?.message),
  };
}

export async function setLiked(
  presetId: string,
  liked: boolean,
  userId: string
): Promise<Result<null>> {
  const supabase = await client();
  const { error } = liked
    ? await supabase.from("preset_likes").insert({ preset_id: presetId })
    : await supabase
        .from("preset_likes")
        .delete()
        .eq("preset_id", presetId)
        .eq("user_id", userId);
  return { data: null, error: friendly(error?.message) };
}

export async function reportPreset(
  presetId: string,
  reason: string
): Promise<Result<null>> {
  const { error } = await (await client())
    .from("preset_reports")
    .insert({ preset_id: presetId, reason: reason.slice(0, 200) });
  return { data: null, error: friendly(error?.message) };
}

// --- Saved configurations (the Save button, across devices) --------------------

// Every saved configuration of the user arrives in one request per session
// (a user has at most one row per simulation, each a few hundred bytes); the
// Save/Delete buttons then keep this copy in step instead of refetching.
let configCache: {
  userId: string;
  configs: Promise<Map<string, PresetInputs>>;
} | null = null;

function loadConfigs(userId: string) {
  if (configCache?.userId !== userId) {
    const configs = (async () => {
      const { data, error } = await (await client())
        .from("user_configs")
        .select("sim_id, inputs");
      if (error) {
        configCache = null; // retry on the next call
        return new Map<string, PresetInputs>();
      }
      return new Map(
        (data ?? []).map((row) => [
          row.sim_id as string,
          row.inputs as PresetInputs,
        ])
      );
    })();
    configCache = { userId, configs };
  }
  return configCache!.configs;
}

export async function getCloudConfig(
  userId: string,
  simId: string
): Promise<Result<PresetInputs | null>> {
  const configs = await loadConfigs(userId);
  return { data: configs.get(simId) ?? null, error: null };
}

export async function saveCloudConfig(
  userId: string,
  simId: string,
  inputs: PresetInputs
): Promise<Result<null>> {
  const { error } = await (await client())
    .from("user_configs")
    .upsert(
      { sim_id: simId, inputs, updated_at: new Date().toISOString() },
      { onConflict: "user_id,sim_id" }
    );
  if (!error) (await loadConfigs(userId)).set(simId, inputs);
  return { data: null, error: friendly(error?.message) };
}

export async function deleteCloudConfig(
  userId: string,
  simId: string
): Promise<Result<null>> {
  const { error } = await (await client())
    .from("user_configs")
    .delete()
    .eq("sim_id", simId);
  if (!error) (await loadConfigs(userId)).delete(simId);
  return { data: null, error: friendly(error?.message) };
}

// --- Account --------------------------------------------------------------------

export async function updateDisplayName(
  userId: string,
  displayName: string
): Promise<Result<null>> {
  const { error } = await (await client())
    .from("profiles")
    .update({ display_name: displayName.trim() })
    .eq("id", userId);
  return { data: null, error: friendly(error?.message) };
}

/** Everything stored about the user, as one JSON document (GDPR export). */
export async function exportMyData(userId: string) {
  const supabase = await client();
  const [profile, presets, configs, likes, reports] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("presets").select("*").eq("author_id", userId),
    supabase.from("user_configs").select("*"),
    supabase.from("preset_likes").select("*"),
    supabase.from("preset_reports").select("*"),
  ]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return {
    exportedAt: new Date().toISOString(),
    account: { id: user?.id, email: user?.email, created_at: user?.created_at },
    profile: profile.data,
    presets: presets.data,
    savedConfigs: configs.data,
    likes: likes.data,
    reports: reports.data,
  };
}

export async function deleteMyAccount(): Promise<Result<null>> {
  const supabase = await client();
  const { error } = await supabase.rpc("delete_my_account");
  // The user no longer exists server-side, so only the local session is cleared.
  if (!error) {
    configCache = null;
    await supabase.auth.signOut({ scope: "local" });
  }
  return { data: null, error: friendly(error?.message) };
}
