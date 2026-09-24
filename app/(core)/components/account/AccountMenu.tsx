"use client";
// Header control for the community account. Renders nothing when the deploy has
// no Supabase configured (a build-time constant, so no layout shift). The
// trigger is a fixed-size icon button in every state — signed out, loading,
// signed in — so the header never moves when the session resolves.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleUser,
  faRightFromBracket,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";
import useTranslation from "../../hooks/useTranslation";
import useAuth, { openSignIn, signOut } from "../../hooks/useAuth";
import SignInDialog from "./SignInDialog";

export default function AccountMenu() {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const { enabled, ready, user, displayName } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (!enabled) return null;

  const initial = (displayName ?? "").trim().charAt(0).toUpperCase();
  const label = user
    ? `${t("Account")}: ${displayName ?? ""}`.trim()
    : t("Sign in");

  return (
    <div
      ref={containerRef}
      className={`account-menu ${isCompleted ? "notranslate" : ""}`.trim()}
    >
      <button
        type="button"
        className="account-menu__trigger"
        aria-label={label}
        title={label}
        aria-haspopup={user ? "menu" : "dialog"}
        aria-expanded={user ? open : undefined}
        aria-busy={!ready}
        onClick={() => (user ? setOpen((v) => !v) : openSignIn())}
      >
        {user && initial ? (
          <span className="account-menu__initial notranslate">{initial}</span>
        ) : (
          <FontAwesomeIcon icon={faCircleUser} />
        )}
      </button>

      {open && user ? (
        // data-clarity-mask: keep the email and nickname out of Microsoft
        // Clarity session recordings (app/layout.tsx loads Clarity).
        <div
          className="account-menu__menu"
          role="menu"
          data-clarity-mask="True"
        >
          <p className="account-menu__name notranslate">{displayName}</p>
          {user.email ? (
            <p className="account-menu__email notranslate">{user.email}</p>
          ) : null}
          <Link
            role="menuitem"
            href="/account"
            className="account-menu__item"
            onClick={() => setOpen(false)}
          >
            <FontAwesomeIcon icon={faUserGear} /> {t("Your presets & account")}
          </Link>
          <button
            role="menuitem"
            type="button"
            className="account-menu__item"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
          >
            <FontAwesomeIcon icon={faRightFromBracket} /> {t("Sign out")}
          </button>
        </div>
      ) : null}

      <SignInDialog />
    </div>
  );
}
