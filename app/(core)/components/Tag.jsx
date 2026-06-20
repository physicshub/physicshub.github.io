"use client";

import { COLORS } from "../data/tags";
import useTranslation from "../hooks/useTranslation.ts";

function Tag({ tag, className = "" }) {
  const { t } = useTranslation();
  const colorData = COLORS[tag.color] || COLORS.grey;

  const inlineStyle = {
    background: `linear-gradient(135deg, ${colorData.primary}, ${colorData.secondary})`,
    boxShadow: `0 0 8px ${colorData.secondary}`,
  };

  return (
    <span className={`tag ${className}`} style={inlineStyle}>
      {t(tag.name)}
    </span>
  );
}

export default Tag;
