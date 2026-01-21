import TAGS from "../tags";

export const bouncingBallBlog = {
  id: "bb-001",
  slug: "bouncing-ball-physics",
  name: "How Bouncing Ball Works",
  desc: "Detailed analysis about gravity and bounces.",
  tags: [TAGS.EASY, TAGS.PHYSICS, TAGS.COLLISION, TAGS.ANIMATIONS],
  theory: {
    sections: [
      {
        title: "Introduction",
        blocks: [
          {
            type: "paragraph",
            text: "This section demonstrates the physics behind the Bouncing Ball simulation.",
          },
        ],
      },
      {
        title: "Concept of Motion",
        blocks: [
          {
            type: "paragraph",
            text: "This ball moves in a [2-D] two-dimensional space with horizontal and vertical velocity components. The direction of motion is determined by the sign of these components.",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Velocity in the X-axis (vx): Determines horizontal movement. Positive values move right, negative values move left.",
              "Velocity in the Y-axis (vy): Determines vertical movement. Positive values move down, negative values move up.",
              "Combined Motion: The overall movement is a combination of both components, resulting in diagonal trajectories when both vx and vy are non-zero. In short, Each frame updates the ball's position using both the velocities.",
            ],
          },
        ],
      },
      {
        title: "Understanding Collisions",
        blocks: [
          {
            type: "list",
            ordered: false,
            items: [
              "When the ball reaches the left or right boundary, the X velocity reverses.",
              "When the ball reaches the top or bottom boundary, the Y velocity reverses.",
              "This reversal simulates a bounce effect [Elastic collision], changing the ball's direction while maintaining its speed.",
            ],
          },
          {
            type: "formula",
            latex: "v_{after} = -v_{before}",
          },
          {
            type: "note",
            text: "In a perfectly elastic collision, no energy is lost, and the ball retains its speed after bouncing.",
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
let vx = 2.5, vy = 2;

function draw(){
  x += vx;
  y += vy;

// Check for collision with walls
  if(x <= 0 || x >= canvasWidth) {
    vx = -vx; // Reverse X velocity
  }
   if(y <= 0 || y >= canvasHeight) {
      vy = -vy; // Reverse Y velocity
   }
}`,
          },
        ],
      },
      {
        title: "Parameters Overview",
        blocks: [
          {
            type: "table",
            columns: ["Parameter", "Description", "Example Value"],
            data: [
              {
                Parameter: "Velocity X",
                Description:
                  "Controls the ball's speed in the horizontal direction.",
                "Example Value": "2.5",
              },
              {
                Parameter: "Velocity Y",
                Description:
                  "Controls the ball's speed in the vertical direction.",
                "Example Value": "2.0",
              },
              {
                Parameter: "Ball Size",
                Description: "Defines the radius or diameter of the ball.",
                "Example Value": "48",
              },
            ],
          },
        ],
      },
      {
        title: "Tips and Tricks",
        blocks: [
          {
            type: "callout",
            calloutType: "info",
            title: "Did you know",
            text: "This simulation is a basic form of motion physics used in most 2D games and animation engines.",
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "Common Mistake",
            text: "Forgetting to reverse the velocity component upon collision will result in the ball getting stuck at the wall.",
          },
          {
            type: "callout",
            calloutType: "tip",
            title: "Try It Yourself!",
            text: "Experiment by changing velocity values or ball size to see how motion patterns change.",
          },
          {
            type: "callout",
            calloutType: "success",
            title: "Success!",
            text: "You've learned the basics of 2D motion and collision handling!",
          },
        ],
      },
    ],
  },
};
