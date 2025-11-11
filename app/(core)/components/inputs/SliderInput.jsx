function SliderInput({ label, val, min, max, step, onChange }) {
  return (
    <div className="control-group">
      <label className="input-label">{label}</label>
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
