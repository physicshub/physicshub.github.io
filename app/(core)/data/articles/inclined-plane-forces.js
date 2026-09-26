import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const inclinedPlaneBlog = {
  slug: "inclined-plane-forces",
  name: "How does an inclined plane work?",
  desc: "On a ramp, weight splits into mg sin θ along the slope and mg cos θ into it. Friction decides whether the block slides — the maths, with a simulation.",
  tags: [
    LEVELS.upperSecondary,
    DIFFICULTIES.core,
    TAGS.PHYSICS,
    TAGS.FORCES,
    TAGS.FRICTION,
    TAGS.DYNAMICS,
  ],
  date: "24/09/2026",
  theory: {
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "How does an inclined plane work?",
          },
          {
            type: "paragraph",
            text: "Gravity always pulls straight down, but a ramp only lets a block move along its surface. So weight is split in two: a component **along the slope**, $mg\\sin\\theta$, that pulls the block downhill, and a component **into the slope**, $mg\\cos\\theta$, that the surface pushes back on (the normal force). Friction depends on that normal force, which is why the angle decides whether the block stays put or slides.",
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "A block on a ramp slides only when $\\tan\\theta > \\mu_s$. At the angle of repose, $\\theta = \\arctan\\mu_s$, gravity along the slope exactly equals the maximum static friction — and mass cancels out.",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "Weight resolves into $F_\\parallel = mg\\sin\\theta$ (along the slope) and $N = mg\\cos\\theta$ (perpendicular).",
              "Maximum static friction is $f_{s,\\max} = \\mu_s N = \\mu_s mg\\cos\\theta$; once the block moves, friction is $\\mu_k N$.",
              "It slides when $\\tan\\theta > \\mu_s$. Sliding acceleration is $a = g(\\sin\\theta - \\mu_k\\cos\\theta)$.",
              "The steeper the ramp, the smaller the normal force — so friction gets weaker exactly when gravity pulls harder.",
            ],
          },
          {
            type: "sectionTitle",
            text: "How do you split weight into components?",
          },
          {
            type: "paragraph",
            text: "Tilt your axes to match the ramp: one along the slope, one perpendicular to it. The angle between the weight and the perpendicular axis equals the ramp angle $\\theta$, so:",
          },
          {
            type: "formula",
            ref: "incline-parallel-force",
            latex:
              "\\begin{aligned}F_\\parallel &= mg\\sin\\theta \\\\[2pt] N &= mg\\cos\\theta\\end{aligned}",
          },
          {
            type: "paragraph",
            text: "At $\\theta = 0$ (flat) all the weight presses on the surface and nothing pulls sideways. At $\\theta = 90°$ (vertical) the surface carries no weight and the block is in free fall. Every ramp lies between those extremes. Perpendicular to the slope the block does not move, so $N$ cancels the weight's perpendicular component exactly.",
          },
          {
            type: "callout",
            calloutType: "info",
            title: "Example: a 5 kg block on a 30° ramp",
            text: "$F_\\parallel = 5 \\times 9.81 \\times \\sin 30° = 24.5$ N and $N = 5 \\times 9.81 \\times \\cos 30° = 42.5$ N. With $\\mu_s = 0.5$ the maximum static friction is $0.5 \\times 42.5 = 21.2$ N, which is less than $24.5$ N — so the block slides.",
          },
          {
            type: "sectionTitle",
            text: "When does the block start to slide?",
          },
          {
            type: "paragraph",
            text: "Static friction can match the pull down the slope only up to $\\mu_s N$. Setting $mg\\sin\\theta = \\mu_s mg\\cos\\theta$ and cancelling $mg$:",
          },
          {
            type: "formula",
            ref: "angle-of-repose",
            latex: "\\tan\\theta_{\\text{repose}} = \\mu_s",
          },
          {
            type: "table",
            columns: ["Static friction $\\mu_s$", "Angle of repose"],
            data: [
              { "Static friction $\\mu_s$": "0.2", "Angle of repose": "11.3°" },
              { "Static friction $\\mu_s$": "0.5", "Angle of repose": "26.6°" },
              { "Static friction $\\mu_s$": "0.8", "Angle of repose": "38.7°" },
              { "Static friction $\\mu_s$": "1.0", "Angle of repose": "45°" },
              { "Static friction $\\mu_s$": "1.5", "Angle of repose": "56.3°" },
            ],
          },
          {
            type: "callout",
            calloutType: "tip",
            title: "Find it in the simulation",
            text: "Set static friction to 0.5 and raise the ramp slowly. The block stays put until the angle passes about $26.6°$, then starts to slide. Change the mass — the angle does not move.",
          },
          {
            type: "sectionTitle",
            text: "How fast does it accelerate once it slides?",
          },
          {
            type: "paragraph",
            text: "Once moving, friction drops to the kinetic value $\\mu_k N$. Along the slope, Newton's second law gives:",
          },
          {
            type: "formula",
            latex:
              "m a = mg\\sin\\theta - \\mu_k mg\\cos\\theta \\;\\Longrightarrow\\; a = g\\,(\\sin\\theta - \\mu_k\\cos\\theta)",
          },
          {
            type: "paragraph",
            text: "Mass cancels again. On a frictionless ramp $a = g\\sin\\theta$ — the ramp simply slows down free fall. With $\\theta = 30°$ and $\\mu_k = 0.2$, $a = 9.81(0.5 - 0.2\\times0.866) = 3.21\\ \\text{m/s}^2$, so a block slides $2$ m in about $1.1$ s and reaches $3.6$ m/s.",
          },
          {
            type: "toggle",
            title: "What if you push or pull the block?",
            content:
              "An applied force $F$ at an angle adds components along and perpendicular to the ramp. Pulling up the slope reduces the net force downhill; pulling partly away from the surface also reduces $N$, and with it friction. Resolve every force along the two tilted axes and sum each axis separately — the method never changes.",
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "Why is the normal force $mg\\cos\\theta$ and not $mg$?",
                a: "The surface only has to cancel the part of the weight pushing into it. On a slope that is $mg\\cos\\theta$; the rest of the weight, $mg\\sin\\theta$, is along the surface and is what pulls the block downhill.",
              },
              {
                q: "Does mass affect whether a block slides down a ramp?",
                a: "No. Both the pull down the slope and the maximum friction are proportional to $m$, so it cancels: the block slides when $\\tan\\theta > \\mu_s$, whatever its mass.",
              },
              {
                q: "What is the acceleration on a frictionless incline?",
                a: "$a = g\\sin\\theta$, directed down the slope. At 30° that is half of $g$, about $4.9\\ \\text{m/s}^2$.",
              },
              {
                q: "What is the difference between static and kinetic friction?",
                a: "Static friction acts on a block that is not moving and adjusts up to a maximum of $\\mu_s N$. Kinetic friction acts on a sliding block and is roughly constant at $\\mu_k N$, usually smaller than the static maximum — which is why sliding starts with a small jerk.",
              },
              {
                q: "Why does a ramp make lifting easier?",
                a: "A ramp trades distance for force: the force needed to push a load up is about $mg\\sin\\theta$ instead of $mg$, but you move it a longer distance. The work against gravity is the same.",
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
              "Tilt the ramp and tune the friction in the [Inclined Plane simulation](/simulations/InclinedPlane).",
              "Splitting vectors into components: [Vectors: components, addition, dot and cross products](/blog/comprehensive-guide-to-vector-operations).",
              "Free fall is the vertical-ramp limit: [How does free fall work?](/blog/ball-free-fall-comprehensive-guide).",
              "Another balance of forces: [How does a spring work?](/blog/spring-connection).",
            ],
          },
        ],
      },
    ],
  },
};
