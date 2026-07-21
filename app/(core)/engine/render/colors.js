/**
 * One palette for force vectors across every simulation, so that "red is
 * weight, green is normal, orange is friction" holds everywhere.
 */
export const FORCE_COLORS = {
  weight: "#ef4444", // red
  gravity: "#ef4444",
  normal: "#10b981", // green
  friction: "#f59e0b", // orange
  applied: "#a855f7", // purple
  tension: "#06b6d4", // cyan
  spring: "#ec4899", // pink
  drag: "#6366f1", // indigo
  damping: "#818cf8",
  wind: "#6366f1",
  buoyancy: "#38bdf8", // sky
  centripetal: "#ef4444",
  net: "#fbbf24", // amber
  component: "#fca5a5", // light red, used dashed
  velocity: "#22d3ee",
  acceleration: "#f472b6",
};

/** Neutral greys for scene furniture (anchors, ground, guides). */
export const SCENE_COLORS = {
  anchor: "#9ca3af",
  rope: "#9ca3af",
  ground: "#64648c",
  guide: "#7dd3fc",
  marker: "#f472b6",
};

export default FORCE_COLORS;
