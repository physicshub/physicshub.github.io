import React from "react";
import useTranslation from "../../hooks/useTranslation.ts";

function CheckboxInput({ label, name, checked, onChange }) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  return (
    <label
      htmlFor={name}
      className={`sim-field sim-field--toggle ${checked ? "is-on" : ""} ${
        isCompleted ? "notranslate" : ""
      }`}
    >
      <input
        type="checkbox"
        id={name}
        name={name}
        className="sim-field__checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span className="sim-field__label">{t(label)}</span>
      <span className="sim-field__switch" aria-hidden="true" />
    </label>
  );
}

export default CheckboxInput;
