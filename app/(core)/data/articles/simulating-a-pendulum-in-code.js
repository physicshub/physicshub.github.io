import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const simulatingPendulumBlog = {
  slug: "simulating-a-pendulum-in-code",
  name: "How do you simulate a pendulum in code?",
  desc: "Turn the pendulum equation into a state you can step forward in time. Compare explicit Euler, semi-implicit Euler and RK4 with real energy-drift numbers, in JavaScript.",
  tags: [
    LEVELS.undergraduate,
    DIFFICULTIES.advanced,
    TAGS.PHYSICS,
    TAGS.OSCILLATIONS,
    TAGS.PROGRAMMING,
  ],
  date: "23/09/2026",
  theory: {
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "How do you simulate a pendulum in code?",
          },
          {
            type: "paragraph",
            text: "Write the state as two numbers — the angle $\\theta$ and the angular velocity $\\omega$ — and advance them in small time steps using the acceleration $-\\frac{g}{L}\\sin\\theta$. The choice of integrator matters more than it looks: **explicit Euler makes the pendulum gain energy without limit**, while **semi-implicit Euler** and **RK4** keep it stable.",
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "Update the velocity first, then the position with the new velocity (semi-implicit Euler) — or use RK4. Never use plain explicit Euler on an oscillator: its energy grows every step.",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "Convert the second-order equation into two first-order ones: $\\dot\\theta = \\omega$, $\\dot\\omega = -(g/L)\\sin\\theta$.",
              "Explicit Euler is unstable for oscillations: in our test the energy grew by over 2000% in 100 seconds.",
              "Semi-implicit Euler is one line different and keeps the energy bounded; RK4 is far more accurate but costs four evaluations per step.",
              "Resolve the period with plenty of steps — a step below $T/100$ is comfortable for a pendulum.",
            ],
          },
          {
            type: "sectionTitle",
            text: "From one equation to a state you can step",
          },
          {
            type: "paragraph",
            text: "This article is the code companion to [How a pendulum works](/blog/physics-of-pendulum-explained), where the equation $\\ddot\\theta = -\\frac{g}{L}\\sin\\theta$ is derived. A computer steps first-order systems, so introduce $\\omega = \\dot\\theta$:",
          },
          {
            type: "formula",
            latex:
              "\\begin{cases}\\dot\\theta = \\omega \\\\[2pt] \\dot\\omega = -\\dfrac{g}{L}\\sin\\theta\\end{cases}",
          },
          {
            type: "paragraph",
            text: "Each step of length $\\Delta t$ moves $(\\theta,\\omega)$ a little forward. The three integrators below differ only in how they do that.",
          },
          {
            type: "sectionTitle",
            text: "Three integrators in a few lines",
          },
          {
            type: "code",
            language: "javascript",
            code: `const g = 9.81, L = 1;
const accel = (theta) => -(g / L) * Math.sin(theta);

// Energy per unit mass — used to check each method
const energy = ({ theta, omega }) =>
  0.5 * L * L * omega ** 2 + g * L * (1 - Math.cos(theta));

// 1. Explicit Euler: both updates use the OLD state
function explicitEuler(s, dt) {
  const a = accel(s.theta);
  s.theta += s.omega * dt;
  s.omega += a * dt;
}

// 2. Semi-implicit Euler: velocity first, then position with the NEW velocity
function semiImplicitEuler(s, dt) {
  s.omega += accel(s.theta) * dt;
  s.theta += s.omega * dt;
}

// 3. Classic 4th-order Runge–Kutta
function rk4(s, dt) {
  const f = (th, om) => [om, accel(th)];
  const [k1t, k1o] = f(s.theta, s.omega);
  const [k2t, k2o] = f(s.theta + 0.5 * dt * k1t, s.omega + 0.5 * dt * k1o);
  const [k3t, k3o] = f(s.theta + 0.5 * dt * k2t, s.omega + 0.5 * dt * k2o);
  const [k4t, k4o] = f(s.theta + dt * k3t, s.omega + dt * k3o);
  s.theta += (dt / 6) * (k1t + 2 * k2t + 2 * k3t + k4t);
  s.omega += (dt / 6) * (k1o + 2 * k2o + 2 * k3o + k4o);
}

// Run it
const state = { theta: 1, omega: 0 }; // released from rest at 1 rad (~57°)
for (let t = 0; t < 100; t += 0.02) semiImplicitEuler(state, 0.02);
console.log(energy(state));`,
          },
          {
            type: "sectionTitle",
            text: "How much energy does each method lose or gain?",
          },
          {
            type: "paragraph",
            text: "A frictionless pendulum must conserve energy, so drift in $E$ is a direct measure of numerical error. We released the bob from $1$ rad on a $1$ m string and ran $100$ s (about 50 swings):",
          },
          {
            type: "table",
            columns: ["Method", "Δt = 0.02 s", "Δt = 0.005 s"],
            data: [
              {
                Method: "Explicit Euler",
                "Δt = 0.02 s": "+2,175% (blows up)",
                "Δt = 0.005 s": "+566%",
              },
              {
                Method: "Semi-implicit Euler",
                "Δt = 0.02 s": "wobbles within ±3%",
                "Δt = 0.005 s": "wobbles within ±0.7%",
              },
              {
                Method: "RK4",
                "Δt = 0.02 s": "0.0003%",
                "Δt = 0.005 s": "0.0000003%",
              },
            ],
          },
          {
            type: "paragraph",
            text: "Explicit Euler pushes the bob slightly further out on every swing, so the amplitude keeps growing. Semi-implicit Euler is **symplectic**: the energy error oscillates around the true value instead of drifting away, which is why it is the default in most game and physics engines. RK4 is dramatically more accurate per step, but it does not have that structural guarantee, so its error still creeps upward over very long runs.",
          },
          {
            type: "callout",
            calloutType: "tip",
            title: "Choosing a time step",
            text: "For an oscillator with period $T$, keep $\\Delta t$ below about $T/100$ with the Euler variants (RK4 tolerates larger). Cutting $\\Delta t$ by four cut the semi-implicit wobble by about four in the table above.",
          },
          {
            type: "sectionTitle",
            text: "What PhysicsHub does",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "The **Simple Pendulum** simulation does not integrate an angle at all: the bob is a free body under gravity and the string is a `Distance` constraint to the pivot, stepped with semi-implicit Euler at a fixed 1/120 s.",
              "The **Double Pendulum** integrates the exact Lagrangian equations for the two angles with `rk4`, because chaos amplifies any error and a constraint solver on free masses would not be accurate enough.",
            ],
          },
          {
            type: "callout",
            calloutType: "warning",
            title: 'Chaos changes what "correct" means',
            text: "In a chaotic system any numerical error grows exponentially, so a single trajectory becomes meaningless after the Lyapunov time. Judge such simulations by their statistics — the shape of the attractor — not by matching one exact path.",
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "Why does explicit Euler make a pendulum gain energy?",
                a: "It advances the position using the old velocity and the velocity using the old position, so each step overshoots the true curve slightly outward. Those small outward errors add up every step and the amplitude grows without limit.",
              },
              {
                q: "What is a symplectic integrator?",
                a: "One that preserves the geometric structure of Hamiltonian mechanics. In practice, the energy error oscillates around the true value instead of drifting, which keeps long simulations of orbits and oscillators stable. Semi-implicit Euler and Störmer–Verlet are the common examples.",
              },
              {
                q: "When should I use RK4 instead of semi-implicit Euler?",
                a: "When you need high accuracy over short-to-medium runs and can afford four force evaluations per step — for example the double pendulum. For real-time simulations with many bodies and long runs, a symplectic method at a small step is usually the better trade.",
              },
              {
                q: "How small should the time step be?",
                a: "Small enough that the period is covered by at least 50–100 steps for Euler-type methods. If the energy of a frictionless system visibly drifts or wobbles, halve the step and check again.",
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
              "The physics behind this code: [How does a pendulum work?](/blog/physics-of-pendulum-explained).",
              "See both methods running: [Simple Pendulum](/simulations/SimplePendulum) and [Double Pendulum](/simulations/DoublePendulum).",
              "The same idea for a falling ball with drag: [Free fall and air resistance](/blog/ball-free-fall-comprehensive-guide).",
            ],
          },
        ],
      },
    ],
  },
};
