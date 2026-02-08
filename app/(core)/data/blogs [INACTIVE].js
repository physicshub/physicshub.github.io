// ⚠️ DEPRECATED FILE
// This file is no longer used.
// Blog handling has moved to `articles/` and `articles/index.js`.
// Kept only for reference/testing purposes.

import TAGS from "./tags.js";

const INACTIVE_BLOGS = [
  {
    id: "inactive-001",
    name: "Sample Physics Blog (Inactive)",
    desc: "Deprecated example blog used for testing UI components.",
    slug: "inactive-sample-blog",
    tags: [TAGS.EASY, TAGS.PHYSICS, TAGS.COLLISION, TAGS.ANIMATIONS],
    theory: {
      sections: [
        {
          title: "Introduction",
          blocks: [
            {
              type: "paragraph",
              text: "This is a deprecated blog example retained only for reference.",
            },
          ],
        },
      ],
    },
  },

  {
    id: "inactive-002",
    name: "Empty Blog Shell",
    desc: "Placeholder blog with no theory content.",
    slug: "inactive-empty-blog",
    tags: [TAGS.MEDIUM, TAGS.DYNAMICS],
    theory: {},
  },
];

export default INACTIVE_BLOGS;
