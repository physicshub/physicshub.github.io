import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const circularMotionBlog = {
  slug: "circular-motion-centripetal-force",
  name: "What is centripetal force?",
  desc: "A body in circular motion always accelerates toward the centre, needing an inward force F = mv²/r. If that force vanishes, the body flies off straight.",
  tags: [
    LEVELS.upperSecondary,
    DIFFICULTIES.extended,
    TAGS.PHYSICS,
    TAGS.FORCES,
    TAGS.ACCELERATION,
    TAGS.VECTORS,
  ],
  date: "24/09/2026",
  theory: {
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "What is centripetal force?",
          },
          {
            type: "paragraph",
            text: "Centripetal force is the **inward force** that keeps an object moving in a circle. Even at constant speed, the velocity keeps changing direction, and a change in velocity is an acceleration — here $a = v^2/r$, pointing toward the centre. By Newton's second law that acceleration needs a net force $F = mv^2/r$ pointing the same way. It is not a new kind of force: it is whatever real force supplies the inward pull.",
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "Centripetal force is not a separate force — it is the name for the net inward force. Tension in a string, gravity, friction or a normal force can each play the part.",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "Uniform circular motion has constant **speed** but changing **velocity**, so it is always accelerating.",
              "Acceleration is $a_c = v^2/r = \\omega^2 r$, directed to the centre; force is $F_c = mv^2/r$.",
              "Period $T = 2\\pi r/v = 2\\pi/\\omega$.",
              "Double the speed and the force needed quadruples; halve the radius and it doubles.",
              "If the inward force stops, the object continues in a **straight line along the tangent**, not outward.",
            ],
          },
          {
            type: "sectionTitle",
            text: "Why is circular motion an acceleration?",
          },
          {
            type: "paragraph",
            text: 'Speed is only the size of the velocity. On a circle the direction turns continuously, so the velocity vector keeps changing even though its length does not. Over a short time the velocity change points **toward the centre**, which is why the acceleration is called centripetal, meaning "centre-seeking".',
          },
          {
            type: "formula",
            latex:
              "a_c = \\frac{v^2}{r} = \\omega^2 r, \\qquad F_c = \\frac{m\\,v^2}{r}, \\qquad T = \\frac{2\\pi r}{v}",
          },
          {
            type: "paragraph",
            text: "Here $\\omega = v/r$ is the angular velocity in radians per second. Take a $1$ kg ball on a circle of radius $2$ m at $6$ m/s: $a_c = 36/2 = 18\\ \\text{m/s}^2$, so $F_c = 18$ N, the angular velocity is $3$ rad/s and one lap takes $2\\pi\\cdot 2/6 = 2.09$ s.",
          },
          {
            type: "table",
            columns: ["Change", "Effect on $F_c = mv^2/r$"],
            data: [
              {
                Change: "Double the speed $v$",
                "Effect on $F_c = mv^2/r$": "× 4  (18 N → 72 N)",
              },
              {
                Change: "Halve the radius $r$",
                "Effect on $F_c = mv^2/r$": "× 2  (18 N → 36 N)",
              },
              {
                Change: "Double the mass $m$",
                "Effect on $F_c = mv^2/r$": "× 2",
              },
            ],
          },
          {
            type: "sectionTitle",
            text: "What provides the centripetal force?",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "**Tension** — a ball whirled on a string.",
              "**Gravity** — a planet or satellite orbiting a star.",
              "**Friction** — a car turning on a flat road; too little grip and it slides straight on.",
              "**Normal force** — a rider on a banked track or the wall of a spinning drum.",
            ],
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "There is no outward force acting on the object",
            text: 'When you feel "thrown outward" in a turning car, that is your body trying to go straight (inertia) while the car turns. The only real horizontal force on you is the inward push from the seat and door. "Centrifugal force" appears only as a bookkeeping term in a rotating frame.',
          },
          {
            type: "sectionTitle",
            text: "What happens if the force disappears?",
          },
          {
            type: "paragraph",
            text: "Cut the string of a whirling ball and it does not fly outward — it moves off in a **straight line along the tangent** at the instant of release, exactly as Newton's first law says.",
          },
          {
            type: "callout",
            calloutType: "tip",
            title: "Try it",
            text: "Keep the radius fixed and raise the speed: the required force grows with $v^2$. Then keep the speed and shrink the radius — the tighter the turn, the bigger the force needed.",
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "What is the formula for centripetal force?",
                a: "$F_c = mv^2/r$, or equivalently $m\\omega^2 r$. Here $m$ is the mass, $v$ the speed, $r$ the radius of the circle and $\\omega$ the angular velocity.",
              },
              {
                q: "Is centripetal force a real force?",
                a: "It is the net **real** force pointing to the centre — tension, gravity, friction or a normal force. Nothing new is added; the name just describes its direction and job.",
              },
              {
                q: "Why does an object in circular motion have acceleration if its speed is constant?",
                a: "Acceleration is the rate of change of velocity, which includes direction. On a circle the direction changes all the time, so the velocity changes even at constant speed, producing an acceleration toward the centre.",
              },
              {
                q: "What is the difference between centripetal and centrifugal force?",
                a: "Centripetal force is the real inward force in an inertial frame. Centrifugal force is a fictitious outward force that only appears when you describe the motion from inside the rotating frame.",
              },
              {
                q: "How do I find the period of circular motion?",
                a: "$T = 2\\pi r/v$: the circumference divided by the speed. In terms of angular velocity, $T = 2\\pi/\\omega$.",
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
              "Change radius and speed in the [Circular Motion simulation](/simulations/CircularMotion).",
              "The same circle drives sine and cosine: [Trigonometric Circle simulation](/simulations/TrigonometricCircle).",
              "A pendulum bob moves on a circular arc: [How does a pendulum work?](/blog/physics-of-pendulum-explained).",
              "Splitting acceleration into components: [Vectors: components, addition, dot and cross products](/blog/comprehensive-guide-to-vector-operations).",
            ],
          },
        ],
      },
    ],
  },
};
