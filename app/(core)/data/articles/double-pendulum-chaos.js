import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const doublePendulumBlog = {
  slug: "double-pendulum-chaos",
  name: "Why is the double pendulum chaotic?",
  desc: "Hang one pendulum from another and the motion becomes unpredictable: a start difference of one millionth of a radian grows to a completely different path within seconds.",
  tags: [
    LEVELS.undergraduate,
    DIFFICULTIES.advanced,
    TAGS.PHYSICS,
    TAGS.OSCILLATIONS,
    TAGS.DYNAMICS,
  ],
  date: "24/09/2026",
  theory: {
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Why is the double pendulum chaotic?",
          },
          {
            type: "paragraph",
            text: "A double pendulum is a pendulum hanging from the end of another. Its equations are exact and deterministic, yet the motion is **chaotic**: two runs that start almost identically drift apart exponentially fast, so long-term prediction is impossible. The chaos comes from the coupling — each arm changes the force on the other through the angle between them — which makes the equations of motion strongly nonlinear.",
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "Chaos here is not randomness. The motion is fully determined by the starting angles and velocities — but tiny differences in those grow exponentially, so you can never predict far ahead.",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "Two coupled angles $\\theta_1$ and $\\theta_2$ give the system **two degrees of freedom** — enough for chaos, unlike a single pendulum.",
              "Total energy is conserved (without damping), but the motion is still unpredictable.",
              "**Sensitive dependence:** in our test a $10^{-6}$ rad difference in the start reached $0.1$ rad after $12$ s and order 1 rad by about $15$ s.",
              "Not every start is chaotic: small swings stay regular and predictable.",
              "In practice, predictions are useful only until the Lyapunov time; after that, only statistics are meaningful.",
            ],
          },
          {
            type: "sectionTitle",
            text: "What is a double pendulum?",
          },
          {
            type: "paragraph",
            text: "Two rigid rods of lengths $L_1$ and $L_2$ carry masses $m_1$ and $m_2$. The upper rod pivots on a fixed point; the lower one pivots on the first mass. Two angles, $\\theta_1$ and $\\theta_2$, fully describe the state, together with their rates of change. That is four numbers — a point in a four-dimensional phase space.",
          },
          {
            type: "sectionTitle",
            text: "Where do the equations come from?",
          },
          {
            type: "paragraph",
            text: "Tracking the tension in two coupled rods is awkward, so physicists use the **Lagrangian** $\\mathcal{L} = T - V$, the kinetic energy minus the potential energy, written in terms of the two angles:",
          },
          {
            type: "formula",
            latex:
              "\\begin{aligned}T &= \\tfrac12(m_1+m_2)L_1^2\\dot\\theta_1^2 + \\tfrac12 m_2L_2^2\\dot\\theta_2^2 + m_2L_1L_2\\dot\\theta_1\\dot\\theta_2\\cos(\\theta_1-\\theta_2) \\\\[2pt] V &= -(m_1+m_2)gL_1\\cos\\theta_1 - m_2gL_2\\cos\\theta_2\\end{aligned}",
          },
          {
            type: "paragraph",
            text: "The cross term $\\dot\\theta_1\\dot\\theta_2\\cos(\\theta_1-\\theta_2)$ is the coupling: the motion of each arm enters the other's equation. Applying the Euler–Lagrange equation to each angle gives two coupled nonlinear differential equations with no general closed-form solution — they have to be integrated numerically.",
          },
          {
            type: "formula",
            ref: "euler-lagrange",
            latex:
              "\\frac{d}{dt}\\frac{\\partial\\mathcal{L}}{\\partial\\dot\\theta_i} - \\frac{\\partial\\mathcal{L}}{\\partial\\theta_i} = 0, \\qquad i = 1, 2",
          },
          {
            type: "sectionTitle",
            text: "What does sensitive dependence look like?",
          },
          {
            type: "paragraph",
            text: "We integrated the exact equations for two double pendulums with $L_1 = L_2 = 1$ m and equal masses, released from rest at $\\theta_1 = 120°$, $\\theta_2 = -10°$. The second run starts with $\\theta_1$ larger by just $10^{-6}$ rad ($0.00006°$):",
          },
          {
            type: "table",
            columns: ["Time", "Difference between the two runs"],
            data: [
              {
                Time: "0 s",
                "Difference between the two runs": "0.000001 rad",
              },
              {
                Time: "5 s",
                "Difference between the two runs": "0.000016 rad",
              },
              { Time: "10 s", "Difference between the two runs": "0.003 rad" },
              {
                Time: "15 s",
                "Difference between the two runs": "1.1 rad (about 64°)",
              },
              {
                Time: "20 s",
                "Difference between the two runs":
                  "2 rad — completely different motion",
              },
            ],
          },
          {
            type: "paragraph",
            text: "The gap grows roughly exponentially, $\\delta(t) \\approx \\delta_0 e^{\\lambda t}$, where $\\lambda$ is the **Lyapunov exponent**. Beyond the **Lyapunov time** $\\sim 1/\\lambda$ the two histories are unrelated. Starting instead from small swings ($5°$, $5°$) with the same $10^{-6}$ rad difference, the runs stayed within about $10^{-6}$ rad for a full minute — regular motion, no chaos.",
          },
          {
            type: "callout",
            calloutType: "info",
            title: "Energy is still conserved",
            text: "Without damping the total energy of the double pendulum is constant — in our integration it stayed within $2\\times10^{-8}$ of its starting value. Conservation of energy restricts where the motion can go, but four-dimensional phase space leaves plenty of room to wander chaotically.",
          },
          {
            type: "sectionTitle",
            text: "Why can't we just use a better computer?",
          },
          {
            type: "paragraph",
            text: "Because the problem is not the arithmetic: any measurement of the starting angles has some error, and that error is amplified exponentially. Halving the uncertainty buys only a fixed amount of extra prediction time, $\\ln 2/\\lambda$. Real chaotic systems — the weather, the three-body problem — face the same wall. What survives is the **statistics**: the region of phase space the motion visits, not the path.",
          },
          {
            type: "callout",
            calloutType: "tip",
            title: "Try it",
            text: "Start the simulation with both angles small, then raise the first angle toward 120° and beyond. Watch the trail change from a tidy pattern to a tangle. Add a little damping and the motion gradually dies down as the energy drains away.",
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "Is the double pendulum random?",
                a: "No. It is completely deterministic: the same starting state always gives the same motion. It is unpredictable in practice because tiny differences in the start grow exponentially, so any real measurement error eventually destroys the prediction.",
              },
              {
                q: "Why is one pendulum not chaotic but two are?",
                a: "A single pendulum has one degree of freedom and its trajectories are constrained by energy conservation to closed curves. Two coupled pendulums have a four-dimensional phase space and a nonlinear coupling, which allows trajectories to wander and diverge.",
              },
              {
                q: "What is the Lyapunov exponent?",
                a: "The average exponential rate at which two nearby trajectories separate, $\\delta(t) \\approx \\delta_0 e^{\\lambda t}$. A positive value signals chaos; its inverse is the Lyapunov time, the horizon beyond which predictions fail.",
              },
              {
                q: "Does a double pendulum always behave chaotically?",
                a: "No. At small amplitudes it behaves like two coupled oscillators with regular, predictable motion. Chaos appears at larger energies, where the nonlinear terms dominate.",
              },
              {
                q: "How is a double pendulum simulated accurately?",
                a: "By integrating the Lagrangian equations for the two angles with a high-accuracy method such as fourth-order Runge–Kutta at a small time step. PhysicsHub's simulation does this directly rather than solving the rods as constraints on free masses.",
              },
            ],
          },
          {
            type: "sectionTitle",
            text: "Keep exploring",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Release your own double pendulum in the [Double Pendulum simulation](/simulations/DoublePendulum).",
              "The single pendulum it is built from: [How does a pendulum work?](/blog/physics-of-pendulum-explained).",
              "How the numerical methods behave: [Simulating a pendulum in code](/blog/simulating-a-pendulum-in-code).",
              "Chaos among three gravitating bodies: [The three-body problem](/blog/physics-behind-three-body-problem).",
            ],
          },
        ],
      },
    ],
  },
};
