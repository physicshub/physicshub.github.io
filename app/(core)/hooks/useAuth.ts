"use client";
import { useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase, isCommunityEnabled } from "../lib/supabase";

// The signed-in community account, shared by every component on the page.
//
// Same shape as useCurriculum: a tiny external store instead of a context, so
// it needs no provider in the layout. The server and the first hydration pass
// see `ready: false, user: null`; the client fills it in once Supabase has read
// the stored session (or exchanged the `?code=` an OAuth / magic-link redirect
// brought back).

export type AuthProvider = "github" | "google";

export interface AuthUser {
  id: string;
  email: string | null;
  provider: string | null;
}

interface AuthState {
  ready: boolean;
  user: AuthUser | null;
  /** Public name from `profiles`; null until loaded. */
  displayName: string | null;
  /** The sign-in dialog is global, so any button on the page can open it. */
  signInOpen: boolean;
}

const SERVER_STATE: AuthState = {
  ready: false,
  user: null,
  displayName: null,
  signInOpen: false,
};

let state: AuthState = SERVER_STATE;
let initialised = false;
const listeners = new Set<() => void>();

const setState = (patch: Partial<AuthState>) => {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
};

const toUser = (session: Session | null): AuthUser | null =>
  session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? null,
        provider:
          (session.user.app_metadata?.provider as string | undefined) ?? null,
      }
    : null;

async function loadProfile(userId: string) {
  const supabase = await getSupabase();
  if (!supabase) return;
  const { data } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle();
  if (state.user?.id === userId) {
    setState({ displayName: data?.display_name ?? null });
  }
}

// After an OAuth / magic-link round trip the page URL still carries the
// one-time `?code=`; drop it so a reload or a copied link stays clean.
function stripAuthParams() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("code")) return;
  url.searchParams.delete("code");
  window.history.replaceState(window.history.state, "", url.toString());
}

const SESSION_STORAGE_KEY = "physicshub-auth"; // lib/supabase.ts storageKey

/** Is there anything for the SDK to restore or exchange on this page? */
function hasSessionToRestore(): boolean {
  try {
    if (new URL(window.location.href).searchParams.has("code")) return true;
    return window.localStorage.getItem(SESSION_STORAGE_KEY) !== null;
  } catch {
    return true; // storage blocked: let the SDK decide
  }
}

let listening = false;

/** Load the SDK and follow the session. Idempotent. */
async function attachAuth() {
  if (listening) return;
  listening = true;
  const supabase = await getSupabase();
  if (!supabase) {
    setState({ ready: true });
    return;
  }

  supabase.auth.onAuthStateChange((event, session) => {
    const next = toUser(session);
    const changedUser = next?.id !== state.user?.id;
    // Token refreshes re-emit the same user every hour: keep the old object so
    // nothing keyed on it re-renders or refetches.
    if (!changedUser && state.ready) {
      if (event === "SIGNED_IN") stripAuthParams();
      return;
    }
    setState({
      ready: true,
      user: next,
      displayName: changedUser ? null : state.displayName,
      signInOpen: next ? false : state.signInOpen,
    });
    if (event === "SIGNED_IN") stripAuthParams();
    // Deferred: calling Supabase inside this callback can deadlock the
    // client's auth lock.
    if (next && changedUser) setTimeout(() => loadProfile(next.id), 0);
  });
}

function init() {
  if (!isCommunityEnabled) {
    state = { ...state, ready: true };
    return;
  }
  // Most visitors have never signed in: for them the SDK isn't downloaded at
  // all until they open the sign-in dialog or a presets list needs it.
  if (hasSessionToRestore()) {
    attachAuth();
  } else {
    state = { ...state, ready: true };
  }
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = (): AuthState => {
  if (!initialised && typeof window !== "undefined") {
    initialised = true;
    init();
  }
  return state;
};

const getServerSnapshot = (): AuthState => SERVER_STATE;

// --- Actions ----------------------------------------------------------------

/** Where to come back after signing in: the page the reader is on. */
const returnUrl = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  return url.toString();
};

export function openSignIn() {
  if (!isCommunityEnabled) return;
  setState({ signInOpen: true });
  // Start downloading the SDK while the reader picks a method.
  attachAuth();
}

export function closeSignIn() {
  setState({ signInOpen: false });
}

export async function signInWithProvider(provider: AuthProvider) {
  const supabase = await getSupabase();
  if (!supabase) return { error: "disabled" };
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: returnUrl() },
  });
  return { error: error?.message ?? null };
}

/** Passwordless: emails a sign-in link that returns to this page. */
export async function signInWithEmail(email: string) {
  const supabase = await getSupabase();
  if (!supabase) return { error: "disabled" };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: returnUrl(), shouldCreateUser: true },
  });
  return { error: error?.message ?? null };
}

export async function signOut() {
  const supabase = await getSupabase();
  await supabase?.auth.signOut();
}

export async function refreshProfile() {
  if (state.user) await loadProfile(state.user.id);
}

export default function useAuth() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  return {
    ...snapshot,
    enabled: isCommunityEnabled,
    signedIn: Boolean(snapshot.user),
  };
}
