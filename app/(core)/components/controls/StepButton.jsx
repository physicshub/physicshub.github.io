import { stepSimulation } from "../../constants/Time.js";
import useTranslation from "../../hooks/useTranslation.ts";

const STEP_DELTA = 0.01;

export default function StepButton({ direction }) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  const delta = direction === "backward" ? -STEP_DELTA : STEP_DELTA;
  const label = direction === "backward" ? "−0.01" : "+0.01";
  const title =
    direction === "backward"
      ? t("Step backward simulation")
      : t("Step forward simulation");

  return (
    <button
      onClick={() => stepSimulation(delta)}
      className={`btn-glow ${isCompleted ? "notranslate" : ""}`}
      title={title}
      aria-label={title}
    >
      {label}
    </button>
  );
}
