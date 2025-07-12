function NumberInput({ label, val, min, max, disabled, placeholder, onChange, name }) {
  return (
    <div className="control-group">
      <label className="input-label" htmlFor={name}>{label}</label>
      <input
        type="number"
        id={name}
        value={val}
        min={min}
        max={max}
        placeholder={placeholder}
        className="input-number"
        onChange={onChange}
        disabled = {disabled || false}
      />
    </div>
  );
}

export default NumberInput;