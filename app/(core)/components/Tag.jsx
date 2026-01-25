import { COLORS } from "../data/tags";

function Tag({ tag, className = "" }) {
  const colorData = COLORS[tag.color] || COLORS.grey;

  const inlineStyle = {
    background: `linear-gradient(135deg, ${colorData.primary}, ${colorData.secondary})`,
    boxShadow: `0 0 8px ${colorData.secondary}`,
  };

  return (
    <span className={`tag ${className}`} style={inlineStyle}>
      {tag.name}
    </span>
  );
}

export default Tag;
