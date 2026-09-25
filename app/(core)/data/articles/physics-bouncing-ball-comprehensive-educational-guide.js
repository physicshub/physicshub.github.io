import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const bouncingBallBlog = {
  slug: "physics-bouncing-ball-comprehensive-educational-guide",
  name: "How does a bouncing ball work?",
  desc: "A bouncing ball loses speed at each impact, keeping a fraction e (restitution). Every bounce reaches e² of the last height — the maths, with a simulation.",
  tags: [
    LEVELS.upperSecondary,
    DIFFICULTIES.core,
    TAGS.PHYSICS,
    TAGS.KINEMATICS,
    TAGS.ENERGY,
    TAGS.COLLISION,
  ],
  date: "23/01/2026",
  updated: "23/09/2026",
  theory: {
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "How does a bouncing ball work?",
          },
          {
            type: "paragraph",
            text: "A bouncing ball alternates between two simple things: **free fall** under gravity, and a brief **collision** with the floor that reverses its velocity but keeps only a fraction of its speed. That fraction is the **coefficient of restitution** $e$: a ball with $e = 0.8$ leaves the floor at 80% of the speed it arrived with, so each bounce reaches only $e^2 = 64\\%$ of the previous height.",
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "After every bounce the speed is multiplied by $e$ and the height by $e^2$, so bounce heights shrink geometrically: $h_n = e^{2n}h_0$. The infinite series of bounces still ends in a finite time.",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "Between bounces the only force is gravity: constant acceleration $g$ downward, and the horizontal speed does not change.",
              "The floor reverses the vertical velocity and scales it by $e$ (restitution), between $0$ (clay) and $1$ (perfectly elastic).",
              "Kinetic energy kept per bounce is $e^2$, and bounce heights follow $h_n = e^{2n}h_0$.",
              "Total time is finite: $t_{total} = \\dfrac{1+e}{1-e}\\sqrt{\\dfrac{2h_0}{g}}$, however many bounces there are.",
              "The lost energy becomes heat and sound in the ball and the floor.",
            ],
          },
          {
            type: "sectionTitle",
            text: "What happens between bounces?",
          },
          {
            type: "paragraph",
            text: "Once the ball leaves the floor, gravity is the only thing acting on it. The vertical velocity changes at a steady $-g$, and the horizontal velocity stays constant (there is no friction with the air in the basic model). Dropped from height $h_0$ it reaches the floor after $t_0 = \\sqrt{2h_0/g}$ with speed $v_0 = \\sqrt{2gh_0}$ — energy conservation gives the same result.",
          },
          {
            type: "formula",
            ref: "free-fall-speed",
            latex:
              "v_0 = \\sqrt{2\\,g\\,h_0}, \\qquad t_0 = \\sqrt{\\dfrac{2\\,h_0}{g}}",
          },
          {
            type: "callout",
            calloutType: "tip",
            title: "Try it",
            text: "Change gravity in the simulation to the Moon or Jupiter. The ball's bounce heights follow the same pattern, but the whole rhythm speeds up or slows down with $\\sqrt{1/g}$.",
          },
          {
            type: "sectionTitle",
            text: "What does the coefficient of restitution mean?",
          },
          {
            type: "paragraph",
            text: "No real collision is perfectly elastic. The ball squashes against the floor, stores some energy elastically, and returns most — not all — of it. Restitution measures how much: the ratio of separation speed to approach speed.",
          },
          {
            type: "formula",
            ref: "coefficient-of-restitution",
            latex:
              "e = \\frac{v_{\\text{after}}}{v_{\\text{before}}}, \\qquad 0 \\le e \\le 1",
          },
          {
            type: "table",
            columns: ["Ball", "Typical $e$ (on a hard floor)"],
            data: [
              {
                Ball: "Superball",
                "Typical $e$ (on a hard floor)": "0.85 – 0.92",
              },
              {
                Ball: "Basketball",
                "Typical $e$ (on a hard floor)": "0.75 – 0.85",
              },
              {
                Ball: "Tennis ball",
                "Typical $e$ (on a hard floor)": "0.70 – 0.75",
              },
              {
                Ball: "Golf ball",
                "Typical $e$ (on a hard floor)": "0.60 – 0.70",
              },
              {
                Ball: "Wooden ball",
                "Typical $e$ (on a hard floor)": "0.40 – 0.50",
              },
              { Ball: "Lump of clay", "Typical $e$ (on a hard floor)": "≈ 0" },
            ],
          },
          {
            type: "callout",
            calloutType: "info",
            title: "e depends on the pair",
            text: "Restitution belongs to the ball **and** the surface together, and it varies with impact speed. The values above are typical, not universal constants.",
          },
          {
            type: "sectionTitle",
            text: "How high does each bounce go?",
          },
          {
            type: "paragraph",
            text: "The ball hits with speed $v_0$ and leaves with $ev_0$. Rising against gravity, a launch speed $v$ reaches height $v^2/2g$, so the next bounce reaches $h_1 = (ev_0)^2/2g = e^2 h_0$. Repeating gives a geometric sequence:",
          },
          {
            type: "formula",
            latex: "h_n = e^{2n}\\,h_0",
          },
          {
            type: "paragraph",
            text: "Drop a ball with $e = 0.8$ from $2\\ \\text{m}$ and the peaks are $1.28$, $0.82$, $0.52$, $0.34$ m and so on. The kinetic energy retained per bounce is $e^2$ — for $e = 0.8$ only 64%, so after ten bounces just about 1% of the original energy is left.",
          },
          {
            type: "toggle",
            title: "Why the bouncing stops in finite time",
            content:
              "Each bounce takes less time than the last: the flight after bounce $n$ lasts $2e^n t_0$. Summing the geometric series gives $t_{total} = t_0\\left(1 + \\dfrac{2e}{1-e}\\right) = \\dfrac{1+e}{1-e}\\sqrt{\\dfrac{2h_0}{g}}$, and the total distance travelled is $h_0\\,\\dfrac{1+e^2}{1-e^2}$. For $e = 0.8$ and $h_0 = 2$ m that is about $9.1$ m of travel over an infinite number of bounces — and a finite time.",
          },
          {
            type: "sectionTitle",
            text: "Where does the lost energy go?",
          },
          {
            type: "paragraph",
            text: "During impact the ball compresses like a spring and then expands, but the compression and rebound do not follow exactly the same force curve — that is called **hysteresis**. The area between the two curves is energy turned into heat and sound in the ball and floor. Softer, more internally lossy materials (clay, dead tennis balls) lose more; hard, springy ones (a superball) lose less.",
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "What is the coefficient of restitution?",
                a: "It is the ratio of a ball's speed after a collision to its speed before. It runs from 0 (the ball does not bounce at all) to 1 (a perfectly elastic collision). A ball with $e = 0.7$ rebounds at 70% of its impact speed.",
              },
              {
                q: "Why does each bounce go lower?",
                a: "Because part of the kinetic energy is lost as heat and sound at every impact. The speed is multiplied by $e$ each time, so the height — which depends on speed squared — is multiplied by $e^2$.",
              },
              {
                q: "Does a bouncing ball bounce forever?",
                a: "Mathematically there are infinitely many bounces, but they take a finite total time $\\frac{1+e}{1-e}\\sqrt{2h_0/g}$ and the ball ends up at rest. In practice it stops sooner, when the bounces become too small to notice.",
              },
              {
                q: "Does a heavier ball bounce higher?",
                a: "Not in this model. Mass cancels out of the equations of free fall and the collision only involves the ratio $e$. Real heavier balls can differ because their materials and air resistance differ.",
              },
              {
                q: "How do I know e for a real ball?",
                a: "Drop it from a known height $h_0$, measure the rebound height $h_1$ and use $e = \\sqrt{h_1/h_0}$.",
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
              "Drop your own ball with any gravity and restitution: [Bouncing Ball simulation](/simulations/BouncingBall).",
              "How the same idea runs on a computer: [Coding a bouncing-ball simulation](/blog/coding-a-bouncing-ball-simulation).",
              "Add air resistance and wind: [Free fall and air resistance](/blog/ball-free-fall-comprehensive-guide).",
              "Collisions between two moving bodies: [1D Collision simulation](/simulations/CollisionSimulation).",
            ],
          },
        ],
      },
    ],
  },
};
