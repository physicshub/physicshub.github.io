import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const projectileParabolicBlog = {
  id: "bb-007",
  slug: "projectile-parabolic-motion",
  name: "How does projectile motion work?",
  desc: "Gravity pulls a projectile down while its sideways speed stays constant; together they trace a parabola. The equations, range and angle, with a launcher.",
  tags: [
    LEVELS.upperSecondary,
    DIFFICULTIES.core,
    TAGS.PHYSICS,
    TAGS.KINEMATICS,
    TAGS.GRAVITY,
    TAGS.ACCELERATION,
  ],
  date: "21/01/2026",
  updated: "06/09/2026",
  theory: {
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "How does projectile motion work?",
          },
          {
            type: "paragraph",
            text: "A projectile is any object moving through the air with gravity as the only force acting on it. Its motion splits into two parts that do not affect each other: the horizontal part travels at a **constant speed**, and the vertical part **accelerates downward at $g \\approx 9.81\\ \\text{m/s}^2$**. Add those two motions together and the object traces a parabola.",
          },
          {
            type: "paragraph",
            text: "Everything else — how far it lands, how high it climbs, how long it stays up — follows from those two rules plus the launch speed $v_0$ and angle $\\theta$.",
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "Horizontal and vertical motion are independent: sideways velocity never changes, vertical velocity changes at $g$. The parabola is just those two motions plotted together.",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "Split every projectile problem into horizontal ($x$) and vertical ($y$) components and solve them separately.",
              "Horizontal: $x = v_0\\cos\\theta\\;t$ at constant speed. Vertical: $y = h_0 + v_0\\sin\\theta\\;t - \\tfrac12 g t^2$.",
              "At the apex the vertical velocity is zero; the horizontal velocity is unchanged.",
              "Launching and landing at the same height, a $45°$ angle gives the maximum range — but only with no air resistance.",
            ],
          },
          {
            type: "sectionTitle",
            text: "Why are the two motions independent?",
          },
          {
            type: "paragraph",
            text: "Gravity pulls straight down, so it can only change the vertical velocity. It has no horizontal component, which means the horizontal velocity a projectile is launched with is the horizontal velocity it keeps for the whole flight (ignoring air). This is why a bullet fired horizontally and a bullet dropped from the same height hit the ground at the same moment: their vertical motions are identical, and the horizontal motion of the fired bullet does not delay the fall.",
          },
          {
            type: "callout",
            calloutType: "tip",
            title: "See it in the simulation",
            text: "Set the angle to $0°$ and launch. Then drop a second ball straight down from the same height. Both reach the floor together — the horizontal speed changes where the ball lands, not when.",
          },
          {
            type: "sectionTitle",
            text: "The equations of projectile motion",
          },
          {
            type: "paragraph",
            text: "Resolve the launch velocity into components — $v_{0x} = v_0\\cos\\theta$ and $v_{0y} = v_0\\sin\\theta$ — then apply constant-velocity motion horizontally and constant-acceleration motion vertically:",
          },
          {
            type: "formula",
            latex:
              "\\begin{aligned}x(t) &= v_0 \\cos\\theta\\;t \\\\[2pt] y(t) &= h_0 + v_0 \\sin\\theta\\;t - \\tfrac{1}{2}g t^2\\end{aligned}",
          },
          {
            type: "paragraph",
            text: "Eliminating $t$ between those two equations gives $y$ as a function of $x$ — and the result is a quadratic in $x$, which is the equation of a parabola. That is **why** the path is parabolic rather than, say, circular.",
          },
          {
            type: "formula",
            ref: "projectile-trajectory",
            latex:
              "y = h_0 + x\\tan\\theta - \\frac{g\\,x^2}{2\\,v_0^2\\cos^2\\theta}",
          },
          {
            type: "sectionTitle",
            text: "Range, maximum height and time of flight",
          },
          {
            type: "paragraph",
            text: "Three numbers describe the whole arc. Setting $y = 0$ in the vertical equation and solving the quadratic gives the **time of flight**; the horizontal equation then gives the **range**; and the apex is where the vertical velocity $v_y = v_0\\sin\\theta - g t$ passes through zero.",
          },
          {
            type: "table",
            columns: ["Quantity", "Formula (launch from ground, $h_0 = 0$)"],
            data: [
              {
                Quantity: "Time of flight",
                "Formula (launch from ground, $h_0 = 0$)":
                  "$t_f = \\dfrac{2 v_0 \\sin\\theta}{g}$",
              },
              {
                Quantity: "Maximum height",
                "Formula (launch from ground, $h_0 = 0$)":
                  "$H = \\dfrac{v_0^2 \\sin^2\\theta}{2g}$",
              },
              {
                Quantity: "Range",
                "Formula (launch from ground, $h_0 = 0$)":
                  "$R = \\dfrac{v_0^2 \\sin 2\\theta}{g}$",
              },
            ],
          },
          {
            type: "paragraph",
            text: "The range formula contains $\\sin 2\\theta$, which is largest when $2\\theta = 90°$, i.e. $\\theta = 45°$. That is the famous result — but it only holds when the projectile lands at its launch height and there is no drag. Launch from a cliff and the best angle drops below $45°$; add air resistance and it drops further still.",
          },
          {
            type: "toggle",
            title: "What if it launches from a height h₀?",
            content:
              "The time of flight becomes $t_f = \\dfrac{v_0\\sin\\theta + \\sqrt{v_0^2\\sin^2\\theta + 2 g h_0}}{g}$, and the range is $R = v_0\\cos\\theta\\;t_f$. The extra height buys extra hang time, so the range grows and the optimum launch angle shifts below $45°$.",
          },
          {
            type: "sectionTitle",
            text: "What changes with drag and wind?",
          },
          {
            type: "paragraph",
            text: "The clean parabola assumes gravity is the only force. Turn on **drag** in the simulation and the air pushes back opposite to the velocity, growing with speed — the trajectory becomes lopsided, the descent steeper than the climb, and the range shorter than the ideal formula predicts. **Wind** adds a constant horizontal push that stretches the range downwind and compresses it upwind. With either enabled, the predicted landing point in the readout starts to diverge from where the ball actually lands, which is the whole point of the comparison.",
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "Energy is not always conserved here",
            text: "Without drag, mechanical energy $E = \\tfrac12 m v^2 + m g h$ stays constant and kinetic energy just swaps with potential energy over the arc. Once drag is on, some of that energy leaves as heat and $E$ decreases.",
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "Why is the path a parabola and not an arc of a circle?",
                a: "Because the horizontal position grows linearly with time while the vertical position has a $-\\tfrac12 g t^2$ term. Substituting $t = x / (v_0\\cos\\theta)$ makes $y$ a quadratic function of $x$, and a quadratic graph is a parabola.",
              },
              {
                q: "Is 45° always the best angle for maximum range?",
                a: "Only when the launch and landing heights are equal and there is no air resistance. Launching from above the landing point lowers the optimal angle; adding drag lowers it further, typically to around 30–40° for real balls.",
              },
              {
                q: "What is the velocity at the highest point?",
                a: "The vertical velocity is exactly zero at the apex, but the horizontal velocity is still $v_0\\cos\\theta$ — the same as at launch. The projectile is moving purely sideways for that instant.",
              },
              {
                q: "Does a heavier projectile fall faster?",
                a: "Not under gravity alone: mass cancels out of the equations of motion, so a heavy and a light projectile launched identically follow the same path. Mass only matters once air resistance is involved, where it changes how much the drag slows the object.",
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
              "Launch your own shots in the [Projectile & Parabolic Motion simulation](/simulations/ParabolicMotion).",
              "The vertical half of this motion on its own: [Free fall and air resistance](/blog/ball-free-fall-comprehensive-guide).",
              "How acceleration changes velocity: [A ball in uniformly accelerated motion](/blog/ball-uniformly-accelerated-motion).",
              "Splitting a velocity into components: [The guide to vector operations](/blog/comprehensive-guide-to-vector-operations).",
            ],
          },
        ],
      },
    ],
  },
};
