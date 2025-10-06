import { useState } from "react";
import { setTimeScale, getTimeScale } from "../../constants/Time.js";

export default function SpeedControl() {
  const speeds = [0.5, 1, 1.5, 2];
  const [index, setIndex] = useState(speeds.indexOf(getTimeScale()));

  const handleClick = () => {
    const newIndex = (index + 1) % speeds.length;
    setIndex(newIndex);
    setTimeScale(speeds[newIndex]);
  };

  return (
    <button onClick={handleClick} className="btn-glow" title="Change simulation speed">
      {speeds[index]}x
    </button>
  );
}
