// Turning a preset's raw inputs into something a reader can scan: only the
// parameters that differ from the simulation's defaults, each with its label,
// a readable value and its unit.
import { isHexColor } from "@/app/(core)/utils/simulationUrl.js";

export type PresetField = {
  name: string;
  label: string;
  type: string;
  unit?: string;
  symbol?: string;
  options?: { value: string | number | boolean; label: string }[];
};

export type PresetChange = {
  name: string;
  label: string;
  symbol?: string;
  unit?: string;
  /** Display value; `color` is set instead for colour inputs. */
  value: string;
  color?: string;
};

const sameValue = (a: unknown, b: unknown) =>
  typeof a === "number" && typeof b === "number"
    ? Math.abs(a - b) < 1e-9
    : a === b;

function formatValue(field: PresetField | undefined, value: unknown): string {
  const option = field?.options?.find((opt) => sameValue(opt.value, value));
  if (option) return option.label;
  if (typeof value === "boolean")
    return value ? /* i18n */ "On" : /* i18n */ "Off";
  if (typeof value === "number") return String(Number(value.toPrecision(4)));
  return String(value);
}

export function describeChanges(
  inputs: Record<string, unknown>,
  initialInputs: Record<string, unknown>,
  fields: PresetField[]
): PresetChange[] {
  const byName = new Map(fields.map((field) => [field.name, field]));
  const changes: PresetChange[] = [];
  for (const [name, value] of Object.entries(inputs)) {
    if (!(name in initialInputs) || sameValue(value, initialInputs[name])) {
      continue;
    }
    const field = byName.get(name);
    // Only a hex colour may reach the swatch's inline style (see isHexColor).
    const isColor = field?.type === "color" && isHexColor(value);
    // An option label already names its value ("Moon (1.62 m/s²)").
    const hasOption = field?.options?.some((opt) =>
      sameValue(opt.value, value)
    );
    changes.push({
      name,
      label: field?.label ?? name,
      symbol: field?.symbol,
      unit: hasOption || isColor ? undefined : field?.unit,
      value: isColor ? "" : formatValue(field, value),
      color: isColor ? (value as string) : undefined,
    });
  }
  return changes;
}
