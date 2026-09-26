"use client";
// "Share your setup": publishes what is on the simulation right now as a
// community preset. The inputs are read from the running simulation when the
// dialog opens (see getCurrentInputs), so what the reader sees is what gets
// published.

import { useState, type FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleExclamation,
  faCircleInfo,
  faPaperPlane,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";
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

const FORM_ID = "preset-publish-form";

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
      icon={faShareNodes}
      popupContent={{
        title: "Share your setup",
        description:
          "Publish the parameters on the simulation right now so others can try them.",
        buttons: nothingChanged
          ? [{ label: "Got it", onClick: close, type: "primary" }]
          : [
              { label: "Cancel", onClick: close },
              {
                label: busy ? "Publishing…" : "Publish preset",
                icon: faPaperPlane,
                type: "primary",
                form: FORM_ID,
                disabled: busy || title.trim().length < 3,
              },
            ],
      }}
    >
      {nothingChanged ? (
        <p className="popup-alert popup-alert--info">
          <FontAwesomeIcon icon={faCircleInfo} />
          <span>
            {inputs
              ? t(
                  "These are the default parameters. Change at least one value on the simulation, then share it."
                )
              : t("The simulation is still loading — try again in a moment.")}
          </span>
        </p>
      ) : (
        <form id={FORM_ID} className="popup-stack" onSubmit={submit}>
          <div className="popup-field">
            <p className="popup-label">{t("Parameters you changed")}</p>
            <PresetChanges changes={changes} />
          </div>

          <label className="popup-field">
            <span className="popup-field__label">{t("Title")}</span>
            <input
              className="popup-input"
              type="text"
              required
              minLength={3}
              maxLength={PRESET_TITLE_MAX}
              placeholder={t("e.g. Resonance at the natural frequency")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="popup-field">
            <span className="popup-field__head">
              <span className="popup-field__label">
                {t("What should people notice?")}
                <span className="popup-field__optional">({t("optional")})</span>
              </span>
              <span className="popup-field__count">
                {description.length}/{PRESET_DESCRIPTION_MAX}
              </span>
            </span>
            <textarea
              className="popup-input"
              rows={4}
              maxLength={PRESET_DESCRIPTION_MAX}
              placeholder={t(
                "Explain what happens and why — it helps other students learn from your setup."
              )}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          {error && (
            <p className="popup-alert popup-alert--error" role="alert">
              <FontAwesomeIcon icon={faCircleExclamation} />
              <span>{t(error)}</span>
            </p>
          )}

          <p className="popup-note">
            {t(
              "Published presets are public and show your nickname. Keep it about physics: presets reported by several people are hidden automatically."
            )}
          </p>
        </form>
      )}
    </Popup>
  );
}
