import { TAGS } from "./tags";

export default [
   {
      id:1,
      name:"Bouncing Ball",
      desc:"Simulation of the ball bouncing off the walls.",
      link:"/simulations/BouncingBall",
      tags:[
         TAGS.EASY,
         TAGS.PHYSICS,
         TAGS.COLLISION,
         TAGS.ANIMATIONS
      ],

      theory:{
         sections:[
            {
               title:"Introduction",
               blocks:[
                  {
                        type:"paragraph",                        text:"This section demonstrates the physics behind the Bouncing Ball simulation."
                  },
               ]
            },
            {
               title:"Concept of Motion",
               blocks:[
                  {
                     type:"paragraph",
                     text:"This ball moves in a [2-D] two-dimensional space with horizontal and vertical velocity components. The direction of motion is determined by the sign of these components."
                  },
                  {
                     type:"list",
                     ordered:true,
                     items:[
                        "Velocity in the X-axis (vx): Determines horizontal movement. Positive values move right, negative values move left.",
                        "Velocity in the Y-axis (vy): Determines vertical movement. Positive values move down, negative values move up.",
                        "Combined Motion: The overall movement is a combination of both components, resulting in diagonal trajectories when both vx and vy are non-zero. In short, Each frame updates the ball's position using both the velocities."
                     ]
                  }
               ]
            },
            {
               title:"Understanding Collisions",
               blocks:[
                  {
                     type:"list",
                     ordered:false,
                     items:[
                        "When the ball reaches the left or right boundary, the X velocity reverses.",
                        "When the ball reaches the top or bottom boundary, the Y velocity reverses.",
                        "This reversal simulates a bounce effect [Elastic collision], changing the ball's direction while maintaining its speed."
                     ]
                  },
                  {
                     type:"formula",
                     latex:"v_{after} = -v_{before}"
                  },
                  {
                     type:"note",
                     text:"In a perfectly elastic collision, no energy is lost, and the ball retains its speed after bouncing."
                  }
               ]
            },
            {
               title:"Code Example",
               blocks:[
                  {
                     type:"code",
                     language:"javascript",
                     code:`let x = 100, y = 100;
let vx = 2.5, vy = 2;

function draw(){
  x += vx;
  y += vy;

// Check for collision with walls
  if(x <= 0 || x >= canvasWidth) {
    vx = -vx; // Reverse X velocity
  }
   if(y <= 0 || y >= canvasHeight) {
      vy = -vy; // Reverse Y velocity
   }
}`
                  }
               ]
            },
            {
               title:"Parameters Overview",
               blocks:[
                  {
                     type:"table",
                     columns:[
                        "Parameter",
                        "Description",
                        "Example Value"
                     ],
                     data:[
                        {
                           "Parameter":"Velocity X",
                           "Description":"Controls the ball's speed in the horizontal direction.",
                           "Example Value":"2.5"
                        },
                        {
                           "Parameter":"Velocity Y",
                           "Description":"Controls the ball's speed in the vertical direction.",
                           "Example Value":"2.0"
                        },
                        {
                           "Parameter":"Ball Size",
                           "Description":"Defines the radius or diameter of the ball.",
                           "Example Value":"48"
                        }
                     ]
                  }
               ]
            },
            {
               title:"Tips and Tricks",
               blocks:[
                  {
                     type:"callout",
                     calloutType:"info",
                     title:"Did you know",
                     text:"This simulation is a basic form of motion physics used in most 2D games and animation engines."
                  },
                  {
                     type:"callout",
                     calloutType:"warning",
                     title:"Common Mistake",
                     text:"Forgetting to reverse the velocity component upon collision will result in the ball getting stuck at the wall."
                  },
                  {
                     type:"callout",
                     calloutType:"tip",
                     title:"Try It Yourself!",
                     text:"Experiment by changing velocity values or ball size to see how motion patterns change."
                  },
                  {
                     type:"callout",
                     calloutType:"success",
                     title:"Success!",
                     text:"You've learned the basics of 2D motion and collision handling!"
                  }
               ]
            }
         ]
      }
   },
   {
      id:2,
      name:"Vector Operations",
      desc:"Vector Operations in real time.",
      link:"/simulations/VectorsOperations",
      tags:[
         TAGS.EASY, 
         TAGS.MATH, 
         TAGS.VECTORS, 
         TAGS.PHYSICS
      ],
      theory:{
         sections:[
            {
               title:"What is a Vector?",
               blocks:[
                  {
                     type:"paragraph",
                     text:"In a 2D space vectors are described with 3 different values, module (length), direction (angle), and orientation (sense). Given the angle and the module you can calculate the components on each axis (x,y). they can be calculated multiplying the module by the cosine and the sine of the angle. "
                  }
               ]
            },
            {
               title:"Purpose",
               blocks:[
                  {
                     type:"paragraph",
                     text:"This section describes basic vector operations used in 2D simulations: addition, subtraction, scaling, normalization, dot product, and cross product (2D - pseudoscalar)."
                  }
               ]
            },
            {
               title:"Fundamental Operations",
               blocks:[
                  {
                     type:"subheading",
                     text:"Addition and subtraction"
                  },
                  {
                     type:"paragraph",
                     text:"During an addition or subtraction of 2 vectors, the resultant vector is given by the sum or the difference of each component. After that, the vector can be converted back to module with the pythagorean theorem and angle drawing it on a Cartesian Plane."
                  },
                  {
                     type:"subheading",
                     text:"Parallelogram Addition"
                  },
                  {
                     type:"paragraph",
                     text:"The addition can be done without components with the parallelogram method, where two vectors originate from the same point, they can be used as two sides of a parallelogram, of which the diagonal originating from the same point of the two vectors, is the resultant vector. "                 
                  },
                  {
                     type:"subheading",
                     text:"Triangle Addition (as shown in the simulation)"
                  },
                  {
                     type:"paragraph",
                     text:"In the triangle method, the second vector is drawn starting from the end of the first vector. The resultant vector is drawn from the origin of the first vector to the end of the second vector."
                  },
                  {
                     type:"subheading",
                     text:"Parallelogram Subtraction (as shown in the simulation)"
                  },
                  {
                     type:"paragraph",
                     text:"In subtraction, using the parallelogram rule we can either add the opposite of the vector to be subtracted or use the other diagonal of the parallelogram as the resultant vector from the subtraction."
                  },
                  {
                     type:"subheading",
                     text:"Multiplication by a Scalar"
                  },
                  {
                     type:"paragraph",
                     text:"The multiplication of a vector by a scalar is done by multiplying the module of the vector by the scalar, while the angle remains unchanged. If the scalar is negative, the angle changes by 180 degrees (the vector points in the opposite direction)."
                  }
               ]
            }
         ]
      }
   },
   {
      id:3,
      name:"Ball Acceleration",
      desc:"Ball accelerating to the mouse direction.",
      link:"/simulations/BallAcceleration",
      tags:[
         TAGS.MEDIUM,
         TAGS.PHYSICS,
         TAGS.ACCELERATION
      ],

      theory:{
         sections:[
            {
               title:"Introduction",
               blocks:[
                  {
                        type:"paragraph",
                        text:"This simulation demonstrates the physics behind the Ball Acceleration towards the target - in this scenario, the mouse pointer."
                  },
               ]
            },
            {
               title:"Concept of Acceleration",
               blocks:[
                  {
                     type:"paragraph",
                     text:"Acceleration is the rate of change of velocity of an object. Unlike the bouncing ball, which moves at a constant speed or velocity, this ball gradually increases its speed towards the mouse position. The closer it gets, the smaller the acceleration becomes."
                  },
                  {
                     type:"list",
                     ordered:true,
                     items:[
                        "Velocity determines how fast the ball is moving per frame.",
                        "Acceleration changes the velocity over time, allowing smooth movement towards the target.",
                        "DIrection is determined by the vector from the ball to the mouse position."
                     ]
                  }
               ]
            },
            {
               title:"Physics Behind It",
               blocks:[
                  {
                     type:"list",
                     ordered:false,
                     items:[
                        "The ball calculates the direction vector between its current position and the mouse position.",
                        "This direction is normalized (made unit length).",
                        "Acceleration is applied along that direction to update velocity"
                     ]
                  },
                  {
                     type:"formula",
                     latex:"\\vec{v} = \\vec{a} \\quad\\text{where}\\quad \\vec{a} = (\\text{mouse} - \\times a_{rate})"
                  },
                  {
                     type:"note",
                     text:"The ball stops accelerating when it reaches the defined maximum speed (Max speed)"
                  }
               ]
            },
            {
               title:"Code Example",
               blocks:[
                  {
                     type:"code",
                     language:"javascript",
                     code:`let x = 100, y = 100;
let vx = 0, vy = 0;
let ax = 0, ay = 0;
const a_rate = 0.1; // Acceleration rate
const maxSpeed = 5; // Maximum speed

function draw(mouseX, mouseY){
   // Calculate direction to mouse
   let dirX = mouseX - x;
   let dirY = mouseY - y;
   let length = Math.sqrt(dirX * dirX + dirY * dirY);

   // Normalize direction and apply acceleration
   ax = (dirX / length) * a_rate;
   ay = (dirY / length) * a_rate;
  vx += ax;
  vy += ay;

   // Limit speed to maxSpeed (limiting velocity to max speed)
   let speed = Math.sqrt(vx * vx + vy * vy);
   if(speed > maxSpeed) {
      vx = (vx / speed) * maxSpeed;
      vy = (vy / speed) * maxSpeed;
   }

   // Update position
   x += vx;
   y += vy;
}`
                  }
               ]
            },
            {
               title:"Parameters Overview",
               blocks:[
                  {
                     type:"table",
                     columns:[
                        "Parameter",
                        "Description",
                        "Example Value"
                     ],
                     data:[
                        {
                           "Parameter":"Ball Size",
                           "Description":"Determines the visual size of moving ball.",
                           "Example Value":"48"
                        },
                        {
                           "Parameter":"Max Speed",
                           "Description":"Sets the highest velocity the ball can reach.",
                           "Example Value":"5"
                        },
                        {
                           "Parameter":"Acceleration Rate",
                           "Description":"Controls how quickly the ball accelerates towards the mouse.",
                           "Example Value":"0.1"
                        }
                     ]
                  }
               ]
            },
            {
               title:"Tips and Tricks",
               blocks:[
                  {
                     type:"callout",
                     calloutType:"info",
                     title:"Fun Fact",
                     text:"This concept of acceleration towards a target is widely used in game development for character movement and AI behavior like homing missiles or character following certain behavior in games."
                  },
                  {
                     type:"callout",
                     calloutType:"warning",
                     title:"Attention!",
                     text:"If acceleration rate is too high, the ball may overshoot the target and oscillate around it instead of smoothly approaching."
                  },
                  {
                     type:"callout",
                     calloutType:"tip",
                     title:"Try This!",
                     text:"Experiment with different acceleration rates and max speeds to see how they affect the ball's movement dynamics."
                  },
                  {
                     type:"callout",
                     calloutType:"success",
                     title:"You Did It!",
                     text:"You now understand how acceleration and direction combine to create realistic motion physics."
                  }
               ]
            }
         ]
      }
   },
   {
      id:4,
      name:"Ball Gravity",
      desc:"Ball fall and bounce on the ground.",
      link:"/simulations/BallGravity",
      tags:[
         TAGS.MEDIUM,
         TAGS.COLLISION,
         TAGS.PHYSICS,
         TAGS.GRAVITY
      ],

      theory:{
         sections:[
            {
               title:"Introduction",
               blocks:[
                  {
                        type:"paragraph",
                        text:"This simulation shows how the gravity acts on a ball, making it fall and bounce when it hits the ground. It's a classic demonstration of the motion under uniform acceleration and energy transformation."
                  },
               ]
            },
            {
               title:"Concept of Gravity and Free Fall",
               blocks:[
                  {
                     type:"paragraph",
                     text:"Gravity is a natural force that pulls the objects towards the center of the Earth. In this simulation, the ball experiences a constant downward acceleration due to the gravity, causing it to speed up as it falls. The rate of acceleration depends on the gravity type selected (e.g., Earth, Moon, Jupiter or Mars)."
                  },
                  {
                     type:"list",
                     ordered:true,
                     items:[
                        "Objects in free fall accelerate at approximately 9.81 m/s² on Earth.",
                        "When the ball hits the ground, it bounces due to the elastic collision principles.",
                        "Each bounces loses some energy, resulting in lower heights with each subsequent bounce."
                     ]
                  }
               ]
            },
            {
               title:"Physics Behind It",
               blocks:[
                  {
                     type:"list",
                     ordered:false,
                     items:[
                        "The gravitational acceleration (g) acts continuously on the ball: thus, increasing its downward velocity over time.",
                        "When the ball hits the surface, its velocity reverses the direction and reduces in magnitude due to the energy loss during the bounce.",
                        "Wind and friction parameters can slightly affect horizontal motion, simulating air resistance."
                     ]
                  },
                  {
                     type:"formula",
                     latex:"h = \\frac{1}{2} g t^2, \\quad v = u + g t, \\quad E_k = \\frac{1}{2} m v^2"
                  },
                  {
                     type:"note",
                     text:"The ball's total energy is a sum of kinetic and potential energy, which transforms during the fall and bounce."
                  }
               ]
            },
            {
               title:"Code Example",
               blocks:[
                  {
                     type:"code",
                     language:"javascript",
                     code:`let x = 100, y = 100;

let vy = 0;
const gravity = 0.98; // Gravitational acceleration
const bounceFactor = 0.7; // Energy loss on bounce
let ground = 400; // Ground level

function draw(){
   vy += gravity; // Apply gravity to vertical velocity
   y += vy; // Update position

   // Check for collision with ground
   if(y >= ground) {
      y = ground; // Reset position to ground level
      vy = -vy * bounceFactor; // Reverse and reduce velocity for bounce
   }
      //Draw the ball at (x, y)
      circle(200, y, 40);
}`
                  }
               ]
            },
            {
               title:"Simulation Parameters",
               blocks:[
                  {
                     type:"table",
                     columns:[
                        "Parameter",
                        "Description",
                        "Example Value"
                     ],
                     data:[
                        {
                           "Parameter":"Ball Size (px)",
                           "Description":"Determines the diameter of the ball in pixels.",
                           "Example Value":"40"
                        },
                        {
                           "Parameter":"Mass (kg)",
                           "Description":"Defines the weight of the ball, affecting its momentum and kinetic energy.",
                           "Example Value":"5"
                        },
                        {
                           "Parameter":"Friction Coefficient (μ)",
                           "Description":"Reduces the motion after bouncing to simulate air resistance.",
                           "Example Value":"0"
                        },
                        {
                           "Parameter":"Wind (m/s²)",
                           "Description":"Applies a horizontal acceleration simulating air movement.",
                           "Example Value":"1"
                        },
                        {
                           "Parameter":"Gravity Type",
                           "Description":"Selects the gravity strength based on different celestial bodies like Earth, Moon, Jupiter, or Mars.",
                           "Example Value":"Earth (9.81 m/s²)"
                        }
                     ]
                  }
               ]
            },
            {
               title:"Tips & Tricks",
               blocks:[
                  {
                     type:"callout",
                     calloutType:"info",
                     title:"Did you know",
                     text:"Gravity is the sane force that keeps planets orbiting the sum and also, this simulation mimics the universal attraction on a smaller scale."
                  },
                  {
                     type:"callout",
                     calloutType:"warning",
                     title:"Attention!",
                     text:"If the bounce factor is set too high (>1), the ball may gain energy unrealistically and fly off-screen."
                  },
                  {
                     type:"callout",
                     calloutType:"tip",
                     title:"Try It Yourself!",
                     text:"Experiment by changing the gravity type and bounce factor to see how they affect the ball's motion."
                  },
                  {
                     type:"callout",
                     calloutType:"success",
                     title:"Concept Mastered!",
                     text:"You've learned the gravitational acceleration, collisions, and energy conservation work together in real-world physics"
                  }
               ]
            }
         ]
      }
   },
   {
      id:5,
      name:"Spring Connection",
      desc:"A Ball connected to a string.",
      link:"/simulations/SpringConnection",
      tags:[
         TAGS.ADVANCED,
         TAGS.PHYSICS,
         TAGS.OSCILLATIONS,
         TAGS.SPRINGS
      ],
      
      theory:{
         sections:[
            {
               title:"Introduction",
               blocks:[
                  {
                        type:"paragraph",
                        text:"This simulation demonstrates spring-mass oscillations and is currently being expanded."
                  },
               ]
            },
            {
               title:"Understanding the spring-mass system",
               blocks:[
                  {
                     type:"paragraph",
                     text:"A spring connection simulation models how a mass behaves when attached to a spring under the influence of gravity. The restoring force generated by the spring obeys Hook's Law, which states that the force exerted by the spring is proportional to the displacement from its rest length."
                  },
                  {
                     type:"list",
                     ordered:true,
                     items:[
                        "At equilibrium, the spring exerts a force that balances the weight of the mass.",
                        "When displaced from equilibrium, the spring generates a restoring force that pulls the mass back towards the equilibrium position.",
                        "The mass oscillates around the equilibrium position due to the interplay between the spring force and gravitational force."
                     ]
                  }
               ]
            },
            {
               title:"Key Concepts and Formulas",
               blocks:[
                  {
                     type:"list",
                     ordered:false,
                     items:[
                        "Hooke's Law: F = -k x, where F is the restoring force, k is the spring constant, and x is the displacement from equilibrium.",
                        "Potential Energy in the Spring: U = 1/2 k x^2, representing the energy stored in the spring when compressed or stretched.",
                        "Kinetic Energy of the Mass: K = 1/2 m v^2, representing the energy of motion of the mass.",
                        "Total Mechanical Energy: E = K + U, which remains constant in the absence of non-conservative forces like friction.",
                        "Simple Harmonic Motion: The mass-spring system exhibits simple harmonic motion, characterized by sinusoidal oscillations around the equilibrium position.",
                        "Newton's Second Law: F = m a, where F is the net force acting on the mass, m is its mass, and a is its acceleration."
                     ]
                  },
                  {
                     type:"formula",
                     latex:"F_s = -k(x - L_0)"
                  },
                  {
                     type:"formula",
                     latex:"m a = -k (x - L_0) - b v + m g"
                  },
                  {
                     type:"note",
                     text:"Here, k is the spring constant, b is the damping coefficient, L₀ is the natural length of the spring, m is the mass, g is the acceleration due to gravity, x is the position of the mass, v is its velocity, and a is its acceleration."
                  }
               ]
            },
            {
               title:"Code Representation",
               blocks:[
                  {
                     type:"code",
                     language:"javascript",
                     code:`

// Simplifies spring-mass system
let y = 1; // Position (m)
let vy = 0; // Velocity (m/s)
const k = 100; // Spring constant (N/m)
const L0 = 0.5; // Natural length of the spring (m)
const m = 10; // Mass (kg)
const g = 9.81; // Gravitational acceleration (m/s²)
const b = 1; // Damping coefficient (kg/s)

function draw(dt){
  let Fspring = -k * (y - L0); // Spring force
   let Fgravity = m * g; // Gravitational force
   let Fdamping = -b * vy; // Damping force
   let Fnet = Fspring + Fgravity + Fdamping; // Net force
   let ay = Fnet / m; // Acceleration
   vy += ay * dt; // Update velocity
   y += vy * dt; // Update position
}`
                  }
               ]
            },
            {
               title:"Simulation Parameters",
               blocks:[
                  {
                     type:"table",
                     columns:[
                        "Parameter",
                        "Symbol",
                        "Description"
                     ],
                     data:[
                        {
                           "Parameter":"Mass",
                           "Symbol":"m",
                           "Description":"Mass of the bob attached to the spring (kg)."
                        },
                        {
                           "Parameter":"Spring Constant",
                           "Symbol":"k",
                           "Description":"Stiffness of the spring, determining the restoring force (N/m)."
                        },
                        {
                           "Parameter":"Rest length",
                           "Symbol":"L₀",
                           "Description":"Length of the spring when no forces are applied (equilibrium) (m)."
                        },
                        {
                           "Parameter":"Damping Coefficient",
                           "Symbol":"b",
                           "Description":"Resists motion, simulating energy loss due to friction or air resistance (kg/s)."
                        }
                     ]
                  }
               ]
            },
            {
               title:"Helpful Tips",
               blocks:[
                  {
                     type:"callout",
                     calloutType:"info",
                     title:"Real-World Application",
                     text:"This system models a weight hanging from a ceiling by a spring, demonstrating oscillatory motion and energy conservation."
                  },
                  {
                     type:"callout",
                     calloutType:"warning",
                     title:"Attention!",
                     text:"If damping is too low, the mass may oscillate indefinitely; if too high, it may not oscillate at all. The system becomes overdamped."
                  },
                  {
                     type:"callout",
                     calloutType:"tip",
                     title:"Smart Tip!",
                     text:"Try varying different spring constants and masses to see how they affect oscillation frequency and amplitude."
                  },
                  {
                     type:"callout",
                     calloutType:"success",
                     title:"Success!",
                     text:"You've learned how restoring force, damping, and energy conservation govern spring-mass oscillations."
                  }
               ]
            }
         ]
      }
   },
      {
      id:6,
      name:"Simple Pendulum",
      desc:"A Simple Pendulum system.",
      link:"/simulations/SimplePendulum",
      tags:[
         TAGS.MEDIUM,
         TAGS.OSCILLATIONS,
         TAGS.ENERGY,
         TAGS.PHYSICS
      ],
      theory:{
         sections:[
      {
         title:"Introduction",
         blocks:[
            {
               type:"paragraph",
               text:"A simple pendulum is formed by a small bob of mass m suspended from a fixed point by a light, inextensible string of length L. When displaced from equilibrium and released, the bob oscillates under the influence of gravity."
            },
            {
               type:"formula",
               latex:"T = 2\\pi \\sqrt{\\tfrac{L}{g}}"
            },
            {
               type:"paragraph",
               text:"Here, T is the time period of one oscillation, L is the length of the pendulum, and g is the acceleration due to gravity."
            }
         ]
      },
      {
         title:"Forces Involved",
         blocks:[
            {
               type:"subheading",
               text:"Gravitational Force"
            },
            {
               type:"paragraph",
               text:"The bob experiences its weight acting vertically downward."
            },
            {
               type:"formula",
               latex:"F_{g} = m g"
            },
            {
               type:"paragraph",
               text:"Here, Fg is the gravitational force (weight), m is the mass of the bob, and g is the acceleration due to gravity."
            },
            {
               type:"subheading",
               text:"Tension"
            },
            {
               type:"paragraph",
               text:"The string provides a tension force directed along its length, balancing part of the weight and keeping the bob constrained to move along a circular arc."
            },
            {
               type:"formula",
               latex:"T - m g \\cos\\theta = m \\tfrac{v^2}{L}"
            },
            {
               type:"paragraph",
               text:"Here, T is the tension in the string, m is the bob’s mass, g is acceleration due to gravity, θ is the angular displacement, v is the bob’s velocity, and L is the string length."
            },
            {
               type:"subheading",
               text:"Restoring Force"
            },
            {
               type:"paragraph",
               text:"The tangential component of gravity acts as the restoring force, pulling the bob back to its mean position."
            },
            {
               type:"formula",
               latex:"F_{restoring} = - m g \\sin\\theta"
            },
            {
               type:"paragraph",
               text:"Here, Frestoring is the restoring force, m is the mass of the bob, g is acceleration due to gravity, and θ is the angular displacement."
            }
         ]
      },
      {
         title:"Equation of Motion",
         blocks:[
            {
               type:"paragraph",
               text:"Applying Newton’s second law along the arc gives the differential equation of motion."
            },
            {
               type:"formula",
               latex:"m L \\tfrac{d^2\\theta}{dt^2} = - m g \\sin\\theta"
            },
            {
               type:"paragraph",
               text:"Here, m is the bob’s mass, L is the string length, θ is angular displacement, t is time, and g is acceleration due to gravity."
            },
            {
               type:"formula",
               latex:"\\tfrac{d^2\\theta}{dt^2} + \\tfrac{g}{L} \\sin\\theta = 0"
            },
            {
               type:"paragraph",
               text:"This is the general differential equation for pendulum motion, where θ is angular displacement, g is acceleration due to gravity, and L is the length of the pendulum."
            }
         ]
      },
      {
         title:"Small Angle Approximation",
         blocks:[
            {
               type:"paragraph",
               text:"For small angles (θ < 10°), we approximate sinθ ≈ θ (in radians). This simplifies the motion to simple harmonic motion (SHM)."
            },
            {
               type:"formula",
               latex:"\\tfrac{d^2\\theta}{dt^2} + \\tfrac{g}{L}\\,\\theta = 0"
            },
            {
               type:"paragraph",
               text:"Here, θ is angular displacement, g is gravitational acceleration, and L is string length. This equation represents SHM."
            },
            {
               type:"paragraph",
               text:"The solution describes oscillations with angular frequency ω = √(g/L)."
            },
            {
               type:"formula",
               latex:"T = 2\\pi \\sqrt{\\tfrac{L}{g}}"
            },
            {
               type:"paragraph",
               text:"Here, T is the time period, L is the string length, and g is the acceleration due to gravity."
            }
         ]
      },
      {
         title:"Energy Analysis",
         blocks:[
            {
               type:"paragraph",
               text:"The pendulum continuously exchanges energy between kinetic and potential forms while total mechanical energy remains constant (ignoring air resistance)."
            },
            {
               type:"formula",
               latex:"E = K + U = \\tfrac{1}{2} m v^2 + m g h"
            },
            {
               type:"paragraph",
               text:"Here, E is total energy, K is kinetic energy, U is potential energy, m is the bob’s mass, v is velocity, g is gravitational acceleration, and h is height relative to the mean position."
            },
            {
               type:"paragraph",
               text:"At the mean position, energy is entirely kinetic; at extreme positions, it is entirely potential."
            }
         ]
      },
      {
         title:"Measurements and Observations",
         blocks:[
            {
               type:"list",
               ordered:false,
               items:[
                  "The period is independent of the bob's mass.",
                  "For small oscillations, the time period depends only on length L and gravity g.",
                  "Longer pendulums have longer periods.",
                  "For large angles, the motion deviates from SHM and the period increases slightly."
               ]
            }
         ]
      },
      {
         title:"Constants and Recommended Values",
         blocks:[
            {
               type:"table",
               columns:["Constant", "Meaning", "Suggested value"],
               data:[
                  {"Constant":"g", "Meaning":"Gravitational acceleration", "Suggested value":"9.8 m/s²"},
                  {"Constant":"L", "Meaning":"Length of pendulum", "Suggested value":"0.5 – 2.0 m"},
                  {"Constant":"θ", "Meaning":"Initial displacement angle", "Suggested value":"< 10° for SHM"}
               ]
            }
         ]
      },
      {
         title:"Advanced Derivation",
         blocks:[
            {
               type:"toggle",
               title:"Show Mathematical Derivation",
               content:"Starting with torque τ = -mgL sinθ and I = mL², we get mL² d²θ/dt² = -mgL sinθ. Simplifying gives d²θ/dt² + (g/L) sinθ = 0. For small θ, sinθ ≈ θ, reducing to SHM: d²θ/dt² + (g/L) θ = 0. Solution: θ(t) = θ₀ cos(ωt + φ), with ω = √(g/L) and period T = 2π√(L/g)."
            }
         ]
      }
   ]
      }
   }
];