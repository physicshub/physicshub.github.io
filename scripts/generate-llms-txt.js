// scripts/generate-llms-txt.js
/**
 * Generates /llms.txt and /llms-full.txt according to the llmstxt.org GEO standard.
 *
 * Generative search engines (Perplexity, SearchGPT, Claude, Gemini) use llms.txt
 * to discover structured site knowledge, simulation directories, and deep links.
 */

import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import chapters from "../app/(core)/data/chapters.js";
import { blogsArray } from "../app/(core)/data/articles/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HOSTNAME = "https://physicshub.github.io";
const NOINDEX_PATHS = new Set(["/blog/create", "/simulations/test"]);

export function generateLlmsTxtContent() {
  const simulationEntries = chapters
    .filter((c) => !NOINDEX_PATHS.has(c.link))
    .map(
      (c) =>
        `- [${c.name}](${HOSTNAME}${c.link}): ${c.desc.replace(/\s+/g, " ").trim()}`
    )
    .join("\n");

  const blogEntries = blogsArray
    .filter((b) => !NOINDEX_PATHS.has(`/blog/${b.slug}`))
    .map((b) => {
      const title = b.name || b.theory?.title || b.title || b.slug;
      const desc = b.desc || b.description || "Educational physics guide and mathematical theory.";
      return `- [${title}](${HOSTNAME}/blog/${b.slug}): ${desc.replace(/\s+/g, " ").trim()}`;
    })
    .join("\n");

  return `# PhysicsHub

> Free, open-source educational platform featuring interactive physics simulations and theoretical guides for students, educators, and developers.

## Overview

PhysicsHub provides real-time browser-based physics visualizations covering kinematics, dynamics, harmonic motion, vectors, collision theory, and modern physics. Each simulation provides interactive controls, mathematical formulations, and visual representations to help students understand abstract physical concepts.

- Website: ${HOSTNAME}
- Repository: https://github.com/physicshub/physicshub.github.io
- License: Open Source (MIT)

## Interactive Simulations

${simulationEntries}

## Educational Guides & Theory

${blogEntries}

## Core Topics & Disciplines

- **Kinematics & Motion**: Displacement, velocity, uniform acceleration, parabolic trajectories.
- **Classical Dynamics**: Newton's laws of motion, gravitational fields, air resistance, elastic & inelastic collisions.
- **Harmonic Oscillations**: Simple harmonic motion (SHM), Hooke's law, spring-mass systems, pendulums.
- **Mathematical Tools**: Vector arithmetic, 2D vector decomposition, dot products, trigonometry.

## Optional & Deep Resources

- [Full Knowledge Base](${HOSTNAME}/llms-full.txt): Detailed simulation parameters, formulas, target educational levels, and complete documentation.
`;
}

