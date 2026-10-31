"use client";
// The one sign-in dialog, opened from anywhere through `openSignIn()` in
// useAuth (the header, a like button, the "share your configuration" button).
// Mounted once, by AccountMenu in the header, and portaled to <body>.

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";
import {
  faCircleExclamation,
  faEnvelopeCircleCheck,
  faUserAstronaut,
} from "@fortawesome/free-solid-svg-icons";
import Popup from "../Popup";
import { OAUTH_PROVIDERS } from "../../lib/supabase";
import useTranslation from "../../hooks/useTranslation";
import useAuth, {
  closeSignIn,
  signInWithEmail,
  signInWithProvider,
  type AuthProvider,
} from "../../hooks/useAuth";

export default function SignInDialog() {
  const { t } = useTranslation();
  const { signInOpen } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    closeSignIn();
    setStatus("idle");
    setError(null);
  };

  const withProvider = async (provider: AuthProvider) => {
    setError(null);
    const { error } = await signInWithProvider(provider);
    if (error) setError(error);
  };

  const withEmail = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setStatus("sending");
    const { error } = await signInWithEmail(email.trim());
    if (error) {
      setError(error);
      setStatus("idle");
    } else {
      setStatus("sent");
    }
  };

  return (
    <Popup
      isOpen={signInOpen}
      onClose={close}
      size="sm"
      icon={faUserAstronaut}
      popupContent={{
        title: "Sign in to PhysicsHub",
        description:
          "Publish your simulation setups, like the community's and keep your saved configurations on every device.",
      }}
    >
      {/* Masked from Clarity session recordings: the email being typed. */}
      <div className="popup-stack signin" data-clarity-mask="True">
        <div className="signin__providers">
          {OAUTH_PROVIDERS.includes("github") && (
            <button
              type="button"
              className="ph-btn ph-btn--ghost popup__action"
              onClick={() => withProvider("github")}
            >
              <FontAwesomeIcon icon={faGithub} /> {t("Continue with GitHub")}
            </button>
          )}
          {OAUTH_PROVIDERS.includes("google") && (
            <button
              type="button"
              className="ph-btn ph-btn--ghost popup__action"
              onClick={() => withProvider("google")}
            >
              <FontAwesomeIcon icon={faGoogle} /> {t("Continue with Google")}
            </button>
          )}
        </div>

        <p className="popup-divider">
          <span>{t("or with your email")}</span>
        </p>

        {status === "sent" ? (
          <p className="popup-alert popup-alert--success" role="status">
            <FontAwesomeIcon icon={faEnvelopeCircleCheck} />
            <span>
              {t(
                "Check your inbox: we sent you a sign-in link. Open it in this browser to come back here signed in."
              )}
            </span>
          </p>
        ) : (
          <form className="popup-inline" onSubmit={withEmail}>
            <label className="sr-only" htmlFor="signin-email">
              {t("Email address")}
            </label>
            <input
              id="signin-email"
              className="popup-input"
              type="email"
              required
              autoComplete="email"
              placeholder={t("you@example.com")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              className="ph-btn ph-btn--primary popup__action"
              disabled={status === "sending"}
            >
              {status === "sending" ? t("Sending…") : t("Send link")}
            </button>
          </form>
        )}

        {error && (
          <p className="popup-alert popup-alert--error" role="alert">
            <FontAwesomeIcon icon={faCircleExclamation} />
            <span>{t(error)}</span>
          </p>
        )}

        <p className="popup-note signin__privacy">
          {t(
            "We store only what sign-in needs, a public nickname you can change, and what you choose to publish. No passwords, no ads, nothing sold. Under 16? Ask a parent or teacher first."
          )}{" "}
          <Link href="/privacy" onClick={close}>
            {t("Privacy Policy")}
          </Link>
        </p>
      </div>
    </Popup>
  );
}
