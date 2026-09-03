// app/(core)/components/inputs/SelectInput.jsx
import React from "react";
import useTranslation from "../../hooks/useTranslation.ts";
import PropTypes from "prop-types";

function SelectInput({
  label,
  name,
  options,
  value,
  onChange,
  placeholder,
  unit,
  symbol,
}) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  return (
    <div
      className={`sim-field sim-field--select ${isCompleted ? "notranslate" : ""}`}
    >
      {(label || symbol || unit) && (
        <div className="sim-field__head">
          {symbol && <span className="sim-field__symbol">{symbol}</span>}
          {label && (
            <label htmlFor={name} className="sim-field__label">
              {t(label)}
            </label>
          )}
          {unit && <span className="sim-field__unit">{unit}</span>}
        </div>
      )}
      <div className="sim-field__body">
        <div className="sim-field__selectwrap">
          <select
            id={name}
            name={name}
            className="sim-field__select"
            value={value}
            onChange={onChange}
          >
            {placeholder && (
              <option value="" disabled>
                {t(placeholder)}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.label)}
              </option>
            ))}
          </select>
          <span className="sim-field__caret" aria-hidden="true">
            ▾
          </span>
        </div>
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
  unit: PropTypes.string,
  symbol: PropTypes.string,
};

SelectInput.defaultProps = {
  label: "",
  placeholder: "",
};

export default SelectInput;
