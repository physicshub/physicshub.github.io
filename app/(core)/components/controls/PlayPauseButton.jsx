import { useState } from "react";
import { togglePause, isPaused } from "../../constants/Time.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
import useTranslation from "../../hooks/useTranslation.ts";

export default function PlayPauseButton() {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const [paused, setPaused] = useState(isPaused());

  const handleClick = () => {
    togglePause();
    setPaused(isPaused());
  };

  return (
    <button
      onClick={handleClick}
      className={`btn-glow ${isCompleted ? "notranslate" : ""}`}
      title={t("Play/Pause simulation")}
    >
      <FontAwesomeIcon icon={paused ? faPlay : faPause} />
    </button>
  );
}
