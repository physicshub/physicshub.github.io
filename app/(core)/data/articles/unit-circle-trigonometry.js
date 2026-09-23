import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const unitCircleBlog = {
  slug: "unit-circle-trigonometry",
  name: "What is the unit circle?",
  desc: "On a circle of radius 1, cosine and sine are the x and y coordinates of a point at angle θ. Tangent and the other functions are lengths too — and sin(ωθ+φ) is a wave.",
  tags: [
    LEVELS.lowerSecondary,
    DIFFICULTIES.core,
    TAGS.MATH,
    TAGS.TRIGONOMETRY,
    TAGS.WAVES,
  ],
  date: "24/09/2026",
  theory: {
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "What is the unit circle?",
          },
          {
            type: "paragraph",
            text: "The unit circle is a circle of radius $1$ centred at the origin. Pick a point on it at angle $\\theta$ from the positive x-axis: its **x-coordinate is $\\cos\\theta$** and its **y-coordinate is $\\sin\\theta$**. That single picture defines sine and cosine for every angle — not just the ones inside a triangle — and shows why they repeat every full turn.",
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "On the unit circle the point at angle $\\theta$ is $(\\cos\\theta,\\ \\sin\\theta)$. Because the radius is 1, Pythagoras gives $\\sin^2\\theta + \\cos^2\\theta = 1$ for every angle.",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "$\\cos\\theta$ is the horizontal coordinate and $\\sin\\theta$ the vertical coordinate of the point at angle $\\theta$.",
              "$\\tan\\theta = \\sin\\theta/\\cos\\theta$ is the slope of the radius — and a length on the vertical line $x = 1$.",
              "One full turn is $360°$ or $2\\pi$ radians, so sine and cosine repeat with period $2\\pi$.",
              "Plotting $\\sin\\theta$ against the angle traces a **sine wave**; $y = A\\sin(\\omega\\theta + \\varphi)$ changes its height, speed and shift.",
            ],
          },
          {
            type: "sectionTitle",
            text: "How do sine and cosine come from the circle?",
          },
          {
            type: "paragraph",
            text: "Draw a right triangle from the point straight down to the x-axis. The hypotenuse is the radius, $1$, so the horizontal leg is $\\cos\\theta$ and the vertical leg is $\\sin\\theta$. As the point moves round the circle the same picture works past $90°$, where triangles stop making sense: in the second quadrant $\\cos\\theta$ is negative (the point is left of the y-axis) while $\\sin\\theta$ is still positive.",
          },
          {
            type: "formula",
            latex: "\\sin^{2}\\theta + \\cos^{2}\\theta = 1",
          },
          {
            type: "table",
            columns: [
              "Angle",
              "$\\cos\\theta$",
              "$\\sin\\theta$",
              "$\\tan\\theta$",
            ],
            data: [
              {
                Angle: "0°",
                "$\\cos\\theta$": "1",
                "$\\sin\\theta$": "0",
                "$\\tan\\theta$": "0",
              },
              {
                Angle: "30° (π/6)",
                "$\\cos\\theta$": "√3/2 ≈ 0.866",
                "$\\sin\\theta$": "1/2",
                "$\\tan\\theta$": "≈ 0.577",
              },
              {
                Angle: "45° (π/4)",
                "$\\cos\\theta$": "√2/2 ≈ 0.707",
                "$\\sin\\theta$": "√2/2 ≈ 0.707",
                "$\\tan\\theta$": "1",
              },
              {
                Angle: "60° (π/3)",
                "$\\cos\\theta$": "1/2",
                "$\\sin\\theta$": "√3/2 ≈ 0.866",
                "$\\tan\\theta$": "≈ 1.732",
              },
              {
                Angle: "90° (π/2)",
                "$\\cos\\theta$": "0",
                "$\\sin\\theta$": "1",
                "$\\tan\\theta$": "undefined",
              },
            ],
          },
          {
            type: "callout",
            calloutType: "tip",
            title: "Try it",
            text: "Drag the angle in the simulation and watch the point's coordinates. When it crosses $90°$, cosine changes sign; at exactly $90°$ tangent has no value because the radius is vertical.",
          },
          {
            type: "sectionTitle",
            text: "What are tangent, secant and the others?",
          },
          {
            type: "paragraph",
            text: "The other four functions are also lengths in the picture. **Tangent** is the height where the extended radius meets the vertical line $x = 1$, and it equals $\\sin\\theta/\\cos\\theta$. The reciprocals — **secant** $1/\\cos\\theta$, **cosecant** $1/\\sin\\theta$ and **cotangent** $\\cos\\theta/\\sin\\theta$ — are the matching segments on the other tangent lines. Tangent blows up whenever $\\cos\\theta = 0$, which is why it has gaps.",
          },
          {
            type: "sectionTitle",
            text: "Why radians?",
          },
          {
            type: "paragraph",
            text: "A radian measures an angle by the arc it cuts off on the unit circle: an arc of length $\\theta$ subtends an angle of $\\theta$ radians. A full turn has arc length $2\\pi$, so $360° = 2\\pi$ rad and $180° = \\pi$ rad. Radians make formulas clean — for example the arc length is simply $s = r\\theta$ — which is why physics uses them.",
          },
          {
            type: "sectionTitle",
            text: "How does the circle make a wave?",
          },
          {
            type: "paragraph",
            text: "Let the point travel round the circle and record its height. Against the angle $\\theta$ this traces the sine wave. Stretching and shifting it gives the general form:",
          },
          {
            type: "formula",
            latex: "y = A\\,\\sin(\\omega\\theta + \\varphi)",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "**Amplitude $A$** — how tall the wave is.",
              "**Angular frequency $\\omega$** — how many cycles fit in each turn; the period becomes $2\\pi/\\omega$.",
              "**Phase $\\varphi$** — a horizontal shift that slides the wave left or right.",
            ],
          },
          {
            type: "paragraph",
            text: "The same equation describes a mass on a spring, a pendulum for small swings and an alternating current: anything that goes round a circle at a steady rate has a sine wave as its shadow.",
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "Why is the radius 1 in the unit circle?",
                a: "So that the coordinates are exactly cosine and sine — no scaling needed. For a circle of radius $r$ the point is $(r\\cos\\theta,\\ r\\sin\\theta)$.",
              },
              {
                q: "Why is sin²θ + cos²θ = 1?",
                a: "The point $(\\cos\\theta,\\ \\sin\\theta)$ lies on a circle of radius 1, and the distance from the origin satisfies $x^2 + y^2 = 1$. It is Pythagoras' theorem on the triangle with legs $\\cos\\theta$ and $\\sin\\theta$.",
              },
              {
                q: "Why is tan 90° undefined?",
                a: "At $90°$, $\\cos\\theta = 0$, and tangent is $\\sin\\theta/\\cos\\theta$, which would divide by zero. Geometrically the radius is parallel to the line $x = 1$ and never meets it.",
              },
              {
                q: "How do I convert degrees to radians?",
                a: "Multiply by $\\pi/180$. So $90° = \\pi/2$, $180° = \\pi$ and $360° = 2\\pi$ radians.",
              },
              {
                q: "What is the difference between frequency and angular frequency?",
                a: "Frequency $f$ counts cycles per second; angular frequency $\\omega = 2\\pi f$ counts radians per second. In $y = A\\sin(\\omega t)$ it is $\\omega$ that appears.",
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
              "Drag the angle and plot the wave in the [Trigonometric Circle simulation](/simulations/TrigonometricCircle).",
              "Sine and cosine split a velocity into components: [How does projectile motion work?](/blog/projectile-parabolic-motion).",
              "The circle in motion: [What is centripetal force?](/blog/circular-motion-centripetal-force).",
              "The full toolkit for components: [Vectors: components, addition, dot and cross products](/blog/comprehensive-guide-to-vector-operations).",
            ],
          },
        ],
      },
    ],
  },
};
