import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const simulatingAirResistanceBlog = {
  slug: "simulating-air-resistance-in-code",
  name: "How do you code air resistance?",
  desc: "Add a drag term proportional to v² to a falling object and it reaches a terminal velocity. Code it in a few lines of JavaScript and check it against the exact solution.",
  tags: [
    LEVELS.undergraduate,
    DIFFICULTIES.extended,
    TAGS.PHYSICS,
    TAGS.GRAVITY,
    TAGS.PROGRAMMING,
  ],
  date: "23/09/2026",
  theory: {
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "How do you code air resistance?",
          },
          {
            type: "paragraph",
            text: "Add one term to the acceleration: gravity pulls down at $g$, and drag pushes back with $k v^2$, where $k = \\tfrac{1}{2}C_d\\rho A/m$. Step the speed forward with $a = g - kv^2$ and the object speeds up, then levels off at the **terminal velocity** $\\sqrt{g/k}$ — exactly what happens in a real fall.",
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "Because drag is quadratic, the closed-form solution is $v(t) = v_t\\tanh(gt/v_t)$. That gives you an exact answer to test your simulation against.",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "Per-unit-mass drag acceleration is $k v^2$ with $k = \\tfrac12 C_d\\rho A/m$; terminal velocity is $\\sqrt{g/k}$.",
              "Semi-implicit Euler at a small step matches the exact solution: 1154.5 m vs 1154.2 m fallen at $\\Delta t = 0.01$ s.",
              "Always test against the analytic $\\tanh$ solution and against the no-drag limit.",
              "In two dimensions, drag opposes the velocity **relative to the air**: $\\vec a = -k\\,|\\vec v_{rel}|\\,\\vec v_{rel}$.",
            ],
          },
          {
            type: "paragraph",
            text: "This is the code companion to [How free fall works](/blog/ball-free-fall-comprehensive-guide), which derives the drag force and terminal velocity.",
          },
          {
            type: "sectionTitle",
            text: "The whole simulation",
          },
          {
            type: "code",
            language: "javascript",
            code: `const g = 9.81, rho = 1.225;   // m/s², kg/m³
const m = 80, CdA = 0.7;        // skydiver: mass (kg), drag coefficient × area (m²)

const k = (0.5 * rho * CdA) / m;      // drag acceleration per v²
const vTerminal = Math.sqrt(g / k);   // 42.8 m/s

// s.v = downward speed (m/s), s.y = distance fallen (m)
function step(s, dt) {
  const a = g - k * s.v * s.v;   // gravity minus quadratic drag
  s.v += a * dt;                 // update velocity first…
  s.y += s.v * dt;               // …then position with the new velocity
}

// Closed-form solution for quadratic drag, used as the test oracle
const exact = (t) => ({
  v: vTerminal * Math.tanh((g * t) / vTerminal),
  y: ((vTerminal * vTerminal) / g) * Math.log(Math.cosh((g * t) / vTerminal)),
});

const s = { v: 0, y: 0 };
for (let t = 0; t < 30; t += 0.01) step(s, 0.01);
console.log(s, exact(30));`,
          },
          {
            type: "sectionTitle",
            text: "Does it match the exact solution?",
          },
          {
            type: "paragraph",
            text: "For this skydiver the terminal velocity is $42.8$ m/s, reached to within 5% after $8.0$ s and within 1% after $11.5$ s. Compared with a drag-free fall ($98.1$ m/s after $10$ s), drag has already held the speed to $41.9$ m/s. Distance fallen in $30$ s:",
          },
          {
            type: "table",
            columns: ["Time step", "Distance fallen in 30 s", "Error vs exact"],
            data: [
              {
                "Time step": "0.1 s",
                "Distance fallen in 30 s": "1157.6 m",
                "Error vs exact": "+0.3%",
              },
              {
                "Time step": "0.01 s",
                "Distance fallen in 30 s": "1154.5 m",
                "Error vs exact": "+0.03%",
              },
              {
                "Time step": "0.001 s",
                "Distance fallen in 30 s": "1154.2 m",
                "Error vs exact": "≈ 0",
              },
              {
                "Time step": "exact",
                "Distance fallen in 30 s": "1154.2 m",
                "Error vs exact": "—",
              },
            ],
          },
          {
            type: "callout",
            calloutType: "tip",
            title: "The terminal speed is forgiving",
            text: "Even with a huge step of 2 s the speed still settles on 42.8 m/s, because the drag term pulls it back each step; the distance is what needs the small step.",
          },
          {
            type: "sectionTitle",
            text: "Going to two dimensions with wind",
          },
          {
            type: "paragraph",
            text: "In 2D, drag opposes the motion **relative to the air**. If the air moves with velocity $\\vec w$, use $\\vec v_{rel} = \\vec v - \\vec w$ and apply $\\vec a_{drag} = -k\\,|\\vec v_{rel}|\\,\\vec v_{rel}$ to both components. A tailwind then reduces drag on the ball; a headwind increases it. The Ball Gravity simulation keeps things simpler: wind is just a constant horizontal acceleration, with no drag.",
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "Linear vs quadratic drag",
            text: "Quadratic drag ($\\propto v^2$) describes fast objects in air. For very slow motion through a viscous fluid, drag is linear ($\\propto v$), which has a different terminal velocity and a simple exponential approach. Pick the law that fits the regime.",
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "How do I calculate terminal velocity in code?",
                a: "Compute $k = \\tfrac12 C_d\\rho A/m$ and take $v_t = \\sqrt{g/k}$. It is where the gravity and drag accelerations cancel: $g = k v_t^2$.",
              },
              {
                q: "Why does my falling object oscillate or blow up?",
                a: "Almost always a step that is too large for the acceleration you are applying. Reduce the time step, or use a more accurate integrator such as RK4, and check the result against the analytic solution.",
              },
              {
                q: "What values of Cd and area should I use?",
                a: "A sphere is about $C_d = 0.47$; a belly-down skydiver has $C_d A$ around 0.5–0.9 m². Real values depend on shape and speed, so treat them as inputs you tune to a known terminal velocity.",
              },
              {
                q: "Do I need the mass?",
                a: "Yes: drag is a force, so the acceleration it produces is force divided by mass. A denser object with the same shape has a smaller $k$ and a higher terminal velocity.",
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
              "The physics first: [How does free fall work?](/blog/ball-free-fall-comprehensive-guide).",
              "Choosing integrators and measuring their error: [Simulating a pendulum in code](/blog/simulating-a-pendulum-in-code).",
              "Try wind and gravity: [Ball Gravity simulation](/simulations/BallGravity).",
            ],
          },
        ],
      },
    ],
  },
};
