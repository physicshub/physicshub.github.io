import React from "react";
import useTranslation from "../../hooks/useTranslation.ts";
import PropTypes from "prop-types";

function ColorInput({ label, name, value, onChange }) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  return (
    <div
      className={`color-input-container ${isCompleted ? "notranslate" : ""}`}
    >
      <label htmlFor={name} className="color-input-label">
        {t(label)}
      </label>
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
  onChange: PropTypes.func.isRequired,
};

ColorInput.defaultProps = {
  label: "",
};

export default ColorInput;
