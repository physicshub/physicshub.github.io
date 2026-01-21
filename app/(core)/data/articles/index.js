// (core)/data/articles/index.js
import { bouncingBallBlog } from "./bouncing-ball-physics.js";
import { operationVectorsBlog } from "./operations-with-vectors.js";
import { ballAcceleratingBlog } from "./ball-uniformly-accelerated-motion.js";
import { ballFreeFallBlog } from "./ball-free-fall.js";
import { springConnectionBlog } from "./spring-connection.js";
import { pendulumBlog } from "./pendulum-motion.js";
import { projectileParabolicBlog } from "./projectile-parabolic-motion.js";

export const allBlogs = {
  [bouncingBallBlog.slug]: bouncingBallBlog,
  [operationVectorsBlog.slug]: operationVectorsBlog,
  [ballAcceleratingBlog.slug]: ballAcceleratingBlog,
  [ballFreeFallBlog.slug]: ballFreeFallBlog,
  [springConnectionBlog.slug]: springConnectionBlog,
  [pendulumBlog.slug]: pendulumBlog,
  [projectileParabolicBlog.slug]: projectileParabolicBlog,
};

export const blogsArray = Object.values(allBlogs);
