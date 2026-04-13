// app/components/controls/EmbedCodeControl.jsx
"use client";
import { useMemo } from "react";
import useTranslation from "../../hooks/useTranslation.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";

export default function EmbedCodeControl({
  simulation,
  inputs,
  width = 600,
  height = 400,
}) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  // Build URL with query parameters
  const url = useMemo(() => {
    //useMemo hook grabs window immedialtely causing error during server side rendering
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(inputs).toString();
    return `${window.location.origin}/${simulation}?${params}`;
  }, [simulation, inputs]);

  // Generate embed code
  const embedCode = `<iframe src="${url}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    alert(t("Embed code copied!"));
  };

  return (
    <div className={isCompleted ? "notranslate" : ""}>
      <button
        onClick={handleCopy}
        className="btn-glow"
        title={t("Copy embed code to clipboard")}
      >
        <FontAwesomeIcon icon={faCode} />
      </button>
    </div>
  );
}
