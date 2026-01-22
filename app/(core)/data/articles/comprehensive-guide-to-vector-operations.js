import TAGS from "../tags.js";

/**
 * Operations with Vectors: A Comprehensive Educational Journey
 * This blog is structured progressively, moving from high-school basic intuition
 * to advanced engineering-level vector calculus and computational implementation.
 */

export const operationVectorsBlog = {
  slug: "comprehensive-guide-to-vector-operations",
  name: "The Mathematical Universe of Vectors: A Progressive Guide",
  desc: "From basic geometry to advanced dot and cross products, learn how vectors power physics and computer science.",
  tags: [TAGS.MATH, TAGS.PHYSICS, TAGS.VECTORS],
  theory: {
    title: "Vector Algebra: The Language of Space and Force",
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Level 1: Intuition and Geometric Foundations",
          },
          {
            type: "paragraph",
            text: "Imagine you are giving someone directions. If you say 'walk 5 kilometers', they don't know where to go. If you say 'walk North', they don't know how far. A **Vector** is a mathematical object that combines both: it has a **Magnitude** (length) and a **Direction** (angle).",
          },
          {
            type: "subheading",
            text: "The Three Pillars of a Vector",
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
            text: "Level 2: Trigonometric Decomposition",
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
            text: "Level 3: Geometric Addition and Subtraction",
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
            text: "Level 4: Scaling and Normalization",
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
            text: "Level 5: The Dot Product (Scalar Product)",
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
            text: "Level 6: The Cross Product (Vector Product)",
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
            text: "This is crucial for calculating **Torque** (rotational force) and determining if a point is to the left or right of a line.",
          },
        ],
      },
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Final Phase: Computational Implementation",
          },
          {
            type: "paragraph",
            text: "For a student of computer science, here is how a complete 2D Vector Class looks, implementing everything we have learned.",
          },
          {
            type: "code",
            language: "javascript",
            code: `class Vector2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  // Level 3: Addition
  add(v) {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }

  // Level 4: Scaling & Normalization
  get magnitude() {
    return Math.sqrt(this.x**2 + this.y**2);
  }

  normalize() {
    const mag = this.magnitude;
    if (mag === 0) return new Vector2D(0, 0);
    return new Vector2D(this.x / mag, this.y / mag);
  }

  // Level 5: Dot Product
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  // Level 6: 2D Cross Product (Scalar)
  cross(v) {
    return this.x * v.y - this.y * v.x;
  }
}`,
          },
          {
            type: "callout",
            calloutType: "success",
            title: "Learning Journey Complete",
            text: "You have successfully navigated from simple arrows to complex algebraic operations. These concepts are the foundation of modern engineering, 3D graphics, and orbital mechanics.",
          },
        ],
      },
    ],
  },
};
