// (core)/data/articles/index.js
import { bouncingBallBlog } from "./physics-bouncing-ball-comprehensive-educational-guide.js";
import { operationVectorsBlog } from "./comprehensive-guide-to-vector-operations.js";
import { ballAcceleratingBlog } from "./ball-uniformly-accelerated-motion.js";
import { ballFreeFallBlog } from "./ball-free-fall-comprehensive-guide.js";
import { springConnectionBlog } from "./spring-connection.js";
import { pendulumBlog } from "./physics-of-pendulum-explained.js";
import { projectileParabolicBlog } from "./projectile-parabolic-motion.js";
import { class12PhysicsBlog } from "./class-12-physics.js";
import { whatIsPhysicsBlog } from "./what-is-physics.js";
import { threeBodyProblemBlog } from "./physics-behind-three-body-problem.js";
import { piCollisionBlog } from "./pi-from-block-collisions-explained.js";
import { codingBouncingBallBlog } from "./coding-a-bouncing-ball-simulation.js";
import { simulatingAirResistanceBlog } from "./simulating-air-resistance-in-code.js";
import { simulatingPendulumBlog } from "./simulating-a-pendulum-in-code.js";
import { inclinedPlaneBlog } from "./inclined-plane-forces.js";
import { circularMotionBlog } from "./circular-motion-centripetal-force.js";
import { collisionsBlog } from "./elastic-inelastic-collisions.js";
import { unitCircleBlog } from "./unit-circle-trigonometry.js";
import { doublePendulumBlog } from "./double-pendulum-chaos.js";
import { skyBlueBlog } from "./why-is-the-sky-blue.js";
import { airplanesFlyBlog } from "./how-do-airplanes-fly.js";
import { lightningThunderBlog } from "./why-do-we-see-lightning-before-thunder.js";
import { astronautsFloatBlog } from "./why-do-astronauts-float-in-space.js";
import { metalColderThanWoodBlog } from "./why-does-metal-feel-colder-than-wood.js";
import { rayTracingBlog } from "./how-does-ray-tracing-work.js";

export const allBlogs = {
  [whatIsPhysicsBlog.slug]: whatIsPhysicsBlog,
  [class12PhysicsBlog.slug]: class12PhysicsBlog,
  [skyBlueBlog.slug]: skyBlueBlog,
  [metalColderThanWoodBlog.slug]: metalColderThanWoodBlog,
  [bouncingBallBlog.slug]: bouncingBallBlog,
  [codingBouncingBallBlog.slug]: codingBouncingBallBlog,
  [collisionsBlog.slug]: collisionsBlog,
  [operationVectorsBlog.slug]: operationVectorsBlog,
  [unitCircleBlog.slug]: unitCircleBlog,
  [ballAcceleratingBlog.slug]: ballAcceleratingBlog,
  [lightningThunderBlog.slug]: lightningThunderBlog,
  [ballFreeFallBlog.slug]: ballFreeFallBlog,
  [simulatingAirResistanceBlog.slug]: simulatingAirResistanceBlog,
  [airplanesFlyBlog.slug]: airplanesFlyBlog,
  [inclinedPlaneBlog.slug]: inclinedPlaneBlog,
  [circularMotionBlog.slug]: circularMotionBlog,
  [astronautsFloatBlog.slug]: astronautsFloatBlog,
  [springConnectionBlog.slug]: springConnectionBlog,
  [pendulumBlog.slug]: pendulumBlog,
  [simulatingPendulumBlog.slug]: simulatingPendulumBlog,
  [doublePendulumBlog.slug]: doublePendulumBlog,
  [projectileParabolicBlog.slug]: projectileParabolicBlog,
  [threeBodyProblemBlog.slug]: threeBodyProblemBlog,
  [piCollisionBlog.slug]: piCollisionBlog,
  [rayTracingBlog.slug]: rayTracingBlog,
};

export const blogsArray = Object.values(allBlogs);
