// src/routes.js
export const routes = [
  { path: '/', component: 'Home', changefreq: 'weekly', priority: 1.0 },
  { path: '/contribute', component: 'Contribute', changefreq: 'monthly', priority: 0.8 },
  { path: '/simulations', component: 'Simulations', changefreq: 'weekly', priority: 0.9 },
  { path: '/about', component: 'About', changefreq: 'monthly', priority: 0.7 },
  { path: '/BouncingBall', component: 'BouncingBall', changefreq: 'weekly', priority: 0.7 },
  { path: '/VectorsOperations', component: 'VectorsOperations', changefreq: 'weekly', priority: 0.7 },
  { path: '/BallAcceleration', component: 'BallAcceleration', changefreq: 'weekly', priority: 0.7 },
  { path: '/BallGravity', component: 'BallGravity', changefreq: 'weekly', priority: 0.7 },
  { path: '/SpringConnection', component: 'SpringConnection', changefreq: 'weekly', priority: 0.7 },
  { path: '/SimplePendulum', component: 'SimplePendulum', changefreq: 'weekly', priority: 0.7 },
];
