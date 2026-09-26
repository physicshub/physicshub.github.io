import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const codingBouncingBallBlog = {
  slug: "coding-a-bouncing-ball-simulation",
  name: "How do you code a bouncing ball?",
  desc: "Gravity, a floor and a restitution factor make a bouncing ball — but a naive floor check changes the energy. Handle the impact time exactly, in JavaScript.",
  tags: [
    LEVELS.undergraduate,
    DIFFICULTIES.extended,
    TAGS.PHYSICS,
    TAGS.COLLISION,
    TAGS.PROGRAMMING,
  ],
  date: "23/09/2026",
  theory: {
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "How do you code a bouncing ball?",
          },
          {
            type: "paragraph",
            text: "Each physics step does three things: apply gravity to the velocity, move the ball, and — if it went through the floor — reverse the velocity and multiply it by the restitution $e$. The catch is the last part: **where you put the ball when it crosses the floor decides whether energy is conserved**. A common shortcut loses energy even with $e = 1$.",
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "Don't just clamp the ball to the floor and flip its velocity. Solve for the moment of impact inside the step, bounce there, and spend the rest of the step moving away.",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "Step physics at a **fixed** time step and let the frame rate vary independently.",
              "Under constant gravity you can advance exactly: $y \\mathrel{+}= v\\,\\Delta t - \\tfrac12 g\\,\\Delta t^2$, $v \\mathrel{-}= g\\,\\Delta t$.",
              "The impact time inside a step solves $y + v\\tau - \\tfrac12 g\\tau^2 = 0$.",
              "Naive clamp-and-flip loses energy even for a perfectly elastic ball; the exact impact time keeps every bounce at the right height.",
            ],
          },
          {
            type: "paragraph",
            text: "This is the code companion to [How a bouncing ball works](/blog/physics-bouncing-ball-comprehensive-educational-guide), which explains restitution and the $h_n = e^{2n}h_0$ heights we test against below.",
          },
          {
            type: "sectionTitle",
            text: "The full loop in about 35 lines",
          },
          {
            type: "code",
            language: "javascript",
            code: `const G = 9.81;            // m/s²
const E = 0.8;             // restitution
const FIXED_DT = 1 / 120;  // physics step, seconds

const ball = { y: 2, vy: 0 }; // metres above the floor, m/s upward

// Advance under constant gravity for dt seconds — exact, not an approximation.
function fall(b, dt) {
  b.y += b.vy * dt - 0.5 * G * dt * dt;
  b.vy -= G * dt;
}

function step(b, dt) {
  let left = dt;
  while (left > 0) {
    const yEnd = b.y + b.vy * left - 0.5 * G * left * left;
    if (yEnd >= 0) { fall(b, left); return; }        // no impact this step

    // Impact inside the step: solve y + v·τ − ½gτ² = 0 for τ
    const tau = (b.vy + Math.sqrt(b.vy * b.vy + 2 * G * b.y)) / G;
    fall(b, tau);                                     // advance exactly to the floor
    b.y = 0;
    b.vy = -E * b.vy;                                 // bounce
    left -= tau;                                      // spend the remaining time
    if (Math.abs(b.vy) < 0.01) { b.vy = 0; return; }  // resting: stop micro-bounces
  }
}

// Fixed-timestep loop: render at any frame rate, step physics at 120 Hz
let acc = 0;
function frame(frameSeconds) {
  acc += Math.min(frameSeconds, 0.25);  // clamp huge frames (tab was hidden)
  while (acc >= FIXED_DT) { step(ball, FIXED_DT); acc -= FIXED_DT; }
}`,
          },
          {
            type: "sectionTitle",
            text: "Does it match the physics?",
          },
          {
            type: "paragraph",
            text: "Dropping the ball from $2$ m with $e = 0.8$ and recording each peak, the code reproduces the geometric heights $h_n = e^{2n}h_0$ to within the sampling of the step:",
          },
          {
            type: "table",
            columns: ["Bounce", "Theory $2e^{2n}$ (m)", "Code (m)"],
            data: [
              {
                Bounce: "1",
                "Theory $2e^{2n}$ (m)": "1.280",
                "Code (m)": "1.280",
              },
              {
                Bounce: "2",
                "Theory $2e^{2n}$ (m)": "0.819",
                "Code (m)": "0.818",
              },
              {
                Bounce: "3",
                "Theory $2e^{2n}$ (m)": "0.524",
                "Code (m)": "0.524",
              },
              {
                Bounce: "4",
                "Theory $2e^{2n}$ (m)": "0.336",
                "Code (m)": "0.335",
              },
            ],
          },
          {
            type: "sectionTitle",
            text: "Why not just clamp the ball to the floor?",
          },
          {
            type: "paragraph",
            text: "The shortcut is `if (y < 0) { y = 0; vy = -e * vy; }`. When the ball overshoots the floor by a few millimetres, that snap throws away the height it should have had and adds energy at the wrong moment. Even with a perfectly elastic $e = 1$, a ball dropped from $2$ m should return to $2$ m every time. Measured at 30 physics steps per second:",
          },
          {
            type: "table",
            columns: ["Collision handling", "First peaks for e = 1 (m)"],
            data: [
              {
                "Collision handling": "Clamp and flip",
                "First peaks for e = 1 (m)":
                  "1.85, 1.86, 1.66, 1.67, 1.47 — decaying",
              },
              {
                "Collision handling": "Mirror the penetration",
                "First peaks for e = 1 (m)":
                  "1.92, 2.00, 1.92, 2.00 — wobbling",
              },
              {
                "Collision handling": "Exact impact time",
                "First peaks for e = 1 (m)": "≈ 2.00 every time",
              },
            ],
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "Fast objects can skip the floor entirely",
            text: "If the ball moves more than its own thickness in one step it can jump straight over a thin surface (tunnelling). Use a smaller step, several sub-steps, or a swept test between the old and new position.",
          },
          {
            type: "sectionTitle",
            text: "What PhysicsHub does",
          },
          {
            type: "paragraph",
            text: "The Bouncing Ball simulation runs on a fixed 1/120 s step with the shared engine. Its `Bounds` element compensates for the work gravity does while the ball overlaps the floor inside a step, so restitution 1 really is lossless and the heights match the theory rather than drifting down.",
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "Why use a fixed time step for a bouncing ball?",
                a: "With a variable step the result depends on the frame rate: a slow computer would bounce differently from a fast one. A fixed physics step, with rendering decoupled from it, gives the same result everywhere.",
              },
              {
                q: "Why does my ball lose energy even with restitution 1?",
                a: "Almost always the floor handling. Snapping the ball to y = 0 discards the small overshoot inside the step, so each bounce loses a little height. Solve for the impact time and continue from there.",
              },
              {
                q: "How do I stop the infinite tiny bounces at the end?",
                a: "Add a rest threshold: when the rebound speed falls below a small value (for example 0.01 m/s), set the velocity to zero. The physical bounces converge in finite time, but floating-point steps do not.",
              },
              {
                q: "Can I use this for a ball that also moves sideways?",
                a: "Yes. Gravity and the floor only affect the vertical component, so keep a horizontal velocity that does not change (or that you damp with friction) and handle each axis separately.",
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
              "The physics first: [How does a bouncing ball work?](/blog/physics-bouncing-ball-comprehensive-educational-guide).",
              "Watch it run: [Bouncing Ball simulation](/simulations/BouncingBall).",
              "Integrators for oscillators, with measured error: [Simulating a pendulum in code](/blog/simulating-a-pendulum-in-code).",
            ],
          },
        ],
      },
    ],
  },
};
