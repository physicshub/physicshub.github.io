"use client";
// Community presets for one simulation: setups other readers published, which
// load into the simulation above with one click ("Try"), plus the button to
// publish your own. Placed last on the page (after the related articles): the
// list arrives after hydration, and there nothing below it but the footer can
// move when it does. It is only requested once the section nears the
// viewport, and then once per visit (see the request budget in
// lib/community.ts).
//
// Renders nothing when the deploy has no Supabase configured.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faHeart,
  faLink,
  faFlag,
  faTrash,
  faStar,
  faCheck,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import useTranslation from "@/app/(core)/hooks/useTranslation";
import useAuth, { openSignIn } from "@/app/(core)/hooks/useAuth";
import { isCommunityEnabled } from "@/app/(core)/lib/supabase";
import {
  deletePreset,
  getMyLikes,
  invalidatePresets,
  listPresets,
  reportPreset,
  setLiked,
  sortPresets,
  updateCachedPreset,
  PRESET_PAGE_SIZE,
  type Preset,
  type PresetInputs,
  type PresetSort,
} from "@/app/(core)/lib/community";
import {
  applyInputs,
  getCurrentInputs,
  onPresetsChanged,
} from "@/app/(core)/utils/simulationEvents.js";
import {
  buildSimulationUrl,
  sanitizeInputs,
} from "@/app/(core)/utils/simulationUrl.js";
import PresetChanges from "./PresetChanges";
import PublishPresetDialog from "./PublishPresetDialog";
import { describeChanges, type PresetField } from "./presetFormat";

type Props = {
  simId: string;
  simName: string;
  fields: PresetField[];
  initialInputs: PresetInputs;
};

export default function CommunityPresets(props: Props) {
  if (!isCommunityEnabled) return null;
  return <CommunityPresetsSection {...props} />;
}

