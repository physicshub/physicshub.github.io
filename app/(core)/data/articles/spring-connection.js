import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const springConnectionBlog = {
  id: "bb-005",
  slug: "spring-connection",
  name: "How does a spring work?",
  desc: "A spring pushes back in proportion to how far you stretch it (Hooke's law) — which is why a mass on a spring oscillates. The physics, with a simulation.",
  tags: [
    LEVELS.upperSecondary,
    DIFFICULTIES.extended,
    TAGS.PHYSICS,
    TAGS.OSCILLATIONS,
    TAGS.SPRINGS,
    TAGS.ENERGY,
  ],
  date: "21/01/2026",
  updated: "06/09/2026",
  theory: {
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "How does a spring work?",
          },
          {
            type: "paragraph",
            text: "A spring resists being stretched or compressed with a force that grows in proportion to how far it is pushed from its natural length. Stretch it twice as far and it pulls back twice as hard. That simple rule — **Hooke's law**, $F = -kx$ — is why a mass hanging from a spring does not just fall to a new position and stop: it overshoots, gets pulled back, overshoots the other way, and keeps oscillating.",
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "A spring's force is $F = -kx$: proportional to the displacement $x$ and always pointing back toward the rest position. A linear restoring force like this always produces simple harmonic motion.",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "**Hooke's law:** the spring force is $F = -kx$, where $k$ is the stiffness and $x$ is the displacement from the natural length.",
              "The minus sign makes it a **restoring** force — it always pushes back toward equilibrium, which is what causes oscillation.",
              "The period is $T = 2\\pi\\sqrt{m/k}$: heavier mass swings slower, stiffer spring swings faster. Amplitude does not change the period.",
              "Energy sloshes between kinetic and elastic potential; without damping, the total stays constant and the motion never stops.",
              "**Damping** (friction, air) drains energy each cycle, shrinking the swings until the mass settles.",
            ],
          },
          {
            type: "sectionTitle",
            text: "Hooke's law: force proportional to stretch",
          },
          {
            type: "paragraph",
            text: "Take a spring at its natural length and pull the attached mass a distance $x$ away. The spring pulls back with a force",
          },
          {
            type: "formula",
            ref: "hookes-law",
            latex: "F = -k\\,x",
          },
          {
            type: "paragraph",
            text: "where $k$ is the **spring constant** (or stiffness), measured in newtons per metre. A large $k$ means a stiff spring that fights hard against small stretches; a small $k$ means a floppy one. The minus sign is the important part: the force points **opposite** to the displacement, so it always tries to return the mass to $x = 0$.",
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "Hooke's law has limits",
            text: "$F = -kx$ only holds while the spring is not stretched too far. Push past its **elastic limit** and the metal deforms permanently — the force is no longer proportional to $x$, and the spring does not return to its original shape.",
          },
          {
            type: "sectionTitle",
            text: "Why the mass oscillates: simple harmonic motion",
          },
          {
            type: "paragraph",
            text: "Combine Hooke's law with Newton's second law, $F = ma$, and you get the equation of motion for the mass:",
          },
          {
            type: "formula",
            latex:
              "m\\,\\ddot{x} = -k\\,x \\quad\\Longrightarrow\\quad \\ddot{x} = -\\frac{k}{m}\\,x",
          },
          {
            type: "paragraph",
            text: "This says the acceleration is always proportional to the displacement and points the other way. The solution is a sine wave: the mass moves as $x(t) = A\\cos(\\omega t + \\varphi)$, oscillating forever between $+A$ and $-A$. This pattern — a linear restoring force producing sinusoidal motion — is called **simple harmonic motion (SHM)**, and it turns up everywhere from pendulums to sound waves to the vibrations of atoms.",
          },
          {
            type: "paragraph",
            text: "The angular frequency $\\omega = \\sqrt{k/m}$ sets how fast the oscillation goes. Converting to a period:",
          },
          {
            type: "formula",
            ref: "spring-period",
            latex: "T = 2\\pi\\sqrt{\\frac{m}{k}}",
          },
          {
            type: "paragraph",
            text: "Notice what is **not** in that formula: the amplitude. Pull the mass 2 cm or 10 cm from rest and it still takes exactly the same time to complete one bounce. Notice also what changes it — a heavier mass slows the oscillation down, a stiffer spring speeds it up. Try your own numbers in the calculator on the [[spring-period]] card.",
          },
          {
            type: "toggle",
            title: "What about the vertical spring and gravity?",
            content:
              "Hanging a mass on a vertical spring just shifts the equilibrium point: the spring stretches until its pull balances the weight, $k x_0 = m g$. Measure displacement from that **new** rest position and gravity drops out of the equation entirely — the mass performs the same SHM with the same period $T = 2\\pi\\sqrt{m/k}$, just centred lower down.",
          },
          {
            type: "sectionTitle",
            text: "Energy: kinetic and elastic potential trade off",
          },
          {
            type: "paragraph",
            text: "A stretched or compressed spring stores **elastic potential energy** $U = \\tfrac12 k x^2$. As the mass moves, energy shuttles between this and kinetic energy $K = \\tfrac12 m v^2$:",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "At the extremes ($x = \\pm A$) the mass is momentarily still: all the energy is elastic potential.",
              "At the centre ($x = 0$) the spring is relaxed: all the energy is kinetic and the mass is moving fastest.",
              "Everywhere in between, the total $E = K + U = \\tfrac12 k A^2$ stays constant — as long as nothing removes energy.",
            ],
          },
          {
            type: "sectionTitle",
            text: "Damping: why real springs stop",
          },
          {
            type: "paragraph",
            text: "Friction in the spring and drag from the air take a small bite of energy on every swing, so the amplitude decays and the mass eventually settles at equilibrium. The simulation models this with a **damping coefficient** $b$ that adds a force $-b\\,v$ opposing the motion:",
          },
          {
            type: "formula",
            latex: "m\\,\\ddot{x} = -k\\,x - b\\,\\dot{x}",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "**Light damping** — the mass oscillates many times, each swing a little smaller (underdamped).",
              "**Heavy damping** — the mass creeps back to rest without a single full oscillation (overdamped).",
              "**Critical damping** — the fastest possible return to rest with no overshoot; this is what car suspensions and door closers aim for.",
            ],
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "What is the spring constant k?",
                a: "It is the stiffness of the spring in newtons per metre — the force needed to stretch it by one metre. A stiff spring has a large k; a soft one has a small k. It is a property of the spring itself, set by its material, wire thickness and number of coils.",
              },
              {
                q: "Why doesn't the amplitude affect the period?",
                a: "A bigger pull stretches the spring further, which makes the restoring force proportionally bigger, which makes the mass accelerate proportionally harder. The extra distance and the extra force cancel out, so every oscillation takes the same time. This is the defining feature of simple harmonic motion.",
              },
              {
                q: "What makes a mass-spring system oscillate faster?",
                a: "A stiffer spring (larger k) or a lighter mass (smaller m). The period is $T = 2\\pi\\sqrt{m/k}$, so quadrupling the stiffness halves the period, and quadrupling the mass doubles it.",
              },
              {
                q: "Where does the energy go when the oscillation dies out?",
                a: "Into heat. Damping forces — internal friction in the spring and air resistance — do negative work on the mass each cycle, converting its mechanical energy into thermal energy in the spring and the surrounding air.",
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
              "Change the mass, stiffness and damping in the [Spring–Mass simulation](/simulations/SpringConnection), or the frictionless [Horizontal Spring](/simulations/HorizontalSpring).",
              "The other classic simple-harmonic system: [The physics of the pendulum](/blog/physics-of-pendulum-explained).",
              "How a constant force (not a restoring one) curves motion: [How projectile motion works](/blog/projectile-parabolic-motion).",
            ],
          },
        ],
      },
    ],
  },
};
