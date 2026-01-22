import TAGS from "../tags.js";

export const bouncingBallBlog = {
  slug: "physics-bouncing-ball-comprehensive-educational-guide",
  name: "The Physics of a Bouncing Ball: A Progressive Learning Path",
  desc: "A comprehensive exploration of classical mechanics through the lens of a bouncing ball, transitioning from basic kinematic observations to advanced thermodynamics and algorithmic simulation.",
  tags: [TAGS.PHYSICS, TAGS.EASY, TAGS.COLLISION, TAGS.ANIMATIONS],
  date: "22/01/2026",
  theory: {
    title: "The Mechanics of Impact: From Simple Motion to Complex Dynamics",
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Phase 1: Observation and Basic Kinematics (Introductory Level)",
          },
          {
            type: "paragraph",
            text: "To a beginner, a bouncing ball serves as a perfect introduction to **Kinematics**—the branch of mechanics concerned with the motion of objects without reference to the forces which cause the motion. In this stage, we focus on tracking state changes over time using two primary vectors: **Position** ($\vec{s}$) and **Velocity** ($\vec{v}$).",
          },
          {
            type: "subtitle",
            text: "The Geometry of the 'Bounce'",
            level: 1,
          },
          {
            type: "paragraph",
            text: "In an idealized world of Uniform Linear Motion (ULM), we assume the ball moves at a constant speed. The 'Physics' here is purely geometric and conditional. We define a boundary (the floor) and monitor the ball's coordinates. When a coordinate exceeds that boundary, we trigger a 'Reflection Event.'",
          },
          {
            type: "image",
            src: "https://www.fisicalab.com/sites/all/files/contenidos/en/kinematic/freefall.png",
            alt: "Overview of physics situation about a ball in free fall.",
            caption:
              "Visualizing the vertical displacement and velocity vectors during descent.",
            href: "https://www.fisicalab.com/en/section/free-fall",
            size: "small",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "**Independence of Axes:** We treat $x$ (horizontal) and $y$ (vertical) motion separately. Unless an external force acts horizontally, the ball continues its sideways journey at a constant rate.",
              "**Velocity Inversion:** The moment of impact is modeled by multiplying the vertical velocity by $-1$. This represents a perfect, instantaneous change in direction.",
              "**The Overlap Problem:** In digital frames, a ball might move 'into' the floor between two frames. We must perform a **Positional Correction** (or 'teleportation') to reset the ball exactly at the boundary surface to prevent visual glitching or 'sticking'.",
            ],
          },
        ],
      },
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Phase 2: Dynamics and Constant Acceleration (Intermediate Level)",
          },
          {
            type: "paragraph",
            text: "Moving beyond simple motion, we introduce **Dynamics**. Real objects are governed by **Newton's Second Law** ($F = ma$), where forces cause changes in velocity. On Earth, the dominant force is Gravity ($F_g = mg$), which exerts a constant downward pull.",
          },
          {
            type: "subtitle",
            text: "The Quadratic Path: Understanding Parabolas",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Because gravity provides a constant acceleration ($g \\approx 9.81 m/s^2$), the velocity is no longer constant—it increases linearly over time. Consequently, the position changes quadratically. This is the origin of the **parabolic arc** seen in every sports game or animation.",
          },
          {
            type: "formula",
            latex: "y(t) = y_0 + v_{0y}t + \\frac{1}{2}gt^2",
            inline: false,
          },
          {
            type: "paragraph",
            text: "This equation allows us to predict exactly where the ball will be at any given second. In a simulation, however, we usually calculate this incrementally, frame by frame, adding a small 'slice' of gravity to the velocity in every update.",
          },
          {
            type: "image",
            src: "https://i.sstatic.net/a8OcF.png",
            alt: "A graph illustrating how height and velocity change during bouncing.",
            caption:
              "Velocity-Time graph showing the linear increase in speed and the sharp vertical jumps at the moment of impact.",
            href: "https://physics.stackexchange.com/questions/517367/what-is-going-on-at-point-a-of-this-velocity-time-graph-of-a-bouncing-ball",
          },
          {
            type: "callout",
            calloutType: "info",
            title: "Simulating Earth's Gravity",
            text: "While $9.81 m/s^2$ is the physical standard, computer screens use pixels. If your simulation runs at 60 FPS, a gravity of $0.5$ pixels/frame² often yields the most visually pleasing 'Earth-like' weight for a standard-sized ball.",
          },
        ],
      },
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Phase 3: Work, Energy, and Restitution (Advanced Level)",
          },
          {
            type: "paragraph",
            text: "In the real world, a ball eventually stops bouncing. To explain this, we must look at **Thermodynamics** and **Energy Transformation**. A bounce is not just a reflection; it is a high-speed collision where the ball momentarily deforms like a spring.",
          },
          {
            type: "subtitle",
            text: "The Coefficient of Restitution ($e$)",
            level: 1,
          },
          {
            type: "paragraph",
            text: "No macroscopic collision is perfectly elastic. During the impact, some Kinetic Energy (KE) is converted into thermal energy (heat) and sound waves. We quantify this 'loss' through the **Coefficient of Restitution**, a scalar value between 0 and 1 that represents the ratio of the final to the initial relative velocity.",
          },
          {
            type: "formula",
            latex: "e = -\\frac{v_{after}}{v_{before}}",
            inline: false,
          },
          {
            type: "table",
            columns: ["Material", "Approx. e Value", "Physical Behavior"],
            data: [
              {
                Material: "Superball",
                "Approx. e Value": "0.85 - 0.92",
                "Physical Behavior":
                  "High elasticity; minimal energy lost to heat.",
              },
              {
                Material: "Tennis Ball",
                "Approx. e Value": "0.70 - 0.75",
                "Physical Behavior":
                  "Standard bounce; significant compression loss.",
              },
              {
                Material: "Wooden Ball",
                "Approx. e Value": "0.40 - 0.50",
                "Physical Behavior": "Rigid; energy lost to vibration/sound.",
              },
              {
                Material: "Lump of Clay",
                "Approx. e Value": "0.00 - 0.05",
                "Physical Behavior":
                  "Inelastic; nearly all energy goes into deformation.",
              },
            ],
          },
          {
            type: "toggle",
            title: "Advanced Calculation: Kinetic Energy Loss",
            content:
              "The total energy loss can be found by comparing $KE = \\frac{1}{2}mv^2$ before and after. The missing energy is not 'deleted' but redistributed into the molecular structure of the ball, increasing its temperature slightly with every bounce.",
          },
        ],
      },
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Phase 4: Algorithmic Implementation (The Developer's View)",
          },
          {
            type: "paragraph",
            text: "To bridge the gap between theory and code, we use **Numerical Integration**. Specifically, the 'Semi-Implicit Euler' method is the industry standard for simple game physics because it is stable and efficient.",
          },
          {
            type: "code",
            language: "javascript",
            code: `// Simulation Global Constants
const GRAVITY = 0.5;      // Downward acceleration (px/frame^2)
const RESTITUTION = 0.75; // Energy retention (e)
const AIR_DRAG = 0.995;   // Velocity decay over time

class Ball {
  constructor(x, y, vx, vy, radius) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.radius = radius;
  }

  update(canvasWidth, canvasHeight) {
    // 1. DYNAMICS: Update Velocity based on forces
    this.vy += GRAVITY;       // Gravity acts on vertical axis
    this.vx *= AIR_DRAG;      // Air resistance acts on both axes
    this.vy *= AIR_DRAG;

    // 2. KINEMATICS: Update Position based on velocity
    this.x += this.vx;
    this.y += this.vy;

    // 3. COLLISION RESPONSE: Floor Handling
    if (this.y + this.radius > canvasHeight) {
      // Step A: Positional Correction (Anti-Tunneling)
      this.y = canvasHeight - this.radius;
      
      // Step B: Impulse Response (Restitution)
      this.vy *= -RESTITUTION;

      // Step C: Energy Threshold (Stability)
      // Stop the 'micro-bouncing' when velocity is too low
      if (Math.abs(this.vy) < 1.5) this.vy = 0;
    }

    // 4. BOUNDARY HANDLING: Walls
    if (this.x + this.radius > canvasWidth || this.x - this.radius < 0) {
      this.vx *= -RESTITUTION;
      this.x = this.x < this.radius ? this.radius : canvasWidth - this.radius;
    }
  }
}`,
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "The Tunneling Phenomenon",
            text: "When an object moves faster than its own diameter per frame, it might 'pass through' the floor entirely without the condition `y > floor` ever being met. For high-speed simulations, look into 'Continuous Collision Detection' (CCD).",
          },
          {
            type: "callout",
            calloutType: "success",
            title: "Summary of Learning",
            text: "You have successfully traced the journey of a bouncing ball from a simple geometric reflection to a sophisticated energy-aware simulation. These principles form the bedrock of physics engines like Matter.js or Box2D!",
          },
        ],
      },
    ],
  },
};
