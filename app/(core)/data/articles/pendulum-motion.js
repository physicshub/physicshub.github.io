import TAGS from "../tags";

export const pendulumBlog = {
  id: "bb-006",
  slug: "pendulum-motion",
  name: "How works a pendulum?",
  desc: "All you need to know about pendulum.",
  tags: [TAGS.MEDIUM, TAGS.OSCILLATIONS, TAGS.ENERGY, TAGS.PHYSICS],
  theory: {
    sections: [
      {
        title: "Introduction",
        blocks: [
          {
            type: "paragraph",
            text: "A simple pendulum is formed by a small bob of mass m suspended from a fixed point by a light, inextensible string of length L. When displaced from equilibrium and released, the bob oscillates under the influence of gravity.",
          },
          {
            type: "formula",
            latex: "T = 2\\pi \\sqrt{\\tfrac{L}{g}}",
          },
          {
            type: "paragraph",
            text: "Here, T is the time period of one oscillation, L is the length of the pendulum, and g is the acceleration due to gravity.",
          },
        ],
      },
      {
        title: "Forces Involved",
        blocks: [
          {
            type: "subheading",
            text: "Gravitational Force",
          },
          {
            type: "paragraph",
            text: "The bob experiences its weight acting vertically downward.",
          },
          {
            type: "formula",
            latex: "F_{g} = m g",
          },
          {
            type: "paragraph",
            text: "Here, Fg is the gravitational force (weight), m is the mass of the bob, and g is the acceleration due to gravity.",
          },
          {
            type: "subheading",
            text: "Tension",
          },
          {
            type: "paragraph",
            text: "The string provides a tension force directed along its length, balancing part of the weight and keeping the bob constrained to move along a circular arc.",
          },
          {
            type: "formula",
            latex: "T - m g \\cos\\theta = m \\tfrac{v^2}{L}",
          },
          {
            type: "paragraph",
            text: "Here, T is the tension in the string, m is the bob’s mass, g is acceleration due to gravity, θ is the angular displacement, v is the bob’s velocity, and L is the string length.",
          },
          {
            type: "subheading",
            text: "Restoring Force",
          },
          {
            type: "paragraph",
            text: "The tangential component of gravity acts as the restoring force, pulling the bob back to its mean position.",
          },
          {
            type: "formula",
            latex: "F_{restoring} = - m g \\sin\\theta",
          },
          {
            type: "paragraph",
            text: "Here, Frestoring is the restoring force, m is the mass of the bob, g is acceleration due to gravity, and θ is the angular displacement.",
          },
        ],
      },
      {
        title: "Equation of Motion",
        blocks: [
          {
            type: "paragraph",
            text: "Applying Newton’s second law along the arc gives the differential equation of motion.",
          },
          {
            type: "formula",
            latex: "m L \\tfrac{d^2\\theta}{dt^2} = - m g \\sin\\theta",
          },
          {
            type: "paragraph",
            text: "Here, m is the bob’s mass, L is the string length, θ is angular displacement, t is time, and g is acceleration due to gravity.",
          },
          {
            type: "formula",
            latex: "\\tfrac{d^2\\theta}{dt^2} + \\tfrac{g}{L} \\sin\\theta = 0",
          },
          {
            type: "paragraph",
            text: "This is the general differential equation for pendulum motion, where θ is angular displacement, g is acceleration due to gravity, and L is the length of the pendulum.",
          },
        ],
      },
      {
        title: "Small Angle Approximation",
        blocks: [
          {
            type: "paragraph",
            text: "For small angles (θ < 10°), we approximate sinθ ≈ θ (in radians). This simplifies the motion to simple harmonic motion (SHM).",
          },
          {
            type: "formula",
            latex: "\\tfrac{d^2\\theta}{dt^2} + \\tfrac{g}{L}\\,\\theta = 0",
          },
          {
            type: "paragraph",
            text: "Here, θ is angular displacement, g is gravitational acceleration, and L is string length. This equation represents SHM.",
          },
          {
            type: "paragraph",
            text: "The solution describes oscillations with angular frequency ω = √(g/L).",
          },
          {
            type: "formula",
            latex: "T = 2\\pi \\sqrt{\\tfrac{L}{g}}",
          },
          {
            type: "paragraph",
            text: "Here, T is the time period, L is the string length, and g is the acceleration due to gravity.",
          },
        ],
      },
      {
        title: "Energy Analysis",
        blocks: [
          {
            type: "paragraph",
            text: "The pendulum continuously exchanges energy between kinetic and potential forms while total mechanical energy remains constant (ignoring air resistance).",
          },
          {
            type: "formula",
            latex: "E = K + U = \\tfrac{1}{2} m v^2 + m g h",
          },
          {
            type: "paragraph",
            text: "Here, E is total energy, K is kinetic energy, U is potential energy, m is the bob’s mass, v is velocity, g is gravitational acceleration, and h is height relative to the mean position.",
          },
          {
            type: "paragraph",
            text: "At the mean position, energy is entirely kinetic; at extreme positions, it is entirely potential.",
          },
        ],
      },
      {
        title: "Measurements and Observations",
        blocks: [
          {
            type: "list",
            ordered: false,
            items: [
              "The period is independent of the bob's mass.",
              "For small oscillations, the time period depends only on length L and gravity g.",
              "Longer pendulums have longer periods.",
              "For large angles, the motion deviates from SHM and the period increases slightly.",
            ],
          },
        ],
      },
      {
        title: "Constants and Recommended Values",
        blocks: [
          {
            type: "table",
            columns: ["Constant", "Meaning", "Suggested value"],
            data: [
              {
                Constant: "g",
                Meaning: "Gravitational acceleration",
                "Suggested value": "9.8 m/s²",
              },
              {
                Constant: "L",
                Meaning: "Length of pendulum",
                "Suggested value": "0.5 – 2.0 m",
              },
              {
                Constant: "θ",
                Meaning: "Initial displacement angle",
                "Suggested value": "< 10° for SHM",
              },
            ],
          },
        ],
      },
      {
        title: "Advanced Derivation",
        blocks: [
          {
            type: "toggle",
            title: "Show Mathematical Derivation",
            content:
              "Starting with torque τ = -mgL sinθ and I = mL², we get mL² d²θ/dt² = -mgL sinθ. Simplifying gives d²θ/dt² + (g/L) sinθ = 0. For small θ, sinθ ≈ θ, reducing to SHM: d²θ/dt² + (g/L) θ = 0. Solution: θ(t) = θ₀ cos(ωt + φ), with ω = √(g/L) and period T = 2π√(L/g).",
          },
        ],
      },
    ],
  },
};
