import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

/**
 * Operations with Vectors: A Comprehensive Educational Journey
 * This blog is structured progressively, moving from high-school basic intuition
 * to advanced engineering-level vector calculus and computational implementation.
 */

export const operationVectorsBlog = {
  slug: "comprehensive-guide-to-vector-operations",
  name: "Vectors: components, addition, dot and cross products",
  desc: "A vector has magnitude and direction. Split it into components and addition, scaling, dot and cross products all become simple arithmetic.",
  tags: [
    LEVELS.upperSecondary,
    DIFFICULTIES.core,
    TAGS.MATH,
    TAGS.PHYSICS,
    TAGS.VECTORS,
    TAGS.TRIGONOMETRY,
  ],
  date: "22/01/2026",
  updated: "06/09/2026",
  theory: {
    title: "Vector Algebra: The Language of Space and Force",
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "What is a vector?",
          },
          {
            type: "paragraph",
            text: "Imagine you are giving someone directions. If you say 'walk 5 kilometres', they don't know where to go. If you say 'walk north', they don't know how far. A **vector** is a mathematical object that combines both: it has a **magnitude** (a length) and a **direction** (an angle). Force, velocity, acceleration and displacement are all vectors.",
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "A vector has size and direction. The trick to working with one is to split it into perpendicular **components** — then every operation becomes ordinary arithmetic on numbers.",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "A vector = magnitude + direction. Split it into components with $v_x = |v|\\cos\\theta$, $v_y = |v|\\sin\\theta$.",
              "Add vectors tip-to-tail (or add components); the magnitude of the sum is **not** the sum of the magnitudes.",
              "**Normalising** ($\\hat{v} = \\vec{v}/|v|$) keeps a vector's direction but sets its length to 1.",
              "The **dot product** $\\vec a\\cdot\\vec b = |a||b|\\cos\\theta$ returns a number and measures alignment — zero means perpendicular.",
              "The **cross product** $|a||b|\\sin\\theta$ returns an area (2D) or a perpendicular vector (3D), and is the basis of torque.",
            ],
          },
          {
            type: "subheading",
            text: "The three pillars of a vector",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "**Magnitude:** The scalar size of the vector (e.g., speed, force intensity).",
              "**Direction:** The line along which the vector points (the angle).",
              "**Orientation (Sense):** Which way the arrow points along that line.",
            ],
          },

          {
            type: "callout",
            calloutType: "info",
            title: "Wait, what is a Scalar?",
            text: "A scalar is just a number (like temperature or mass). It has no direction. Vectors are 'scalars with an attitude'—they point somewhere!",
          },
        ],
      },
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Breaking a vector into components",
          },
          {
            type: "paragraph",
            text: "Computers and engineers don't usually work with 'angles' directly; they break vectors down into **Components**. By placing a vector on a Cartesian Plane, we can find its influence along the X and Y axes using Trigonometry.",
          },
          {
            type: "formula",
            latex:
              "v_x = |v| \\cdot \\cos(\\theta) \\quad , \\quad v_y = |v| \\cdot \\sin(\\theta)",
            inline: false,
          },
          {
            type: "paragraph",
            text: "Conversely, if we have the components, we use the **Pythagorean Theorem** to find the total magnitude and the **Arctangent** for the angle.",
          },
          {
            type: "formula",
            latex:
              "|v| = \\sqrt{v_x^2 + v_y^2} \\quad , \\quad \\theta = \\arctan\\left(\\frac{v_y}{v_x}\\right)",
            inline: false,
          },

          {
            type: "toggle",
            title: "Why do we decompose vectors?",
            content:
              "Decomposition allows us to solve complex 2D problems as two simple 1D problems. For example, gravity only affects the Y-component of a projectile, while air resistance might affect both.",
          },
        ],
      },
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Adding and subtracting vectors",
          },
          {
            type: "paragraph",
            text: "Adding vectors is not as simple as $2 + 2 = 4$. If you walk 3m East and 4m North, you are 5m away from the start, not 7m. This is **Vector Addition**.",
          },
          {
            type: "subtitle",
            text: "Visual Methods",
            level: 1,
          },
          {
            type: "list",
            ordered: false,
            items: [
              "**Tip-to-Tail Method:** Place the start of the second vector at the end of the first. The result is the line from the very start to the very end.",
              "**Parallelogram Method:** Start both vectors from the same origin. Create a parallelogram; the diagonal is the resultant.",
            ],
          },

          {
            type: "callout",
            calloutType: "warning",
            title: "Common Pitfall: Subtraction",
            text: "Vector subtraction $\\vec{a} - \\vec{b}$ is actually the addition of the opposite: $\\vec{a} + (-\\vec{b})$. Graphically, the result points from the tip of B to the tip of A.",
          },
          {
            type: "example",
            title: "The Resultant Force",
            content:
              "If two people pull a box in different directions, the box moves along the 'Resultant' vector created by adding their individual force vectors.",
          },
        ],
      },
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Scaling and normalising",
          },
          {
            type: "paragraph",
            text: "Multiplication by a **Scalar** changes the length of a vector without changing its direction (unless the scalar is negative, which flips the direction 180°).",
          },
          {
            type: "subtitle",
            text: "Normalization (Unit Vectors)",
            level: 1,
          },
          {
            type: "paragraph",
            text: "In game development and physics, we often only care about the **direction**. A **Unit Vector** is a vector with a magnitude of exactly 1. We create it through **Normalization**.",
          },
          {
            type: "formula",
            latex: "\\hat{v} = \\frac{\\vec{v}}{|v|}",
            inline: false,
          },
          {
            type: "callout",
            calloutType: "tip",
            title: "Use Case: Character Movement",
            text: "If a player holds 'Up' and 'Right', the combined vector is longer than 1. If you don't normalize it, the character will move faster diagonally than they do straight! Always normalize your input vectors.",
          },
        ],
      },
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "The dot product: measuring alignment",
          },
          {
            type: "paragraph",
            text: "The Dot Product is one of the most powerful tools in physics. It takes two vectors and returns a single **Scalar number**. It measures how much one vector 'points' in the same direction as another.",
          },
          {
            type: "formula",
            latex:
              "\\vec{a} \\cdot \\vec{b} = |a||b| \\cos(\\theta) = a_x b_x + a_y b_y",
            inline: false,
          },

          {
            type: "table",
            columns: ["Angle (θ)", "Dot Product Result", "Meaning"],
            data: [
              {
                "Angle (θ)": "0°",
                "Dot Product Result": "Positive (Max)",
                Meaning: "Vectors point in the same direction.",
              },
              {
                "Angle (θ)": "90°",
                "Dot Product Result": "Zero",
                Meaning: "Vectors are Orthogonal (Perpendicular).",
              },
              {
                "Angle (θ)": "180°",
                "Dot Product Result": "Negative (Min)",
                Meaning: "Vectors point in opposite directions.",
              },
            ],
          },
          {
            type: "callout",
            calloutType: "info",
            title: "Physical Work",
            text: "In physics, Work is defined as $W = \\vec{F} \\cdot \\vec{d}$. If you push a wall, you apply force, but displacement is zero, so Work is zero!",
          },
        ],
      },
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "The cross product: area and torque",
          },
          {
            type: "paragraph",
            text: "Unlike the Dot Product, the Cross Product returns a **Vector**. In 3D, this vector is perpendicular to both inputs. In 2D, we calculate a 'Pseudoscalar' which represents the area of the parallelogram formed by the vectors.",
          },
          {
            type: "formula",
            latex: "\\vec{a} \\times \\vec{b} = |a||b| \\sin(\\theta) \\hat{n}",
            inline: false,
          },

          {
            type: "paragraph",
            text: "This is crucial for calculating **torque** (rotational force) and for determining whether a point lies to the left or the right of a line — the sign of the 2D cross product tells you which side.",
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "What is the difference between a vector and a scalar?",
                a: "A scalar is a single number — mass, temperature, speed. A vector has both a magnitude and a direction — velocity, force, displacement. You can add two scalars with ordinary arithmetic; adding two vectors means combining their directions too.",
              },
              {
                q: "Why isn't the magnitude of a sum equal to the sum of the magnitudes?",
                a: "Because the vectors point in different directions, so they partly work against each other. Walk 3 m east then 4 m north and you end up 5 m from the start, not 7 m — the components add, and Pythagoras gives the resulting length.",
              },
              {
                q: "What does the dot product actually tell you?",
                a: "How much two vectors point the same way. It is $|a||b|\\cos\\theta$: positive when the angle between them is under 90°, zero when they are perpendicular, negative when they oppose. In physics, work is the dot product of force and displacement.",
              },
              {
                q: "When do I need to normalise a vector?",
                a: 'Whenever you only care about direction, not size — for example, to get a unit "which way" vector for steering or for projecting one vector onto another. Divide the vector by its own magnitude and its length becomes exactly 1.',
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
              "Add, subtract and dot vectors live in the [Vector Operations simulation](/simulations/VectorsOperations).",
              "Components in action — splitting a launch velocity: [How projectile motion works](/blog/projectile-parabolic-motion).",
              "The unit circle behind $\\sin$ and $\\cos$: [Trigonometric Circle simulation](/simulations/TrigonometricCircle).",
            ],
          },
        ],
      },
    ],
  },
};
