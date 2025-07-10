import React from "react";
import PropTypes from "prop-types";

function SelectInput({ 
  label, 
  name, 
  options,
  value, 
  onChange, 
  placeholder
}) {
  return (
    <div className="select-container">
      {label && (
        <label htmlFor={name} className="select-label">
          {label}
        </label>
      )}
      <div className="select-wrapper">
        <select
          id={name}
          name={name}
          className="select-input"
          value={value}
          onChange={onChange}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="select-arrow" aria-hidden="true">▾</span>
      </div>
    </div>
  );
}

SelectInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.any, label: PropTypes.string })
  ).isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string
};

SelectInput.defaultProps = {
  label: "",
  placeholder: ""
};

export default SelectInput;
