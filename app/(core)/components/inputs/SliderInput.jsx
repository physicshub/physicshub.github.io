import useTranslation from "../../hooks/useTranslation.ts";

function SliderInput({ label, val, min, max, step, onChange }) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  return (
    <div className={`control-group ${isCompleted ? "notranslate" : ""}`}>
      <label className="input-label">{t(label)}</label>
      <input
        type="range"
        id="inputSlider"
        min={min}
        max={max}
        step={step}
        value={val}
        className="input-slider"
        onChange={onChange}
      />
    </div>
  );
}

export default SliderInput;
