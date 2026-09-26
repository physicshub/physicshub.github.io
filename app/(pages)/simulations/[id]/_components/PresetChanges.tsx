"use client";
import useTranslation from "@/app/(core)/hooks/useTranslation";
import type { PresetChange } from "./presetFormat";

/** The changed parameters of a preset, as a row of chips. */
export default function PresetChanges({
  changes,
}: {
  changes: PresetChange[];
}) {
  const { t } = useTranslation();
  if (changes.length === 0) {
    return <p className="preset-changes__none">{t("Default parameters")}</p>;
  }
  return (
    <ul className="preset-changes">
      {changes.map((change) => (
        <li key={change.name} className="preset-changes__chip">
          <span className="preset-changes__label">{t(change.label)}</span>
          {change.color ? (
            <span
              className="preset-changes__swatch"
              style={{ background: change.color }}
              aria-label={change.color}
            />
          ) : (
            <span className="preset-changes__value notranslate">
              {t(change.value)}
              {change.unit ? ` ${change.unit}` : ""}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
