import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const collisionsBlog = {
  slug: "elastic-inelastic-collisions",
  name: "What is the difference between elastic and inelastic collisions?",
  desc: "Momentum is conserved in every collision; kinetic energy only in elastic ones. See both cases with worked numbers and the restitution coefficient that links them.",
  tags: [
    LEVELS.upperSecondary,
    DIFFICULTIES.core,
    TAGS.PHYSICS,
    TAGS.COLLISION,
    TAGS.ENERGY,
    TAGS.DYNAMICS,
  ],
  date: "24/09/2026",
  theory: {
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "What is the difference between elastic and inelastic collisions?",
          },
          {
            type: "paragraph",
            text: "In **every** collision the total momentum is conserved. What differs is kinetic energy: in an **elastic** collision it is conserved too, while in an **inelastic** one some of it is turned into heat, sound or deformation. A perfectly inelastic collision is the extreme case where the bodies stick together and move with a common velocity.",
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "Momentum $m_1u_1 + m_2u_2$ is always conserved in an isolated collision. Kinetic energy is conserved only when the collision is elastic (restitution $e = 1$).",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "Always: $m_1u_1 + m_2u_2 = m_1v_1 + m_2v_2$ (momentum conservation).",
              "**Elastic** ($e = 1$): kinetic energy is also conserved. **Perfectly inelastic** ($e = 0$): the bodies stick together and lose the most energy.",
              "The coefficient of restitution is $e = (v_2 - v_1)/(u_1 - u_2)$: separation speed over approach speed, between 0 and 1.",
              "Equal masses in an elastic head-on collision simply **swap velocities**.",
              '"Lost" kinetic energy is not destroyed — it becomes heat, sound and deformation.',
            ],
          },
          {
            type: "sectionTitle",
            text: "What is always conserved?",
          },
          {
            type: "paragraph",
            text: "Two bodies pushing on each other exert equal and opposite forces for the same time, so the momentum one gains the other loses. With initial velocities $u$ and final velocities $v$:",
          },
          {
            type: "formula",
            ref: "momentum-conservation",
            latex: "m_1 u_1 + m_2 u_2 = m_1 v_1 + m_2 v_2",
          },
          {
            type: "paragraph",
            text: "This holds for a car crash, two billiard balls or a hammer on a nail — as long as no outside force acts during the collision. It is one equation with two unknowns ($v_1$, $v_2$), so you need one more piece of information: how elastic the collision is.",
          },
          {
            type: "sectionTitle",
            text: "What happens in an elastic collision?",
          },
          {
            type: "paragraph",
            text: "Requiring kinetic energy to be conserved as well gives, for a head-on collision:",
          },
          {
            type: "formula",
            ref: "elastic-collision",
            latex:
              "v_1 = \\frac{m_1 - m_2}{m_1 + m_2}\\,u_1 + \\frac{2m_2}{m_1 + m_2}\\,u_2, \\qquad v_2 = \\frac{2m_1}{m_1 + m_2}\\,u_1 + \\frac{m_2 - m_1}{m_1 + m_2}\\,u_2",
          },
          {
            type: "paragraph",
            text: "Two special cases are worth remembering: equal masses **swap** velocities, and a light body hitting a very heavy one bounces back with almost its own speed while the heavy body barely moves.",
          },
          {
            type: "sectionTitle",
            text: "What happens in an inelastic collision?",
          },
          {
            type: "paragraph",
            text: "In a perfectly inelastic collision the bodies stick together, so there is one final velocity $v = (m_1u_1 + m_2u_2)/(m_1 + m_2)$. In between lies the general case, described by the **coefficient of restitution**:",
          },
          {
            type: "formula",
            ref: "coefficient-of-restitution",
            latex: "e = \\frac{v_2 - v_1}{u_1 - u_2}, \\qquad 0 \\le e \\le 1",
          },
          {
            type: "paragraph",
            text: "Combining it with momentum conservation gives $v_1 = \\dfrac{m_1u_1 + m_2u_2 - m_2e\\,(u_1 - u_2)}{m_1 + m_2}$ and $v_2 = \\dfrac{m_1u_1 + m_2u_2 + m_1e\\,(u_1 - u_2)}{m_1 + m_2}$. Setting $e = 1$ recovers the elastic formulas; $e = 0$ makes both velocities equal.",
          },
          {
            type: "sectionTitle",
            text: "A worked example",
          },
          {
            type: "paragraph",
            text: "A $2$ kg body moving at $3$ m/s hits a $1$ kg body at rest. Total momentum is $6\\ \\text{kg·m/s}$ and the initial kinetic energy is $9$ J.",
          },
          {
            type: "table",
            columns: ["Collision", "Final velocities", "Kinetic energy after"],
            data: [
              {
                Collision: "Elastic ($e = 1$)",
                "Final velocities": "$v_1 = 1$, $v_2 = 4$ m/s",
                "Kinetic energy after": "9 J (none lost)",
              },
              {
                Collision: "Partly elastic ($e = 0.5$)",
                "Final velocities": "$v_1 = 1.5$, $v_2 = 3$ m/s",
                "Kinetic energy after": "6.75 J (2.25 J lost)",
              },
              {
                Collision: "Perfectly inelastic ($e = 0$)",
                "Final velocities": "both 2 m/s",
                "Kinetic energy after": "6 J (3 J lost)",
              },
            ],
          },
          {
            type: "paragraph",
            text: "Check the momentum in each row: $2\\times1 + 1\\times4 = 6$, $2\\times1.5 + 1\\times3 = 6$, $3\\times2 = 6$. It never changes — only the energy does.",
          },
          {
            type: "callout",
            calloutType: "tip",
            title: "Try it",
            text: "In the simulation set ball 1 to $2$ kg at $3$ m/s and ball 2 to $1$ kg at rest, then slide restitution from 1 down to 0. The momentum readout stays put while the kinetic energy drops.",
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "Is momentum conserved in an inelastic collision?",
                a: "Yes. Momentum is conserved in every collision without external forces. Only kinetic energy is lost in an inelastic one, converted to heat, sound or deformation.",
              },
              {
                q: "What is a perfectly inelastic collision?",
                a: "One where the bodies stick together and move as a single mass after impact. It loses the maximum possible kinetic energy compatible with momentum conservation.",
              },
              {
                q: "Are any real collisions perfectly elastic?",
                a: "Not on the everyday scale — some energy always becomes heat or sound — but hard spheres such as billiard balls come close, and collisions between atoms and molecules can be elastic.",
              },
              {
                q: "What does the coefficient of restitution measure?",
                a: "How bouncy a collision is: the ratio of the speed of separation to the speed of approach. It is 1 for an elastic collision, 0 for a perfectly inelastic one, and in between for real objects.",
              },
              {
                q: "Where does the lost kinetic energy go?",
                a: "Into thermal energy, sound and permanent deformation of the colliding bodies. Total energy is still conserved once those forms are counted.",
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
              "Set masses, velocities and restitution in the [1D Collision simulation](/simulations/CollisionSimulation).",
              "Restitution on a floor: [How does a bouncing ball work?](/blog/physics-bouncing-ball-comprehensive-educational-guide).",
              "A surprising result from elastic collisions: [How two sliding blocks compute π](/blog/pi-from-block-collisions-explained).",
            ],
          },
        ],
      },
    ],
  },
};
