// app/(core)/lib/supabase.ts
//
// The browser's Supabase client. The site is a static export, so there is no
// server in between: the client uses the public anon key and everything is
// enforced by Row Level Security (supabase/migrations/*). Without the two env
// vars the whole community layer switches itself off — no buttons, no
// requests — so forks and local checkouts work unchanged.
//
// The SDK is loaded with a dynamic import, on first use after hydration, so it
// never weighs on the first paint of any page (the header needs the session,
// but not before the page is interactive).
"use client";
import type { SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * OAuth providers offered in the sign-in dialog. List only the ones enabled
 * under Authentication → Providers in Supabase, or the button leads to an
 * error. Email magic links are always offered. Add "google" once configured.
 */
export const OAUTH_PROVIDERS: readonly ("github" | "google")[] = ["github"];

/** Build-time constant: true only when the deploy has Supabase configured. */
export const isCommunityEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let clientPromise: Promise<SupabaseClient | null> | null = null;

/** The shared client, or null on the server / when the community is off. */
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!isCommunityEnabled || typeof window === "undefined") {
    return Promise.resolve(null);
  }
  clientPromise ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: {
        flowType: "pkce",
        persistSession: true,
        autoRefreshToken: true,
        // OAuth and magic links land back on whatever page started them with
        // a `?code=`; the client exchanges it for a session on load.
        detectSessionInUrl: true,
        storageKey: "physicshub-auth",
      },
    })
  );
  return clientPromise;
}
