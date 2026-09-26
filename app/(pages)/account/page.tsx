"use client";
// /account — the signed-in reader's presets, nickname, and their data rights:
// download everything we store, or delete the account for good. Also the
// plain-language privacy summary the sign-in dialog links to (#privacy).

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faEyeSlash,
  faHeart,
  faStar,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import useTranslation from "@/app/(core)/hooks/useTranslation";
import useAuth, {
  openSignIn,
  refreshProfile,
} from "@/app/(core)/hooks/useAuth";
import {
  deleteMyAccount,
  deletePreset,
  exportMyData,
  listMyPresets,
  updateDisplayName,
  type Preset,
} from "@/app/(core)/lib/community";
import { notifyPresetsChanged } from "@/app/(core)/utils/simulationEvents.js";

export default function AccountPage() {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const { enabled, ready, user } = useAuth();

  return (
    // data-clarity-mask: the whole page is personal data; keep it out of
    // Microsoft Clarity session recordings (loaded in app/layout.tsx).
    <main
      className={`account-page ${isCompleted ? "notranslate" : ""}`}
      data-clarity-mask="True"
    >
      <h1>{t("Your account")}</h1>

      {!enabled ? (
        <p className="account-page__note">
          {t("Accounts aren't available on this version of the site.")}
        </p>
      ) : !ready ? (
        <p className="account-page__note">{t("Loading…")}</p>
      ) : !user ? (
        <div className="account-card">
          <p>
            {t(
              "Sign in to publish presets, like the community's and keep your saved configurations on every device."
            )}
          </p>
          <button
            type="button"
            className="ph-btn ph-btn--primary"
            onClick={openSignIn}
          >
            {t("Sign in")}
          </button>
        </div>
      ) : (
        <SignedIn userId={user.id} email={user.email} />
      )}

      <PrivacySummary />
    </main>
  );
}

function SignedIn({ userId, email }: { userId: string; email: string | null }) {
  const { displayName } = useAuth();

  return (
    <>
      <NicknameCard userId={userId} current={displayName} email={email} />
      <MyPresets userId={userId} />
      <DataCard userId={userId} />
    </>
  );
}

function NicknameCard({
  userId,
  current,
  email,
}: {
  userId: string;
  current: string | null;
  email: string | null;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(current ?? "");
  const [status, setStatus] = useState<string | null>(null);

  // Fill the field once the profile arrives.
  const [prevCurrent, setPrevCurrent] = useState(current);
  if (current !== prevCurrent) {
    setPrevCurrent(current);
    setName(current ?? "");
  }

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const { error } = await updateDisplayName(userId, name);
    if (error) {
      setStatus(
        error.includes("taken") || error.includes("too often")
          ? t(error)
          : t(
              "That nickname can't be used: 2–32 characters, no links, and nothing that looks official (PhysicsHub, admin, moderator…)."
            )
      );
      return;
    }
    await refreshProfile();
    setStatus(t("Saved."));
  };

  return (
    <section className="account-card">
      <h2>{t("Public nickname")}</h2>
      <p className="account-card__hint">
        {t(
          "Shown next to the presets you publish. Don't use your full real name."
        )}
        {email ? (
          <>
            {" "}
            {t("You're signed in as")}{" "}
            <span className="notranslate">{email}</span> —{" "}
            {t("your email is never shown to anyone.")}
          </>
        ) : null}
      </p>
      <form className="account-card__row" onSubmit={save}>
        <input
          type="text"
          minLength={2}
          maxLength={32}
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setStatus(null);
          }}
          aria-label={t("Public nickname")}
        />
        <button type="submit" className="ph-btn ph-btn--primary">
          {t("Save")}
        </button>
      </form>
      {status && (
        <p className="account-card__status" role="status">
          {status}
        </p>
      )}
    </section>
  );
}