function CommunityPresetsSection({
  simId,
  simName,
  fields,
  initialInputs,
}: Props) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const { user } = useAuth();
  const userId = user?.id ?? null;

  // Nothing is fetched until the section is about to scroll into view: most
  // visitors never reach the bottom of a simulation page.
  const sectionRef = useRef<HTMLElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || nearViewport) return;
    if (typeof IntersectionObserver === "undefined") {
      setNearViewport(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [nearViewport]);

  // A like in flight per preset: a double click must not send two requests.
  const pendingLikes = useRef(new Set<string>());

  const [sort, setSort] = useState<PresetSort>("top");
  const [presets, setPresets] = useState<Preset[]>([]);
  const [visible, setVisible] = useState(PRESET_PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLikedIds] = useState<Set<string>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  const [publishOpen, setPublishOpen] = useState(false);
  const [publishInputs, setPublishInputs] = useState<PresetInputs | null>(null);

  // One request per visit (cached in lib/community.ts). Top/New and "Show
  // more" are computed below from this list and never hit the network; only a
  // publish or delete (here or on /account) forces a refetch.
  useEffect(
    () =>
      onPresetsChanged((id: string) => {
        if (id !== simId) return;
        invalidatePresets(simId);
        setReloadKey((k) => k + 1);
      }),
    [simId]
  );

  useEffect(() => {
    if (!nearViewport) return;
    let cancelled = false;
    listPresets(simId).then(({ data, error }) => {
      if (cancelled) return;
      setPresets(data);
      setError(error);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [simId, reloadKey, nearViewport]);

  const sorted = useMemo(() => sortPresets(presets, sort), [presets, sort]);
  const shown = sorted.slice(0, visible);

  // Which presets the signed-in reader already liked: one request per list
  // (keyed on the ids, so a like updating a count doesn't refetch it).
  const idsKey = useMemo(() => presets.map((p) => p.id).join(","), [presets]);
  useEffect(() => {
    if (!userId || !idsKey) {
      setLikedIds(new Set());
      return;
    }
    let cancelled = false;
    getMyLikes(idsKey.split(",")).then(({ data }) => {
      if (!cancelled) setLikedIds(data);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, idsKey]);

  const toggleLike = useCallback(
    async (preset: Preset) => {
      if (!userId) {
        openSignIn();
        return;
      }
      if (pendingLikes.current.has(preset.id)) return;
      pendingLikes.current.add(preset.id);
      const wasLiked = liked.has(preset.id);
      const delta = wasLiked ? -1 : 1;
      // Optimistic: flip now, undo if the database says no.
      const apply = (sign: number) => {
        setLikedIds((current) => {
          const next = new Set(current);
          if (sign * delta > 0) next.add(preset.id);
          else next.delete(preset.id);
          return next;
        });
        setPresets((current) =>
          current.map((p) => {
            if (p.id !== preset.id) return p;
            const likes_count = Math.max(0, p.likes_count + sign * delta);
            updateCachedPreset(simId, p.id, { likes_count });
            return { ...p, likes_count };
          })
        );
      };
      apply(1);
      const { error } = await setLiked(preset.id, !wasLiked, userId);
      pendingLikes.current.delete(preset.id);
      if (error) {
        apply(-1);
        setError(error);
      }
    },
    [userId, liked, simId]
  );

  const openPublish = () => {
    if (!userId) {
      openSignIn();
      return;
    }
    const current = getCurrentInputs();
    setPublishInputs(
      current
        ? (sanitizeInputs(current, initialInputs, fields) as PresetInputs)
        : null
    );
    setPublishOpen(true);
  };

  const publishChanges = useMemo(
    () =>
      publishInputs
        ? describeChanges(publishInputs, initialInputs, fields)
        : [],
    [publishInputs, initialInputs, fields]
  );

  return (
    <section
      ref={sectionRef}
      className={`community-presets ${isCompleted ? "notranslate" : ""}`}
      aria-labelledby="community-presets-title"
    >
      <header className="community-presets__head">
        <div>
          <h2 id="community-presets-title">{t("Community presets")}</h2>
          <p className="community-presets__intro">
            {t("Setups other learners found interesting in")} {t(simName)}.{" "}
            {t("Try one, then tweak it.")}
          </p>
        </div>
        <div className="community-presets__actions">
          <div
            className="community-presets__sort"
            role="tablist"
            aria-label={t("Order")}
          >
            {(["top", "new"] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={sort === option}
                className={sort === option ? "is-active" : ""}
                onClick={() => {
                  setSort(option);
                  setVisible(PRESET_PAGE_SIZE);
                }}
              >
                {option === "top" ? t("Top") : t("New")}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="ph-btn ph-btn--primary"
            onClick={openPublish}
          >
            <FontAwesomeIcon icon={faPlus} /> {t("Share your setup")}
          </button>
        </div>
      </header>

      {error && (
        <p className="community-presets__error" role="alert">
          {t(error)}
        </p>
      )}

      {loading && presets.length === 0 ? (
        <ul className="community-presets__grid" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="preset-card preset-card--skeleton" />
          ))}
        </ul>
      ) : presets.length === 0 && !error ? (
        <p className="community-presets__empty">
          {t(
            "No presets yet. Find a setup worth showing and be the first to share it!"
          )}
        </p>
      ) : (
        <ul className="community-presets__grid">
          {shown.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              changes={describeChanges(
                sanitizeInputs(preset.inputs, initialInputs, fields),
                initialInputs,
                fields
              )}
              liked={liked.has(preset.id)}
              mine={userId === preset.author_id}
              onTry={() => {
                applyInputs(preset.inputs);
                document
                  .querySelector(".simulation-stage")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              onLike={() => toggleLike(preset)}
              shareUrl={() =>
                buildSimulationUrl(
                  window.location.pathname,
                  {
                    ...initialInputs,
                    ...sanitizeInputs(preset.inputs, initialInputs, fields),
                  },
                  initialInputs
                )
              }
              onReport={async () => {
                if (!userId) {
                  openSignIn();
                  return false;
                }
                const { error } = await reportPreset(preset.id, "");
                if (!error || error.includes("already")) return true;
                setError(error);
                return false;
              }}
              onDelete={async () => {
                const { error } = await deletePreset(preset.id, simId);
                if (error) {
                  setError(error);
                  return;
                }
                // Drop it locally: no need to refetch the whole list.
                setPresets((current) =>
                  current.filter((p) => p.id !== preset.id)
                );
              }}
            />
          ))}
        </ul>
      )}

      {sorted.length > visible && (
        <div className="community-presets__more">
          <button
            type="button"
            className="ph-btn ph-btn--ghost"
            onClick={() => setVisible((v) => v + PRESET_PAGE_SIZE)}
          >
            {t("Show more")}
          </button>
        </div>
      )}

      <PublishPresetDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        simId={simId}
        inputs={publishInputs}
        changes={publishChanges}
      />
    </section>
  );
}

type CardProps = {
  preset: Preset;
  changes: ReturnType<typeof describeChanges>;
  liked: boolean;
  mine: boolean;
  onTry: () => void;
  onLike: () => void;
  shareUrl: () => string;
  /** Resolves true once the report is recorded. */
  onReport: () => Promise<boolean>;
  onDelete: () => Promise<void>;
};

function PresetCard({
  preset,
  changes,
  liked,
  mine,
  onTry,
  onLike,
  shareUrl,
  onReport,
  onDelete,
}: CardProps) {
  const { t } = useTranslation();
  const [confirm, setConfirm] = useState<"report" | "delete" | null>(null);
  const [reported, setReported] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
    } catch {
      // Clipboard can be blocked (insecure context, permissions); nothing to do.
    }
  };

  const date = new Date(preset.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <li className={`preset-card ${preset.featured ? "is-featured" : ""}`}>
      <div className="preset-card__top">
        <h3 className="preset-card__title notranslate">{preset.title}</h3>
        {preset.featured && (
          <span className="preset-card__badge">
            <FontAwesomeIcon icon={faStar} /> {t("Featured")}
          </span>
        )}
      </div>
      <p className="preset-card__meta">
        <span className="notranslate">
          {preset.author?.display_name ?? t("Anonymous")}
        </span>{" "}
        · <time dateTime={preset.created_at}>{date}</time>
      </p>

      {preset.description && (
        <p className="preset-card__description notranslate">
          {preset.description}
        </p>
      )}

      <PresetChanges changes={changes} />

      <div className="preset-card__actions">
        <button
          type="button"
          className="ph-btn ph-btn--primary"
          onClick={onTry}
        >
          <FontAwesomeIcon icon={faPlay} /> {t("Try it")}
        </button>
        <button
          type="button"
          className={`preset-card__icon-btn ${liked ? "is-liked" : ""}`}
          onClick={onLike}
          aria-pressed={liked}
          aria-label={liked ? t("Unlike") : t("Like")}
          title={liked ? t("Unlike") : t("Like")}
        >
          <FontAwesomeIcon icon={faHeart} />
          <span>{preset.likes_count}</span>
        </button>
        <button
          type="button"
          className="preset-card__icon-btn"
          onClick={copyLink}
          aria-label={t("Copy link to this preset")}
          title={copied ? t("Link copied!") : t("Copy link to this preset")}
        >
          <FontAwesomeIcon icon={copied ? faCheck : faLink} />
        </button>
        {mine ? (
          <button
            type="button"
            className="preset-card__icon-btn preset-card__icon-btn--danger"
            onClick={() => setConfirm("delete")}
            aria-label={t("Delete your preset")}
            title={t("Delete your preset")}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        ) : (
          <button
            type="button"
            className="preset-card__icon-btn"
            onClick={() => setConfirm("report")}
            disabled={reported}
            aria-label={reported ? t("Reported") : t("Report")}
            title={reported ? t("Reported — thank you") : t("Report")}
          >
            <FontAwesomeIcon icon={reported ? faCheck : faFlag} />
          </button>
        )}
      </div>

      {confirm && (
        <div className="preset-card__confirm" role="alertdialog">
          <p>
            {confirm === "delete"
              ? t("Delete this preset for good?")
              : t(
                  "Report this preset as inappropriate or spam? Presets reported by several people are hidden."
                )}
          </p>
          <div>
            <button
              type="button"
              className="ph-btn ph-btn--ghost"
              onClick={() => setConfirm(null)}
            >
              {t("Cancel")}
            </button>
            <button
              type="button"
              className="ph-btn ph-btn--primary"
              onClick={async () => {
                if (confirm === "delete") {
                  await onDelete();
                } else if (await onReport()) {
                  setReported(true);
                }
                setConfirm(null);
              }}
            >
              {confirm === "delete" ? t("Delete") : t("Report")}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
