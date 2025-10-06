// components/inputs/DynamicInputs.jsx
import NumberInput from "./NumberInput.jsx";
import CheckboxInput from "./CheckboxInput.jsx";
import ColorInput from "./ColorInput.jsx";

export default function DynamicInputs({ config, values, onChange }) {
  return (
    <div className="inputs-container">
      {config.map((field) => {
        const commonProps = {
          key: field.name,
          name: field.name,
          label: field.label,
          onChange: (e) => {
            const val =
              field.type === "checkbox"
                ? e.target.checked
                : field.type === "color"
                ? e.target.value
                : Number(e.target.value);
            onChange(field.name, val);
          },
        };

        if (field.type === "number") {
          return (
            <NumberInput
              {...commonProps}
              val={values[field.name]}
              placeholder={field.placeholder}
            />
          );
        }
        if (field.type === "checkbox") {
          return (
            <CheckboxInput
              {...commonProps}
              checked={values[field.name]}
            />
          );
        }
        if (field.type === "color") {
          return (
            <ColorInput
              {...commonProps}
              value={values[field.name]}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