const SIMULATION_DETAILS = {
  "/simulations/BouncingBall": {
    equations: "Kinematics: y(t) = y₀ + v₀t - ½gt²; Velocity: v(t) = v₀ - gt; Coefficient of restitution: e = v_after / v_before (e ∈ [0, 1])",
    parameters: "Gravity (g), Initial velocity (v₀), Elasticity/Restitution (e), Ball radius, Surface friction",
  },
  "/simulations/VectorsOperations": {
    equations: "Vector addition: R_x = A_x + B_x, R_y = A_y + B_y; Magnitude: |R| = √(R_x² + R_y²); Dot product: A · B = |A||B|cos(θ) = A_x B_x + A_y B_y; Angle: θ = arccos((A · B)/(|A||B|))",
    parameters: "Vector A (x, y components / magnitude & angle), Vector B (x, y components / magnitude & angle)",
  },
  "/simulations/BallAcceleration": {
    equations: "Newton's Second Law: F_net = ma; Uniform acceleration: v(t) = v₀ + at, r(t) = r₀ + v₀t + ½at²; Direction vector: a_dir = (cursor - r) / |cursor - r|",
    parameters: "Mass (m), Acceleration magnitude (|a|), Cursor target coordinate, Velocity damping",
  },
  "/simulations/BallGravity": {
    equations: "Gravitational force: F_g = mg; Aerodynamic drag: F_d = -½ ρ C_d A v² v̂; Net acceleration: a = g - (F_d / m)",
    parameters: "Mass (m), Gravitational acceleration (g), Air density (ρ), Drag coefficient (C_d), Elasticity",
  },
  "/simulations/SpringConnection": {
    equations: "Hooke's Law: F = -kx; Angular frequency: ω = √(k / m); Period: T = 2π√(m / k); Total Mechanical Energy: E = ½kx² + ½mv² = constant",
    parameters: "Spring constant (k), Suspended mass (m), Displacement (x), Damping coefficient (c)",
  },
  "/simulations/SimplePendulum": {
    equations: "Equation of motion: d²θ/dt² + (g/L)sin(θ) = 0; Small-angle approximation (sin θ ≈ θ): θ(t) = θ₀ cos(ωt); Angular frequency: ω = √(g/L); Period: T ≈ 2π√(L/g)",
    parameters: "Pendulum rod length (L), Gravitational acceleration (g), Bob mass (m), Initial release angle (θ₀)",
  },
  "/simulations/ParabolicMotion": {
    equations: "Horizontal: x(t) = v₀ cos(θ) t; Vertical: y(t) = v₀ sin(θ) t - ½gt²; Max height: H = (v₀² sin²θ) / (2g); Range: R = (v₀² sin(2θ)) / g; Flight time: t_flight = (2 v₀ sin θ) / g",
    parameters: "Launch angle (θ), Initial velocity (v₀), Launch height (y₀), Gravity (g)",
  },
  "/simulations/InclinedPlane": {
    equations: "Parallel gravitational force: F_∥ = mg sin(θ); Perpendicular / Normal force: N = mg cos(θ); Kinetic friction: f_k = μ_k N = μ_k mg cos(θ); Net acceleration: a = g(sin θ - μ_k cos θ)",
    parameters: "Incline angle (θ), Mass (m), Friction coefficient (μ_k), Incline length",
  },
  "/simulations/CircularMotion": {
    equations: "Centripetal acceleration: a_c = v² / r = ω²r; Centripetal force: F_c = m v² / r = m ω² r; Angular velocity: ω = 2π / T = 2πf; Tangential speed: v = ωr",
    parameters: "Radius (r), Angular speed (ω), Tangential speed (v), Mass (m)",
  },
  "/simulations/ThreeBody": {
    equations: "Gravitational equations of motion: d²r_i/dt² = -G ∑_{j≠i} m_j (r_i - r_j) / |r_i - r_j|³ for i,j ∈ {1, 2, 3}; Energy conservation: E = ∑ ½m_i v_i² - G ∑_{i<j} m_i m_j / |r_i - r_j|",
    parameters: "Masses (m₁, m₂, m₃), Initial position vectors (r₁, r₂, r₃), Initial velocity vectors (v₁, v₂, v₃), Gravitational constant (G)",
  },
  "/simulations/HorizontalSpring": {
    equations: "Equation of motion: m (d²x/dt²) + c (dx/dt) + kx = 0; Undamped frequency: ω₀ = √(k/m); Damped frequency: ω_d = √(ω₀² - γ²); Energy: E = ½kx² + ½mv²",
    parameters: "Mass (m), Spring constant (k), Friction/damping coefficient (c), Amplitude (A)",
  },
  "/simulations/DoublePendulum": {
    equations: "Lagrangian: L = T - V with generalised coordinates (θ₁, θ₂); Nonlinear coupled Euler-Lagrange equations producing deterministic chaos; Sensitive dependence on initial conditions (Lyapunov exponent λ > 0)",
    parameters: "Rod lengths (L₁, L₂), Bob masses (m₁, m₂), Initial angles (θ₁, θ₂), Gravity (g)",
  },
  "/simulations/CollisionSimulation": {
    equations: "Conservation of momentum: m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'; Elastic collision velocity relations: v₁' = [(m₁ - m₂)v₁ + 2m₂v₂] / (m₁ + m₂), v₂' = [(m₂ - m₁)v₂ + 2m₁v₁] / (m₁ + m₂); Kinetic energy: ½m₁v₁² + ½m₂v₂² = ½m₁v₁'² + ½m₂v₂'²",
    parameters: "Masses (m₁, m₂), Initial velocities (v₁, v₂), Elasticity coefficient (e ∈ [0, 1])",
  },
  "/simulations/PiCollisions": {
    equations: "Conservation of energy: ½M V² + ½m v² = E; Scaled coordinates: x = √(M) V, y = √(m) v; Trajectory forms an angle θ = arctan(√(m/M)); Total number of collisions N = ⌊π / θ⌋ = ⌊π √(M/m)⌋",
    parameters: "Mass of large block (M = 100^k), Mass of small block (m = 1), Elasticity (e = 1)",
  },
  "/simulations/TrigonometricCircle": {
    equations: "Unit circle definition: x² + y² = 1; x = cos(θ), y = sin(θ); tan(θ) = sin(θ)/cos(θ); Pythagorean identity: sin²(θ) + cos²(θ) = 1; Wave equation: y(t) = A sin(ωθ + φ)",
    parameters: "Angle (θ in radians/degrees), Amplitude (A), Angular frequency (ω), Phase shift (φ)",
  },
};

