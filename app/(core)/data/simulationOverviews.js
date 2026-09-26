// SEO / learning content rendered server-side above the interactive canvas on
// each /simulations/<id> page. Keyed by the URL segment (the `id` produced from
// chapter.link).
//
// - `intro`    : 2–3 plain sentences describing the simulation and the concept.
// - `controls` : the physical quantities a visitor can change (kept in sync by
//                hand with the matching config's INPUT_FIELDS).
// - `concepts` : the physics ideas the simulation demonstrates.
// - `formulas` : ids of Formulary cards (data/formulas/). An entry can also be
//                `{ ref, label?, latex? }` to show the simulation's own form of
//                the formula (vector form, a special case) while still linking
//                the card. Unknown ids fail the build.

/**
 * @typedef {string | { ref: string, label?: string, latex?: string }} FormulaRef
 * @typedef {{ intro: string, controls: string[], concepts: string[],
 *   formulas: FormulaRef[] }} SimulationOverview
 * @type {Record<string, SimulationOverview>}
 */
const simulationOverviews = {
  BouncingBall: {
    intro:
      "A ball moves in a straight line at constant speed until it meets a wall, then rebounds. It is the simplest possible model of motion and collision: velocity, reflection, and — once gravity and restitution are switched on — energy loss on each bounce. Watching one velocity component flip at every wall makes the idea of a vector concrete.",
    controls: [
      "Mass",
      "Ball diameter",
      "Gravity",
      "Coefficient of restitution",
    ],
    concepts: [
      "Velocity as a vector",
      "Uniform (constant-velocity) motion",
      "Elastic reflection off a surface",
      "Coefficient of restitution",
    ],
    formulas: [
      "uniform-motion",
      {
        ref: "coefficient-of-restitution",
        label: "Bounce off a vertical wall",
        latex: "v_x \\rightarrow -e\\,v_x",
      },
    ],
  },

  VectorsOperations: {
    intro:
      "Vectors are the language of physics: force, velocity, acceleration and displacement are all vectors. Drag two vectors in the plane and see their sum, difference and dot product update live, alongside each vector's magnitude and direction. It is a sandbox for building intuition before vectors appear in every later topic.",
    controls: [
      "Vector A magnitude",
      "Vector A angle",
      "Operation (add / subtract / dot)",
      "Scalar multiplier",
    ],
    concepts: [
      "Vector magnitude and direction",
      "Tip-to-tail addition and subtraction",
      "Components along x and y",
      "The dot product and the angle between vectors",
    ],
    formulas: ["vector-magnitude", "vector-sum", "dot-product"],
  },

  BallAcceleration: {
    intro:
      "A ball is pulled toward your cursor: the further away the cursor, the longer the ball accelerates and the faster it is moving when it arrives. This is a hands-on picture of Newton's second law — a constant force produces a constant acceleration, and acceleration is the rate at which velocity changes, not the velocity itself.",
    controls: ["Ball diameter", "Maximum speed", "Acceleration"],
    concepts: [
      "Acceleration as the rate of change of velocity",
      "Newton's second law, F = ma",
      "Uniformly accelerated motion",
      "Why velocity and acceleration can point in different directions",
    ],
    formulas: [
      "newtons-second-law",
      "velocity-constant-acceleration",
      "displacement-constant-acceleration",
    ],
  },

  BallGravity: {
    intro:
      "A ball falls under gravity, bounces off the floor and loses a little energy on every impact. Adjust the gravitational acceleration, the ball's mass, the wind, the friction and the restitution to see how each one changes the motion. It connects free fall, Newton's laws and the coefficient of restitution in a single scene.",
    controls: [
      "Mass",
      "Ball diameter",
      "Gravity",
      "Wind acceleration",
      "Friction coefficient",
      "Coefficient of restitution",
    ],
    concepts: [
      "Free fall and gravitational acceleration g",
      "Weight versus mass",
      "Coefficient of restitution",
      "Kinetic and gravitational potential energy",
    ],
    formulas: [
      "weight",
      "free-fall-speed",
      {
        ref: "coefficient-of-restitution",
        label: "Restitution at a bounce",
        latex: "e = \\dfrac{v_{\\text{after}}}{v_{\\text{before}}}",
      },
    ],
  },

  SpringConnection: {
    intro:
      "A mass hangs from a spring and oscillates. The spring pulls back with a force proportional to how far it is stretched (Hooke's law), and that linear restoring force is exactly what produces simple harmonic motion. Change the mass, the spring constant or the damping and watch the period and decay respond.",
    controls: [
      "Bob mass",
      "Spring constant",
      "Damping coefficient",
      "Rest length",
      "Gravity",
    ],
    concepts: [
      "Hooke's law",
      "Simple harmonic motion",
      "Angular frequency, period and frequency",
      "Damped oscillation",
    ],
    formulas: ["hookes-law", "spring-angular-frequency", "spring-period"],
  },

  SimplePendulum: {
    intro:
      "A bob on a string swings back and forth about its lowest point. For small swings the motion is simple harmonic and the period depends only on the string length and gravity — not on the mass, and only weakly on the amplitude, the property Galileo called isochronism. Increase the initial angle to see the small-angle approximation break down.",
    controls: ["Length", "Mass", "Gravity", "Damping", "Initial angle"],
    concepts: [
      "Restoring torque of gravity",
      "Small-angle approximation, sin θ ≈ θ",
      "Isochronism for small amplitudes",
      "Energy conservation between the top and bottom of the swing",
    ],
    formulas: [
      "pendulum-period",
      "pendulum-equation-of-motion",
      "pendulum-speed-bottom",
    ],
  },

  ParabolicMotion: {
    intro:
      "Launch a projectile and watch its path. With gravity as the only force, horizontal and vertical motion are independent: the horizontal velocity stays constant while the vertical velocity changes at g, and the combination traces a parabola. Add drag or wind to see how the ideal trajectory deforms.",
    controls: [
      "Launch speed",
      "Launch angle",
      "Start height",
      "Gravity",
      "Quadratic drag",
      "Wind acceleration",
    ],
    concepts: [
      "Independence of horizontal and vertical motion",
      "Parabolic trajectory",
      "Range, maximum height and time of flight",
      "Effect of launch angle (45° for maximum range in a vacuum)",
    ],
    formulas: [
      "projectile-trajectory",
      "projectile-range",
      "projectile-max-height",
    ],
  },

  InclinedPlane: {
    intro:
      "A block rests on a ramp. Gravity still points straight down, but the surface splits it into a component along the slope that drives sliding and a component into the slope that sets the normal force — and therefore the maximum friction. Change the angle to find the point where static friction can no longer hold the block.",
    controls: [
      "Mass",
      "Plane angle",
      "Static friction μₛ",
      "Kinetic friction μₖ",
      "Applied force",
      "Gravity",
    ],
    concepts: [
      "Resolving weight into components",
      "Normal force as a constraint",
      "Static versus kinetic friction",
      "The angle of repose, tan θ = μₛ",
    ],
    formulas: [
      "incline-parallel-force",
      "incline-normal-force",
      {
        ref: "static-friction-max",
        latex: "f_{s,\\max} = \\mu_s N = \\mu_s m g \\cos\\theta",
      },
    ],
  },

  CircularMotion: {
    intro:
      "An object moves around a circle at constant speed. Its velocity is constant in size but always changing direction, so it is always accelerating — toward the centre. That centripetal acceleration needs a real inward force; remove it and the object flies off along the tangent, not outward.",
    controls: ["Radius", "Tangential speed", "Mass", "Ball diameter"],
    concepts: [
      "Uniform circular motion",
      "Centripetal acceleration points to the centre",
      "Centripetal force comes from a real force (tension, gravity, friction)",
      "Angular velocity and period",
    ],
    formulas: [
      "centripetal-acceleration",
      "centripetal-force",
      "circular-period",
    ],
  },

  ThreeBody: {
    intro:
      "Three masses attract each other through Newtonian gravity. Unlike the two-body problem, this system has no general closed-form solution: the motion is chaotic, and tiny changes in the starting positions or velocities lead to completely different futures. The simulation integrates the equations numerically with small sub-steps to stay accurate through close approaches.",
    controls: [
      "Starting configuration",
      "Body mass",
      "Gravitational constant",
      "Body size",
      "Randomness",
    ],
    concepts: [
      "Newton's law of universal gravitation",
      "Superposition of forces from multiple bodies",
      "Sensitivity to initial conditions (deterministic chaos)",
      "Numerical integration and conservation checks",
    ],
    formulas: [
      {
        ref: "newtons-law-of-gravitation",
        label: "Gravitational force between two bodies",
        latex:
          "\\vec{F}_{ij} = -\\,G\\,\\dfrac{m_i m_j}{|\\vec{r}_{ij}|^{2}}\\,\\hat{r}_{ij}",
      },
      "gravitational-superposition",
    ],
  },

  HorizontalSpring: {
    intro:
      "A mass on a frictionless horizontal surface is tied to a wall by a spring. With gravity removed from the direction of motion, the spring force alone governs the oscillation — the cleanest possible demonstration of Hooke's law and simple harmonic motion. Drag the mass to set an amplitude and release it.",
    controls: [
      "Bob mass",
      "Spring constant",
      "Damping coefficient",
      "Rest length",
    ],
    concepts: [
      "Hooke's law on a horizontal axis",
      "Simple harmonic motion",
      "Amplitude, period and phase",
      "Total mechanical energy stays constant without friction",
    ],
    formulas: [
      "hookes-law",
      "shm-position",
      {
        ref: "elastic-potential-energy",
        label: "Total energy",
        latex: "E = \\tfrac{1}{2} k A^{2}",
      },
    ],
  },

  DoublePendulum: {
    intro:
      "A second pendulum hangs from the end of the first. The system has just two degrees of freedom, yet its motion is famously chaotic: run it twice from almost-identical starts and the arms soon diverge. This simulation integrates the exact Lagrangian equations for the two angles rather than using a constraint solver, so the chaos is physical and not a numerical artefact.",
    controls: [
      "Length 1 and 2",
      "Mass 1 and 2",
      "Gravity",
      "Damping",
      "Initial angles",
    ],
    concepts: [
      "Coupled oscillators",
      "Degrees of freedom and generalized coordinates",
      "Deterministic chaos and sensitivity to initial conditions",
      "Energy conservation in the absence of damping",
    ],
    formulas: ["lagrangian", "euler-lagrange"],
  },

  CollisionSimulation: {
    intro:
      "Two bodies move along a line and collide. Momentum is always conserved in the collision; kinetic energy is conserved only if the collision is perfectly elastic. Set the masses, the initial velocities and the restitution, then read off the momentum and kinetic energy before and after to see which quantities survive.",
    controls: [
      "Ball 1 mass and velocity",
      "Ball 2 mass and velocity",
      "Coefficient of restitution",
    ],
    concepts: [
      "Conservation of linear momentum",
      "Elastic versus inelastic collisions",
      "Coefficient of restitution",
      "Centre-of-mass frame",
    ],
    formulas: [
      "momentum-conservation",
      {
        ref: "elastic-collision",
        label: "Elastic collision, final velocity of body 1",
        latex:
          "v_1 = \\dfrac{m_1 - m_2}{m_1 + m_2}\\,u_1 + \\dfrac{2 m_2}{m_1 + m_2}\\,u_2",
      },
      "coefficient-of-restitution",
    ],
  },

  test: {
    intro:
      "A deliberately heavy scene that spawns hundreds of interacting bodies at once. It is a benchmark for the rendering and physics loop, not a physics lesson — use it to see how many bodies your device can integrate and draw while holding a smooth frame rate.",
    controls: ["Number of bodies", "Gravity"],
    concepts: [
      "Fixed-timestep simulation loops",
      "Frame rate and rendering budget",
      "Broad-phase collision cost as body count grows",
    ],
    formulas: [],
  },

  PiCollisions: {
    intro:
      "Two blocks slide on a frictionless floor with a wall on one side. When the left block is heavier than the right by a factor of 100ᴺ, the total number of collisions equals the first N+1 digits of π. It is a startling link between elastic-collision conservation laws and geometry — the collisions trace out an angle on a circle in velocity space.",
    controls: [
      "Mass of small block",
      "Mass of large block",
      "Initial velocities",
      "Block sizes",
    ],
    concepts: [
      "Perfectly elastic collisions in one dimension",
      "Conservation of momentum and kinetic energy",
      "Configuration/velocity space and rotations",
      "Why the count is exact (no collision may be missed)",
    ],
    formulas: ["pi-collision-count", "momentum-conservation", "kinetic-energy"],
  },

  TrigonometricCircle: {
    intro:
      "Drag the angle θ around the unit circle and watch every trigonometric function appear as a real length: sine and cosine as the coordinates of the point, tangent on the vertical line x = 1, and their reciprocals as related segments. A generalized sine wave A·sin(ωθ + φ) plots alongside, tying the circle to the graph.",
    controls: [
      "Function shown",
      "Rotation speed",
      "Initial angle",
      "Amplitude A",
      "Frequency ω",
      "Phase φ",
    ],
    concepts: [
      "The unit circle definition of sine and cosine",
      "Tangent, cotangent, secant and cosecant as segments",
      "Amplitude, angular frequency and phase of a sine wave",
      "Inverse trigonometric functions",
    ],
    formulas: ["pythagorean-identity", "tangent-ratio", "sine-wave"],
  },

  RayTracing: {
    intro:
      "A ray tracer makes an image by following rays of light backwards: from the camera, through each pixel, into the scene. At the first surface a ray hits, the laws of geometric optics decide the colour — how squarely the surface faces the light, how far away the light is, whether something casts a shadow, and what the surface reflects. Click any pixel to follow its ray and see every equation with its live numbers.",
    controls: [
      "Camera, sphere and light positions (drag them in the diagram)",
      "Field of view",
      "Sphere radius",
      "Light intensity I₀",
      "Ambient, diffuse and specular coefficients",
      "Shininess n and reflectivity ρ",
    ],
    concepts: [
      "Rays as the model of geometric optics",
      "Ray–sphere intersection and the discriminant",
      "Lambert's cosine law",
      "The inverse-square law for a point source",
      "Shadows as blocked straight-line paths",
      "The law of reflection and specular highlights",
    ],
    formulas: [
      "ray-equation",
      "ray-sphere-intersection",
      "inverse-square-law",
      "lamberts-cosine-law",
      "law-of-reflection",
    ],
  },

  KirchhoffCircuit: {
    intro:
      "Four DC circuits — a single loop, three resistors in series, three in parallel, and a two-loop network driven by two cells — solved live by Kirchhoff's laws. Charge carriers drift along each wire at a speed set by that branch's current, resistors glow with the power they dissipate, and the readout walks each loop term by term so you can watch the voltages add up to exactly zero.",
    controls: [
      "Circuit layout",
      "EMF of each cell",
      "Internal resistance of each cell",
      "The three resistances",
    ],
    concepts: [
      "Kirchhoff's current law (junction rule) as charge conservation",
      "Kirchhoff's voltage law (loop rule) as energy conservation",
      "Ohm's law and equivalent resistance in series and parallel",
      "EMF, internal resistance and terminal voltage",
      "Power delivered by a cell and dissipated as heat",
      "Sign conventions: a negative branch current means a cell is charging",
    ],
    formulas: [
      {
        label: "Ohm's law",
        latex: "V = IR",
      },
      {
        label: "Junction rule (KCL)",
        latex: "\\sum_{\\text{into node}} I = \\sum_{\\text{out of node}} I",
      },
      {
        label: "Loop rule (KVL)",
        latex: "\\sum_{\\text{closed loop}} \\Delta V = 0",
      },
      {
        label: "Current in a branch of EMF E and resistance R",
        latex: "I = \\dfrac{V_{\\text{from}} - V_{\\text{to}} + E}{R}",
      },
      {
        label: "Terminal voltage of a real cell",
        latex: "V_{\\text{term}} = E - I r",
      },
      {
        label: "Power dissipated in a resistance",
        latex: "P = I^{2} R",
      },
    ],
  },
};

export default simulationOverviews;
