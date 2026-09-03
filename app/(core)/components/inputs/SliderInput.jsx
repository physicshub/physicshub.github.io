import useTranslation from "../../hooks/useTranslation.ts";

function SliderInput({ label, val, min, max, step, unit, symbol, onChange }) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  const numeric = Number(val);
  const fillPct =
    typeof min === "number" && typeof max === "number" && max > min
      ? Math.min(100, Math.max(0, ((numeric - min) / (max - min)) * 100))
      : 0;

  return (
    <div
      className={`sim-field sim-field--range ${isCompleted ? "notranslate" : ""}`}
    >
      <div className="sim-field__head">
        {symbol && <span className="sim-field__symbol">{symbol}</span>}
        <label className="sim-field__label">{t(label)}</label>
        {unit && <span className="sim-field__unit">{unit}</span>}
      </div>
      <div className="sim-field__body">
        <input
          type="range"
          className="sim-field__slider"
          style={{ "--fill": `${fillPct}%` }}
          min={min}
          max={max}
          step={step}
          value={val}
          onChange={onChange}
        />
        <div className="sim-field__valuebox">
          <span className="sim-field__value">{val}</span>
        </div>
      </div>
    </div>
  );
}

export default SliderInput;
