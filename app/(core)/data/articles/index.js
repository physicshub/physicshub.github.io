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

export const allBlogs = {
  [whatIsPhysicsBlog.slug]: whatIsPhysicsBlog,
  [class12PhysicsBlog.slug]: class12PhysicsBlog,
  [bouncingBallBlog.slug]: bouncingBallBlog,
  [operationVectorsBlog.slug]: operationVectorsBlog,
  [ballAcceleratingBlog.slug]: ballAcceleratingBlog,
  [ballFreeFallBlog.slug]: ballFreeFallBlog,
  [springConnectionBlog.slug]: springConnectionBlog,
  [pendulumBlog.slug]: pendulumBlog,
  [projectileParabolicBlog.slug]: projectileParabolicBlog,
};

export const blogsArray = Object.values(allBlogs);
