import NumberInput from "./NumberInput.jsx";
import CheckboxInput from "./CheckboxInput.jsx";
import ColorInput from "./ColorInput.jsx";
import SelectInput from "./SelectInput.jsx";
import useTranslation from "../../hooks/useTranslation.ts";
import { useState } from "react";

interface FieldConfig {
  name: string;
  label: string;
  type: "number" | "checkbox" | "color" | "select";
  /** Physics symbol shown as an accent pill (e.g. "v₀", "μₛ", "θ"). */
  symbol?: string;
  /** Unit of measure shown as a standardized chip — never put it in `label`. */
  unit?: string;
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

const decimalsOf = (step?: number) => {
  const parts = String(step ?? 1).split(".");
  return parts[1]?.length ?? 0;
};

export default function DynamicInputs({ config, values, onChange }: Props) {
  const { meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const [lastValidValues, setLastValidValues] =
    useState<Record<string, string | number | boolean>>(values);

  /**
   * Clamp to [min, max] when declared, commit as a number, remember it.
   * `snap` rounds to the field's `step` precision — used for slider / stepper
   * moves so they don't leave float dust like 0.30000000000000004; typed input
   * keeps whatever precision the user entered.
   */
  const commitNumber = (field: FieldConfig, num: number, snap = false) => {
    let v = num;
    if (snap) v = Number(v.toFixed(decimalsOf(field.step)));
    if (typeof field.min === "number") v = Math.max(field.min, v);
    if (typeof field.max === "number") v = Math.min(field.max, v);
    onChange(field.name, v);
    setLastValidValues((prev) => ({ ...prev, [field.name]: v }));
  };

  /** −/+ stepper: nudge the current value by one `step`. */
  const stepField = (field: FieldConfig, dir: number) => {
    const step = Number(field.step) || 1;
    const current = Number(values[field.name]);
    const base = Number.isFinite(current)
      ? current
      : typeof field.min === "number"
        ? field.min
        : 0;
    commitNumber(field, base + dir * step, true);
  };

  return (
    <div className={`inputs-container ${isCompleted ? "notranslate" : ""}`}>
      {config.map((field) => {
        const commonProps = {
          name: field.name,
          label: field.label,
          symbol: field.symbol,
          unit: field.unit,
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
              onSlider={(raw: string) => commitNumber(field, Number(raw), true)}
              onStep={(dir: number) => stepField(field, dir)}
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
                const isValidNumber = /^-?\d*\.?\d*$/.test(rawValue);
                if (isValidNumber) {
                  // Store as string to preserve formatting like "5.0"
                  onChange(field.name, rawValue);
                }
              }}
              onBlur={() => {
                const currentValue = values[field.name];

                if (typeof currentValue === "number") {
                  // Re-clamp in case min/max changed with another input.
                  commitNumber(field, currentValue);
                  return;
                }

                if (
                  typeof currentValue === "string" &&
                  currentValue !== "" &&
                  currentValue !== "." &&
                  currentValue !== "-"
                ) {
                  const num = Number(currentValue);
                  if (!isNaN(num)) {
                    commitNumber(field, num);
                    return;
                  }
                }

                // revert if invalid
                onChange(field.name, lastValidValues[field.name]);
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
