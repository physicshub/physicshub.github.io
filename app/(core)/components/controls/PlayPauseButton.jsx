import { useState } from "react";
import { togglePause, isPaused } from "../../constants/Time.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";

export default function PlayPauseButton() {
  const [paused, setPaused] = useState(isPaused());

  const handleClick = () => {
    togglePause();
    setPaused(isPaused());
  };

  return (
    <button
      onClick={handleClick}
      className="btn-glow"
      title="Play/Pause simulation"
    >
      <FontAwesomeIcon icon={paused ? faPlay : faPause} />
    </button>
  );
}
