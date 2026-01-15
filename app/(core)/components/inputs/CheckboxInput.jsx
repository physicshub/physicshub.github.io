import React from "react";

function CheckboxInput({ label, name, checked, onChange, ...rest }) {
  return (
    <div className="checkbox-container">
      <input
        type="checkbox"
        id={name}
        name={name}
        className="checkbox-input"
        checked={checked}
        onChange={onChange}
        {...rest}
      />
      <label htmlFor={name} className="checkbox-label">
        <span className="checkbox-toggle" />
        {label}
      </label>
    </div>
  );
}

export default CheckboxInput;
