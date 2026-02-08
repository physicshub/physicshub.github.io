import TAGS from "../tags.js";

export const inclinedPlaneBlog = {
  id: "bb-008",
  slug: "incline-plane",
  name: "Inclined Plane",
  desc: "Understand the physics of an inclined plane through forces, motion, and energy.",
  tags: [TAGS.MEDIUM, TAGS.DYNAMICS, TAGS.FORCES, TAGS.FRICTION],

  theory: {
    sections: [
      {
        title: "Introduction",
        blocks: [
          {
            type: "paragraph",
            text: "An inclined plane is a flat surface tilted at an angle to the horizontal. It is a simple machine that allows objects to be raised or lowered using less force compared to vertical lifting. The motion of an object on an inclined plane is analyzed by resolving gravitational force into components parallel and perpendicular to the surface.",
          },
          {
            type: "paragraph",
            text: "The weight of an object (mg) acts vertically downward. On an incline of angle θ, this force is resolved into two components: one parallel to the slope (mg sin θ), which causes motion, and one perpendicular to the slope (mg cos θ), which is balanced by the normal force.",
          },
        ],
      },

      {
        title: "Forces on an Inclined Plane",
        blocks: [
          {
            type: "list",
            ordered: false,
            items: [
              "Parallel component of gravity: F∥ = mg sin(θ)",
              "Perpendicular component of gravity: F⊥ = mg cos(θ)",
              "Normal force: N = mg cos(θ)",
              "Kinetic friction: fk = μk N = μk mg cos(θ)",
              "Static friction (maximum): fs(max) = μs mg cos(θ)",
            ],
          },
        ],
      },

      {
        title: "Equations of Motion",
        blocks: [
          {
            type: "list",
            ordered: false,
            items: [
              "Acceleration without friction: a = g sin(θ)",
              "Acceleration with friction: a = g (sin(θ) − μ cos(θ))",
              "Velocity along the slope: v = a t",
              "Distance travelled along the slope: s = ½ a t²",
            ],
          },
          {
            type: "formula",
            latex:
              "\\begin{aligned} a &= g \\sin\\theta \\\\ a &= g(\\sin\\theta - \\mu \\cos\\theta) \\\\ v &= at \\\\ s &= \\tfrac{1}{2}at^2 \\end{aligned}",
          },
        ],
      },

      {
        title: "Energy Viewpoint",
        blocks: [
          {
            type: "paragraph",
            text: "From an energy perspective, an inclined plane converts gravitational potential energy into kinetic energy. In the absence of friction, mechanical energy is conserved. When friction is present, some energy is dissipated as heat.",
          },
          {
            type: "formula",
            latex: "U = mgh, \\quad K = \\tfrac{1}{2}mv^2",
          },
          {
            type: "note",
            text: "With friction, the work done by friction reduces the final kinetic energy of the object.",
          },
        ],
      },

      {
        title: "Angle of Repose",
        blocks: [
          {
            type: "paragraph",
            text: "The angle of repose is the minimum angle of inclination at which an object just begins to slide down the plane. At this angle, the component of gravity parallel to the plane equals the maximum static friction.",
          },
          {
            type: "formula",
            latex: "\\tan\\theta = \\mu_s",
          },
        ],
      },

      {
        title: "Practical Observations",
        blocks: [
          {
            type: "list",
            ordered: false,
            items: [
              "Increasing the angle θ increases acceleration down the slope.",
              "Higher friction coefficients reduce acceleration and may prevent motion entirely.",
              "An object slides only if mg sin(θ) > μ mg cos(θ).",
              "The mechanical advantage of an incline is MA = L / h = 1 / sin(θ).",
            ],
          },
        ],
      },

      {
        title: "Try It Yourself",
        blocks: [
          {
            type: "callout",
            calloutType: "tip",
            text: "Set friction to zero and observe uniform acceleration down the slope. Gradually increase friction and note how the acceleration decreases. Adjust the angle to find the angle of repose.",
          },
          {
            type: "callout",
            calloutType: "info",
            title: "Interactive Controls",
            text: "Change the incline angle to study its effect on acceleration. Adjust the friction coefficient to compare ideal and realistic motion. Enable force guides to visualize gravity, normal force, and friction components.",
          },
        ],
      },
    ],
  },
};
