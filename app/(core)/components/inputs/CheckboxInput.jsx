import React from "react";
import useTranslation from "../../hooks/useTranslation.ts";

function CheckboxInput({ label, name, checked, onChange, ...rest }) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  return (
    <div className={`checkbox-container ${isCompleted ? "notranslate" : ""}`}>
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
        {t(label)}
      </label>
    </div>
  );
}

export default CheckboxInput;
