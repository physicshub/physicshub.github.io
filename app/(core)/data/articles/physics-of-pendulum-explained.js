import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const pendulumBlog = {
  slug: "physics-of-pendulum-explained",
  name: "How does a pendulum work?",
  desc: "A pendulum's period depends only on its length and gravity, not its mass: T = 2π√(L/g). The physics of the swing, energy and damping, with a simulation.",
  tags: [
    LEVELS.upperSecondary,
    DIFFICULTIES.extended,
    TAGS.PHYSICS,
    TAGS.OSCILLATIONS,
    TAGS.ENERGY,
  ],
  date: "26/01/2026",
  updated: "23/09/2026",
  theory: {
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "How does a pendulum work?",
          },
          {
            type: "paragraph",
            text: "A pendulum is a mass hanging from a fixed point. Pull it aside and gravity drags it back toward the lowest point; it arrives with speed, overshoots, and swings out the other side. For small swings the time of one full back-and-forth depends only on the **length** of the string and on **gravity** — $T = 2\\pi\\sqrt{L/g}$ — and **not** on the mass or on how far you pull it.",
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "For small angles a pendulum's period is $T = 2\\pi\\sqrt{L/g}$: longer string, slower swing; stronger gravity, faster swing; mass and amplitude do not matter.",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "The restoring force is the tangential part of gravity, $F = -mg\\sin\\theta$. For small angles $\\sin\\theta\\approx\\theta$, so it behaves like a spring: **simple harmonic motion**.",
              "Period $T = 2\\pi\\sqrt{L/g}$. Quadruple the length and the period doubles.",
              "Energy swaps between potential (top of the swing) and kinetic (bottom); total energy stays constant without friction.",
              "Beyond about $15°$ the small-angle formula drifts: at $90°$ the true period is about $18\\%$ longer.",
              "Damping (air, pivot friction) shrinks the amplitude each swing until the pendulum stops.",
            ],
          },
          {
            type: "image",
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Pendulum_animation.gif",
            alt: "Animated diagram showing a simple pendulum's back-and-forth motion with labeled components.",
            caption:
              "A simple pendulum: a point mass (the bob) on a string of length L, swinging through an angle θ from the vertical.",
            href: "https://en.wikipedia.org/wiki/Pendulum",
            size: "medium",
          },
          {
            type: "sectionTitle",
            text: "What does the period depend on?",
          },
          {
            type: "paragraph",
            text: "Three quantities describe a swing: the **amplitude** (how far it swings), the **period** $T$ (time for one full cycle) and the **frequency** $f = 1/T$ (cycles per second). Three observations tell you almost everything about the period:",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "**Longer string → slower swing.** The period grows with the square root of the length, so doubling $L$ multiplies $T$ by only $\\sqrt2 \\approx 1.41$.",
              "**Stronger gravity → faster swing.** On the Moon, where $g$ is about six times smaller, the same pendulum swings roughly $2.4$ times slower.",
              "**Mass does not matter.** Gravity pulls a heavier bob harder, but a heavier bob is also harder to accelerate — the two cancel exactly.",
            ],
          },
          {
            type: "sectionTitle",
            text: "Why is it simple harmonic motion?",
          },
          {
            type: "paragraph",
            text: "The bob feels two forces: the string's tension and gravity $mg$. Tension is perpendicular to the motion, so only the component of gravity along the arc changes the speed. That tangential component always points back toward the bottom:",
          },
          {
            type: "image",
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Simple_gravity_pendulum.svg",
            alt: "Free body diagram showing force vectors on a pendulum bob at maximum displacement.",
            caption:
              "Forces on the bob: tension along the string and gravity. The component of gravity along the arc, −mg sin θ, is the restoring force.",
            href: "https://en.wikipedia.org/wiki/Pendulum_(mechanics)",
            size: "medium",
          },
          {
            type: "formula",
            latex:
              "F_t = -mg\\sin\\theta \\quad\\Longrightarrow\\quad \\frac{d^2\\theta}{dt^2} = -\\frac{g}{L}\\sin\\theta",
          },
          {
            type: "paragraph",
            text: "For small angles $\\sin\\theta \\approx \\theta$ (at $15°$ the error is only $0.4\\%$), and the equation becomes the same one that governs a mass on a spring, with $\\omega_0 = \\sqrt{g/L}$:",
          },
          {
            type: "formula",
            latex:
              "\\frac{d^2\\theta}{dt^2} = -\\frac{g}{L}\\,\\theta \\quad\\Longrightarrow\\quad \\theta(t) = \\theta_0\\cos(\\omega_0 t + \\varphi), \\qquad T = \\frac{2\\pi}{\\omega_0} = 2\\pi\\sqrt{\\frac{L}{g}}",
          },
          {
            type: "table",
            columns: ["Length $L$ (m)", "Period $T$ (s)", "Where you see it"],
            data: [
              {
                "Length $L$ (m)": "0.25",
                "Period $T$ (s)": "1.00",
                "Where you see it": "Metronome, short playground swing",
              },
              {
                "Length $L$ (m)": "1.00",
                "Period $T$ (s)": "2.01",
                "Where you see it": "Standard laboratory pendulum",
              },
              {
                "Length $L$ (m)": "9.80",
                "Period $T$ (s)": "6.28",
                "Where you see it": "Large chandelier, church-bell scale",
              },
            ],
          },
          {
            type: "callout",
            calloutType: "tip",
            title: "Measure gravity with a string",
            text: "Time ten swings of a pendulum of known length and solve $g = 4\\pi^2 L / T^2$. Geologists once used exactly this to map tiny changes in gravity across the Earth.",
          },
          {
            type: "sectionTitle",
            text: "Where does the energy go?",
          },
          {
            type: "paragraph",
            text: "Take the bottom of the swing as zero height. At angle $\\theta$ the bob has risen $h = L(1-\\cos\\theta)$, so its potential energy is $U = mgL(1-\\cos\\theta)$ and its kinetic energy is $K = \\tfrac12 m v^2$. At the extremes the bob stops and all the energy is potential; at the bottom it moves fastest and all of it is kinetic. Without friction the sum never changes:",
          },
          {
            type: "formula",
            latex:
              "E = \\tfrac12 m L^2\\dot\\theta^{\\,2} + mgL(1-\\cos\\theta) = mgL(1-\\cos\\theta_0)",
          },
          {
            type: "sectionTitle",
            text: "What happens at large angles?",
          },
          {
            type: "paragraph",
            text: "Without the small-angle shortcut the equation has no elementary solution — the exact period involves an elliptic integral. What matters in practice is the result: **bigger swings take longer**. The pendulum lags behind the $2\\pi\\sqrt{L/g}$ prediction more and more as the amplitude grows, and would take forever to swing up to exactly $180°$ (perfectly balanced upside-down).",
          },
          {
            type: "table",
            columns: ["Amplitude $\\theta_0$", "Period vs small-angle formula"],
            data: [
              {
                "Amplitude $\\theta_0$": "15°",
                "Period vs small-angle formula": "+0.4%",
              },
              {
                "Amplitude $\\theta_0$": "30°",
                "Period vs small-angle formula": "+1.7%",
              },
              {
                "Amplitude $\\theta_0$": "60°",
                "Period vs small-angle formula": "+7.3%",
              },
              {
                "Amplitude $\\theta_0$": "90°",
                "Period vs small-angle formula": "+18%",
              },
            ],
          },
          {
            type: "toggle",
            title: "The exact period, if you want it",
            content:
              "Using energy conservation and the substitution $\\sin(\\phi/2) = k\\sin\\psi$ with $k = \\sin(\\theta_0/2)$, the exact period is $T = 4\\sqrt{L/g}\\,K(k)$, where $K(k) = \\int_0^{\\pi/2} \\dfrac{d\\psi}{\\sqrt{1-k^2\\sin^2\\psi}}$ is the complete elliptic integral of the first kind. Expanding for small $\\theta_0$ gives $T \\approx 2\\pi\\sqrt{L/g}\\,\\bigl(1 + \\tfrac{1}{16}\\theta_0^2 + \\dots\\bigr)$.",
          },
          {
            type: "sectionTitle",
            text: "Why does a real pendulum stop?",
          },
          {
            type: "paragraph",
            text: "Air resistance and friction at the pivot remove a little energy every swing, so the amplitude decays. Model that as a force proportional to velocity and there are three regimes: **underdamped** (it keeps swinging with shrinking amplitude), **critically damped** (it returns to rest as fast as possible without overshooting — what door closers aim for) and **overdamped** (it creeps back slowly). Real clocks fight damping by feeding the pendulum a small push each swing.",
          },
          {
            type: "callout",
            calloutType: "info",
            title: "Beyond one pendulum",
            text: "Hang a second pendulum from the first and the motion becomes chaotic — nearly identical starts diverge completely. Explore it in the Double Pendulum simulation, and see how the same math runs on a computer in the companion article below.",
          },
          {
            type: "toggle",
            title: "Galileo and the chandelier",
            content:
              "Legend says that in 1581 the young Galileo timed a swinging cathedral chandelier in Pisa against his own pulse and noticed that each swing took the same time even as the amplitude died away. Whether or not it happened that way, it is the seed of the pendulum clock.",
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "What is the formula for the period of a pendulum?",
                a: "$T = 2\\pi\\sqrt{L/g}$, valid for small swings (under about 15°). $L$ is the string length in metres and $g \\approx 9.81\\ \\text{m/s}^2$. A 1-metre pendulum has a period of about 2 seconds.",
              },
              {
                q: "Does the mass of the bob change the period?",
                a: "No. A heavier bob feels a larger gravitational force but also resists acceleration more, and the two effects cancel exactly. Two bobs of different mass on strings of equal length swing together.",
              },
              {
                q: "Does the amplitude change the period?",
                a: "Only slightly for small swings — that near-independence is called isochronism and is what makes pendulum clocks work. At large amplitudes the period does grow: about 18% longer at 90°.",
              },
              {
                q: "Why does a pendulum eventually stop?",
                a: "Friction at the pivot and air resistance convert mechanical energy into heat a little at a time. Each swing is slightly smaller than the last until the motion dies out.",
              },
              {
                q: "How do you make a pendulum swing faster?",
                a: "Shorten the string. The period scales with the square root of the length, so quartering the length halves the period. Stronger gravity would also speed it up, but you cannot change that at home.",
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
              "Change length, gravity and amplitude in the [Simple Pendulum simulation](/simulations/SimplePendulum).",
              "Watch chaos appear with two pendulums: [Double Pendulum simulation](/simulations/DoublePendulum).",
              "How the same equations are solved on a computer: [Simulating a pendulum in code](/blog/simulating-a-pendulum-in-code).",
              "The other classic harmonic oscillator: [How a spring works](/blog/spring-connection).",
            ],
          },
        ],
      },
    ],
  },
};
