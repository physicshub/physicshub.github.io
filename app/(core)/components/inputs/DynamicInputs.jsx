import NumberInput from "./NumberInput.jsx";
import CheckboxInput from "./CheckboxInput.jsx";
import ColorInput from "./ColorInput.jsx";
import SelectInput from "./SelectInput.jsx";

function renderInput(field, values, onChange) {
  // Check if field should be conditionally rendered
  if (field.showIf) {
    const condition = field.showIf;
    const shouldShow = condition.every(({ key, value }) => {
      if (value === true) return values[key] === true;
      if (value === false) return values[key] === false;
      return values[key] === value;
    });
    if (!shouldShow) return null;
  }

  const commonProps = {
    name: field.name,
    label: field.label,
  };

  if (field.type === "number") {
    return (
      <NumberInput
        key={field.name}
        {...commonProps}
        val={values[field.name]}
        placeholder={field.placeholder}
        min={field?.min}
        max={field?.max}
        step={field?.step}
        onChange={(e) => onChange(field.name, Number(e.target.value))}
      />
    );
  }

  if (field.type === "checkbox") {
    return (
      <CheckboxInput
        key={field.name}
        {...commonProps}
        checked={values[field.name]}
        onChange={(e) => onChange(field.name, e.target.checked)}
      />
    );
  }

  if (field.type === "color") {
    return (
      <ColorInput
        key={field.name}
        {...commonProps}
        value={values[field.name]}
        onChange={(e) => onChange(field.name, e.target.value)}
      />
    );
  }

  if (field.type === "select") {
    return (
      <SelectInput
        key={field.name}
        {...commonProps}
        options={field.options}
        value={values[field.name]}
        placeholder={field.placeholder}
        onChange={(e) => onChange(field.name, e.target.value)}
      />
    );
  }
  return null;
}

export default function DynamicInputs({ config, values, onChange, grouped = false }) {
  // If grouped, separate by category
  if (grouped) {
    const physicsControls = config.filter((f) => f.category === "physics");
    const visualizationControls = config.filter((f) => f.category === "visualization");
    const otherControls = config.filter((f) => !f.category);

    return (
      <>
        {physicsControls.length > 0 && (
          <div className="inputs-group">
            <h3 className="inputs-group-title">Physics Controls</h3>
            <div className="inputs-container">
              {physicsControls.map((field) => renderInput(field, values, onChange))}
            </div>
          </div>
        )}
        {visualizationControls.length > 0 && (
          <div className="inputs-group">
            <h3 className="inputs-group-title">Visualization Controls</h3>
            <div className="inputs-container">
              {visualizationControls.map((field) => renderInput(field, values, onChange))}
            </div>
          </div>
        )}
        {otherControls.length > 0 && (
          <div className="inputs-container">
            {otherControls.map((field) => renderInput(field, values, onChange))}
          </div>
        )}
      </>
    );
  }

  // Default: render all together
  return (
    <div className="inputs-container">
      {config.map((field) => renderInput(field, values, onChange))}
    </div>
  );
}
