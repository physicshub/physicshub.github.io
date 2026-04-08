function NumberInput({
  label,
  val,
  min,
  max,
  disabled = false,
  placeholder,
  onChange,
  name,
  step,
}) {
  // Convert to string for display, handling all cases
  let displayValue = "";
  if (val === "" || val === undefined || val === null) {
    displayValue = "";
  } else {
    displayValue = String(val);
  }
  return (
    <div className="control-group">
      <label className="input-label" htmlFor={name}>
        {label}
      </label>
      <input
        type="text"
        inputMode="numeric"
        id={name}
        value={displayValue}
        min={min}
        max={max}
        step={step || 1}
        placeholder={placeholder}
        className="input-number"
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

export default NumberInput;
