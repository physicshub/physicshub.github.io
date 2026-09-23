import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const ballFreeFallBlog = {
  id: "bb-004",
  slug: "ball-free-fall-comprehensive-guide",
  name: "How does free fall work?",
  desc: "In free fall every object accelerates at g ≈ 9.81 m/s², whatever its mass. Equations, gravity on other worlds, and how air resistance sets terminal velocity.",
  tags: [
    LEVELS.upperSecondary,
    DIFFICULTIES.core,
    TAGS.PHYSICS,
    TAGS.GRAVITY,
    TAGS.KINEMATICS,
    TAGS.ACCELERATION,
  ],
  date: "24/01/2026",
  updated: "23/09/2026",
  theory: {
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "How does free fall work?",
          },
          {
            type: "paragraph",
            text: "An object in free fall has gravity as the only force acting on it, so it accelerates downward at a constant rate: $g \\approx 9.81\\ \\text{m/s}^2$ on Earth. Its speed grows by about $9.81$ m/s every second, and — the surprising part — **the acceleration is the same for a bowling ball and a feather**, because a heavier object is pulled harder but is also harder to accelerate.",
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "In free fall $v = gt$ and the distance fallen is $d = \\tfrac12 g t^2$, for any mass. Only air resistance makes light, broad objects fall more slowly.",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "Free fall = only gravity acts. Acceleration is $g$ (9.81 m/s² on Earth), independent of mass.",
              "Time to fall a height $h$: $t = \\sqrt{2h/g}$. Speed on landing: $v = \\sqrt{2gh}$.",
              "Other worlds have different $g$: the Moon 1.62, Mars 3.71, Jupiter 24.79 m/s².",
              "Air resistance grows with speed until it balances weight: the **terminal velocity**.",
              "A constant wind adds a horizontal acceleration that acts independently of gravity.",
            ],
          },
          {
            type: "sectionTitle",
            text: "What are the equations of free fall?",
          },
          {
            type: "paragraph",
            text: "Drop an object from rest at height $h$ and take up as positive. Constant acceleration gives:",
          },
          {
            type: "formula",
            latex:
              "\\begin{aligned}v(t) &= -g\\,t \\\\[2pt] y(t) &= h - \\tfrac{1}{2}g\\,t^2 \\\\[2pt] v^2 &= 2\\,g\\,d\\end{aligned}",
          },
          {
            type: "paragraph",
            text: "The last one says the landing speed depends only on the distance fallen $d$, not on the mass. A ball dropped from $10$ m hits the ground at about $14$ m/s (50 km/h), whether it is a ping-pong ball or a bowling ball — in a vacuum.",
          },
          {
            type: "table",
            columns: ["Drop height", "Time to ground", "Impact speed"],
            data: [
              {
                "Drop height": "1 m (table)",
                "Time to ground": "0.45 s",
                "Impact speed": "4.4 m/s (16 km/h)",
              },
              {
                "Drop height": "5 m (second floor)",
                "Time to ground": "1.01 s",
                "Impact speed": "9.9 m/s (36 km/h)",
              },
              {
                "Drop height": "10 m (third floor)",
                "Time to ground": "1.43 s",
                "Impact speed": "14.0 m/s (50 km/h)",
              },
              {
                "Drop height": "50 m",
                "Time to ground": "3.19 s",
                "Impact speed": "31.3 m/s (113 km/h)",
              },
            ],
          },
          {
            type: "callout",
            calloutType: "info",
            title: "Galileo on the Moon",
            text: "On 2 August 1971 Apollo 15 astronaut David Scott dropped a hammer and a falcon feather together on the Moon. With no air, they hit the surface at the same instant — Galileo's idea confirmed live on television.",
          },
          {
            type: "sectionTitle",
            text: "How does gravity change on other worlds?",
          },
          {
            type: "paragraph",
            text: "Surface gravity comes from Newton's law, $g = GM/R^2$. It depends on the planet's mass **and** radius, which is why small, dense bodies can pull harder than their mass alone suggests. Same drop, different worlds:",
          },
          {
            type: "table",
            columns: [
              "World",
              "$g$ (m/s²)",
              "Time to fall 10 m",
              "Impact speed",
            ],
            data: [
              {
                World: "Moon",
                "$g$ (m/s²)": "1.62",
                "Time to fall 10 m": "3.51 s",
                "Impact speed": "5.7 m/s",
              },
              {
                World: "Mars",
                "$g$ (m/s²)": "3.71",
                "Time to fall 10 m": "2.32 s",
                "Impact speed": "8.6 m/s",
              },
              {
                World: "Earth",
                "$g$ (m/s²)": "9.81",
                "Time to fall 10 m": "1.43 s",
                "Impact speed": "14.0 m/s",
              },
              {
                World: "Jupiter",
                "$g$ (m/s²)": "24.79",
                "Time to fall 10 m": "0.90 s",
                "Impact speed": "22.3 m/s",
              },
            ],
          },
          {
            type: "callout",
            calloutType: "tip",
            title: "Try it",
            text: "In the simulation pick a different world from the gravity menu and drop the ball from the same height. The timing changes exactly as $t = \\sqrt{2h/g}$ predicts.",
          },
          {
            type: "sectionTitle",
            text: "What does air resistance do?",
          },
          {
            type: "paragraph",
            text: "Real objects push air out of the way, and the air pushes back. At everyday speeds that drag force grows with the **square** of the speed:",
          },
          {
            type: "formula",
            latex: "F_{\\text{drag}} = \\tfrac{1}{2}\\,C_d\\,\\rho\\,A\\,v^2",
          },
          {
            type: "paragraph",
            text: "Here $C_d$ is the shape-dependent drag coefficient (about $0.47$ for a sphere), $\\rho \\approx 1.225\\ \\text{kg/m}^3$ is air density and $A$ is the area facing the flow. As a falling object speeds up, drag grows until it equals the weight. Then the net force is zero, the acceleration stops, and the object falls at constant **terminal velocity**:",
          },
          {
            type: "formula",
            latex:
              "v_{\\text{terminal}} = \\sqrt{\\dfrac{2\\,m\\,g}{C_d\\,\\rho\\,A}}",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "A belly-down **skydiver** tops out around $55$ m/s (200 km/h); tucked head-down, above $80$ m/s.",
              "A **raindrop** falls from kilometres up but hits at only about $9$ m/s.",
              "An **ant** has such a small mass for its surface area that its terminal speed is a few m/s — it survives a fall from any height.",
            ],
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "The simulation ignores air drag",
            text: "The Ball Gravity simulation models gravity, wind, floor friction and bounce — not air resistance — so its ball never reaches a terminal velocity. The drag section above describes the real-world extension.",
          },
          {
            type: "sectionTitle",
            text: "How does wind change the fall?",
          },
          {
            type: "paragraph",
            text: "In the simulation, wind (active while you hold the mouse button) is a **constant horizontal acceleration** $a_w$. Gravity acts only vertically and wind only horizontally, so the two motions are independent and you can solve each separately:",
          },
          {
            type: "formula",
            latex:
              "\\begin{aligned}x(t) &= x_0 + v_{x0}\\,t + \\tfrac{1}{2}a_w\\,t^2 \\\\[2pt] y(t) &= y_0 + v_{y0}\\,t - \\tfrac{1}{2}g\\,t^2\\end{aligned}",
          },
          {
            type: "paragraph",
            text: "Combined, the path curves like a tilted parabola. It is the same independence that makes projectile motion work, with wind supplying the sideways acceleration instead of a launch speed.",
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "Do heavier objects fall faster?",
                a: "Not in free fall. Gravity pulls a heavier object harder, but its greater inertia cancels that exactly, so all objects accelerate at $g$. In air, drag slows light and broad objects more — that is why a feather falls slower than a hammer, but not on the Moon.",
              },
              {
                q: "What is the acceleration of free fall?",
                a: "About $9.81\\ \\text{m/s}^2$ downward at Earth's surface, often rounded to 10. It varies slightly with latitude and altitude, and it is very different on other bodies: 1.62 on the Moon, 24.79 on Jupiter.",
              },
              {
                q: "What is terminal velocity?",
                a: "The constant speed a falling object reaches when air drag equals its weight, so the net force — and the acceleration — is zero. For a skydiver it is roughly 55 m/s in a belly-down position.",
              },
              {
                q: "How long does it take to fall a given height?",
                a: "$t = \\sqrt{2h/g}$, ignoring air. From 10 m on Earth that is about 1.43 s; from 100 m about 4.5 s (air resistance makes real falls from that height slightly longer).",
              },
              {
                q: "Why do astronauts float if gravity still acts on them?",
                a: "Because they are in continuous free fall around the Earth: the station and everything in it fall together, so nothing pushes on anything else. Weightlessness is falling with nothing to stop you.",
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
              "Drop a ball on any world, add wind and friction: [Ball Gravity simulation](/simulations/BallGravity).",
              "What the floor does next: [How a bouncing ball works](/blog/physics-bouncing-ball-comprehensive-educational-guide).",
              "Add a launch speed and angle: [How projectile motion works](/blog/projectile-parabolic-motion).",
              "Code the drag and check it against the exact solution: [Simulating a falling object with air resistance](/blog/simulating-air-resistance-in-code).",
            ],
          },
        ],
      },
    ],
  },
};
