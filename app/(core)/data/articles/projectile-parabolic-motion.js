import TAGS from "../tags";

export const projectileParabolicBlog = {
  id: "bb-007",
  slug: "projectile-parabolic-motion",
  name: "how parabolic projectile motion works?",
  desc: "Understand parabolic projectile motion in easy way.",
  tags: [TAGS.MEDIUM, TAGS.PHYSICS, TAGS.GRAVITY, TAGS.ACCELERATION],
  theory: {
    sections: [
      {
        title: "Introduction",
        blocks: [
          {
            type: "paragraph",
            text: "Projectile motion describes the two-dimensional movement of an object that is launched with an initial velocity and then allowed to move under the influence of gravity alone. The horizontal and vertical motions are independent: horizontal motion has constant velocity (if we neglect air drag), while vertical motion experiences constant acceleration due to gravity.",
          },
          {
            type: "paragraph",
            text: 'In this simulation you can tune the launch speed v₀, the shooting angle θ, the initial height h₀, and even add linear drag or wind acceleration. The draggable ball lets you reposition the launch instantly, making it easier to investigate "what-if" scenarios.',
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
              "Horizontal position: x(t) = v₀ cos(θ) · t",
              "Vertical position: y(t) = h₀ + v₀ sin(θ) · t - ½ g t²",
              "Time of flight (until y=0): t_f = (v₀ sin(θ) + √(v₀² sin²(θ) + 2 g h₀)) / g",
              "Range: R = v₀ cos(θ) · t_f",
            ],
          },
          {
            type: "formula",
            latex:
              "\\begin{aligned}x(t) &= v_0 \\cos(\\theta)\\,t \\\\ y(t) &= h_0 + v_0 \\sin(\\theta)\\,t - \\tfrac{1}{2}g t^2\\end{aligned}",
          },
        ],
      },
      {
        title: "Energy Viewpoint",
        blocks: [
          {
            type: "paragraph",
            text: "Ignoring drag, the total mechanical energy E = K + U remains constant. At launch the kinetic energy is ½ m v₀² and the potential energy is m g h₀. As the projectile rises, kinetic energy is converted into potential energy until it reaches the apex.",
          },
          {
            type: "formula",
            latex: "K = \\tfrac{1}{2} m v^2, \\quad U = m g h",
          },
          {
            type: "note",
            text: "When air resistance is enabled in the simulation, a portion of the mechanical energy is dissipated as heat, shortening the range compared to the ideal case.",
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
              "A 45° launch maximizes range only when h₀ = 0 and there is no drag.",
              "Higher launch heights increase the time of flight and therefore the horizontal range.",
              "Wind acceleration acts horizontally and can either stretch or shorten the range depending on its direction.",
              "Drag forces depend on velocity; faster projectiles experience a stronger decelerating effect.",
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
            title: "Experiment",
            text: "Set wind to a positive value and drag to zero, then repeat with drag enabled. Compare how the predicted range shown in SimInfo diverges from the actual landing point.",
          },
          {
            type: "callout",
            calloutType: "info",
            title: "Interactive controls",
            text: "Drag the projectile before release to change the launch position, double-click the canvas to quickly relaunch with the current parameters, and use the guides toggle to inspect the theoretical arc.",
          },
        ],
      },
    ],
  },
};
