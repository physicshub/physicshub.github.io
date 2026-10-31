// app/components/controls/EmbedCodeControl.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import useTranslation from "../../hooks/useTranslation.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCode } from "@fortawesome/free-solid-svg-icons";
import { buildSimulationUrl } from "../../utils/simulationUrl.js";

export default function EmbedCodeControl({
  simulation,
  inputs,
  initialInputs = {},
  width = "100%",
  height = 640,
}) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const [copied, setCopied] = useState(false);

  // `?embed=1` strips the site chrome (see the inline script in app/layout.tsx).
  const url = useMemo(
    () =>
      buildSimulationUrl(simulation, inputs, initialInputs, { embed: true }),
    [simulation, inputs, initialInputs]
  );

  const embedCode = `<iframe src="${url}" title="PhysicsHub simulation" width="${width}" height="${height}" style="border:0" loading="lazy" allowfullscreen></iframe>`;

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
    } catch (error) {
      console.warn("[EmbedCodeControl] Clipboard write failed:", error);
    }
  };

  return (
    <div className={isCompleted ? "notranslate" : ""}>
      <button
        onClick={handleCopy}
        className="btn-glow"
        title={
          copied ? t("Embed code copied!") : t("Copy embed code to clipboard")
        }
        aria-label={
          copied ? t("Embed code copied!") : t("Copy embed code to clipboard")
        }
      >
        <FontAwesomeIcon icon={copied ? faCheck : faCode} />
      </button>
    </div>
  );
}
