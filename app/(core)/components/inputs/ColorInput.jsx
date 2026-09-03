import React from "react";
import useTranslation from "../../hooks/useTranslation.ts";
import PropTypes from "prop-types";

function ColorInput({ label, name, value, onChange }) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  return (
    <div
      className={`sim-field sim-field--color ${isCompleted ? "notranslate" : ""}`}
    >
      <div className="sim-field__head">
        <label htmlFor={name} className="sim-field__label">
          {t(label)}
        </label>
      </div>
      <div className="sim-field__body">
        <input
          id={name}
          type="color"
          name={name}
          className="sim-field__swatch"
          value={value}
          onChange={onChange}
        />
        <span className="sim-field__hex">
          {String(value || "").toUpperCase()}
        </span>
      </div>
    </div>
  );
}

ColorInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

ColorInput.defaultProps = {
  label: "",
};

export default ColorInput;
