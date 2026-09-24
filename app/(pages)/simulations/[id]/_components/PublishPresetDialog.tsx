"use client";
// "Share your setup": publishes what is on the simulation right now as a
// community preset. The inputs are read from the running simulation when the
// dialog opens (see getCurrentInputs), so what the reader sees is what gets
// published.

import { useState, type FormEvent } from "react";
import Popup from "@/app/(core)/components/Popup";
import useTranslation from "@/app/(core)/hooks/useTranslation";
import {
  publishPreset,
  PRESET_DESCRIPTION_MAX,
  PRESET_TITLE_MAX,
  type PresetInputs,
} from "@/app/(core)/lib/community";
import { notifyPresetsChanged } from "@/app/(core)/utils/simulationEvents.js";
import PresetChanges from "./PresetChanges";
import type { PresetChange } from "./presetFormat";

type Props = {
  open: boolean;
  onClose: () => void;
  simId: string;
  /** Sanitised current inputs, captured when the dialog was opened. */
  inputs: PresetInputs | null;
  changes: PresetChange[];
};

export default function PublishPresetDialog({
  open,
  onClose,
  simId,
  inputs,
  changes,
}: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setError(null);
    onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!inputs || changes.length === 0) return;
    setBusy(true);
    setError(null);
    const { error } = await publishPreset({
      simId,
      title,
      description,
      inputs,
    });
    setBusy(false);
    if (error) {
      setError(error);
      return;
    }
    setTitle("");
    setDescription("");
    notifyPresetsChanged(simId);
    onClose();
  };

  const nothingChanged = !inputs || changes.length === 0;

  return (
    <Popup
      isOpen={open}
      onClose={close}
      popupContent={{
        title: "Share your setup",
        description:
          "Publish the parameters on the simulation right now so others can try them.",
      }}
    >
      {nothingChanged ? (
        <p className="preset-publish__empty">
          {inputs
            ? t(
                "These are the default parameters. Change at least one value on the simulation, then share it."
              )
            : t("The simulation is still loading — try again in a moment.")}
        </p>
      ) : (
        <form className="preset-publish" onSubmit={submit}>
          <div className="preset-publish__summary">
            <p className="preset-publish__label">
              {t("Parameters you changed")}
            </p>
            <PresetChanges changes={changes} />
          </div>

          <label className="preset-publish__field">
            <span>{t("Title")}</span>
            <input
              type="text"
              required
              minLength={3}
              maxLength={PRESET_TITLE_MAX}
              placeholder={t("e.g. Resonance at the natural frequency")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="preset-publish__field">
            <span>
              {t("What should people notice?")} <small>({t("optional")})</small>
            </span>
            <textarea
              rows={4}
              maxLength={PRESET_DESCRIPTION_MAX}
              placeholder={t(
                "Explain what happens and why — it helps other students learn from your setup."
              )}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <small className="preset-publish__count">
              {description.length}/{PRESET_DESCRIPTION_MAX}
            </small>
          </label>

          {error && (
            <p className="preset-publish__error" role="alert">
              {t(error)}
            </p>
          )}

          <p className="preset-publish__note">
            {t(
              "Published presets are public and show your nickname. Keep it about physics: presets reported by several people are hidden automatically."
            )}
          </p>

          <button
            type="submit"
            className="ph-btn ph-btn--primary"
            disabled={busy || title.trim().length < 3}
          >
            {busy ? t("Publishing…") : t("Publish preset")}
          </button>
        </form>
      )}
    </Popup>
  );
}
