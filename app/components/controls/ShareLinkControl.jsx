// app/components/controls/ShareLinkControl.jsx
"use client";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShare } from "@fortawesome/free-solid-svg-icons";

export default function ShareLinkControl({ simulation, inputs }) {
  // Build URL with query parameters
  const url = useMemo(() => {
    const params = new URLSearchParams(inputs).toString();
    return `${window.location.origin}/${simulation}?${params}`;
  }, [simulation, inputs]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    alert("Link copied in clipboard!");
  };

  return (
    <button onClick={handleCopy} className="btn-glow" title="Copy shareable link to clipboard">
        <FontAwesomeIcon icon={faShare} />
    </button>
  );
}
