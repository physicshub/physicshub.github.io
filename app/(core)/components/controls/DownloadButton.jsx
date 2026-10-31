// controls/DownloadButton.jsx
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import useTranslation from "../../hooks/useTranslation.ts";
import Popup from "../Popup";

export default function DownloadButton({ inputs, simulation }) {
  const [open, setOpen] = useState(false);
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  const handleDownload = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(inputs, null, 2));
    const link = document.createElement("a");
    link.href = dataStr;
    link.download = "simulation-inputs-" + simulation + ".json";
    link.click();
  };

  const handleClick = () => {
    setOpen(true);
    handleDownload();
  };

  return (
    <div className={isCompleted ? "notranslate" : ""}>
      <button
        onClick={handleClick}
        className="btn-glow"
        title={t("Download inputs as JSON file")}
        aria-label={t("Download inputs as JSON file")}
      >
        <FontAwesomeIcon icon={faDownload} />
      </button>

      <Popup
        isOpen={open}
        onClose={() => setOpen(false)}
        size="sm"
        icon={faDownload}
        popupContent={{
          title: "Your download is starting",
          description:
            "The current parameters are saved as a JSON file. Load it later with the upload button to pick up where you left off.",
          buttons: [
            {
              label: "Close",
              onClick: () => setOpen(false),
            },
            {
              label: "Download again",
              icon: faDownload,
              onClick: handleDownload,
              type: "primary",
            },
          ],
        }}
      />
    </div>
  );
}
