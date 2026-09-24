import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const airplanesFlyBlog = {
  slug: "how-do-airplanes-fly",
  name: "How do airplanes fly?",
  desc: "A wing pushes air downward and the air pushes the wing up. That lift grows with speed squared and balances the plane's weight in level flight.",
  tags: [
    LEVELS.upperSecondary,
    DIFFICULTIES.core,
    TAGS.PHYSICS,
    TAGS.FLUIDS,
    TAGS.FORCES,
  ],
  date: "24/09/2026",
  theory: {
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "How do airplanes fly?",
          },
          {
            type: "paragraph",
            text: "An airplane flies because its wings **deflect air downward**, and by Newton's third law the air pushes the wings **upward**. That upward push is called **lift**. In steady level flight lift exactly balances the plane's weight, and the engines only have to overcome drag.",
          },
          {
            type: "paragraph",
            text: "You can describe the same lift in two equivalent ways: as a change in the momentum of the air, or as lower pressure above the wing than below it. Both are correct; neither needs the wing to be curved on top.",
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "Lift is the upward force from a wing turning airflow downward; it grows with the **square of speed** and must equal weight, $L = W$, for level flight.",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "A wing tilted into the wind (its **angle of attack**) sends air downward, and the air reacts by pushing the wing up.",
              "Four forces act on a plane: lift, weight, thrust and drag. Level, constant-speed flight means lift $=$ weight and thrust $=$ drag.",
              "Lift follows $L = \\tfrac12 \\rho v^2 S C_L$, so doubling speed gives four times the lift.",
              "Too steep an angle of attack makes the airflow separate from the wing and lift collapses: a **stall**.",
            ],
          },
          {
            type: "sectionTitle",
            text: "What are the four forces on an airplane?",
          },
          {
            type: "table",
            columns: ["Force", "Direction", "Produced by"],
            data: [
              {
                Force: "Lift",
                Direction: "Up, perpendicular to airflow",
                "Produced by": "Wings deflecting air downward",
              },
              {
                Force: "Weight",
                Direction: "Down",
                "Produced by": "Gravity acting on the plane's mass",
              },
              {
                Force: "Thrust",
                Direction: "Forward",
                "Produced by": "Propellers or jet engines pushing air backward",
              },
              {
                Force: "Drag",
                Direction: "Backward, along airflow",
                "Produced by": "Air resistance against the whole plane",
              },
            ],
          },
          {
            type: "sectionTitle",
            text: "Why does a wing make lift?",
          },
          {
            type: "paragraph",
            text: "A wing is tilted slightly upward relative to the oncoming air. The air that meets it is forced to turn downward as it leaves the trailing edge. Pushing air down means giving it downward momentum, and the reaction on the wing is an equal upward force. The curved, rounded top surface helps the air stay attached to the wing while it turns, and that is where the low pressure comes from: the air above is accelerated and its pressure falls, while the pressure below rises.",
          },
          {
            type: "callout",
            calloutType: "warning",
            title: 'The "equal transit time" myth',
            text: "A popular explanation claims that air over the top must travel farther to meet the air below at the back edge. It does not: the air over the top arrives **earlier**, and flat wings and upside-down flight still make lift. Nothing forces the two streams to meet up again.",
          },
          {
            type: "sectionTitle",
            text: "How much lift does a wing make?",
          },
          {
            type: "formula",
            latex: "L = \\tfrac{1}{2}\\,\\rho\\, v^{2}\\, S\\, C_L",
          },
          {
            type: "paragraph",
            text: "Here $\\rho$ is the air density ($1.225$ kg/m³ at sea level), $v$ the speed through the air, $S$ the wing area and $C_L$ the lift coefficient, which grows with angle of attack. To hold up a $1000$ kg plane with $S = 16\\ \\text{m}^2$ and $C_L = 1.2$, set $L = mg$ and solve: $v = \\sqrt{2mg/(\\rho S C_L)} \\approx 29$ m/s, or about $104$ km/h.",
          },
          {
            type: "paragraph",
            text: "This also answers why planes need a long runway: below that speed the wings cannot make enough lift, and the plane keeps rolling until $v$ is high enough. On a hot day or at a high-altitude airport the air is less dense, $\\rho$ is smaller, and the required speed goes up.",
          },
          {
            type: "sectionTitle",
            text: "What is a stall?",
          },
          {
            type: "paragraph",
            text: "Raising the angle of attack increases lift, but only up to a limit, typically around $15°$. Beyond it the smooth airflow separates from the top of the wing, turbulence takes over and lift drops suddenly while drag rises. A stall is about **angle**, not about engine power: a plane can stall at any speed if the wing is tilted too much.",
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "Can an airplane fly upside down?",
                a: "Yes. Lift depends on the angle of attack, not on which side of the wing is up. An inverted plane pitches its nose so the wing is still tilted into the wind and keeps producing lift, though less efficiently for a wing designed for upright flight.",
              },
              {
                q: "Why do airplanes need to go fast to take off?",
                a: "Because lift grows with $v^2$. Only above a certain speed do the wings make enough lift to equal the plane's weight, so the plane accelerates along the runway until it gets there.",
              },
              {
                q: "Is Bernoulli's principle wrong?",
                a: "No. Pressure differences around the wing are real and Bernoulli's principle relates them to speed changes. What is wrong is the equal-transit-time argument often attached to it. Pressure and momentum are two views of the same force.",
              },
              {
                q: "Why is it harder to take off on a hot day?",
                a: "Warm air is less dense, so for the same speed the wing gets less lift because $\\rho$ in $L = \\tfrac12 \\rho v^2 S C_L$ is smaller. The plane needs more speed, and therefore more runway.",
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
              "See what air resistance does to a moving object in the [Projectile & Parabolic Motion simulation](/simulations/ParabolicMotion) by turning on drag and wind.",
              "How drag limits speed: [Free fall and air resistance](/blog/ball-free-fall-comprehensive-guide).",
              "Balancing forces on a slope: [Inclined plane forces](/blog/inclined-plane-forces).",
              "Why do astronauts float? Another force-balance puzzle: [Why do astronauts float in space?](/blog/why-do-astronauts-float-in-space)",
            ],
          },
        ],
      },
    ],
  },
};
