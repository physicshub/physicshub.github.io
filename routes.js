// routes.js
export const routes = [
  { path: "/", component: "Home", changefreq: "weekly", priority: 1.0 },
  {
    path: "/contribute",
    component: "Contribute",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/simulations",
    component: "Simulations",
    changefreq: "weekly",
    priority: 0.9,
  },
  { path: "/about", component: "About", changefreq: "monthly", priority: 0.7 },
  { path: "/blog", component: "Blog", changefreq: "weekly", priority: 0.9 },
  {
    path: "/blog/create",
    component: "Blog",
    changefreq: "monthly",
    priority: 0.7,
  },
];
