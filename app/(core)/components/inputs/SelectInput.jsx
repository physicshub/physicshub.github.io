// app/(core)/components/inputs/SelectInput.jsx
import React from "react";
import PropTypes from "prop-types";

function SelectInput({ label, name, options, value, onChange, placeholder }) {
  const handleChange = (e) => {
    const selectedValue = e.target.value;
    // Convert to number if the value is numeric (for gravity and similar numeric selects)
    const numericValue = !isNaN(selectedValue) && selectedValue !== "" && !isNaN(parseFloat(selectedValue))
      ? parseFloat(selectedValue) 
      : selectedValue;
    // Create a synthetic event object that matches what onChange expects
    const syntheticEvent = {
      target: {
        name,
        value: numericValue
      }
    };
    onChange(syntheticEvent);
  };

  return (
    <div className="control-group">
      <label htmlFor={name} className="input-label">
        {label}
      </label>
      <div className="select-wrapper">
        <select
          id={name}
          name={name}
          className="input-number select-input"
          value={value}
          onChange={handleChange}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="select-arrow" aria-hidden="true">
          ▾
        </span>
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
  placeholder: PropTypes.string,
};

SelectInput.defaultProps = {
  label: "",
  placeholder: "",
};

export default SelectInput;
