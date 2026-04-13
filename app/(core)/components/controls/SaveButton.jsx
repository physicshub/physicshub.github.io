// controls/SaveButton.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useTranslation from "../../hooks/useTranslation.ts";
import { faSave } from "@fortawesome/free-solid-svg-icons";

export default function SaveButton({ inputs, simulation }) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const handleSave = () => {
    localStorage.setItem(simulation, JSON.stringify(inputs));
    alert(t("Inputs value saved in local memory for ") + simulation + "!");
  };

  return (
    <button
      onClick={handleSave}
      className={`btn-glow ${isCompleted ? "notranslate" : ""}`}
      title={t("Save inputs to local memory")}
    >
      <FontAwesomeIcon icon={faSave} />
    </button>
  );
}
