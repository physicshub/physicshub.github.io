import { resetTime } from "../../constants/Time.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";
import useTranslation from "../../hooks/useTranslation.ts";

export default function ResetButton({ onReset }) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const handleClick = () => {
    resetTime();
    if (onReset) onReset(); // callback per resettare stato simulazione
  };

  return (
    <button
      onClick={handleClick}
      className={`btn-glow ${isCompleted ? "notranslate" : ""}`}
      title={t("Reset simulation")}
    >
      <FontAwesomeIcon icon={faRedo} />
    </button>
  );
}
