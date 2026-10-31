// Card image for an article: an explicit `thumbnail`, a curated illustration,
// or the first image block in its theory. Shared by the /blog index and the
// recommended-reading cards on simulation pages so both show the same picture.

const BLOG_THUMBNAILS = {
  "what-is-physics":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Milky_Way_Night_Sky_Black_Rock_Desert_Nevada.jpg",
  "class-12-physics-complete-guide":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Single_slit_and_double_slit2.jpg",
  "physics-bouncing-ball-comprehensive-educational-guide":
    "https://www.fisicalab.com/sites/all/files/contenidos/en/kinematic/freefall.png",
  "comprehensive-guide-to-vector-operations":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Vector_addition.svg",
  "ball-uniformly-accelerated-motion":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Acceleration.svg",
  "ball-free-fall-comprehensive-guide":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Free_fall.svg",
  "spring-connection":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Simple_harmonic_motion_animation.gif",
  "physics-of-pendulum-explained":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Pendulum_animation.gif",
  "projectile-parabolic-motion":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Projectile_motion.svg",
  "physics-behind-three-body-problem":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Three-body_Problem_Animation_with_COM.gif",
  "pi-from-block-collisions-explained":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Galperin_billiards.svg/600px-Galperin_billiards.svg.png",
};

export const getFirstBlogImage = (blog) => {
  if (blog.thumbnail) return blog.thumbnail;
  if (BLOG_THUMBNAILS[blog.slug]) return BLOG_THUMBNAILS[blog.slug];

  for (const section of blog.theory?.sections ?? []) {
    const imageBlock = section.blocks?.find(
      (block) => block.type === "image" && block.src
    );

    if (imageBlock?.src) return imageBlock.src;
  }

  return "";
};
