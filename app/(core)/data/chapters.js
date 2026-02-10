import TAGS from "./tags.js";

const chapters = [
  {
    id: 1,
    name: "Bouncing Ball",
    desc: "Simulation of the ball bouncing off the walls.",
    link: "/simulations/BouncingBall",
    tags: [TAGS.EASY, TAGS.KINEMATICS, TAGS.COLLISION],
    icon: "/icons/bouncingBall.png",
    relatedBlogSlug: "physics-bouncing-ball-comprehensive-educational-guide",
    funFacts: [
      "No real ball bounces forever because energy is lost as heat and sound.",
      "Perfectly elastic collisions exist only in theory."
    ],
  },

  {
    id: 2,
    name: "Vector Operations Calculator",
    desc: "Interactive 2D vector operations tool.",
    link: "/simulations/VectorsOperations",
    tags: [TAGS.EASY, TAGS.MATH, TAGS.VECTORS, TAGS.TRIGONOMETRY],
    icon: "/icons/vector.png",
    relatedBlogSlug: "operations-with-vectors",
    funFacts: [
      "Vector addition is commutative.",
      "Dot product helps determine the angle between two vectors."
    ],
  },

  {
    id: 3,
    name: "Ball Acceleration",
    desc: "Ball accelerating to the mouse direction.",
    link: "/simulations/BallAcceleration",
    tags: [TAGS.MEDIUM, TAGS.KINEMATICS, TAGS.ACCELERATION, TAGS.INTERACTIVE],
    icon: "/icons/acceleration.png",
    relatedBlogSlug: "ball-uniformly-accelerated-motion",
    funFacts: [
      "Acceleration happens whenever velocity changes.",
    ],
  },

  {
    id: 4,
    name: "Ball Gravity",
    desc: "Ball fall and bounce on the ground.",
    link: "/simulations/BallGravity",
    tags: [TAGS.MEDIUM, TAGS.DYNAMICS, TAGS.GRAVITY, TAGS.COLLISION],
    icon: "/icons/gravity.png",
    relatedBlogSlug: "ball-free-fall-comprehensive-guide",
    funFacts: [
      "All objects fall at the same rate in a vacuum, regardless of mass.",
    ],
  },

  {
    id: 5,
    name: "Spring Mass System Simulator",
    desc: "Explore Hooke's Law and Simple Harmonic Motion.",
    link: "/simulations/SpringConnection",
    tags: [TAGS.ADVANCED, TAGS.DYNAMICS, TAGS.SPRINGS, TAGS.OSCILLATIONS],
    icon: "/icons/spring.png",
    relatedBlogSlug: "spring-connection",
    funFacts: [
      "Hooke’s Law is valid only within the elastic limit of a spring.",
    ],
  },

  {
    id: 6,
    name: "Simple Pendulum Simulation",
    desc: "Calculate the period and frequency of a pendulum.",
    link: "/simulations/SimplePendulum",
    tags: [TAGS.MEDIUM, TAGS.DYNAMICS, TAGS.OSCILLATIONS, TAGS.ENERGY],
    icon: "/icons/pendulam.png",
    relatedBlogSlug: "pendulum-motion",
    funFacts: [
      "For small angles, a pendulum’s period does not depend on mass.",
    ],
  },

  {
    id: 7,
    name: "Projectile & Parabolic Motion",
    desc: "Simulate projectile motion under gravity.",
    link: "/simulations/ParabolicMotion",
    tags: [TAGS.MEDIUM, TAGS.KINEMATICS, TAGS.GRAVITY, TAGS.MATH],
    icon: "/icons/parabola.png",
    relatedBlogSlug: "projectile-parabolic-motion",
    funFacts: [
      "Maximum range occurs at a 45° launch angle without air resistance.",
    ],
  },

  {
    id: 8,
    name: "Inclined Plane",
    desc: "Block sliding on an inclined plane.",
    link: "/simulations/InclinedPlane",
    tags: [TAGS.MEDIUM, TAGS.DYNAMICS, TAGS.FORCES, TAGS.FRICTION],
    icon: "/icons/inclined.png",
    funFacts: [
      "Inclined planes reduce the force needed to lift heavy objects.",
    ],
  },
];

export default chapters;
