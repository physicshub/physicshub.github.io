import { useState } from "react";
import useTranslation from "../../hooks/useTranslation.ts";
import { setTimeScale, getTimeScale } from "../../constants/Time.js";

export default function SpeedControl() {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const speeds = [0.5, 1, 1.5, 2];
  const [index, setIndex] = useState(speeds.indexOf(getTimeScale()));

  const handleClick = () => {
    const newIndex = (index + 1) % speeds.length;
    setIndex(newIndex);
    setTimeScale(speeds[newIndex]);
  };

  return (
    <button
      onClick={handleClick}
      className={`btn-glow ${isCompleted ? "notranslate" : ""}`}
      title={t("Change simulation speed")}
    >
      {speeds[index]}x
    </button>
  );
}
