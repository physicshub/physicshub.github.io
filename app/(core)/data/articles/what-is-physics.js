import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const whatIsPhysicsBlog = {
  slug: "what-is-physics",
  name: "What is physics? A visual introduction",
  desc: "Physics is the science of matter, energy, space, time and the forces between them. A short visual guide to what it studies, how it works and how to start.",
  tags: [
    LEVELS.elementary,
    DIFFICULTIES.core,
    TAGS.PHYSICS,
    TAGS.KINEMATICS,
    TAGS.ENERGY,
    TAGS.QUANTUM,
    TAGS.RELATIVITY,
  ],
  date: "09/03/2026",
  updated: "23/09/2026",
  theory: {
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "What is physics?",
          },
          {
            type: "paragraph",
            text: "Physics is the science that tries to explain how the universe works at its most basic level: what everything is made of, what moves it, and the rules it follows. It covers everything from a ball rolling down a ramp to the light of distant stars, and it uses mathematics to turn those rules into predictions you can test.",
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "Physics is the study of matter, energy, space, time and the forces that connect them — and its laws are the same everywhere in the universe.",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "Physics looks for a few **general laws** that explain many different phenomena.",
              "Its core ideas are **matter, energy, forces, space-time and waves/fields**.",
              "Main branches: mechanics, thermodynamics, electromagnetism, quantum physics, relativity, optics, nuclear/particle physics and astrophysics.",
              "It works by a loop: **observe → model → predict → test**. A model that fails a test is changed or dropped.",
              "You don't need advanced maths to start — you need curiosity and to play with how things move.",
            ],
          },
          {
            type: "image",
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Physics_and_other_sciences.png",
            alt: "Diagram showing how physics relates to the other natural sciences.",
            caption:
              "Physics sits under the other natural sciences: chemistry rests on it, biology rests on chemistry.",
            href: "https://en.wikipedia.org/wiki/Physics",
            size: "xsmall",
          },
          {
            type: "sectionTitle",
            text: "What does physics study?",
          },
          {
            type: "paragraph",
            text: "Almost everything in physics is built from five ideas:",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "**Matter and mass** — what things are made of and how much inertia they have.",
              "**Energy** — the capacity to change things. It can change form (motion, heat, light, stored in a spring) but is never created or destroyed.",
              "**Forces** — pushes and pulls. There are only four fundamental ones: gravity, electromagnetism, and the strong and weak nuclear forces.",
              "**Space and time** — the stage on which everything happens, which relativity shows are linked into a single space-time.",
              "**Waves and fields** — how light, sound and forces spread through space.",
            ],
          },
          {
            type: "table",
            columns: ["Fundamental force", "What it does", "Acts on"],
            data: [
              {
                "Fundamental force": "Gravity",
                "What it does":
                  "Pulls masses together; shapes planets and galaxies",
                "Acts on": "Everything with mass or energy",
              },
              {
                "Fundamental force": "Electromagnetism",
                "What it does":
                  "Holds atoms and molecules together; gives light, electricity, magnets",
                "Acts on": "Electric charges",
              },
              {
                "Fundamental force": "Strong nuclear",
                "What it does":
                  "Binds quarks into protons and neutrons, and nuclei together",
                "Acts on": "Quarks and nuclei",
              },
              {
                "Fundamental force": "Weak nuclear",
                "What it does": "Drives radioactive decay and fusion in stars",
                "Acts on": "Most subatomic particles",
              },
            ],
          },
          {
            type: "sectionTitle",
            text: "What are the branches of physics?",
          },
          {
            type: "table",
            columns: ["Branch", "What it studies", "You meet it when…"],
            data: [
              {
                Branch: "Classical mechanics",
                "What it studies": "Motion and forces",
                "You meet it when…": "you throw a ball or ride a bike",
              },
              {
                Branch: "Thermodynamics",
                "What it studies": "Heat, temperature, entropy",
                "You meet it when…": "a cup of tea cools",
              },
              {
                Branch: "Electromagnetism",
                "What it studies": "Electricity, magnetism, light",
                "You meet it when…": "you switch on a lamp",
              },
              {
                Branch: "Optics",
                "What it studies": "How light travels and bends",
                "You meet it when…": "you use glasses or a camera",
              },
              {
                Branch: "Quantum mechanics",
                "What it studies": "Atoms and particles",
                "You meet it when…": "you use a computer chip or LED",
              },
              {
                Branch: "Relativity",
                "What it studies": "Space, time, gravity, high speeds",
                "You meet it when…": "your phone finds you by GPS",
              },
              {
                Branch: "Nuclear & particle physics",
                "What it studies": "Nuclei and elementary particles",
                "You meet it when…": "you have an X-ray or a PET scan",
              },
              {
                Branch: "Astrophysics & cosmology",
                "What it studies": "Stars, galaxies, the universe",
                "You meet it when…": "you look up at night",
              },
            ],
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "An open problem",
            text: "Physics has two hugely successful theories that do not fit together yet: general relativity (gravity, the large) and quantum mechanics (the tiny). Reconciling them is one of the biggest unsolved problems.",
          },
          {
            type: "sectionTitle",
            text: "How is physics different from other sciences?",
          },
          {
            type: "paragraph",
            text: "Three things: **universality** (the same laws apply on Earth and in distant galaxies), **fundamentality** (chemistry, biology and geology ultimately obey physical laws), and **mathematical precision** (physical theories make numerical predictions — quantum electrodynamics predicts the electron's magnetic moment to about eleven decimal places, and experiment agrees).",
          },
          {
            type: "sectionTitle",
            text: "How does physics work?",
          },
          {
            type: "paragraph",
            text: "Physics is not a list of facts to memorise; it is a method. Observe something, build a simple **model** that explains it, use the model to **predict** something new, then **test** the prediction. If the test fails, the model is revised or replaced — Newton's gravity held for two centuries until Einstein's relativity explained what it could not.",
          },
          {
            type: "image",
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/The_Scientific_Method.svg",
            alt: "Diagram of the scientific method as a loop of observation, hypothesis, prediction and test.",
            caption:
              "The scientific method is a loop, not a straight line: every test can send you back to improve the model.",
            href: "https://en.wikipedia.org/wiki/Scientific_method",
            size: "medium",
          },
          {
            type: "paragraph",
            text: "**Theoretical** physicists build and refine the models; **experimental** physicists design the measurements that test them. Both are needed — a theory nobody can test is not yet physics.",
          },
          {
            type: "sectionTitle",
            text: "Why does physics use so much maths?",
          },
          {
            type: "paragraph",
            text: 'Because maths is the language that lets a law make a precise prediction. "Heavier things fall faster" is a guess; $d = \\tfrac12 g t^2$ tells you exactly how far something falls in any time — and lets you find out you were wrong. You don\'t need calculus to begin: a lot of physics needs only ratios, graphs and simple algebra.',
          },
          {
            type: "sectionTitle",
            text: "Where is physics in everyday life?",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "**Computers and phones** exist because quantum physics explained semiconductors; the first transistor was built in 1947.",
              "**GPS** works only because engineers correct for relativity: satellite clocks run about 38 microseconds per day fast relative to the ground, and uncorrected the position error would grow by roughly 10 km a day.",
              "**Medical scans** use physics directly: MRI uses nuclear magnetic resonance, PET scans detect the light from matter meeting antimatter, X-rays are electromagnetic waves.",
              "**Solar panels** rely on the photoelectric effect, which Einstein explained in 1905 — a result that seemed like pure curiosity at the time.",
            ],
          },
          {
            type: "sectionTitle",
            text: "What are common misconceptions about physics?",
          },
          {
            type: "list",
            ordered: false,
            items: [
              '**"A force is needed to keep something moving."** No — an object keeps its velocity unless a force changes it (Newton\'s first law). Friction is the force that stops things.',
              '**"Heavier objects fall faster."** In free fall they all accelerate at the same rate; air resistance is what makes a feather slower.',
              '**"There is no gravity in space."** Gravity is only slightly weaker on the space station; astronauts float because they are in free fall.',
              '**"A theory is just a guess."** In science, a theory is a well-tested explanation that has survived every attempt to disprove it.',
              '**"Energy gets used up."** It changes form (motion into heat, say) but the total is conserved.',
            ],
          },
          {
            type: "sectionTitle",
            text: "How do I start learning physics?",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "**Play first.** Change one number in a simulation and watch what happens — try the [Bouncing Ball](/simulations/BouncingBall) or the [Simple Pendulum](/simulations/SimplePendulum).",
              "**Learn the ideas without heavy maths:** speed, acceleration, force, energy.",
              "**Add algebra:** the equations of motion, [projectile motion](/blog/projectile-parabolic-motion), Hooke's law.",
              "**Then calculus and vectors,** when you want exact answers to harder problems.",
              "**Do one or two problems every day.** Physics is learned by doing, not watching.",
            ],
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "What is physics in simple words?",
                a: "Physics is the science that explains how things move and interact, and what everything is made of. It looks for simple rules that describe a huge range of phenomena, from a falling apple to the orbit of the Moon.",
              },
              {
                q: "What are the main branches of physics?",
                a: "Classical mechanics, thermodynamics, electromagnetism, optics, quantum mechanics, relativity, nuclear and particle physics, and astrophysics and cosmology. Each studies a different scale or kind of phenomenon.",
              },
              {
                q: "Do I need to be good at maths to learn physics?",
                a: "Not to start. Many core ideas — motion, forces, energy — can be understood conceptually and explored with simulations. Maths becomes important when you want precise predictions, but you can build it up gradually.",
              },
              {
                q: "What is the difference between physics and chemistry?",
                a: "Physics studies the fundamental laws of matter, energy and forces. Chemistry applies them to how atoms combine and react. Chemistry's rules ultimately come from physics, especially electromagnetism and quantum mechanics.",
              },
              {
                q: "What can you do with physics?",
                a: "Physics underlies engineering, electronics, medicine, energy, computing, data science and finance, as well as research. The habit of building and testing models is useful almost everywhere.",
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
              "Start with motion: [How does a ball accelerate toward a target?](/blog/ball-uniformly-accelerated-motion).",
              "Then forces and gravity: [How does free fall work?](/blog/ball-free-fall-comprehensive-guide).",
              "Try every experiment: [all PhysicsHub simulations](/simulations).",
              "A big idea from physics: [The three-body problem](/blog/physics-behind-three-body-problem).",
            ],
          },
        ],
      },
    ],
  },
};
