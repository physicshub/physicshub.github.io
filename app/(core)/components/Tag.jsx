import { COLORS } from "../data/tags";

function Tag({ tag, className = "" }) {
  const colorData = COLORS[tag.color] || COLORS.grey;

  // Glow is state, not decoration (DESIGN.md "Glow-Is-State Rule"): the chip
  // carries its identity through the fill alone and stays calm at rest, which
  // matters most on blog cards that show several tags at once.
  const inlineStyle = {
    background: `linear-gradient(135deg, ${colorData.primary}, ${colorData.secondary})`,
  };

  return (
    <span className={`tag ${className}`} style={inlineStyle}>
      {tag.name}
    </span>
  );
}

export default Tag;