function MyPresets({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [presets, setPresets] = useState<Preset[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listMyPresets(userId).then(({ data, error }) => {
      if (cancelled) return;
      setPresets(data);
      setError(error);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const remove = async (preset: Preset) => {
    const { error } = await deletePreset(preset.id, preset.sim_id);
    if (error) {
      setError(error);
      return;
    }
    setPresets((current) => current?.filter((p) => p.id !== preset.id) ?? null);
    notifyPresetsChanged(preset.sim_id);
  };

  return (
    <section className="account-card">
      <h2>{t("Your presets")}</h2>
      {error && <p className="account-card__error">{t(error)}</p>}
      {presets === null ? (
        <p className="account-card__hint">{t("Loading…")}</p>
      ) : presets.length === 0 ? (
        <p className="account-card__hint">
          {t("You haven't published any presets yet. Open a")}{" "}
          <Link href="/simulations">{t("simulation")}</Link>
          {t(", set it up the way you like and press “Share your setup”.")}
        </p>
      ) : (
        <ul className="account-presets">
          {presets.map((preset) => (
            <li key={preset.id} className="account-presets__item">
              <div>
                <Link
                  href={`/simulations/${preset.sim_id}`}
                  className="account-presets__title notranslate"
                >
                  {preset.title}
                </Link>
                <p className="account-presets__meta">
                  <span className="notranslate">{preset.sim_id}</span> ·{" "}
                  <FontAwesomeIcon icon={faHeart} /> {preset.likes_count}
                  {preset.featured && (
                    <>
                      {" "}
                      · <FontAwesomeIcon icon={faStar} /> {t("Featured")}
                    </>
                  )}
                  {preset.hidden && (
                    <>
                      {" "}
                      ·{" "}
                      <span className="account-presets__hidden">
                        <FontAwesomeIcon icon={faEyeSlash} />{" "}
                        {t("Hidden after reports — under review")}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <button
                type="button"
                className="preset-card__icon-btn preset-card__icon-btn--danger"
                onClick={() => remove(preset)}
                aria-label={t("Delete your preset")}
                title={t("Delete your preset")}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DataCard({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const CONFIRM_WORD = "DELETE";

  const download = async () => {
    const data = await exportMyData(userId);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "physicshub-my-data.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const remove = async () => {
    setBusy(true);
    const { error } = await deleteMyAccount();
    setBusy(false);
    if (error) setError(error);
  };

  return (
    <section className="account-card">
      <h2>{t("Your data")}</h2>
      <div className="account-card__row">
        <button
          type="button"
          className="ph-btn ph-btn--ghost"
          onClick={download}
        >
          <FontAwesomeIcon icon={faDownload} /> {t("Download my data")}
        </button>
      </div>

      <h3 className="account-card__danger-title">{t("Delete account")}</h3>
      <p className="account-card__hint">
        {t(
          "Deletes your account, your nickname, every preset you published, your likes and your saved configurations. This can't be undone. Type"
        )}{" "}
        <strong className="notranslate">{CONFIRM_WORD}</strong>{" "}
        {t("to confirm.")}
      </p>
      <div className="account-card__row">
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          aria-label={t("Type DELETE to confirm")}
        />
        <button
          type="button"
          className="ph-btn ph-btn--ghost account-card__danger"
          disabled={confirmText !== CONFIRM_WORD || busy}
          onClick={remove}
        >
          <FontAwesomeIcon icon={faTrash} /> {t("Delete my account")}
        </button>
      </div>
      {error && <p className="account-card__error">{t(error)}</p>}
    </section>
  );
}

function PrivacySummary() {
  const { t } = useTranslation();
  return (
    <section id="privacy" className="account-card account-card--privacy">
      <h2>{t("Privacy & your data")}</h2>
      <ul>
        <li>
          {t(
            "An account is optional: every simulation works without one. Accounts only add publishing presets, likes and syncing your saved configurations."
          )}
        </li>
        <li>
          {t(
            "We store your email (or the GitHub / Google account you sign in with) only to sign you in. It is never shown publicly, sold or used for marketing."
          )}
        </li>
        <li>
          {t(
            "Public: your nickname and the presets you publish. Private: your email, likes, reports and saved configurations."
          )}
        </li>
        <li>
          {t(
            "Data is stored with Supabase (our database provider). You can download it or delete everything at any time from this page."
          )}
        </li>
        <li>
          {t(
            "If you are under 16, ask a parent, guardian or teacher before creating an account."
          )}
        </li>
      </ul>
      <p className="account-card__hint">
        {t("The full details are in our")}{" "}
        <Link href="/privacy">{t("Privacy Policy")}</Link>.
      </p>
    </section>
  );
}
