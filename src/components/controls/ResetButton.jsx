import { resetTime } from "../../constants/Time.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";

export default function ResetButton({ onReset }) {
  const handleClick = () => {
    resetTime();
    if (onReset) onReset(); // callback per resettare stato simulazione
  };

  return (
    <button onClick={handleClick} className="btn-glow" title="Reset simulation">
      <FontAwesomeIcon icon={faRedo} />
    </button>
  );
}
