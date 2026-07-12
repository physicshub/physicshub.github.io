"use client";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

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
  const [auth, setAuth] = useState<AuthState>({ authenticated: false });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

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
      .then((res) => res.json())
      .then((data: AuthState) => {
        setAuth(data);
        onAuthChange?.(data);
      })
      .catch(() => setAuth({ authenticated: false }))
      .finally(() => setLoading(false));
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/github/logout", { method: "POST" });
    setAuth({ authenticated: false });
    onAuthChange?.({ authenticated: false });
  };

  if (loading) return null;

  if (!auth.authenticated) {
    return (
      <div className="auth-status-banner">
        {authError && <p className="auth-status-error">{authError}</p>}
        <a
          href="/api/auth/github"
          className="ph-btn ph-btn--primary auth-status-signin"
        >
          <FontAwesomeIcon icon={faGithub} /> Sign in with GitHub to publish
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
        Publishing as <strong>@{auth.username}</strong>
      </span>
      <button
        type="button"
        onClick={handleSignOut}
        className="ph-btn ph-btn--ghost auth-status-signout"
      >
        <FontAwesomeIcon icon={faSignOutAlt} /> Sign out
      </button>
    </div>
  );
}
