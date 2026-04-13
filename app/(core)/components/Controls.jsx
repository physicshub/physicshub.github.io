import { useState } from "react";
import useTranslation from "../hooks/useTranslation.ts";
import PlayPauseButton from "./controls/PlayPauseButton.jsx";
import SpeedControl from "./controls/SpeedControl.jsx";
import ResetButton from "./controls/ResetButton.jsx";
import SaveButton from "./controls/SaveButton.jsx";
import DeleteButton from "./controls/DeleteButton.jsx";
import DownloadButton from "./controls/DownloadButton.jsx";
import UploadButton from "./controls/UploadButton.jsx";
import ShareLinkControl from "./controls/ShareLinkControl.jsx";
import EmbedCodeControl from "./controls/EmbedCodeControl.jsx";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";

export default function Controls({ onReset, inputs, simulation, onLoad }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  simulation = simulation.replaceAll(/[/#]/g, "");

  return (
    <div
      className={`simulation-controls ${isOpen ? "is-open" : ""} ${
        isCompleted ? "notranslate" : ""
      }`}
    >
      <div className="main-controls-wrapper">
        <SpeedControl />
        <PlayPauseButton />
        <ResetButton onReset={onReset} />

        <button
          className="mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={t("Toggle controls")}
        >
          <FontAwesomeIcon
            icon={isOpen ? faArrowUp : faArrowDown}
            color="var(--accent-color)"
          />
        </button>
      </div>

      <div className="extra-controls-wrapper">
        <div className="controls-group">
          <SaveButton inputs={inputs} simulation={simulation} />
          <DeleteButton simulation={simulation} />
        </div>
        <div className="controls-group">
          <DownloadButton inputs={inputs} simulation={simulation} />
          <UploadButton onLoad={onLoad} simulation={simulation} />
        </div>
        <div className="controls-group">
          <ShareLinkControl inputs={inputs} simulation={simulation} />
          <EmbedCodeControl inputs={inputs} simulation={simulation} />
        </div>
      </div>
    </div>
  );
}
