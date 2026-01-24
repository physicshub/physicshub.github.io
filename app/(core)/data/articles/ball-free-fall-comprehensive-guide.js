import TAGS from "../tags.js";

export const ballFreeFallBlog = {
  id: "bb-004",
  slug: "ball-free-fall-comprehensive-guide",
  name: "Free Fall and External Forces: A Complete Physics Journey",
  desc: "A comprehensive exploration of gravitational motion, atmospheric forces, and planetary physics through the lens of a falling ball subject to wind and resistance.",
  tags: [TAGS.MEDIUM, TAGS.COLLISION, TAGS.PHYSICS, TAGS.GRAVITY],
  theory: {
    title: "Free Fall Dynamics: From Vacuum to Atmosphere",
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Phase 1: Understanding Free Fall - The Fundamentals",
          },
          {
            type: "paragraph",
            text: "Free fall is one of the most fundamental phenomena in physics, yet it's commonly misunderstood. When we say an object is in **free fall**, we mean it's moving under the influence of gravity alone, with no other forces acting on it. In practice, true free fall only occurs in a vacuum—but understanding this idealized case is essential before we add the complexities of air resistance and wind.",
          },
          {
            type: "subtitle",
            text: "What is Gravity?",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Gravity is one of the four fundamental forces of nature. Every object with mass attracts every other object with mass. **Newton's Law of Universal Gravitation** states that the force between two masses is $F = G\\frac{m_1 m_2}{r^2}$, where $G$ is the gravitational constant ($6.674 \\times 10^{-11} N·m^2/kg^2$), $m_1$ and $m_2$ are the masses, and $r$ is the distance between their centers.",
          },
          {
            type: "paragraph",
            text: "For objects near Earth's surface, this simplifies dramatically. The Earth's mass is so large ($5.972 \\times 10^{24}$ kg) and we're so close to it (radius $\\approx 6,371$ km) that we can treat gravity as producing a constant downward acceleration. This acceleration is denoted by $g$ and has a value of approximately $9.81 m/s^2$ at sea level. This means that every second an object falls, its downward velocity increases by $9.81 m/s$.",
          },
          {
            type: "subtitle",
            text: "Galileo's Revolutionary Discovery",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Before Galileo Galilei (1564-1642), people believed that heavier objects fell faster than lighter ones—a claim made by Aristotle nearly 2,000 years earlier. Galileo challenged this through thought experiments and actual experiments. His insight was that in a vacuum (no air resistance), all objects fall at the same rate regardless of their mass. A feather and a hammer dropped on the Moon (where there's no atmosphere) hit the ground simultaneously—as dramatically demonstrated by Apollo 15 astronaut David Scott in 1971.",
          },
          {
            type: "paragraph",
            text: "The reason is mathematical: gravity's force is $F = mg$, and Newton's Second Law tells us $F = ma$. Setting these equal: $ma = mg$, so $a = g$. The mass cancels out! The acceleration due to gravity is independent of the object's mass. This profound result means a bowling ball and a marble, dropped from the same height in vacuum, will fall together.",
          },
          {
            type: "callout",
            calloutType: "info",
            title: "The Feather and Hammer Experiment",
            text: "On August 2, 1971, astronaut David Scott performed Galileo's experiment on the Moon. He dropped a geological hammer and a falcon feather simultaneously. Without air resistance, both hit the lunar surface at exactly the same time. You can watch this iconic moment in space exploration history—it's a beautiful demonstration of physics in action.",
          },
          {
            type: "subtitle",
            text: "The Mathematics of Free Fall",
            level: 1,
          },
          {
            type: "paragraph",
            text: "For an object in free fall starting from rest at height $h$, we can use the kinematic equations. The position as a function of time is:",
          },
          {
            type: "formula",
            latex: "y(t) = h - \\frac{1}{2}gt^2",
            inline: false,
          },
          {
            type: "paragraph",
            text: "The velocity increases linearly with time:",
          },
          {
            type: "formula",
            latex: "v(t) = -gt",
            inline: false,
          },
          {
            type: "paragraph",
            text: "The negative sign indicates downward motion (assuming upward is positive). We can also find the velocity after falling a distance $d$ without knowing the time:",
          },
          {
            type: "formula",
            latex: "v^2 = 2gd",
            inline: false,
          },
          {
            type: "paragraph",
            text: "This tells us that impact velocity depends only on the fall distance, not on the object's mass. A ball dropped from 10 meters hits the ground at $v = \\sqrt{2 \\times 9.81 \\times 10} \\approx 14 m/s$ (about 50 km/h or 31 mph), regardless of whether it's a ping-pong ball or a bowling ball.",
          },
          {
            type: "table",
            columns: [
              "Drop Height",
              "Time to Ground",
              "Impact Velocity",
              "Real-World Reference",
            ],
            data: [
              {
                "Drop Height": "1 meter",
                "Time to Ground": "0.45 seconds",
                "Impact Velocity": "4.4 m/s (16 km/h)",
                "Real-World Reference": "Table height",
              },
              {
                "Drop Height": "5 meters",
                "Time to Ground": "1.01 seconds",
                "Impact Velocity": "9.9 m/s (36 km/h)",
                "Real-World Reference": "Second story window",
              },
              {
                "Drop Height": "10 meters",
                "Time to Ground": "1.43 seconds",
                "Impact Velocity": "14.0 m/s (50 km/h)",
                "Real-World Reference": "Third story building",
              },
              {
                "Drop Height": "50 meters",
                "Time to Ground": "3.19 seconds",
                "Impact Velocity": "31.3 m/s (113 km/h)",
                "Real-World Reference": "15-story building",
              },
              {
                "Drop Height": "100 meters",
                "Time to Ground": "4.52 seconds",
                "Impact Velocity": "44.3 m/s (159 km/h)",
                "Real-World Reference": "Bungee jump height",
              },
            ],
          },
          {
            type: "toggle",
            title: "Deep Dive: Why Does Gravity Vary?",
            content:
              "The value $g = 9.81 m/s^2$ is an average. Gravity actually varies slightly across Earth's surface due to three factors: (1) **Altitude**: Higher elevations are farther from Earth's center, reducing gravity slightly. At Mt. Everest's summit, $g \\approx 9.77 m/s^2$. (2) **Latitude**: Earth's rotation creates a centrifugal effect that's strongest at the equator, reducing effective gravity there to $g \\approx 9.78 m/s^2$ versus $g \\approx 9.83 m/s^2$ at the poles. (3) **Local geology**: Dense rock underground increases gravity slightly. Gravity maps reveal hidden geological structures!",
          },
          {
            type: "code",
            language: "javascript",
            code: `// Basic Free Fall Simulation (No Air Resistance)
class FreeFallBall {
  constructor(x, y, radius) {
    this.x = x;           // Horizontal position (constant in pure free fall)
    this.y = y;           // Vertical position
    this.vy = 0;          // Vertical velocity (starts at zero if dropped)
    this.radius = radius;
  }

  update(deltaTime, gravity = 9.81) {
    // In free fall, only gravity acts
    // Acceleration causes velocity to increase
    this.vy += gravity * deltaTime;
    
    // Velocity causes position to change
    this.y += this.vy * deltaTime;
  }

  // Calculate how long until impact (from current state)
  timeToGround(groundY) {
    const distanceToGround = groundY - this.y - this.radius;
    if (distanceToGround <= 0) return 0;
    
    // Using: d = v₀t + ½gt²
    // Solving quadratic: at² + bt + c = 0
    const a = 0.5 * 9.81;
    const b = this.vy;
    const c = -distanceToGround;
    
    // Quadratic formula
    const discriminant = b*b - 4*a*c;
    if (discriminant < 0) return Infinity; // Ball moving away
    
    const t1 = (-b + Math.sqrt(discriminant)) / (2*a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2*a);
    
    // Return positive solution
    return Math.max(t1, t2);
  }

  getImpactVelocity(groundY) {
    const distanceToGround = groundY - this.y - this.radius;
    if (distanceToGround <= 0) return this.vy;
    
    // v² = v₀² + 2gd
    const vSquared = this.vy * this.vy + 2 * 9.81 * distanceToGround;
    return Math.sqrt(vSquared);
  }
}

// Usage demonstration
const ball = new FreeFallBall(200, 50, 20);
const ground = 400;

console.log(\`Time to impact: \${ball.timeToGround(ground).toFixed(2)} seconds\`);
console.log(\`Impact velocity: \${ball.getImpactVelocity(ground).toFixed(2)} m/s\`);`,
          },
        ],
      },
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Phase 2: Gravity Across the Solar System",
          },
          {
            type: "paragraph",
            text: "One of the most fascinating aspects of gravity is how it varies dramatically across different celestial bodies. The value of $g$ depends on two factors: the mass of the planet and your distance from its center (essentially its radius). This creates wildly different falling experiences across our solar system.",
          },
          {
            type: "subtitle",
            text: "Calculating Surface Gravity",
            level: 1,
          },
          {
            type: "paragraph",
            text: "The surface gravity of any planet or moon can be calculated from Newton's law. For an object on the surface: $g = \\frac{GM}{R^2}$, where $G$ is the gravitational constant, $M$ is the planet's mass, and $R$ is its radius. This explains why massive Jupiter has strong gravity despite being made of gas—its enormous mass more than compensates for its large radius.",
          },
          {
            type: "paragraph",
            text: "Interestingly, surface gravity isn't simply proportional to mass. Mars has about 11% of Earth's mass but 38% of Earth's surface gravity because it's also much smaller (53% of Earth's radius). The $R^2$ in the denominator means smaller bodies can have stronger surface gravity than their mass alone suggests.",
          },
          {
            type: "table",
            columns: [
              "Celestial Body",
              "Surface Gravity (m/s²)",
              "Relative to Earth",
              "Drop Time from 10m",
              "Impact Velocity",
            ],
            data: [
              {
                "Celestial Body": "Moon",
                "Surface Gravity (m/s²)": "1.62",
                "Relative to Earth": "16.5%",
                "Drop Time from 10m": "3.51 seconds",
                "Impact Velocity": "5.69 m/s",
              },
              {
                "Celestial Body": "Mars",
                "Surface Gravity (m/s²)": "3.71",
                "Relative to Earth": "37.8%",
                "Drop Time from 10m": "2.33 seconds",
                "Impact Velocity": "8.62 m/s",
              },
              {
                "Celestial Body": "Earth",
                "Surface Gravity (m/s²)": "9.81",
                "Relative to Earth": "100%",
                "Drop Time from 10m": "1.43 seconds",
                "Impact Velocity": "14.0 m/s",
              },
              {
                "Celestial Body": "Jupiter",
                "Surface Gravity (m/s²)": "24.79",
                "Relative to Earth": "252.6%",
                "Drop Time from 10m": "0.90 seconds",
                "Impact Velocity": "22.3 m/s",
              },
              {
                "Celestial Body": "Sun",
                "Surface Gravity (m/s²)": "274.0",
                "Relative to Earth": "2793%",
                "Drop Time from 10m": "0.27 seconds",
                "Impact Velocity": "74.0 m/s",
              },
            ],
          },
          {
            type: "paragraph",
            text: "These differences create dramatically different experiences. On the Moon, astronauts could jump about six times higher than on Earth. On Jupiter (if it had a solid surface), you'd feel crushing weight—a 70 kg person would effectively weigh 177 kg. On the Sun, the same person would weigh nearly 2 metric tons!",
          },
          {
            type: "subtitle",
            text: "Extreme Gravity: Neutron Stars and Black Holes",
            level: 1,
          },
          {
            type: "paragraph",
            text: "For truly extreme gravity, we must look beyond planets. A **neutron star**—the collapsed core of a massive star—packs about 1.4 solar masses into a sphere only 20 km across. Surface gravity reaches $g \\approx 2 \\times 10^{12} m/s^2$—about 200 billion times Earth's gravity! A ball dropped just one meter would hit the ground traveling at 20,000 km/s (6.7% the speed of light) in about 0.1 milliseconds. At such speeds, relativistic effects become important, and classical physics breaks down.",
          },
          {
            type: "paragraph",
            text: "Near a **black hole**, gravity becomes so intense that not even light can escape within the event horizon. The equations of general relativity show that time itself slows down in strong gravitational fields—a phenomenon called **gravitational time dilation**. An object falling toward a black hole would appear to slow down and freeze at the event horizon from an outside observer's perspective, though the falling object experiences nothing unusual at that point.",
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "Tidal Forces: Spaghettification",
            text: "In extremely strong gravity gradients (like near black holes), the gravitational force on your feet would be vastly stronger than on your head. This differential force, called a **tidal force**, would stretch you like spaghetti—a phenomenon astrophysicists actually call 'spaghettification.' For a stellar-mass black hole, you'd be torn apart before reaching the event horizon. For supermassive black holes, the event horizon is so far from the center that tidal forces there are weaker—you could cross it intact!",
          },
          {
            type: "code",
            language: "javascript",
            code: `// Multi-Gravity Environment Simulator
const GRAVITY_CONSTANTS = {
  moon: { g: 1.62, name: "Moon", color: "#C0C0C0" },
  mars: { g: 3.71, name: "Mars", color: "#CD5C5C" },
  earth: { g: 9.81, name: "Earth", color: "#4169E1" },
  jupiter: { g: 24.79, name: "Jupiter", color: "#DAA520" },
  neutronStar: { g: 2e12, name: "Neutron Star", color: "#8B008B" }
};

class PlanetaryBall {
  constructor(x, y, radius, environment = "earth") {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.vy = 0;
    this.environment = environment;
    this.g = GRAVITY_CONSTANTS[environment].g;
    this.trail = [];
  }

  changeEnvironment(newEnvironment) {
    this.environment = newEnvironment;
    this.g = GRAVITY_CONSTANTS[newEnvironment].g;
  }

  update(deltaTime) {
    // Store position for trail
    this.trail.push({ x: this.x, y: this.y, time: performance.now() });
    
    // Limit trail length
    if (this.trail.length > 50) this.trail.shift();

    // Apply planetary gravity
    this.vy += this.g * deltaTime;
    this.y += this.vy * deltaTime;
  }

  reset(y) {
    this.y = y;
    this.vy = 0;
    this.trail = [];
  }

  getEnvironmentInfo() {
    const env = GRAVITY_CONSTANTS[this.environment];
    const earthRatio = (this.g / GRAVITY_CONSTANTS.earth.g * 100).toFixed(1);
    return {
      name: env.name,
      gravity: this.g,
      color: env.color,
      earthRatio: \`\${earthRatio}% of Earth gravity\`
    };
  }

  // Calculate weight on this planet given Earth weight
  calculateWeight(earthWeight) {
    return earthWeight * (this.g / GRAVITY_CONSTANTS.earth.g);
  }
}

// Comparison simulation
class GravityComparison {
  constructor() {
    this.balls = [
      new PlanetaryBall(100, 50, 15, "moon"),
      new PlanetaryBall(250, 50, 15, "mars"),
      new PlanetaryBall(400, 50, 15, "earth"),
      new PlanetaryBall(550, 50, 15, "jupiter")
    ];
  }

  update(deltaTime) {
    for (const ball of this.balls) {
      ball.update(deltaTime);
    }
  }

  resetAll() {
    for (const ball of this.balls) {
      ball.reset(50);
    }
  }

  draw(ctx) {
    // Draw each ball with its planetary color
    for (const ball of this.balls) {
      const info = ball.getEnvironmentInfo();
      
      // Draw trail
      ctx.strokeStyle = info.color + "40"; // With transparency
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < ball.trail.length; i++) {
        const point = ball.trail[i];
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();

      // Draw ball
      ctx.fillStyle = info.color;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw label
      ctx.fillStyle = "black";
      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.fillText(info.name, ball.x, ball.y - ball.radius - 5);
    }
  }
}`,
          },
        ],
      },
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Phase 3: The Atmosphere Strikes Back - Air Resistance",
          },
          {
            type: "paragraph",
            text: "In the real world, objects don't fall in a vacuum. They must push through air, which resists motion. This **air resistance** (also called **drag**) fundamentally changes falling behavior, creating a maximum falling speed called **terminal velocity**. Understanding drag is crucial for everything from skydiving to spacecraft reentry.",
          },
          {
            type: "subtitle",
            text: "The Physics of Drag",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Air resistance arises from collisions between the falling object and air molecules. The faster you move, the more molecules you hit per second, so drag increases with velocity. For most objects at typical speeds, drag is proportional to velocity squared:",
          },
          {
            type: "formula",
            latex: "F_{drag} = \\frac{1}{2} C_d \\rho A v^2",
            inline: false,
          },
          {
            type: "paragraph",
            text: "Where $C_d$ is the **drag coefficient** (shape-dependent), $\\rho$ is air density ($\\approx 1.225 kg/m^3$ at sea level), $A$ is the cross-sectional area facing the airflow, and $v$ is velocity. The drag coefficient varies dramatically with shape: a sphere has $C_d \\approx 0.47$, a streamlined car might achieve $C_d \\approx 0.25$, while a flat plate perpendicular to flow has $C_d \\approx 1.28$.",
          },
          {
            type: "subtitle",
            text: "Terminal Velocity: When Gravity Meets Equilibrium",
            level: 1,
          },
          {
            type: "paragraph",
            text: "As an object falls and accelerates, drag force increases (remember, it's proportional to $v^2$). Eventually, drag force equals gravitational force: $F_{drag} = mg$. At this point, net force is zero, so acceleration stops and velocity remains constant. This maximum speed is called **terminal velocity**:",
          },
          {
            type: "formula",
            latex: "v_{terminal} = \\sqrt{\\frac{2mg}{C_d \\rho A}}",
            inline: false,
          },
          {
            type: "paragraph",
            text: "Terminal velocity explains many everyday observations. A skydiver in spread-eagle position reaches about 55 m/s (200 km/h or 120 mph) due to large area and high drag. By tucking into a dive position, reducing area and drag coefficient, skydivers can exceed 90 m/s (320 km/h or 200 mph). A raindrop, despite falling from kilometers up, hits you at only about 9 m/s (32 km/h) because it reaches terminal velocity quickly.",
          },
          {
            type: "table",
            columns: [
              "Object",
              "Terminal Velocity",
              "Time to 99% Terminal",
              "Real-World Context",
            ],
            data: [
              {
                Object: "Feather",
                "Terminal Velocity": "~0.5-1 m/s",
                "Time to 99% Terminal": "0.5 seconds",
                "Real-World Context": "Floats gently",
              },
              {
                Object: "Raindrop (3mm)",
                "Terminal Velocity": "~9 m/s",
                "Time to 99% Terminal": "2 seconds",
                "Real-World Context": "Gentle rainfall",
              },
              {
                Object: "Baseball",
                "Terminal Velocity": "~42 m/s",
                "Time to 99% Terminal": "5 seconds",
                "Real-World Context": "150 km/h",
              },
              {
                Object: "Skydiver (spread)",
                "Terminal Velocity": "~55 m/s",
                "Time to 99% Terminal": "12 seconds",
                "Real-World Context": "200 km/h, standard freefall",
              },
              {
                Object: "Skydiver (dive)",
                "Terminal Velocity": "~90 m/s",
                "Time to 99% Terminal": "15 seconds",
                "Real-World Context": "320 km/h, head-first",
              },
              {
                Object: "Bowling Ball",
                "Terminal Velocity": "~100 m/s",
                "Time to 99% Terminal": "18 seconds",
                "Real-World Context": "360 km/h, very heavy",
              },
            ],
          },
          {
            type: "paragraph",
            text: "The time to reach terminal velocity depends on the object's mass and drag characteristics. Lighter objects with high drag (like feathers) reach terminal velocity almost instantly, while heavy objects with low drag (like bullets or meteorites) take much longer and may never reach it during typical falls.",
          },
          {
            type: "callout",
            calloutType: "info",
            title: "Why Don't Small Animals Get Hurt from Falls?",
            text: "Terminal velocity scales with size in interesting ways. An ant has such low mass and high surface area (relative to its weight) that its terminal velocity is only about 6 m/s—it can survive falls from any height! This is why J.B.S. Haldane famously wrote: 'You can drop a mouse down a thousand-yard mine shaft; and, on arriving at the bottom, it gets a slight shock and walks away. A rat is killed, a man is broken, a horse splashes.' Terminal velocity is why size matters in falls.",
          },
          {
            type: "subtitle",
            text: "Modeling Air Resistance Mathematically",
            level: 1,
          },
          {
            type: "paragraph",
            text: "With air resistance, the equation of motion becomes: $ma = mg - \\frac{1}{2}C_d \\rho A v^2$. This is a **non-linear differential equation**—there's no simple closed-form solution like the kinematic equations. However, we can analyze its behavior. At low speeds (small $v$), drag is negligible and motion is nearly free fall. As speed increases, drag grows rapidly (remember the $v^2$), slowing acceleration until eventually $a \\to 0$ at terminal velocity.",
          },
          {
            type: "paragraph",
            text: "For simulation, we solve this numerically using integration methods. The velocity as a function of time asymptotically approaches terminal velocity following: $v(t) = v_{terminal}\\tanh\\left(\\frac{gt}{v_{terminal}}\\right)$, where $\\tanh$ is the hyperbolic tangent function. This elegant solution shows that velocity rises quickly at first, then gradually levels off.",
          },
          {
            type: "toggle",
            title: "Advanced: Reynolds Number and Flow Regimes",
            content:
              "The character of air flow around an object depends on the **Reynolds number**: $Re = \\frac{\\rho v L}{\\mu}$, where $L$ is characteristic length and $\\mu$ is air viscosity. At low $Re$ (< 1), flow is laminar and smooth—drag is proportional to $v$ (Stokes' drag). At high $Re$ (> 1000), flow is turbulent with separation—drag is proportional to $v^2$. This transition explains why tiny particles (dust, pollen) fall much slower than predicted by $v^2$ drag. They operate in the linear drag regime where $F_d \\propto v$ and terminal velocity is proportional to mass, not $\\sqrt{mass}$.",
          },
          {
            type: "code",
            language: "javascript",
            code: `// Ball with Air Resistance
class DragBall {
  constructor(x, y, radius, mass, dragCoefficient = 0.47) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.mass = mass;
    this.vy = 0;
    
    this.Cd = dragCoefficient;
    this.airDensity = 1.225; // kg/m³ at sea level
    this.area = Math.PI * (radius/100) * (radius/100); // Convert px to m
    
    // Calculate terminal velocity
    this.terminalVelocity = Math.sqrt(
      (2 * this.mass * 9.81) / 
      (this.Cd * this.airDensity * this.area)
    );
  }

  calculateDrag() {
    // F_drag = 0.5 * Cd * ρ * A * v²
    // Direction opposite to velocity
    const dragForce = 0.5 * this.Cd * this.airDensity * 
                     this.area * this.vy * this.vy;
    
    // Force becomes negative when moving downward (opposes motion)
    return this.vy > 0 ? -dragForce : dragForce;
  }

  update(deltaTime, gravity = 9.81) {
    // Net force = gravity - drag
    const gravityForce = this.mass * gravity;
    const dragForce = this.calculateDrag();
    const netForce = gravityForce + dragForce;
    
    // F = ma => a = F/m
    const acceleration = netForce / this.mass;
    
    // Update velocity and position
    this.vy += acceleration * deltaTime;
    this.y += this.vy * deltaTime;
  }

  getTerminalVelocity() {
    return this.terminalVelocity;
  }

  getPercentOfTerminal() {
    return (Math.abs(this.vy) / this.terminalVelocity * 100).toFixed(1);
  }
}

// Comparison: Free Fall vs With Drag
class FallComparison {
  constructor(x, y, radius, mass) {
    this.freeFall = new FreeFallBall(x - 50, y, radius);
    this.withDrag = new DragBall(x + 50, y, radius, mass);
  }

  update(deltaTime) {
    this.freeFall.update(deltaTime);
    this.withDrag.update(deltaTime);
  }

  getStats() {
    return {
      freeFallSpeed: this.freeFall.vy.toFixed(2),
      dragSpeed: this.withDrag.vy.toFixed(2),
      terminalVelocity: this.withDrag.getTerminalVelocity().toFixed(2),
      percentTerminal: this.withDrag.getPercentOfTerminal(),
      heightDifference: Math.abs(this.freeFall.y - this.withDrag.y).toFixed(1)
    };
  }
}`,
          },
        ],
      },
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Phase 4: Wind Forces - Horizontal Acceleration",
          },
          {
            type: "paragraph",
            text: "Now we introduce a game-changer: **wind**—a horizontal force that acts on the ball throughout its flight. Unlike gravity (which is constant and downward) or drag (which opposes motion), wind can push in any direction and can vary in strength. This creates fascinating curved trajectories and introduces the concept of **force composition**.",
          },
          {
            type: "subtitle",
            text: "Understanding Wind as a Force",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Wind is moving air—a flow of gas molecules in a particular direction. When wind encounters an object, it exerts force through momentum transfer. The faster the wind, the more momentum it carries and the stronger the force. Wind force can be modeled similarly to drag: $F_{wind} = \\frac{1}{2}C_d \\rho A v_{wind}^2$, but for simplicity in many simulations, we treat wind as producing a constant horizontal acceleration.",
          },
          {
            type: "paragraph",
            text: "In our simulation, wind acts as a **constant horizontal force**, creating a constant horizontal acceleration (similar to how gravity creates constant vertical acceleration). This is a simplification—real wind is turbulent and gusty—but it captures the essential physics. If wind accelerates the ball leftward at $a_{wind} = 2 m/s^2$, the ball's horizontal velocity continuously increases: $v_x(t) = v_{x0} + a_{wind} \\cdot t$.",
          },
          {
            type: "subtitle",
            text: "Vector Addition: Combining Gravity and Wind",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Here's where physics becomes beautiful: gravity and wind are **independent**. Gravity affects vertical motion ($y$ and $v_y$), while wind affects horizontal motion ($x$ and $v_x$). We can analyze each direction separately, then combine the results. This is the principle of **superposition**—effects of multiple forces can be calculated independently and added together.",
          },
          {
            type: "paragraph",
            text: "Mathematically, the net acceleration is the vector sum: $\\vec{a}_{net} = \\vec{a}_{gravity} + \\vec{a}_{wind}$. In components: $a_x = a_{wind}$ and $a_y = g$. The trajectory becomes a **parabola**, but now it's tilted and stretched compared to the vertical-only case. The ball follows a curved path, gaining both downward and horizontal speed as it falls.",
          },
          {
            type: "formula",
            latex:
              "\\begin{aligned} x(t) &= x_0 + v_{x0}t + \\frac{1}{2}a_{wind}t^2 \\\\ y(t) &= y_0 + v_{y0}t + \\frac{1}{2}gt^2 \\end{aligned}",
            inline: false,
          },
          {
            type: "subtitle",
            text: "Real-World Wind Effects",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Wind dramatically affects falling objects in practice. **Artillery calculations** must account for wind to hit targets accurately—a 10 m/s crosswind can deflect a shell by hundreds of meters over a long flight. **Skydiving** requires understanding wind drift; jumpers might exit the aircraft kilometers upwind of their target landing zone. **Building design** must consider objects falling from height in wind—dropped tools from skyscrapers can drift significantly.",
          },
          {
            type: "paragraph",
            text: "**Sports** provide vivid examples. A golf ball hit into a strong headwind will gain less distance and might even curve backward at the peak of its flight if the wind is strong enough. A soccer ball kicked in crosswind follows a curved path. Long jumpers prefer tailwinds (within the legal 2 m/s limit) because the horizontal acceleration effectively increases their jump distance.",
          },
          {
            type: "callout",
            calloutType: "info",
            title: "The Beaufort Scale: Quantifying Wind",
            text: "The **Beaufort Scale** describes wind effects observationally: Force 0 (calm, < 0.5 m/s) - smoke rises vertically; Force 6 (strong breeze, 10-12 m/s) - large branches move, umbrellas difficult to use; Force 12 (hurricane, > 32 m/s) - widespread damage. A 'light breeze' (Force 2, 2-3 m/s) provides enough horizontal acceleration to noticeably deflect a falling ball. A 'strong wind' (Force 7, 14-17 m/s) would dramatically alter trajectories, potentially pushing lightweight objects horizontally faster than they fall!",
          },
          {
            type: "code",
            language: "javascript",
            code: `// Ball with Gravity AND Wind
class WindBall {
  constructor(x, y, vx, vy, radius, mass) {
    this.x = x;
    this.y = y;
    this.vx = vx; // Now horizontal velocity matters!
    this.vy = vy;
    this.radius = radius;
    this.mass = mass;
    
    // Trail for visualization
    this.trail = [];
    this.maxTrailLength = 50;
  }

  update(deltaTime, gravity, windAcceleration) {
    // Store position for trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }

    // INDEPENDENT MOTION IN EACH AXIS
    // Vertical: gravity only
    this.vy += gravity * deltaTime;
    this.y += this.vy * deltaTime;
    
    // Horizontal: wind only
    this.vx += windAcceleration * deltaTime;
    this.x += this.vx * deltaTime;
  }

  getSpeed() {
    // Total speed is magnitude of velocity vector
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  }

  getAngle() {
    // Angle of motion (in degrees from horizontal)
    return Math.atan2(this.vy, this.vx) * 180 / Math.PI;
  }

  getTrajectoryInfo() {
    return {
      horizontalSpeed: this.vx.toFixed(2),
      verticalSpeed: this.vy.toFixed(2),
      totalSpeed: this.getSpeed().toFixed(2),
      angle: this.getAngle().toFixed(1)
    };
  }
}

// Advanced: Wind with Gusts (Variable Wind)
class GustyWind {
  constructor(baseWind, gustStrength, gustFrequency) {
    this.baseWind = baseWind;           // Average wind acceleration
    this.gustStrength = gustStrength;   // Maximum deviation
    this.gustFrequency = gustFrequency; // How often gusts change (Hz)
    this.currentGust = 0;
    this.time = 0;
  }

  update(deltaTime) {
    this.time += deltaTime;
    
    // Use Perlin noise or sine waves for smooth variation
    // Simple sine wave for demonstration
    const gustOscillation = Math.sin(this.time * this.gustFrequency * 2 * Math.PI);
    this.currentGust = this.gustStrength * gustOscillation;
  }

  getWindAcceleration() {
    return this.baseWind + this.currentGust;
  }
}

// Simulation with multiple wind conditions
class WindComparisonSim {
  constructor() {
    this.balls = [
      { ball: new WindBall(100, 50, 0, 0, 15, 1), wind: 0, label: "No Wind" },
      { ball: new WindBall(250, 50, 0, 0, 15, 1), wind: -2, label: "Light Wind" },
      { ball: new WindBall(400, 50, 0, 0, 15, 1), wind: -5, label: "Strong Wind" },
      { ball: new WindBall(550, 50, 0, 0, 15, 1), wind: -10, label: "Gale Force" }
    ];
  }

  update(deltaTime, gravity = 9.81) {
    for (const item of this.balls) {
      item.ball.update(deltaTime, gravity, item.wind);
    }
  }

  resetAll(y = 50) {
    for (const item of this.balls) {
      item.ball.x = item.ball.x; // Keep x position
      item.ball.y = y;
      item.ball.vx = 0;
      item.ball.vy = 0;
      item.ball.trail = [];
    }
  }

  draw(ctx) {
    for (const item of this.balls) {
      const ball = item.ball;
      
      // Draw curved trajectory trail
      ctx.strokeStyle = 'rgba(100, 150, 200, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < ball.trail.length; i++) {
        const point = ball.trail[i];
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();

      // Draw ball
      ctx.fillStyle = 'rgba(100, 150, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw velocity vector
      if (ball.vx !== 0 || ball.vy !== 0) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(ball.x + ball.vx * 3, ball.y + ball.vy * 3);
        ctx.stroke();
      }

      // Draw label
      ctx.fillStyle = 'black';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, ball.x, ball.y - ball.radius - 20);
      ctx.fillText(\`Wind: \${item.wind} m/s²\`, ball.x, ball.y - ball.radius - 5);
    }
  }
}`,
          },
          {
            type: "subtitle",
            text: "Wind + Drag: Complex Interactions",
            level: 1,
          },
          {
            type: "paragraph",
            text: "When we combine wind with air resistance, fascinating complexity emerges. Drag opposes the ball's motion **relative to the air**, not relative to the ground. If wind moves air leftward at 10 m/s and the ball moves leftward at 5 m/s, the ball is actually moving rightward at 5 m/s relative to the air, so drag pushes it leftward! This is why tailwinds help—they reduce relative velocity, reducing drag.",
          },
          {
            type: "paragraph",
            text: "The relative velocity is $\\vec{v}_{relative} = \\vec{v}_{ball} - \\vec{v}_{wind}$. Drag force becomes: $\\vec{F}_{drag} = -\\frac{1}{2}C_d \\rho A |\\vec{v}_{relative}|\\vec{v}_{relative}$. This creates interesting behavior: in strong tailwind, a ball might never reach terminal velocity in the ground frame because the air is moving with it, reducing effective drag to nearly zero.",
          },
        ],
      },
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Phase 5: Energy Transformations and Bouncing",
          },
          {
            type: "paragraph",
            text: "When our wind-blown, gravity-pulled ball finally hits the ground, it must bounce. But now the collision is more complex because the ball has **both** horizontal and vertical velocity components. Understanding energy transformation during these 2D collisions reveals deep physics principles.",
          },
          {
            type: "subtitle",
            text: "Energy Before and After Collision",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Before impact, the ball has kinetic energy from both velocity components: $KE = \\frac{1}{2}m(v_x^2 + v_y^2)$. The total kinetic energy depends on the magnitude of the velocity vector, not the individual components. A ball moving 10 m/s at 45° has the same kinetic energy as one moving 10 m/s straight down—energy is scalar, not directional.",
          },
          {
            type: "paragraph",
            text: "During the collision, the ball compresses against the floor. Kinetic energy temporarily converts to **elastic potential energy** (like a spring), then releases back—but not completely. Some energy dissipates as heat, sound, and permanent deformation. The **coefficient of restitution** ($e$) quantifies this, but now we must apply it carefully to the velocity components.",
          },
          {
            type: "subtitle",
            text: "Component-wise Collision Response",
            level: 1,
          },
          {
            type: "paragraph",
            text: "For a horizontal floor, the collision affects vertical and horizontal motion differently. The **normal force** (perpendicular to the surface) acts only vertically, while **friction** (parallel to surface) acts only horizontally. We handle each separately:",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "**Vertical component**: Apply restitution normally: $v_{y,after} = -e \\cdot v_{y,before}$. The negative sign reverses direction (bounce up instead of down).",
              "**Horizontal component**: Two cases exist. (a) **Frictionless surface**: $v_{x,after} = v_{x,before}$ (horizontal velocity unchanged). (b) **With friction**: Friction opposes motion, reducing horizontal velocity: $v_{x,after} = v_{x,before} \\cdot (1 - \\mu)$, where $\\mu$ is a friction coefficient.",
            ],
          },
          {
            type: "paragraph",
            text: "This creates interesting scenarios. A ball hitting at an angle bounces at a different angle. Without friction, the bounce angle (from vertical) remains the same: $\\theta_{bounce} = \\theta_{impact}$. With friction, the bounce angle becomes shallower because horizontal velocity decreases while vertical velocity maintains its restitution ratio.",
          },
          {
            type: "formula",
            latex:
              "\\text{Energy Loss} = \\frac{1}{2}m(v_{before}^2 - v_{after}^2) = \\frac{1}{2}m[v_{x,before}^2 + v_{y,before}^2 - v_{x,after}^2 - v_{y,after}^2]",
            inline: false,
          },
          {
            type: "subtitle",
            text: "Multiple Bounces: Trajectory Evolution",
            level: 1,
          },
          {
            type: "paragraph",
            text: "With wind continuously accelerating the ball horizontally and energy being lost vertically with each bounce, the trajectory evolves in fascinating ways. Early bounces are high and far apart. Later bounces become rapid and close together as vertical energy depletes. The horizontal motion, however, **continues accelerating** due to wind—the ball keeps drifting leftward (or whichever direction wind blows) even as bounces become tiny.",
          },
          {
            type: "paragraph",
            text: "Eventually, vertical bouncing stops (when kinetic energy drops below the threshold to overcome adhesive forces), but horizontal motion continues indefinitely if wind persists. The ball ends up **sliding** across the ground, still accelerating horizontally. In reality, sliding friction would eventually balance wind force, creating a terminal sliding velocity.",
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "The Tunneling Problem in 2D",
            text: "With both horizontal and vertical motion, the tunneling problem (ball passing through floor between frames) becomes more likely. The ball moves diagonally, covering more distance per frame. Solutions include: (1) Reduce timestep. (2) Use **swept collision detection**: test if the line segment from previous position to current position intersects the floor. (3) Apply **continuous collision detection** (CCD): solve for the exact time of collision within the timestep and handle it precisely.",
          },
          {
            type: "code",
            language: "javascript",
            code: `// Complete Simulation: Gravity + Wind + Drag + Bouncing
class CompleteBall {
  constructor(x, y, vx, vy, radius, mass, restitution = 0.75) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.mass = mass;
    this.restitution = restitution;
    
    // Physics parameters
    this.Cd = 0.47; // Drag coefficient (sphere)
    this.airDensity = 1.225;
    this.area = Math.PI * (radius/100) * (radius/100);
    this.frictionCoefficient = 0.1; // Surface friction
    
    // State tracking
    this.isResting = false;
    this.bounceCount = 0;
    this.totalEnergyLost = 0;
  }

  update(deltaTime, gravity, windAcceleration) {
    if (this.isResting) {
      // Even when resting, wind can push horizontally
      this.vx += windAcceleration * deltaTime;
      this.x += this.vx * deltaTime;
      return;
    }

    // 1. FORCES: Gravity
    const gravityForce = this.mass * gravity;
    
    // 2. FORCES: Wind (constant horizontal acceleration)
    const windForce = this.mass * windAcceleration;
    
    // 3. FORCES: Air Drag (opposes velocity)
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    let dragForceX = 0, dragForceY = 0;
    
    if (speed > 0) {
      const dragMagnitude = 0.5 * this.Cd * this.airDensity * 
                           this.area * speed * speed;
      // Drag opposes velocity direction
      dragForceX = -dragMagnitude * (this.vx / speed);
      dragForceY = -dragMagnitude * (this.vy / speed);
    }
    
    // 4. NET FORCES
    const netForceX = windForce + dragForceX;
    const netForceY = gravityForce + dragForceY;
    
    // 5. ACCELERATION: F = ma => a = F/m
    const ax = netForceX / this.mass;
    const ay = netForceY / this.mass;
    
    // 6. UPDATE VELOCITY (Semi-Implicit Euler)
    this.vx += ax * deltaTime;
    this.vy += ay * deltaTime;
    
    // 7. UPDATE POSITION
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
  }

  checkGroundCollision(groundY) {
    if (this.y + this.radius >= groundY) {
      // Energy before collision
      const energyBefore = 0.5 * this.mass * 
                          (this.vx * this.vx + this.vy * this.vy);
      
      // Positional correction
      this.y = groundY - this.radius;
      
      // Vertical velocity: apply restitution
      this.vy = -this.vy * this.restitution;
      
      // Horizontal velocity: apply friction
      this.vx *= (1 - this.frictionCoefficient);
      
      // Energy after collision
      const energyAfter = 0.5 * this.mass * 
                         (this.vx * this.vx + this.vy * this.vy);
      
      this.totalEnergyLost += (energyBefore - energyAfter);
      this.bounceCount++;
      
      // Stop micro-bouncing
      if (Math.abs(this.vy) < 0.5) {
        this.vy = 0;
        this.isResting = true;
      }
      
      return true;
    }
    return false;
  }

  checkWallCollision(leftWall, rightWall) {
    if (this.x - this.radius < leftWall) {
      this.x = leftWall + this.radius;
      this.vx = -this.vx * this.restitution;
      return true;
    }
    if (this.x + this.radius > rightWall) {
      this.x = rightWall - this.radius;
      this.vx = -this.vx * this.restitution;
      return true;
    }
    return false;
  }

  getKineticEnergy() {
    return 0.5 * this.mass * (this.vx * this.vx + this.vy * this.vy);
  }

  getPotentialEnergy(groundY) {
    const height = groundY - (this.y + this.radius);
    return this.mass * 9.81 * height;
  }

  getTotalEnergy(groundY) {
    return this.getKineticEnergy() + this.getPotentialEnergy(groundY);
  }

  getStats(groundY) {
    return {
      position: { x: this.x.toFixed(1), y: this.y.toFixed(1) },
      velocity: { 
        vx: this.vx.toFixed(2), 
        vy: this.vy.toFixed(2),
        total: Math.sqrt(this.vx**2 + this.vy**2).toFixed(2)
      },
      energy: {
        kinetic: this.getKineticEnergy().toFixed(2),
        potential: this.getPotentialEnergy(groundY).toFixed(2),
        total: this.getTotalEnergy(groundY).toFixed(2),
        lost: this.totalEnergyLost.toFixed(2)
      },
      bounces: this.bounceCount,
      resting: this.isResting
    };
  }
}

// Full Simulation Manager
class PhysicsSimulation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Physics settings
    this.gravity = 9.81;
    this.windAcceleration = -2; // Leftward wind
    
    // Create ball
    this.ball = new CompleteBall(
      this.canvas.width / 2,  // x
      50,                      // y
      0,                       // vx
      0,                       // vy
      20,                      // radius
      1.0,                     // mass (kg)
      0.75                     // restitution
    );
    
    this.running = false;
    this.timestep = 1/60;
  }

  setGravity(planetName) {
    const gravities = {
      moon: 1.62,
      mars: 3.71,
      earth: 9.81,
      jupiter: 24.79
    };
    this.gravity = gravities[planetName] || 9.81;
  }

  setWind(windSpeed) {
    this.windAcceleration = windSpeed;
  }

  reset() {
    this.ball = new CompleteBall(
      this.canvas.width / 2, 50, 0, 0, 20, 1.0, 0.75
    );
  }

  start() {
    this.running = true;
    this.animate();
  }

  stop() {
    this.running = false;
  }

  animate() {
    if (!this.running) return;

    // Clear canvas
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw ground
    this.ctx.fillStyle = '#654321';
    this.ctx.fillRect(0, this.canvas.height - 5, this.canvas.width, 5);

    // Update physics
    this.ball.update(this.timestep, this.gravity, this.windAcceleration);
    this.ball.checkGroundCollision(this.canvas.height - 5);
    this.ball.checkWallCollision(0, this.canvas.width);

    // Draw ball
    this.ctx.fillStyle = '#4169E1';
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw velocity vector
    this.ctx.strokeStyle = '#FF0000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.ball.x, this.ball.y);
    this.ctx.lineTo(
      this.ball.x + this.ball.vx * 5, 
      this.ball.y + this.ball.vy * 5
    );
    this.ctx.stroke();

    // Display stats
    this.displayStats();

    requestAnimationFrame(() => this.animate());
  }

  displayStats() {
    const stats = this.ball.getStats(this.canvas.height - 5);
    
    this.ctx.fillStyle = 'black';
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'left';
    
    let y = 20;
    const lineHeight = 18;
    
    this.ctx.fillText(\`Position: (\${stats.position.x}, \${stats.position.y})\`, 10, y);
    y += lineHeight;
    this.ctx.fillText(\`Velocity: (\${stats.velocity.vx}, \${stats.velocity.vy}) m/s\`, 10, y);
    y += lineHeight;
    this.ctx.fillText(\`Speed: \${stats.velocity.total} m/s\`, 10, y);
    y += lineHeight;
    this.ctx.fillText(\`KE: \${stats.energy.kinetic} J\`, 10, y);
    y += lineHeight;
    this.ctx.fillText(\`PE: \${stats.energy.potential} J\`, 10, y);
    y += lineHeight;
    this.ctx.fillText(\`Total: \${stats.energy.total} J\`, 10, y);
    y += lineHeight;
    this.ctx.fillText(\`Lost: \${stats.energy.lost} J\`, 10, y);
    y += lineHeight;
    this.ctx.fillText(\`Bounces: \${stats.bounces}\`, 10, y);
    y += lineHeight;
    this.ctx.fillText(\`Wind: \${this.windAcceleration.toFixed(1)} m/s²\`, 10, y);
    y += lineHeight;
    this.ctx.fillText(\`Gravity: \${this.gravity.toFixed(2)} m/s²\`, 10, y);
  }
}

// Usage
const sim = new PhysicsSimulation('myCanvas');
sim.setGravity('earth');
sim.setWind(-3); // 3 m/s² leftward
sim.start();`,
          },
        ],
      },
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Phase 6: Advanced Topics and Extensions",
          },
          {
            type: "subtitle",
            text: "Turbulence and Chaotic Wind Patterns",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Real wind is never constant—it's **turbulent**, featuring swirls, eddies, and gusts at multiple scales. This turbulence arises from the **Navier-Stokes equations** governing fluid flow, which exhibit chaotic behavior. Small changes in initial conditions lead to vastly different wind patterns—this is why weather prediction beyond a week becomes unreliable despite powerful supercomputers.",
          },
          {
            type: "paragraph",
            text: "We can model realistic turbulent wind using **Perlin noise** or **Simplex noise**—algorithms that generate smooth, natural-looking random variations. These create wind that varies continuously in space and time, with regions of calm and regions of strong gusts. Objects falling through such a wind field experience constantly changing forces, creating erratic, realistic trajectories.",
          },
          {
            type: "subtitle",
            text: "The Coriolis Effect: Rotating Reference Frames",
            level: 1,
          },
          {
            type: "paragraph",
            text: "On a rotating planet, falling objects experience an apparent force called the **Coriolis effect**. This isn't a real force but an artifact of observing motion from a rotating reference frame (the Earth's surface). The Coriolis acceleration is $\\vec{a}_C = -2\\vec{\\Omega} \\times \\vec{v}$, where $\\vec{\\Omega}$ is Earth's angular velocity and $\\vec{v}$ is the object's velocity.",
          },
          {
            type: "paragraph",
            text: "For everyday falling objects, the Coriolis effect is tiny—a ball dropped from 100m deflects only about 2cm eastward during its fall. However, for long-range projectiles (artillery shells, missiles) or long-duration flights (aircraft), Coriolis becomes significant. It's why hurricanes spin counterclockwise in the Northern Hemisphere and clockwise in the Southern Hemisphere—the Coriolis effect deflects moving air, creating rotation.",
          },
          {
            type: "subtitle",
            text: "Relativistic Corrections: Near Light Speed",
            level: 1,
          },
          {
            type: "paragraph",
            text: "At extremely high velocities approaching the speed of light ($c \\approx 3 \\times 10^8 m/s$), classical physics breaks down and we need **special relativity**. Mass increases with velocity: $m = \\frac{m_0}{\\sqrt{1 - v^2/c^2}}$, where $m_0$ is rest mass. This means accelerating objects becomes progressively harder as they approach light speed—infinite energy would be required to reach exactly $c$.",
          },
          {
            type: "paragraph",
            text: "For falling objects near black holes or neutron stars, **general relativity** becomes essential. Space itself curves in strong gravity, and time dilates—clocks run slower deep in gravitational wells. An object falling into a black hole experiences these effects dramatically, though from the faller's perspective, nothing special happens at the event horizon (until tidal forces become lethal closer in).",
          },
          {
            type: "toggle",
            title: "Deep Dive: The Equivalence Principle",
            content:
              "Einstein's **Equivalence Principle** states that gravitational acceleration is locally indistinguishable from acceleration due to other forces. Inside a windowless elevator, you cannot tell if you're stationary on Earth or accelerating upward at $g$ in deep space—physics works identically. This profound insight led Einstein to general relativity. It also means astronauts in orbit aren't 'weightless' because gravity disappeared—they're in perpetual free fall around Earth, experiencing continuous gravitational acceleration that's exactly balanced by their orbital motion's centrifugal effect.",
          },
          {
            type: "subtitle",
            text: "Computational Fluid Dynamics: Simulating Reality",
            level: 1,
          },
          {
            type: "paragraph",
            text: "For truly accurate simulations of balls falling through air, we need **Computational Fluid Dynamics (CFD)**. This involves solving the Navier-Stokes equations on a grid surrounding the object, calculating how air flows around it at each timestep. CFD reveals phenomena like **vortex shedding** (alternating vortices forming behind the ball), **boundary layer separation** (where smooth flow breaks away from the surface), and **wake turbulence** (chaotic flow trailing the object).",
          },
          {
            type: "paragraph",
            text: "Modern CFD simulations can achieve remarkable realism but require enormous computational power—a detailed simulation might need hours on a supercomputer for just seconds of motion. For games and interactive applications, we use simplified models (like the drag equation) that capture essential behavior without solving the full fluid dynamics. The art is finding the simplest model that produces convincing results.",
          },
        ],
      },
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Phase 7: Practical Applications and Real-World Examples",
          },
          {
            type: "subtitle",
            text: "Meteorology: Falling Raindrops and Hail",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Raindrops provide a perfect natural example of falling objects with drag and wind. Small droplets (< 1mm) fall at only 2-7 m/s—terminal velocity comes quickly due to high surface-area-to-volume ratio. Larger drops (4-5mm) reach 9-10 m/s but can't grow bigger because aerodynamic forces tear them apart. This is why raindrops have a maximum size around 6mm diameter.",
          },
          {
            type: "paragraph",
            text: "**Hailstones** are more complex. They form in updrafts within thunderstorms, repeatedly cycling up and down, accumulating ice layers. Strong updrafts (sometimes exceeding 50 m/s) can suspend hailstones for minutes, allowing them to grow to softball size. When they finally fall, large hail reaches terminal velocities of 40-50 m/s (160-180 km/h), carrying enormous kinetic energy—enough to dent cars and break windows. The falling hail is also blown laterally by high-altitude winds, often landing kilometers from where it formed.",
          },
          {
            type: "subtitle",
            text: "Aviation: Crosswind Landings and Wind Shear",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Pilots must constantly account for wind when landing aircraft. In a **crosswind**, the plane must point partially into the wind while moving along the runway—a technique called 'crabbing.' The pilot maintains a heading that compensates for wind drift, so the ground track aligns with the runway despite the plane pointing off-center. Just before touchdown, the pilot 'kicks out' the crab, aligning the fuselage with the runway while maintaining the corrected ground track.",
          },
          {
            type: "paragraph",
            text: "**Wind shear**—sudden changes in wind speed or direction—is particularly dangerous. Downdrafts near thunderstorms can create microbursts: strong downdrafts that spread outward upon hitting the ground. An aircraft encountering a microburst experiences a sudden headwind (increasing lift and airspeed), then a strong downdraft (decreasing altitude), then a tailwind (decreasing airspeed and lift). This combination has caused numerous accidents. Modern aircraft have wind shear detection systems that alert pilots to escape before it's too late.",
          },
          {
            type: "subtitle",
            text: "Ballistics: Artillery and Missiles",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Long-range artillery must account for numerous factors: gravity (obviously), air resistance (major effect over kilometers), wind (horizontal deflection), Coriolis effect (for very long range), Earth's curvature (for extreme ranges), and even temperature and humidity (affecting air density). Modern fire control computers solve complex differential equations in real-time, adjusting aim to hit targets up to 40+ km away with precision.",
          },
          {
            type: "paragraph",
            text: "**Guided missiles** actively adjust trajectory during flight, but they still face the same physics. A cruise missile flying at 250 m/s for 30 minutes covers 450 km—during which crosswinds could deflect it by kilometers without corrections. The guidance system constantly measures position (via GPS or inertial navigation) and adjusts control surfaces to maintain course despite wind, achieving accuracy measured in meters after hundreds of kilometers of flight.",
          },
          {
            type: "subtitle",
            text: "Sports Science: Optimizing Performance",
            level: 1,
          },
          {
            type: "paragraph",
            text: "**Long jump** athletes prefer maximum legal tailwind (2.0 m/s) because it effectively increases their horizontal acceleration during the jump. With 2 m/s tailwind and a typical flight time of 0.9 seconds, the athlete gains about 1.8 meters of extra distance—the difference between a good jump and a record. This is why wind-assisted jumps (> 2 m/s) don't count for records.",
          },
          {
            type: "paragraph",
            text: "**Ski jumping** showcases extreme wind sensitivity. Jumpers weighing 60-70 kg experience air resistance comparable to their weight at speeds of 90-100 km/h. A 1 m/s headwind can reduce distance by 3-5 meters, while a tailwind adds the same. This massive variability is why competitions use 'wind compensation'—points are adjusted based on measured wind conditions to ensure fairness. Jumpers also modify body position to maximize lift, essentially using themselves as an airfoil.",
          },
          {
            type: "callout",
            calloutType: "success",
            title: "Biomechanics: Terminal Velocity in Freefall",
            text: "Human terminal velocity depends entirely on position. Spread-eagle (maximum drag) yields about 55 m/s (200 km/h). Head-down dive (minimum drag) reaches 90+ m/s (320+ km/h). World record holder Felix Baumgartner jumped from 39 km altitude, reaching 377 m/s (1,357 km/h)—faster than sound—because thin air at that altitude provides minimal drag. As he descended into denser air, drag increased and he decelerated before deploying his parachute. His jump required solving the full atmospheric density profile: $\\rho(h) = \\rho_0 e^{-h/H}$, where $H \\approx 8.5$ km is the scale height.",
          },
          {
            type: "subtitle",
            text: "Engineering: Drop Testing and Impact Analysis",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Product engineers use drop testing to verify durability. A phone dropped from 1.5 meters hits the ground at about 5.4 m/s. Internal accelerometers during impact might record 1000+ g's (1000 times Earth's gravity) for a few milliseconds as the phone decelerates. Engineers design shock-absorbing structures, strategically placed rubber bumpers, and reinforced corners to survive these impacts. Understanding the energy involved ($E = mgh$) guides material selection and structural design.",
          },
          {
            type: "paragraph",
            text: "**Packaging design** uses similar principles. Fragile items must survive shipping, which includes drops of 60-90 cm. Foam padding increases impact duration, reducing peak force via the impulse-momentum theorem: $F \\Delta t = \\Delta p$. Longer impact time ($\\Delta t$) means smaller force for the same momentum change. This is why egg cartons use soft materials—they extend the collision time, keeping forces below the egg's breaking point.",
          },
        ],
      },
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Phase 8: Implementation Best Practices and Optimization",
          },
          {
            type: "subtitle",
            text: "Numerical Stability: Avoiding Simulation Explosions",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Physics simulations can become unstable if not carefully designed. **Stiff equations** (where forces change rapidly) require small timesteps or implicit integration methods. For bouncing balls with high restitution and strong wind, explicit Euler integration might cause velocities to grow without bound—energy is artificially added each timestep. This 'simulation explosion' is prevented by using **symplectic integrators** like Semi-Implicit Euler or Velocity Verlet, which naturally conserve energy.",
          },
          {
            type: "paragraph",
            text: "Another source of instability is the **collision response**. If timestep is too large, the ball might penetrate deeply into the floor before correction. Naively reversing velocity could place it above the starting point, potentially adding energy. Solution: (1) Use swept collision detection to find exact collision time. (2) Apply positional correction carefully, moving the ball to the surface rather than beyond it. (3) Check for jitter—if the ball rapidly bounces in place, damp the velocity more aggressively.",
          },
          {
            type: "subtitle",
            text: "Performance Optimization: Simulating Thousands of Balls",
            level: 1,
          },
          {
            type: "paragraph",
            text: "For particle systems with many balls, performance becomes critical. Key optimizations include:",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "**Spatial Hashing**: Divide space into a grid. Only check collisions between balls in the same or adjacent cells. This reduces collision checks from $O(n^2)$ to roughly $O(n)$.",
              "**Sleeping**: Detect when balls have come to rest and pause their physics updates until something disturbs them (like another ball colliding with them).",
              "**Level of Detail**: Apply simplified physics to distant or unimportant balls. Full drag calculations might only apply to balls in view.",
              "**SIMD/GPU Acceleration**: Modern processors can perform the same operation on multiple data simultaneously. Update 4-8 balls in parallel using SIMD instructions, or thousands on GPU using compute shaders.",
              "**Timestep Hierarchies**: Important balls use small timesteps for accuracy; background balls use larger timesteps for speed.",
            ],
          },
          {
            type: "code",
            language: "javascript",
            code: `// Optimized Multi-Ball System with Spatial Hashing
class SpatialGrid {
  constructor(cellSize, width, height) {
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    this.grid = new Map();
  }

  clear() {
    this.grid.clear();
  }

  insert(ball) {
    const cellX = Math.floor(ball.x / this.cellSize);
    const cellY = Math.floor(ball.y / this.cellSize);
    const key = \`\${cellX},\${cellY}\`;
    
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key).push(ball);
  }

  getNearby(ball) {
    const cellX = Math.floor(ball.x / this.cellSize);
    const cellY = Math.floor(ball.y / this.cellSize);
    const nearby = [];

    // Check this cell and 8 adjacent cells
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = \`\${cellX + dx},\${cellY + dy}\`;
        if (this.grid.has(key)) {
          nearby.push(...this.grid.get(key));
        }
      }
    }
    return nearby;
  }
}

class OptimizedBallSystem {
  constructor(canvasWidth, canvasHeight) {
    this.balls = [];
    this.width = canvasWidth;
    this.height = canvasHeight;
    
    // Spatial hashing for efficient collision detection
    this.spatialGrid = new SpatialGrid(50, canvasWidth, canvasHeight);
    
    // Physics settings
    this.gravity = 9.81;
    this.windAcceleration = -2;
    this.timestep = 1/60;
    
    // Performance tracking
    this.frameCount = 0;
    this.collisionChecks = 0;
  }

  addBall(x, y, vx, vy, radius, mass, restitution) {
    this.balls.push(new CompleteBall(x, y, vx, vy, radius, mass, restitution));
  }

  addRandomBalls(count) {
    for (let i = 0; i < count; i++) {
      this.addBall(
        Math.random() * this.width,
        Math.random() * 100 + 50,
        (Math.random() - 0.5) * 10,
        0,
        10 + Math.random() * 20,
        0.5 + Math.random() * 2,
        0.6 + Math.random() * 0.3
      );
    }
  }

  update() {
    this.collisionChecks = 0;
    
    // 1. Update all ball physics
    for (const ball of this.balls) {
      ball.update(this.timestep, this.gravity, this.windAcceleration);
      ball.checkGroundCollision(this.height - 5);
      ball.checkWallCollision(0, this.width);
    }

    // 2. Build spatial grid
    this.spatialGrid.clear();
    for (const ball of this.balls) {
      this.spatialGrid.insert(ball);
    }

    // 3. Check ball-ball collisions (only nearby balls)
    const checkedPairs = new Set();
    
    for (const ball of this.balls) {
      const nearby = this.spatialGrid.getNearby(ball);
      
      for (const other of nearby) {
        if (ball === other) continue;
        
        // Create unique pair ID to avoid checking same pair twice
        const pairId = ball.id < other.id ? 
          \`\${ball.id}-\${other.id}\` : \`\${other.id}-\${ball.id}\`;
        
        if (checkedPairs.has(pairId)) continue;
        checkedPairs.add(pairId);
        
        this.collisionChecks++;
        this.checkBallCollision(ball, other);
      }
    }

    this.frameCount++;
  }

  checkBallCollision(ball1, ball2) {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distSq = dx * dx + dy * dy;
    const minDist = ball1.radius + ball2.radius;
    const minDistSq = minDist * minDist;

    if (distSq < minDistSq && distSq > 0) {
      const dist = Math.sqrt(distSq);
      const nx = dx / dist;
      const ny = dy / dist;

      // Relative velocity
      const dvx = ball2.vx - ball1.vx;
      const dvy = ball2.vy - ball1.vy;
      const dvn = dvx * nx + dvy * ny;

      // Don't resolve if separating
      if (dvn > 0) return;

      // Collision impulse
      const restitution = Math.min(ball1.restitution, ball2.restitution);
      const impulse = -(1 + restitution) * dvn / 
                     (1/ball1.mass + 1/ball2.mass);

      // Apply impulse
      ball1.vx -= impulse * nx / ball1.mass;
      ball1.vy -= impulse * ny / ball1.mass;
      ball2.vx += impulse * nx / ball2.mass;
      ball2.vy += impulse * ny / ball2.mass;

      // Positional correction
      const overlap = minDist - dist;
      const correctionRatio = overlap / (1/ball1.mass + 1/ball2.mass);
      ball1.x -= nx * correctionRatio / ball1.mass;
      ball1.y -= ny * correctionRatio / ball1.mass;
      ball2.x += nx * correctionRatio / ball2.mass;
      ball2.y += ny * correctionRatio / ball2.mass;
    }
  }

  getPerformanceStats() {
    const potentialChecks = (this.balls.length * (this.balls.length - 1)) / 2;
    const reduction = potentialChecks > 0 ? 
      (1 - this.collisionChecks / potentialChecks) * 100 : 0;
    
    return {
      ballCount: this.balls.length,
      collisionChecks: this.collisionChecks,
      potentialChecks: potentialChecks,
      reductionPercent: reduction.toFixed(1),
      activeBalls: this.balls.filter(b => !b.isResting).length
    };
  }

  draw(ctx) {
    // Clear
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw ground
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, this.height - 5, this.width, 5);

    // Draw balls
    for (const ball of this.balls) {
      // Color based on speed
      const speed = Math.sqrt(ball.vx**2 + ball.vy**2);
      const hue = Math.min(240, Math.max(0, 240 - speed * 5));
      ctx.fillStyle = \`hsl(\${hue}, 70%, 50%)\`;
      
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // Resting indicator
      if (ball.isResting) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Draw performance stats
    const stats = this.getPerformanceStats();
    ctx.fillStyle = 'black';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(\`Balls: \${stats.ballCount}\`, 10, 20);
    ctx.fillText(\`Active: \${stats.activeBalls}\`, 10, 35);
    ctx.fillText(\`Collision checks: \${stats.collisionChecks}\`, 10, 50);
    ctx.fillText(\`Without optimization: \${stats.potentialChecks}\`, 10, 65);
    ctx.fillText(\`Reduction: \${stats.reductionPercent}%\`, 10, 80);
  }
}

// Usage
const system = new OptimizedBallSystem(800, 600);
system.addRandomBalls(100); // Add 100 balls
// System automatically handles efficient collision detection`,
          },
          {
            type: "subtitle",
            text: "Debugging Techniques: Visualizing Physics",
            level: 1,
          },
          {
            type: "paragraph",
            text: "When physics behaves unexpectedly, visualization helps diagnose problems. Render velocity vectors as arrows—their length shows speed, direction shows heading. Draw force vectors to see what's pushing the ball. Display energy values (KE, PE, total) to detect spurious energy gain/loss. Show collision normals to verify correct response directions. Create debug modes that slow time to 10% speed, letting you observe behavior frame-by-frame.",
          },
          {
            type: "paragraph",
            text: "**Instrumentation** is equally important. Log statistics: average energy drift per frame, peak velocities, collision counts, time spent in different code sections. Anomalies become obvious—if energy steadily increases 1% per second, you have an integration problem. If collision checks spike in certain regions, your spatial partitioning isn't working. Modern profilers visualize where computation time goes, guiding optimization efforts.",
          },
          {
            type: "callout",
            calloutType: "tip",
            title: "Unit Testing Physics",
            text: "Physics engines benefit enormously from automated testing. Test that a ball dropped from height $h$ reaches velocity $v = \\sqrt{2gh}$ at ground level (within numerical tolerance). Verify energy conservation for elastic collisions. Check that terminal velocity converges to theoretical value. Test edge cases: zero gravity, infinite wind, simultaneous collisions. Regression tests catch when code changes break previously working physics. Some engines even compare against analytical solutions frame-by-frame, ensuring numerical integration stays accurate.",
          },
        ],
      },
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Phase 9: Learning Path and Next Steps",
          },
          {
            type: "subtitle",
            text: "From Beginner to Expert: A Guided Journey",
            level: 1,
          },
          {
            type: "paragraph",
            text: "You've progressed from basic free fall through drag, wind, collisions, and optimization. This represents a complete journey through classical mechanics as applied to computational physics. Here's how to continue deepening your mastery:",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "**Build Interactive Demos**: Create web-based simulations with sliders for gravity, wind, restitution, and drag. Let users drop multiple balls and observe how parameters affect trajectories. Add planet selection (Moon, Mars, Earth, Jupiter) with appropriate gravity. This reinforces understanding through experimentation.",
              "**Implement Advanced Features**: Add spinning balls with Magnus effect. Model realistic atmosphere with altitude-dependent density: $\\rho(h) = \\rho_0 e^{-h/H}$. Create updrafts and downdrafts that vary spatially. Simulate hailstone formation with cycling through cloud layers.",
              "**Study Real Data**: Film actual balls falling and bouncing with high-speed camera. Extract position data using motion tracking software. Compare to your simulation—tune parameters to match reality. This reveals the gap between theory and practice, teaching valuable lessons about modeling assumptions.",
              "**Explore Related Physics**: Investigate fluid dynamics more deeply—how do objects move through water? Study orbital mechanics—satellites are in perpetual free fall. Learn about pendulums—combining oscillation with gravity. Each topic reveals new connections and deepens physical intuition.",
              "**Read Classic Texts**: Landau & Lifshitz's 'Mechanics' provides mathematical depth. Feynman's 'Lectures on Physics' offers intuitive explanations. Taylor's 'Classical Mechanics' bridges theory and computation. These books show how professionals think about physics.",
              "**Contribute to Open Source**: Physics engines like Box2D, Bullet, or PhysX are open source. Read their code to see professional implementations. Contribute bug fixes or optimizations. Engage with the community—learn from experienced developers.",
            ],
          },
          {
            type: "subtitle",
            text: "Career Paths Using This Knowledge",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Mastery of physics simulation opens numerous career opportunities. **Game Development** requires physics programmers who understand both the math and computational efficiency. **Visual Effects** studios need technical directors who can create realistic simulations for films. **Robotics** companies need engineers who can model object interactions for manipulation planning. **Aerospace** firms need specialists in trajectory optimization and atmospheric flight dynamics.",
          },
          {
            type: "paragraph",
            text: "**Scientific Computing** offers research positions developing simulation tools for physics, chemistry, or biology. **Financial Modeling** surprisingly uses similar mathematics—modeling market dynamics shares techniques with physical simulation. **Machine Learning** increasingly incorporates physics—physics-informed neural networks, differentiable simulation, and hybrid models combining data-driven and physics-based approaches.",
          },
          {
            type: "subtitle",
            text: "The Philosophy of Simulation",
            level: 1,
          },
          {
            type: "paragraph",
            text: "A final reflection: All models are approximations. We treat gravity as constant—but it varies with altitude and latitude. We use $F \\propto v^2$ for drag—but real turbulence is far more complex. We assume balls are rigid spheres—but they deform. The art of physics simulation is choosing the right level of approximation: complex enough to capture essential behavior, simple enough to compute efficiently and understand intuitively.",
          },
          {
            type: "paragraph",
            text: "**George Box famously said**: 'All models are wrong, but some are useful.' Our bouncing ball model is wrong—real balls are quantum mechanical objects made of vibrating atoms, falling through a chaotic fluid on a spinning planet in curved spacetime. Yet our simple model is useful—it predicts trajectories accurately enough for games, education, and many engineering applications. Understanding when approximations suffice, and when greater fidelity is needed, is the mark of an expert.",
          },
          {
            type: "callout",
            calloutType: "success",
            title: "Congratulations!",
            text: "You've completed a comprehensive journey through gravitational motion, atmospheric forces, and computational physics. From Galileo's foundational experiments to modern GPU-accelerated simulations, you've seen how simple observations lead to profound mathematical principles and practical applications. The falling ball—humble and ubiquitous—has taught you core concepts that apply across physics and engineering. Use this knowledge well, stay curious, and remember: every expert was once a beginner who refused to give up. Keep learning, keep building, keep exploring!",
          },
        ],
      },
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Appendix: Quick Reference and Formulas",
          },
          {
            type: "subtitle",
            text: "Essential Equations",
            level: 1,
          },
          {
            type: "table",
            columns: ["Concept", "Formula", "Variables"],
            data: [
              {
                Concept: "Free Fall Position",
                Formula: "y = y₀ - ½gt²",
                Variables: "y₀: initial height, g: gravity, t: time",
              },
              {
                Concept: "Free Fall Velocity",
                Formula: "v = √(2gd)",
                Variables: "d: distance fallen, g: gravity",
              },
              {
                Concept: "Drag Force",
                Formula: "Fₐ = ½CₐρAv²",
                Variables:
                  "Cₐ: drag coefficient, ρ: air density, A: area, v: velocity",
              },
              {
                Concept: "Terminal Velocity",
                Formula: "vₜ = √(2mg/CₐρA)",
                Variables:
                  "m: mass, g: gravity, Cₐ: drag coef, ρ: density, A: area",
              },
              {
                Concept: "Kinetic Energy",
                Formula: "KE = ½m(vₓ² + vᵧ²)",
                Variables: "m: mass, vₓ, vᵧ: velocity components",
              },
              {
                Concept: "Potential Energy",
                Formula: "PE = mgh",
                Variables: "m: mass, g: gravity, h: height",
              },
              {
                Concept: "Restitution",
                Formula: "e = -v_after/v_before",
                Variables: "e: coef. of restitution (0-1), v: velocity",
              },
              {
                Concept: "Wind Effect",
                Formula: "x = x₀ + v₀ₓt + ½aᵤᵢₙₐt²",
                Variables: "aᵤᵢₙₐ: wind acceleration, t: time",
              },
            ],
          },
          {
            type: "subtitle",
            text: "Physical Constants",
            level: 1,
          },
          {
            type: "table",
            columns: ["Constant", "Symbol", "Value", "Units"],
            data: [
              {
                Constant: "Earth Gravity",
                Symbol: "g",
                Value: "9.81",
                Units: "m/s²",
              },
              {
                Constant: "Moon Gravity",
                Symbol: "g_moon",
                Value: "1.62",
                Units: "m/s²",
              },
              {
                Constant: "Mars Gravity",
                Symbol: "g_mars",
                Value: "3.71",
                Units: "m/s²",
              },
              {
                Constant: "Jupiter Gravity",
                Symbol: "g_jupiter",
                Value: "24.79",
                Units: "m/s²",
              },
              {
                Constant: "Air Density (sea level)",
                Symbol: "ρ",
                Value: "1.225",
                Units: "kg/m³",
              },
              {
                Constant: "Drag Coef (sphere)",
                Symbol: "Cₐ",
                Value: "0.47",
                Units: "dimensionless",
              },
            ],
          },
          {
            type: "subtitle",
            text: "Common Pitfalls and Solutions",
            level: 1,
          },
          {
            type: "list",
            ordered: false,
            items: [
              "**Tunneling through floors**: Use swept collision detection or smaller timesteps. Check if the line from previous position to current position intersects the boundary.",
              "**Energy gain over time**: Switch from Explicit Euler to Semi-Implicit Euler integration. The order matters: update velocity first, then position.",
              "**Jittery micro-bouncing**: Set a minimum velocity threshold below which the ball is considered at rest. Damp vertical velocity more aggressively when near the ground.",
              "**Wind too strong**: Remember wind in simulations is acceleration (m/s²), not speed (m/s). Typical values: light breeze ≈ 0.5-2 m/s², strong wind ≈ 5-10 m/s².",
              "**Framerate-dependent physics**: Decouple physics timestep from render framerate. Always update physics at fixed intervals (e.g., 1/60 second).",
              "**Incorrect drag direction**: Drag must oppose velocity: use -v/|v| as the direction multiplier. Never apply drag in the coordinate axis directions independently.",
              "**Coordinate confusion**: Remember most canvas/screen coordinates have Y increasing downward, so positive velocity means downward motion. Keep consistent!",
            ],
          },
          {
            type: "callout",
            calloutType: "info",
            title: "Recommended Resources",
            text: "Books: 'Foundations of Physically Based Modeling and Animation' by House & Keyser, 'Game Physics Engine Development' by Millington, 'Physics for Game Developers' by Bourg. Websites: Khan Academy (physics), Brilliant.org (interactive problems), The Coding Train (implementation tutorials). Physics engines: Box2D (2D), Bullet (3D), PhysX (3D). Online simulations: PhET Interactive Simulations (physics.colorado.edu), Algodoo (interactive 2D physics).",
          },
        ],
      },
    ],
  },
};
