import useTranslation from "../../hooks/useTranslation.ts";

function NumberInput({
  label,
  val,
  min,
  max,
  disabled = false,
  placeholder,
  onChange,
  onBlur,
  name,
  step,
}) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  // Convert to string for display, handling all cases
  let displayValue = "";
  if (val === "" || val === undefined || val === null) {
    displayValue = "";
  } else {
    displayValue = String(val);
  }
  return (
    <div className={`control-group ${isCompleted ? "notranslate" : ""}`}>
      <label className="input-label" htmlFor={name}>
        {t(label)}
      </label>
      <input
        type="text"
        inputMode="numeric"
        id={name}
        value={displayValue}
        min={min}
        max={max}
        step={step || 1}
        placeholder={t(placeholder)}
        className="input-number"
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
      />
    </div>
  );
}

export default NumberInput;
