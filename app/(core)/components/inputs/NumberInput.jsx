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
  return (
    <div className="control-group">
      <label className="input-label" htmlFor={name}>
        {label}
      </label>
      <input
        type="number"
        id={name}
        value={val}
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
