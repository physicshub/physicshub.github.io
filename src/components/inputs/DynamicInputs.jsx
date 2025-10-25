import NumberInput from "./NumberInput.jsx";
import CheckboxInput from "./CheckboxInput.jsx";
import ColorInput from "./ColorInput.jsx";
import SelectInput from "./SelectInput.jsx";

export default function DynamicInputs({ config, values, onChange }) {
  return (
    <div className="inputs-container">
      {config.map((field) => {
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
      })}
    </div>
  );
}
