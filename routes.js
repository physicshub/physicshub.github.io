// routes.js
export const routes = [
  { path: '/', component: 'Home', changefreq: 'weekly', priority: 1.0 },
  { path: '/contribute', component: 'Contribute', changefreq: 'monthly', priority: 0.8 },
  { path: '/simulations', component: 'Simulations', changefreq: 'weekly', priority: 0.9 },
  { path: '/about', component: 'About', changefreq: 'monthly', priority: 0.7 },
  { path: '/simulations/BouncingBall', component: 'BouncingBall', changefreq: 'weekly', priority: 0.7 },
  { path: '/simulations/VectorsOperations', component: 'VectorsOperations', changefreq: 'weekly', priority: 0.7 },
  { path: '/simulations/BallAcceleration', component: 'BallAcceleration', changefreq: 'weekly', priority: 0.7 },
  { path: '/simulations/BallGravity', component: 'BallGravity', changefreq: 'weekly', priority: 0.7 },
  { path: '/simulations/SpringConnection', component: 'SpringConnection', changefreq: 'weekly', priority: 0.7 },
  { path: '/simulations/SimplePendulum', component: 'SimplePendulum', changefreq: 'weekly', priority: 0.7 },
];
