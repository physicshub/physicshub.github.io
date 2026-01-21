import TAGS from "../tags";

export const ballFreeFallBlog = {
  id: "bb-004",
  slug: "ball-free-fall",
  name: "How free fall works?",
  desc: "Discover how to calculate a free fall ball motion.",
  tags: [TAGS.MEDIUM, TAGS.COLLISION, TAGS.PHYSICS, TAGS.GRAVITY],
  theory: {
    sections: [
      {
        title: "Introduction",
        blocks: [
          {
            type: "paragraph",
            text: "This simulation shows how the gravity acts on a ball, making it fall and bounce when it hits the ground. It's a classic demonstration of the motion under uniform acceleration and energy transformation.",
          },
        ],
      },
      {
        title: "Concept of Gravity and Free Fall",
        blocks: [
          {
            type: "paragraph",
            text: "Gravity is a natural force that pulls the objects towards the center of the Earth. In this simulation, the ball experiences a constant downward acceleration due to the gravity, causing it to speed up as it falls. The rate of acceleration depends on the gravity type selected (e.g., Earth, Moon, Jupiter or Mars).",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Objects in free fall accelerate at approximately 9.81 m/s² on Earth.",
              "When the ball hits the ground, it bounces due to the elastic collision principles.",
              "Each bounces loses some energy, resulting in lower heights with each subsequent bounce.",
            ],
          },
        ],
      },
      {
        title: "Physics Behind It",
        blocks: [
          {
            type: "list",
            ordered: false,
            items: [
              "The gravitational acceleration (g) acts continuously on the ball: thus, increasing its downward velocity over time.",
              "When the ball hits the surface, its velocity reverses the direction and reduces in magnitude due to the energy loss during the bounce.",
              "Wind and friction parameters can slightly affect horizontal motion, simulating air resistance.",
            ],
          },
          {
            type: "formula",
            latex:
              "h = \\frac{1}{2} g t^2, \\quad v = u + g t, \\quad E_k = \\frac{1}{2} m v^2",
          },
          {
            type: "note",
            text: "The ball's total energy is a sum of kinetic and potential energy, which transforms during the fall and bounce.",
          },
        ],
      },
      {
        title: "Code Example",
        blocks: [
          {
            type: "code",
            language: "javascript",
            code: `let x = 100, y = 100;

let vy = 0;
const gravity = 0.98; // Gravitational acceleration
const bounceFactor = 0.7; // Energy loss on bounce
let ground = 400; // Ground level

function draw(){
   vy += gravity; // Apply gravity to vertical velocity
   y += vy; // Update position

   // Check for collision with ground
   if(y >= ground) {
      y = ground; // Reset position to ground level
      vy = -vy * bounceFactor; // Reverse and reduce velocity for bounce
   }
      //Draw the ball at (x, y)
      circle(200, y, 40);
}`,
          },
        ],
      },
      {
        title: "Simulation Parameters",
        blocks: [
          {
            type: "table",
            columns: ["Parameter", "Description", "Example Value"],
            data: [
              {
                Parameter: "Ball Size (px)",
                Description: "Determines the diameter of the ball in pixels.",
                "Example Value": "40",
              },
              {
                Parameter: "Mass (kg)",
                Description:
                  "Defines the weight of the ball, affecting its momentum and kinetic energy.",
                "Example Value": "5",
              },
              {
                Parameter: "Friction Coefficient (μ)",
                Description:
                  "Reduces the motion after bouncing to simulate air resistance.",
                "Example Value": "0",
              },
              {
                Parameter: "Wind (m/s²)",
                Description:
                  "Applies a horizontal acceleration simulating air movement.",
                "Example Value": "1",
              },
              {
                Parameter: "Gravity Type",
                Description:
                  "Selects the gravity strength based on different celestial bodies like Earth, Moon, Jupiter, or Mars.",
                "Example Value": "Earth (9.81 m/s²)",
              },
            ],
          },
        ],
      },
      {
        title: "Tips & Tricks",
        blocks: [
          {
            type: "callout",
            calloutType: "info",
            title: "Did you know",
            text: "Gravity is the sane force that keeps planets orbiting the sum and also, this simulation mimics the universal attraction on a smaller scale.",
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "Attention!",
            text: "If the bounce factor is set too high (>1), the ball may gain energy unrealistically and fly off-screen.",
          },
          {
            type: "callout",
            calloutType: "tip",
            title: "Try It Yourself!",
            text: "Experiment by changing the gravity type and bounce factor to see how they affect the ball's motion.",
          },
          {
            type: "callout",
            calloutType: "success",
            title: "Concept Mastered!",
            text: "You've learned the gravitational acceleration, collisions, and energy conservation work together in real-world physics",
          },
        ],
      },
    ],
  },
};
