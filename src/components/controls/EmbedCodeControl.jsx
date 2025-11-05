// src/components/controls/EmbedCodeControl.jsx
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";

export default function EmbedCodeControl({ simulation, inputs, width = 600, height = 400 }) {
  // Build URL with query parameters
  const url = useMemo(() => {
    const params = new URLSearchParams(inputs).toString();
    return `${window.location.origin}/${simulation}?${params}`;
  }, [simulation, inputs]);

  // Generate embed code
  const embedCode = `<iframe src="${url}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    alert("Embed code copied!");
  };

  return (
    <button onClick={handleCopy} className="btn-glow" title="Copy embed code to clipboard">
        <FontAwesomeIcon icon={faCode} />
    </button>
  );
}
