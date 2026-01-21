import TAGS from "../tags.js";

export const ballAcceleratingBlog = {
  id: "bb-003",
  slug: "ball-uniformly-accelerated-motion",
  name: "Ball in uniformly accelerated motion",
  desc: "Understand how a ball can move in mouse direction in uniformly accelerated motion.",
  tags: [TAGS.MEDIUM, TAGS.PHYSICS, TAGS.ACCELERATION],
  theory: {
    sections: [
      {
        title: "Introduction",
        blocks: [
          {
            type: "paragraph",
            text: "This simulation demonstrates the physics behind the Ball Acceleration towards the target - in this scenario, the mouse pointer.",
          },
        ],
      },
      {
        title: "Concept of Acceleration",
        blocks: [
          {
            type: "paragraph",
            text: "Acceleration is the rate of change of velocity of an object. Unlike the bouncing ball, which moves at a constant speed or velocity, this ball gradually increases its speed towards the mouse position. The closer it gets, the smaller the acceleration becomes.",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Velocity determines how fast the ball is moving per frame.",
              "Acceleration changes the velocity over time, allowing smooth movement towards the target.",
              "DIrection is determined by the vector from the ball to the mouse position.",
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
              "The ball calculates the direction vector between its current position and the mouse position.",
              "This direction is normalized (made unit length).",
              "Acceleration is applied along that direction to update velocity",
            ],
          },
          {
            type: "formula",
            latex:
              "\\vec{v} = \\vec{a} \\quad\\text{where}\\quad \\vec{a} = (\\text{mouse} - \\times a_{rate})",
          },
          {
            type: "note",
            text: "The ball stops accelerating when it reaches the defined maximum speed (Max speed)",
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
let vx = 0, vy = 0;
let ax = 0, ay = 0;
const a_rate = 0.1; // Acceleration rate
const maxSpeed = 5; // Maximum speed

function draw(mouseX, mouseY){
   // Calculate direction to mouse
   let dirX = mouseX - x;
   let dirY = mouseY - y;
   let length = Math.sqrt(dirX * dirX + dirY * dirY);

   // Normalize direction and apply acceleration
   ax = (dirX / length) * a_rate;
   ay = (dirY / length) * a_rate;
  vx += ax;
  vy += ay;

   // Limit speed to maxSpeed (limiting velocity to max speed)
   let speed = Math.sqrt(vx * vx + vy * vy);
   if(speed > maxSpeed) {
      vx = (vx / speed) * maxSpeed;
      vy = (vy / speed) * maxSpeed;
   }

   // Update position
   x += vx;
   y += vy;
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
                Parameter: "Ball Size",
                Description: "Determines the visual size of moving ball.",
                "Example Value": "48",
              },
              {
                Parameter: "Max Speed",
                Description: "Sets the highest velocity the ball can reach.",
                "Example Value": "5",
              },
              {
                Parameter: "Acceleration Rate",
                Description:
                  "Controls how quickly the ball accelerates towards the mouse.",
                "Example Value": "0.1",
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
            title: "Fun Fact",
            text: "This concept of acceleration towards a target is widely used in game development for character movement and AI behavior like homing missiles or character following certain behavior in games.",
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "Attention!",
            text: "If acceleration rate is too high, the ball may overshoot the target and oscillate around it instead of smoothly approaching.",
          },
          {
            type: "callout",
            calloutType: "tip",
            title: "Try This!",
            text: "Experiment with different acceleration rates and max speeds to see how they affect the ball's movement dynamics.",
          },
          {
            type: "callout",
            calloutType: "success",
            title: "You Did It!",
            text: "You now understand how acceleration and direction combine to create realistic motion physics.",
          },
        ],
      },
    ],
  },
};
