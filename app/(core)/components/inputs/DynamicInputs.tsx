import NumberInput from "./NumberInput.jsx";
import CheckboxInput from "./CheckboxInput.jsx";
import ColorInput from "./ColorInput.jsx";
import SelectInput from "./SelectInput.jsx";

interface FieldConfig {
  name: string;
  label: string;
  type: "number" | "checkbox" | "color" | "select";
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string | number; label: string }[];
}

interface Props {
  config: FieldConfig[];
  values: Record<string, string | number | boolean>;
  onChange: (name: string, value: string | number | boolean) => void;
}

export default function DynamicInputs({ config, values, onChange }: Props) {
  return (
    <div className="inputs-container">
      {config.map((field) => {
        const commonProps = {
          name: field.name,
          label: field.label,
        };

        const val = values[field.name];

        if (field.type === "number") {
          return (
            <NumberInput
              key={field.name}
              {...commonProps}
              val={val as number}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                let rawValue = e.target.value;

                // Replace comma with dot
                rawValue = rawValue.replace(/,/g, ".");

                // Allow empty string
                if (rawValue === "") {
                  onChange(field.name, "");
                  return;
                }
                // Check if it ends with a dot (user is typing decimal)
                if (rawValue.endsWith(".")) {
                  // Pass as string - don't convert to number yet
                  onChange(field.name, rawValue);
                  return;
                }
                // Only validate, don't convert to number yet
                const isValidNumber = /^\d*\.?\d*$/.test(rawValue);

                if (isValidNumber) {
                  // Store as string to preserve formatting like "5.0"
                  onChange(field.name, rawValue);
                }
              }}
              onBlur={() => {
                const currentValue = val;
                if (
                  typeof currentValue === "string" &&
                  currentValue !== "" &&
                  currentValue !== "."
                ) {
                  const num = Number(currentValue);
                  if (!isNaN(num)) {
                    onChange(field.name, num);
                  }
                }
              }}
            />
          );
        }

        if (field.type === "checkbox") {
          return (
            <CheckboxInput
              key={field.name}
              {...commonProps}
              checked={!!val}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange(field.name, e.target.checked)
              }
            />
          );
        }

        if (field.type === "color") {
          return (
            <ColorInput
              key={field.name}
              {...commonProps}
              value={val as string}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange(field.name, e.target.value)
              }
            />
          );
        }

        if (field.type === "select") {
          return (
            <SelectInput
              key={field.name}
              {...commonProps}
              options={field.options || []}
              value={val as string | number}
              placeholder={field.placeholder}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                onChange(field.name, e.target.value)
              }
            />
          );
        }
        return null;
      })}
    </div>
  );
}
