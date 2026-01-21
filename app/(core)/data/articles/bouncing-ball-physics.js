import TAGS from "../tags";

export const bouncingBallBlog = {
  slug: "physics-bouncing-ball-comprehensive-educational-guide",
  name: "The Physics of a Bouncing Ball: A Progressive Learning Path",
  desc: "A deep dive into the mechanics of bouncing objects, structured from basic kinematic observations to advanced energy dissipation and impulse theories.",
  tags: [TAGS.PHYSICS, TAGS.EASY, TAGS.COLLISION, TAGS.ANIMATIONS],
  theory: {
    title: "The Bouncing Ball: From Simple Motion to Complex Dynamics",
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Phase 1: Observation and Basic Kinematics (Introductory Level)",
          },
          {
            type: "paragraph",
            text: "To a beginner, a bouncing ball is a study of **trajectories**. When an object moves through the air, we describe its state using two primary vectors: **Position** and **Velocity**. In a digital simulation, we treat these as $x$ and $y$ coordinates.",
          },
          {
            type: "subtitle",
            text: "Linear Motion and the 'Bounce' Event",
            level: 1,
          },
          {
            type: "paragraph",
            text: "In the simplest model (Uniform Linear Motion), we assume the ball moves at a constant speed until it hits a boundary. The 'Physics' here is purely geometric: when the ball's position exceeds the floor's limit, we reverse its direction.",
          },
          {
            type: "image",
            src: "https://www.fisicalab.com/sites/all/files/contenidos/en/kinematic/freefall.png",
            alt: "Overview of physics situation about a ball in free fall.",
            caption: "Overview of physics situation about a ball in free fall.",
            href: "https://www.fisicalab.com/en/section/free-fall",
            size: "small",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "**Horizontal Independence:** The ball continues its sideways journey unaffected by the floor.",
              "**Vertical Reversal:** The velocity $v_y$ changes from positive (downward) to negative (upward).",
              "**Position Correction:** We must 'teleport' the ball back to the edge of the floor to prevent it from getting stuck inside the geometry.",
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
            text: "Real balls don't move at constant speeds; they speed up as they fall. This introduces **Newton's Second Law** ($F = ma$). On Earth, the primary force is Gravity ($F_g = mg$), which creates a constant acceleration downward.",
          },
          {
            type: "subtitle",
            text: "The Quadratic Nature of Falling",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Because the ball is accelerating, its position doesn't change linearly—it changes quadratically. This is why the path of a bouncing ball is a series of **parabolas**.",
          },
          {
            type: "formula",
            latex: "y(t) = y_0 + v_{0y}t + \\frac{1}{2}gt^2",
            inline: false,
          },
          {
            type: "image",
            src: "https://i.sstatic.net/a8OcF.png",
            alt: "A graph illustrating how height and velocity change during bouncing.",
            caption:
              "A graph illustrating how height and velocity change during bouncing.",
            href: "https://physics.stackexchange.com/questions/517367/what-is-going-on-at-point-a-of-this-velocity-time-graph-of-a-bouncing-ball",
          },
          {
            type: "callout",
            calloutType: "info",
            title: "The Role of Gravity",
            text: "Gravity on Earth is approximately $9.81 m/s^2$. In a computer simulation, we usually scale this down (e.g., $0.1$ to $0.5$ pixels per frame squared) to make the motion look natural on screen.",
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
            text: "Why does a ball eventually stop? This phase explains the **Thermodynamics** of a bounce. Every time a ball hits the ground, it deforms. This deformation creates internal friction, converting some of the ball's Kinetic Energy into **Heat** and **Sound**.",
          },
          {
            type: "subtitle",
            text: "The Coefficient of Restitution ($e$)",
            level: 1,
          },
          {
            type: "paragraph",
            text: "We measure the 'efficiency' of a bounce using a ratio called the Coefficient of Restitution. It is the ratio of the velocity after impact to the velocity before impact.",
          },
          {
            type: "formula",
            latex: "e = -\\frac{v_{after}}{v_{before}}",
            inline: false,
          },
          {
            type: "table",
            columns: ["Material", "Approx. e Value", "Behavior"],
            data: [
              {
                Material: "Superball",
                "Approx. e Value": "0.90",
                Behavior: "Retains most energy, bounces high.",
              },
              {
                Material: "Tennis Ball",
                "Approx. e Value": "0.75",
                Behavior: "Standard bounce, loses height steadily.",
              },
              {
                Material: "Lead Ball",
                "Approx. e Value": "0.10",
                Behavior: "Thuds and stays nearly flat.",
              },
            ],
          },
          {
            type: "toggle",
            title: "Advanced Calculation: Energy Loss",
            content:
              "The kinetic energy lost during the bounce is calculated as $\Delta KE = \frac{1}{2}m(v_{before}^2 - v_{after}^2)$. This energy is not 'gone' but transformed into molecular vibration (heat) within the ball and the floor.",
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
            text: "To build a high-quality simulation, we integrate all the levels discussed. We use an **Euler Integration** method to update the physics state in every frame of the animation loop.",
          },
          {
            type: "code",
            language: "javascript",
            code: `// Simulation Parameters
const GRAVITY = 0.45;
const RESTITUTION = 0.8; // Energy retention
const FRICTION = 0.99;    // Air resistance

class Ball {
  constructor(x, y, vx, vy, radius) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.radius = radius;
  }

  update(canvasHeight) {
    // 1. Apply Forces (Phase 2)
    this.vy += GRAVITY;
    this.vx *= FRICTION; // Optional air resistance

    // 2. Update Position
    this.x += this.vx;
    this.y += this.vy;

    // 3. Collision Handling (Phase 1 & 3)
    if (this.y + this.radius > canvasHeight) {
      // Reposition to avoid 'tunneling'
      this.y = canvasHeight - this.radius;
      
      // Apply Restitution: Reverse and reduce velocity
      this.vy *= -RESTITUTION;

      // Friction check: if velocity is tiny, stop it
      if (Math.abs(this.vy) < 1) this.vy = 0;
    }
  }
}`,
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "The Tunneling Problem",
            text: "If a ball moves very fast, it might skip past the floor between frames. Always ensure you reset `ball.y` to the floor level precisely when a collision is detected to maintain accuracy.",
          },
          {
            type: "callout",
            calloutType: "success",
            title: "Curriculum Complete",
            text: "You have traveled from basic geometry to energy conservation laws. You can now apply these principles to more complex simulations like particle systems or sports games!",
          },
        ],
      },
    ],
  },
};
