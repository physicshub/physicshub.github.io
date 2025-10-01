import { TAGS } from "./tags";

export default [
   {
      id:1,
      name:"Bouncing Ball",
      desc:"Simulation of the ball bouncing off the walls.",
      link:"/BouncingBall",
      tags:[
         TAGS.EASY,
         TAGS.PHYSICS,
         TAGS.COLLISION,
         TAGS.ANIMATIONS
      ],
      theory:{
         sections:[
            {
               title:"What's a velocity?",
               blocks:[
                  {
                     type:"paragraph",
                     text:"Let's start with some basic theory, defining what velocity is and how to calculate it. "+
                          "Velocity is a vector quantity defined as the change in position of a body as a function of time; "+
                          "in the matter of fact, we can write it as: "
                  },
                  {
                     type:"formula",
                     latex:"$\\v = \\frac{\\Delta_s}{\\Delta_t}$"
                  },
                  {
                     type:"paragraph",
                     text:"where Δs is the change in space, while Δt is the change in time."
                  }
               ]
            },
            {
               title:"How does it affect the position of the ball?",
               blocks:[
                  {
                     type:"paragraph",
                     text:"For the next step, let's consider our motion as one-dimensional: this means that , we'll need only "+
                          "one variable, or direction, to describe it. For example, let's set VelocityY = 0, giving VeloccityX "+
                          "some speed. Our ball is now moving in Rectilinear Uniform Motion (RMU), which can be expressed using "+
                          "the x(t) function: "
                  },
                  {
                     type:"formula",
                     latex:"x(t) = x0 + v*t"
                  },
                  {
                     type:"paragraph",
                     text:"where, in order, x0 is the ball's initial position, v is its velocity, and t is the instant of time "+
                          "we're considering. In this way, the x(t) function will return the value of the ball's position at "+
                          "that given instant in time."
                  },
                  {
                     type:"note",
                     text:"P.S.: It works the same way if, instead of setting VelocityY = 0, we set VelocityX = 0; except that "+
                          "in this case, the ball would clearly be moving vertically."
                  },
                  {
                     type:"paragraph",
                     text:"Are we tough guys, and one-dimensional motion isn't our thing? Let's add a dimension! Now let's "+
                          "consider the motion on both the X and Y axes, giving both a non-zero velocity. The first thing we "+
                          "notice is that, by giving X and Y the same velocity, the ball creates an angle of incidence with the "+
                          "plane (the window walls!) of 45 degrees, or pi/4 radians, if you prefer. This happens because, if we "+
                          "consider a cartesian reference system (CRS) and think of the velocity as a vector, we obtain that we "+
                          "are giving the ball a vertical vector equal to the horizontal one, so the resultant will be a vector "+
                          "directed at 45 degrees (see vector simulation to learn more!). By modifying the velocities, making "+
                          "them different from each other, we notice that the angle of incidence increases or decreases depending "+
                          "on the case."
                  }
               ]
            },
            {
               title:"Some curiosities!",
               blocks:[
                  {
                     type:"list",
                     ordered:false,
                     items:[
                        "The angle of incidence and the angle of reflection (i.e., the angle between the direction of the ball "+
                        "and the plane, created after the ball hits the latter) are equal",
                        "This occurs even when the plane has a different inclination: in fact, just look at the axis perpendicular "+
                        "to the plane at the point where the ball touches it and you immediately notice the symmetry",
                        "This phenomenon is very common in optics, when light beams are bounced off surfaces to analyze their "+
                        "reactions: depending on the material and the type of light transmitted, a lot of useful information can be obtained",
                        "Moreover, you can now show your physics skills with all of your friends the next time you're attending "+
                        "a biliardo night out!"
                     ]
                  }
               ]
            },
            {
               title:"Suggested Experiments",
               blocks:[
                  {
                     type:"list",
                     ordered:false,
                     items:[
                        "Try different velocities for both X and Y",
                        "Enable the trail to better see the motion of the ball and its incidence angles",
                        "Verify the formulas above by measuring the time it takes to the ball to go from a corner to the other of the window"
                     ]
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
      link:"/VectorsOperations",
      tags:[
         TAGS.MEDIUM, 
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
      link:"/BallAcceleration",
      tags:[
         TAGS.ADVANCED,
         TAGS.PHYSICS,
         TAGS.ACCELERATION
      ],
      theory:{
         sections:[
            {
               title:"Description",
               blocks:[
                  {
                     type:"paragraph",
                     text:"The ball accelerates toward the cursor position: the applied force is directed from the object toward the target and can be limited by a maximum value (maxForce)."
                  }
               ]
            },
            {
               title:"Steering Force (seeking)",
               blocks:[
                  {
                     type:"formula",
                     latex:"\\vec{F} = m\\,\\vec{a},\\quad \\vec{a} = \\text{clamp}\\left(\\frac{\\vec{v}_{desired}-\\vec{v}}{\\Delta t},\\,a_{max}\\right)"
                  },
                  {
                     type:"paragraph",
                     text:"v_{desired} is the velocity pointing toward the target (direction × speed). Limiting acceleration yields smoother behavior."
                  }
               ]
            },
            {
               title:"Code Example (pseudocode)",
               blocks:[
                  {
                     type:"code",
                     language:"javascript",
                     code:`let pos, vel = {x:0,y:0}, mass = 1, maxForce = 0.4, maxSpeed = 6;

function applySteer(target){
  const desired = normalize({
    x: target.x - pos.x, 
    y: target.y - pos.y
  });
  desired.x *= maxSpeed; 
  desired.y *= maxSpeed;
  
  let steer = {
    x: desired.x - vel.x, 
    y: desired.y - vel.y
  };
  
  // limit steer magnitude to maxForce
  const m = Math.hypot(steer.x,steer.y)||1;
  if(m > maxForce){ 
    steer.x = steer.x/m*maxForce; 
    steer.y = steer.y/m*maxForce; 
  }
  
  // acceleration = steer / mass
  vel.x += steer.x / mass; 
  vel.y += steer.y / mass;
  pos.x += vel.x; 
  pos.y += vel.y;
}`
                  }
               ]
            },
            {
               title:"Parameters to Tune",
               blocks:[
                  {
                     type:"table",
                     columns:["Parameter", "Effect"],
                     data:[
                        {"Parameter":"maxForce", "Effect":"controls responsiveness/speed of direction change"},
                        {"Parameter":"maxSpeed", "Effect":"maximum cruising speed"},
                        {"Parameter":"mass", "Effect":"reduces acceleration for greater mass"}
                     ]
                  },
                  {
                     type:"callout",
                     calloutType:"warning",
                     title:"Warning",
                     text:"MassForce too high can cause oscillations and unstable behavior."
                  }
               ]
            },
            {
               title:"Suggested Experiments",
               blocks:[
                  {
                     type:"list",
                     ordered:false,
                     items:[
                        "Try different mass values and observe inertia",
                        "Add damping to vel to stabilize movement",
                        "Combine seeking with avoidance to evade obstacles"
                     ]
                  },
                  {
                     type:"example",
                     title:"Desired Behavior",
                     content:"The ball follows the mouse with slight delay and smooth curves, avoiding sudden jerks."
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
      link:"/BallGravity",
      tags:[
         TAGS.EASY,
         TAGS.VECTORS,
         TAGS.GRAVITY
      ],
      theory:{
         sections:[
            {
               title:"Introduction",
               blocks:[
                  {
                     type:"paragraph",
                     text:"In this simulation we observe an object subjected to gravitational force and a horizontal force (wind) optionally applied by the user. The goal is to demonstrate simple numerical integration and bounces with restitution coefficient."
                  },
                  {
                     type:"formula",
                     latex:"F = m \\cdot a"
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
                     text:"Gravity acts downward with intensity equal to the product of mass and gravitational acceleration g."
                  },
                  {
                     type:"formula",
                     latex:"F_{g} = m \\cdot g"
                  },
                  {
                     type:"subheading",
                     text:"Wind"
                  },
                  {
                     type:"paragraph",
                     text:"Wind provides a constant horizontal force when the user clicks: this alters velocity along the x-axis."
                  },
                  {
                     type:"formula",
                     latex:"F_{wind} = F_{w}\\,\\hat{x}"
                  }
               ]
            },
            {
               title:"Motion Equations and Discrete Integration",
               blocks:[
                  {
                     type:"paragraph",
                     text:"With constant forces, acceleration is constant on each axis. In frame-based implementations (p5) we use explicit (Euler) integration:"
                  },
                  {
                     type:"formula",
                     latex:"a = \\frac{F_{tot}}{m},\\quad v \\leftarrow v + a\\,\\Delta t,\\quad x \\leftarrow x + v\\,\\Delta t"
                  },
                  {
                     type:"note",
                     text:"Δt corresponds to time step per frame (e.g. 1/60 s). For stability at high speeds consider sub-stepping or better integrators."
                  }
               ]
            },
            {
               title:"Collisions and Bounces",
               blocks:[
                  {
                     type:"paragraph",
                     text:"When the ball reaches the ground or edges, we reverse the velocity component normal to the surface; we apply restitution coefficient e to simulate energy loss."
                  },
                  {
                     type:"formula",
                     latex:"v_{after} = -\\,e\\,v_{before}"
                  },
                  {
                     type:"paragraph",
                     text:"With e = 1 perfectly elastic bounce; typically 0.6-0.95 is used for realistic bounces."
                  }
               ]
            },
            {
               title:"p5 Code Example",
               blocks:[
                  {
                     type:"code",
                     language:"javascript",
                     code:`let pos = {x:200,y:50}, vel = {x:0,y:0}, acc = {x:0,y:0};
const mass = 1, g = 0.98, windForce = 0.5, e = 0.85;

function applyForces(windActive){
  acc.x = windActive ? windForce/mass : 0;
  acc.y = g; // mass compensated in g if mass==1
}

function step(dt, windActive){
  applyForces(windActive);
  vel.x += acc.x * dt; 
  vel.y += acc.y * dt;
  pos.x += vel.x * dt; 
  pos.y += vel.y * dt;
  
  // ground collision
  if(pos.y > height - r){ 
    pos.y = height - r; 
    vel.y = -vel.y * e; 
  }
}`
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
                        {"Constant":"g", "Meaning":"gravitational acceleration", "Suggested value":"0.5 - 1.0 px/frame^2"},
                        {"Constant":"e", "Meaning":"restitution coefficient", "Suggested value":"0.6 - 0.95"},
                        {"Constant":"Δt", "Meaning":"time step (frame)", "Suggested value":"1 (or 1/60 normalized)"}
                     ]
                  },
                  {
                     type:"callout",
                     calloutType:"info",
                     title:"Note on Mass",
                     text:"If mass ≠ 1 remember to divide forces by mass: a = F / m."
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
                        "Vertical velocity grows linearly with g without collisions",
                        "Wind deflects trajectory on x-axis without directly affecting y",
                        "Greater mass reduces acceleration for same applied force"
                     ]
                  },
                  {
                     type:"callout",
                     calloutType:"warning",
                     title:"Warning",
                     text:"Explicit integration can introduce errors for large time steps: test reduced Δt."
                  }
               ]
            },
            {
               title:"Advanced Derivation",
               blocks:[
                  {
                     type:"toggle",
                     title:"Show Mathematical Derivation",
                     content:"Starting from m\\,\\ddot{x}=\\sum F we get per axis: \\ddot{y}=g => v_y(t)=v_{y0}+g t; integrating we obtain y(t)=y_0+v_{y0}t+\tfrac{1}{2}gt^2. In discrete-time we approximate with difference equations above."
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
      link:"/SpringConnection",
      tags:[
         TAGS.EASY,
         TAGS.VECTORS,
         TAGS.GRAVITY
      ],
      theory:{
      }
   },
      {
      id:6,
      name:"Simple Pendulum",
      desc:"A Simple Pendulum system.",
      link:"/SimplePendulum",
      tags:[
         TAGS.MEDIUM,
         TAGS.VECTORS,
         TAGS.GRAVITY,
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