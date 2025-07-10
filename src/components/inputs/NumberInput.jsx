function NumberInput({ label, val, min, max, placeholder, onChange }) {
  return (
    <div className="control-group">
      <label className="input-label">{label}</label>
      <input
        type="number"
        id="inputNumber"
        value={val}
        min={min}
        max={max}
        placeholder={placeholder}
        className="input-number"
        onChange={onChange}
      />
    </div>
  );
}

export default NumberInput;