export function generateLlmsFullTxtContent() {
  const simulationSections = chapters
    .filter((c) => !NOINDEX_PATHS.has(c.link))
    .map((c) => {
      const tagsStr = Array.isArray(c.tags)
        ? c.tags.map((t) => (typeof t === "object" && t !== null ? t.name : t)).filter(Boolean).join(", ")
        : "";
      const relatedGuide = c.relatedBlogSlug
        ? `\n- **Related Guide**: [Read Guide](${HOSTNAME}/blog/${c.relatedBlogSlug})`
        : "";
      const details = SIMULATION_DETAILS[c.link];
      const equationsStr = details?.equations ? `\n- **Governing Equations**: ${details.equations}` : "";
      const paramsStr = details?.parameters ? `\n- **Key Parameters**: ${details.parameters}` : "";

      return `### ${c.name}

- **URL**: ${HOSTNAME}${c.link}
- **Description**: ${c.desc.replace(/\s+/g, " ").trim()}
- **Target Level**: ${c.level || "General"}
- **Difficulty**: ${c.difficulty || "core"}
- **Physics Topics**: ${tagsStr}${equationsStr}${paramsStr}${relatedGuide}
`;
    })
    .join("\n");

  const blogSections = blogsArray
    .filter((b) => !NOINDEX_PATHS.has(`/blog/${b.slug}`))
    .map((b) => {
      const title = b.name || b.theory?.title || b.title || b.slug;
      const summary = b.desc || b.description || "Educational physics guide and mathematical theory.";
      return `### ${title}

- **URL**: ${HOSTNAME}/blog/${b.slug}
- **Summary**: ${summary.replace(/\s+/g, " ").trim()}
- **Date Published**: ${b.date || "N/A"}
`;
    })
    .join("\n");

  return `# PhysicsHub — Full Knowledge Base (LLMs Full)

> Comprehensive directory of interactive simulations, physical formulas, and educational resources for Large Language Models and AI answer engines.

## Simulations Directory

${simulationSections}

## Educational Articles & Guides

${blogSections}
`;
}

export function writeLlmsFiles() {
  const publicDir = join(__dirname, "../public");
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  const llmsTxt = generateLlmsTxtContent();
  const llmsFullTxt = generateLlmsFullTxtContent();

  const publicLlmsPath = join(publicDir, "llms.txt");
  const publicLlmsFullPath = join(publicDir, "llms-full.txt");

  writeFileSync(publicLlmsPath, llmsTxt, "utf-8");
  writeFileSync(publicLlmsFullPath, llmsFullTxt, "utf-8");

  console.log(`✅ llms.txt generated in public/ (${chapters.length} simulations, ${blogsArray.length} blogs)`);
  console.log(`✅ llms-full.txt generated in public/`);

  const outDir = join(__dirname, "../out");
  if (existsSync(outDir)) {
    writeFileSync(join(outDir, "llms.txt"), llmsTxt, "utf-8");
    writeFileSync(join(outDir, "llms-full.txt"), llmsFullTxt, "utf-8");
    console.log(`✅ llms.txt & llms-full.txt copied to ./out/`);
  }
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith("generate-llms-txt.js")) {
  try {
    writeLlmsFiles();
  } catch (err) {
    console.error("❌ Error generating llms.txt:", err);
    process.exit(1);
  }
}
