import React from "react";
import PropTypes from "prop-types";

function ColorInput({ label, name, value, onChange }) {
  return (
    <div className="color-input-container">
      <label htmlFor={name} className="color-input-label">{label}</label>
      <input
        id={name}
        type="color"
        name={name}
        className="color-input"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

ColorInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

ColorInput.defaultProps = {
  label: ""
};

export default ColorInput;
