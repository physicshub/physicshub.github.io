"use client";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import useTranslation from "../hooks/useTranslation";

type AuthState = {
  authenticated: boolean;
  username?: string;
  avatarUrl?: string;
};

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  state_mismatch: "Sign-in failed a security check. Please try again.",
  missing_code: "GitHub didn't return an authorization code. Please try again.",
  server_not_configured: "GitHub sign-in isn't configured on this server yet.",
  token_exchange_failed:
    "Couldn't complete sign-in with GitHub. Please try again.",
  unexpected: "Something went wrong during sign-in. Please try again.",
};

export default function AuthStatus({
  onAuthChange,
}: {
  onAuthChange?: (state: AuthState) => void;
}) {
  const { t } = useTranslation();
  const [auth, setAuth] = useState<AuthState>({ authenticated: false });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  // /api/* only exists on a deploy that runs a server. On the static GitHub
  // Pages export the call 404s, and offering a sign-in button there would just
  // lead to another 404 — so tell the reader instead.
  const [apiAvailable, setApiAvailable] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get("auth_error");
    if (errorCode) {
      setAuthError(
        AUTH_ERROR_MESSAGES[errorCode] || "Sign-in failed. Please try again."
      );
      // Clean the error out of the URL so a refresh doesn't re-show it.
      params.delete("auth_error");
      const newSearch = params.toString();
      window.history.replaceState(
        {},
        "",
        window.location.pathname + (newSearch ? `?${newSearch}` : "")
      );
    }

    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error(`/api/auth/me returned ${res.status}`);
        return res.json();
      })
      .then((data: AuthState) => {
        setAuth(data);
        onAuthChange?.(data);
      })
      .catch(() => {
        setApiAvailable(false);
        setAuth({ authenticated: false });
      })
      .finally(() => setLoading(false));
    // Deliberately runs once on mount: onAuthChange reports the initial session
    // check, and re-running it on every parent render would refetch in a loop.
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/github/logout", { method: "POST" });
    setAuth({ authenticated: false });
    onAuthChange?.({ authenticated: false });
  };

  if (loading) return null;

  if (!apiAvailable) {
    return (
      <div className="auth-status-banner">
        <p className="auth-status-error">
          {t(
            "Publishing from the editor isn't available on this version of the site. You can still propose an article by opening a pull request."
          )}
        </p>
      </div>
    );
  }

  if (!auth.authenticated) {
    return (
      <div className="auth-status-banner">
        {authError && <p className="auth-status-error">{t(authError)}</p>}
        <a
          href="/api/auth/github"
          className="ph-btn ph-btn--primary auth-status-signin"
        >
          <FontAwesomeIcon icon={faGithub} />{" "}
          {t("Sign in with GitHub to publish")}
        </a>
      </div>
    );
  }

  return (
    <div className="auth-status-banner auth-status-signed-in">
      {auth.avatarUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={auth.avatarUrl}
          alt={auth.username}
          className="auth-status-avatar"
        />
      )}
      <span>
        {t("Publishing as")} <strong>@{auth.username}</strong>
      </span>
      <button
        type="button"
        onClick={handleSignOut}
        className="ph-btn ph-btn--ghost auth-status-signout"
      >
        <FontAwesomeIcon icon={faSignOutAlt} /> {t("Sign out")}
      </button>
    </div>
  );
}
