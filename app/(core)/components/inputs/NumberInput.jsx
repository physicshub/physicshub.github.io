import useTranslation from "../../hooks/useTranslation.ts";

/**
 * The unified numeric parameter control.
 *
 * - When the field declares BOTH `min` and `max` it renders as a slider with a
 *   glowing accent fill, an editable value box and a min/max scale.
 * - Otherwise it renders as a value box flanked by −/+ stepper buttons.
 *
 * The unit of measure is shown once, as the standardized chip in the head
 * (`unit` prop) — never inside the value box or the label.
 */
function NumberInput({
  label,
  val,
  min,
  max,
  step,
  unit,
  symbol,
  disabled = false,
  placeholder,
  onChange,
  onBlur,
  onSlider,
  onStep,
  name,
}) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  const hasRange = typeof min === "number" && typeof max === "number";

  const displayValue =
    val === "" || val === undefined || val === null ? "" : String(val);

  const numeric = Number(val);
  const isNum = Number.isFinite(numeric);
  const fillPct =
    hasRange && max > min
      ? Math.min(100, Math.max(0, ((numeric - min) / (max - min)) * 100))
      : 0;

  const valueInput = (
    <input
      type="text"
      inputMode="decimal"
      id={name}
      value={displayValue}
      placeholder={t(placeholder)}
      className="sim-field__value"
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      autoComplete="off"
    />
  );

  return (
    <div
      className={`sim-field ${hasRange ? "sim-field--range" : "sim-field--stepper"} ${
        disabled ? "is-disabled" : ""
      } ${isCompleted ? "notranslate" : ""}`}
    >
      <div className="sim-field__head">
        {symbol && <span className="sim-field__symbol">{symbol}</span>}
        <label className="sim-field__label" htmlFor={name}>
          {t(label)}
        </label>
        {unit && <span className="sim-field__unit">{unit}</span>}
      </div>

      {hasRange ? (
        <>
          <div className="sim-field__body">
            <input
              type="range"
              className="sim-field__slider"
              style={{ "--fill": `${fillPct}%` }}
              min={min}
              max={max}
              step={step || 1}
              value={isNum ? numeric : min}
              onChange={(e) => onSlider?.(e.target.value)}
              disabled={disabled}
              aria-label={t(label)}
            />
            <div className="sim-field__valuebox">{valueInput}</div>
          </div>
          <div className="sim-field__scale" aria-hidden="true">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </>
      ) : (
        <div className="sim-field__body sim-field__body--stepper">
          <button
            type="button"
            className="sim-field__step"
            onClick={() => onStep?.(-1)}
            disabled={disabled}
            aria-label="Decrease"
            tabIndex={-1}
          >
            −
          </button>
          <div className="sim-field__valuebox">{valueInput}</div>
          <button
            type="button"
            className="sim-field__step"
            onClick={() => onStep?.(1)}
            disabled={disabled}
            aria-label="Increase"
            tabIndex={-1}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}

export default NumberInput;
