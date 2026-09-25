import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const astronautsFloatBlog = {
  slug: "why-do-astronauts-float-in-space",
  name: "Why do astronauts float in space?",
  desc: "Gravity at the ISS is still almost 90% of what it is on the ground. Astronauts float because they and the station are in constant free fall around Earth.",
  tags: [
    LEVELS.upperSecondary,
    DIFFICULTIES.core,
    TAGS.PHYSICS,
    TAGS.GRAVITY,
    TAGS.FORCES,
  ],
  date: "24/09/2026",
  theory: {
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Why do astronauts float in space?",
          },
          {
            type: "paragraph",
            text: "Astronauts float **not because there is no gravity**, but because they are in **continuous free fall**. At the International Space Station's altitude of about $400$ km gravity is still almost $90\\%$ as strong as on the ground; the station and everyone inside simply fall around Earth together, so nothing pushes on anyone.",
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "Weightlessness is free fall, not the absence of gravity: the ISS falls continuously toward Earth while moving sideways at about $7.7$ km/s, so it keeps missing the ground.",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "Gravity at $400$ km is $\\approx 8.7$ m/s², about $89\\%$ of the surface value $9.81$ m/s².",
              "Astronauts, tools and station all fall at the same rate, so there is no contact force between them: they feel weightless.",
              "An orbit is falling sideways fast enough that the ground curves away as quickly as you fall toward it.",
              "The ISS needs about $7.7$ km/s ($27{,}600$ km/h) and circles Earth once every $92$ minutes.",
            ],
          },
          {
            type: "sectionTitle",
            text: "Is there gravity on the space station?",
          },
          {
            type: "paragraph",
            text: "Yes. Gravity weakens with the square of distance from Earth's centre, but it never reaches zero. At height $h$ above the surface, with Earth's radius $R \\approx 6371$ km:",
          },
          {
            type: "formula",
            ref: "gravity-at-altitude",
            latex: "g(h) = g_0\\left(\\frac{R}{R+h}\\right)^{2}",
          },
          {
            type: "table",
            columns: ["Location", "Distance from Earth's centre", "Gravity"],
            data: [
              {
                Location: "Earth's surface",
                "Distance from Earth's centre": "6,371 km",
                Gravity: "$9.81$ m/s²",
              },
              {
                Location: "International Space Station",
                "Distance from Earth's centre": "6,771 km",
                Gravity: "$\\approx 8.7$ m/s²",
              },
              {
                Location: "Geostationary orbit",
                "Distance from Earth's centre": "42,157 km",
                Gravity: "$\\approx 0.22$ m/s²",
              },
            ],
          },
          {
            type: "sectionTitle",
            text: "So why do they float?",
          },
          {
            type: "paragraph",
            text: "Weight, as we feel it, is not gravity itself but the **contact force** that stops us falling: the floor pushing up on your feet. In free fall that force disappears. Astronaut and station accelerate toward Earth at exactly the same rate, so the astronaut and the floor never press on each other. It is the same feeling as being in an elevator whose cable has snapped, or at the top of a roller-coaster drop.",
          },
          {
            type: "paragraph",
            text: "Aircraft can reproduce it briefly: on a parabolic flight the plane follows a free-fall arc and passengers float for about $20$ seconds.",
          },
          {
            type: "sectionTitle",
            text: "Why doesn't the ISS fall to the ground?",
          },
          {
            type: "paragraph",
            text: "It does fall, but it also moves sideways very fast. Imagine firing a cannonball horizontally from a tall mountain: faster shots land farther away, and at a great enough speed the ground curves away beneath the ball as quickly as the ball drops. It never lands, and that is an orbit. For a circular orbit of radius $r$ the required speed and the period are:",
          },
          {
            type: "formula",
            ref: "orbital-speed",
            latex:
              "v = \\sqrt{\\frac{GM}{r}} \\approx 7.7\\ \\text{km/s}, \\qquad T = \\frac{2\\pi r}{v} \\approx 92\\ \\text{min}",
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "Common misconception",
            text: '"There is no gravity in space" is wrong. Gravity from the Sun holds Earth in orbit across $150$ million km. What is true is that a freely falling object feels weightless.',
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "Do astronauts feel gravity on the ISS?",
                a: "They do not feel it, although gravity is acting on them. Since they fall at the same rate as the station, there is no force pressing them against anything, which is what our body senses as weight.",
              },
              {
                q: "How high do you have to go to escape Earth's gravity?",
                a: "You never fully escape it, because gravity only weakens with distance. What you can do is reach the **escape velocity**, about $11.2$ km/s from the surface, at which an object never falls back.",
              },
              {
                q: "Why does water form floating balls on the ISS?",
                a: "In free fall there is no downward pull on the liquid relative to its container, so surface tension pulls a water sample into a sphere, the shape with the least surface area.",
              },
              {
                q: "Why do astronauts have to exercise so much?",
                a: "Without the load of body weight, muscles and bones weaken. Crews exercise around two hours a day to slow that loss.",
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
              "Watch bodies move under gravity in the [Ball Gravity simulation](/simulations/BallGravity).",
              "Send objects around a circle in the [Circular Motion simulation](/simulations/CircularMotion) and see the inward force at work.",
              "Try Newton's cannonball idea with the [Projectile & Parabolic Motion simulation](/simulations/ParabolicMotion).",
              "The force that bends every orbit: [What is centripetal force?](/blog/circular-motion-centripetal-force)",
              "Falling without air: [Free fall and air resistance](/blog/ball-free-fall-comprehensive-guide).",
            ],
          },
        ],
      },
    ],
  },
};
