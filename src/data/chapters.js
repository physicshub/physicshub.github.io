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
      // Placeholder: theory section still in development
      theory:{
         sections:[
            {
               title:"",
               blocks:[
                  {
                        type:"callout",
                        calloutType:"warning",
                        title:"Attention!",
                        text:"This section is still under development; from this block onward, this is an example placeholder. See \"/Contribute\" to find out how you can contribute to this page."
                  },
               ]
            },
            {
               title:"Section 1 Title",
               blocks:[
                  {
                     type:"paragraph",
                     text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eu faucibus enim."
                  },
                  {
                     type:"list",
                     ordered:true,
                     items:[
                        "Ordered list item 1",
                        "Ordered list item 2",
                        "Ordered list item 3"
                     ]
                  }
               ]
            },
            {
               title:"Section 2 Title",
               blocks:[
                  {
                     type:"list",
                     ordered:false,
                     items:[
                        "Unordered list item 1",
                        "Unordered list item 2",
                        "Unordered list item 3"
                     ]
                  },
                  {
                     type:"formula",
                     latex:"x = (1 + 1 * 4)"
                  },
                  {
                     type:"note",
                     text:"This is a note."
                  }
               ]
            },
            {
               title:"Section 3 Title",
               blocks:[
                  {
                     type:"code",
                     language:"javascript",
                     code:`let x = "100";

function draw(){
  x += vx;
  y += vy;
  
  return 1 + 1
}`
                  }
               ]
            },
            {
               title:"Section 4 Title",
               blocks:[
                  {
                     type:"table",
                     columns:[
                        "First column",
                        "Second column",
                        "Third column"
                     ],
                     data:[
                        {
                           "First column":"Value 1",
                           "Second column":"Value 2",
                           "Third column":"Value 3"
                        },
                        {
                           "First column":"Value 1",
                           "Second column":"Value 2",
                           "Third column":"Value 3"
                        },
                        {
                           "First column":"Value 1",
                           "Second column":"Value 2",
                           "Third column":"Value 3"
                        }
                     ]
                  }
               ]
            },
            {
               title:"Section 5 Title",
               blocks:[
                  {
                     type:"callout",
                     calloutType:"info",
                     title:"Info",
                     text:"This is a info."
                  },
                  {
                     type:"callout",
                     calloutType:"warning",
                     title:"Attention!",
                     text:"This is a warning."
                  },
                  {
                     type:"callout",
                     calloutType:"tip",
                     title:"Smart Tip!",
                     text:"This is a tip."
                  },
                  {
                     type:"callout",
                     calloutType:"success",
                     title:"Success!",
                     text:"Congratulation, you won!"
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
      // Placeholder: theory section still in development
      theory:{
         sections:[
            {
               title:"",
               blocks:[
                  {
                        type:"callout",
                        calloutType:"warning",
                        title:"Attention!",
                        text:"This section is still under development; from this block onward, this is an example placeholder. See \"/Contribute\" to find out how you can contribute to this page."
                  },
               ]
            },
            {
               title:"Section 1 Title",
               blocks:[
                  {
                     type:"paragraph",
                     text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eu faucibus enim."
                  },
                  {
                     type:"list",
                     ordered:true,
                     items:[
                        "Ordered list item 1",
                        "Ordered list item 2",
                        "Ordered list item 3"
                     ]
                  }
               ]
            },
            {
               title:"Section 2 Title",
               blocks:[
                  {
                     type:"list",
                     ordered:false,
                     items:[
                        "Unordered list item 1",
                        "Unordered list item 2",
                        "Unordered list item 3"
                     ]
                  },
                  {
                     type:"formula",
                     latex:"x = (1 + 1 * 4)"
                  },
                  {
                     type:"note",
                     text:"This is a note."
                  }
               ]
            },
            {
               title:"Section 3 Title",
               blocks:[
                  {
                     type:"code",
                     language:"javascript",
                     code:`let x = "100";

function draw(){
  x += vx;
  y += vy;
  
  return 1 + 1
}`
                  }
               ]
            },
            {
               title:"Section 4 Title",
               blocks:[
                  {
                     type:"table",
                     columns:[
                        "First column",
                        "Second column",
                        "Third column"
                     ],
                     data:[
                        {
                           "First column":"Value 1",
                           "Second column":"Value 2",
                           "Third column":"Value 3"
                        },
                        {
                           "First column":"Value 1",
                           "Second column":"Value 2",
                           "Third column":"Value 3"
                        },
                        {
                           "First column":"Value 1",
                           "Second column":"Value 2",
                           "Third column":"Value 3"
                        }
                     ]
                  }
               ]
            },
            {
               title:"Section 5 Title",
               blocks:[
                  {
                     type:"callout",
                     calloutType:"info",
                     title:"Info",
                     text:"This is a info."
                  },
                  {
                     type:"callout",
                     calloutType:"warning",
                     title:"Attention!",
                     text:"This is a warning."
                  },
                  {
                     type:"callout",
                     calloutType:"tip",
                     title:"Smart Tip!",
                     text:"This is a tip."
                  },
                  {
                     type:"callout",
                     calloutType:"success",
                     title:"Success!",
                     text:"Congratulation, you won!"
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
      // Placeholder: theory section still in development
      theory:{
         sections:[
            {
               title:"",
               blocks:[
                  {
                        type:"callout",
                        calloutType:"warning",
                        title:"Attention!",
                        text:"This section is still under development; from this block onward, this is an example placeholder. See \"/Contribute\" to find out how you can contribute to this page."
                  },
               ]
            },
            {
               title:"Section 1 Title",
               blocks:[
                  {
                     type:"paragraph",
                     text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eu faucibus enim."
                  },
                  {
                     type:"list",
                     ordered:true,
                     items:[
                        "Ordered list item 1",
                        "Ordered list item 2",
                        "Ordered list item 3"
                     ]
                  }
               ]
            },
            {
               title:"Section 2 Title",
               blocks:[
                  {
                     type:"list",
                     ordered:false,
                     items:[
                        "Unordered list item 1",
                        "Unordered list item 2",
                        "Unordered list item 3"
                     ]
                  },
                  {
                     type:"formula",
                     latex:"x = (1 + 1 * 4)"
                  },
                  {
                     type:"note",
                     text:"This is a note."
                  }
               ]
            },
            {
               title:"Section 3 Title",
               blocks:[
                  {
                     type:"code",
                     language:"javascript",
                     code:`let x = "100";

function draw(){
  x += vx;
  y += vy;
  
  return 1 + 1
}`
                  }
               ]
            },
            {
               title:"Section 4 Title",
               blocks:[
                  {
                     type:"table",
                     columns:[
                        "First column",
                        "Second column",
                        "Third column"
                     ],
                     data:[
                        {
                           "First column":"Value 1",
                           "Second column":"Value 2",
                           "Third column":"Value 3"
                        },
                        {
                           "First column":"Value 1",
                           "Second column":"Value 2",
                           "Third column":"Value 3"
                        },
                        {
                           "First column":"Value 1",
                           "Second column":"Value 2",
                           "Third column":"Value 3"
                        }
                     ]
                  }
               ]
            },
            {
               title:"Section 5 Title",
               blocks:[
                  {
                     type:"callout",
                     calloutType:"info",
                     title:"Info",
                     text:"This is a info."
                  },
                  {
                     type:"callout",
                     calloutType:"warning",
                     title:"Attention!",
                     text:"This is a warning."
                  },
                  {
                     type:"callout",
                     calloutType:"tip",
                     title:"Smart Tip!",
                     text:"This is a tip."
                  },
                  {
                     type:"callout",
                     calloutType:"success",
                     title:"Success!",
                     text:"Congratulation, you won!"
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
      // Placeholder: theory section still in development
      theory:{
         sections:[
            {
               title:"",
               blocks:[
                  {
                        type:"callout",
                        calloutType:"warning",
                        title:"Attention!",
                        text:"This section is still under development; from this block onward, this is an example placeholder. See \"/Contribute\" to find out how you can contribute to this page."
                  },
               ]
            },
            {
               title:"Section 1 Title",
               blocks:[
                  {
                     type:"paragraph",
                     text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eu faucibus enim."
                  },
                  {
                     type:"list",
                     ordered:true,
                     items:[
                        "Ordered list item 1",
                        "Ordered list item 2",
                        "Ordered list item 3"
                     ]
                  }
               ]
            },
            {
               title:"Section 2 Title",
               blocks:[
                  {
                     type:"list",
                     ordered:false,
                     items:[
                        "Unordered list item 1",
                        "Unordered list item 2",
                        "Unordered list item 3"
                     ]
                  },
                  {
                     type:"formula",
                     latex:"x = (1 + 1 * 4)"
                  },
                  {
                     type:"note",
                     text:"This is a note."
                  }
               ]
            },
            {
               title:"Section 3 Title",
               blocks:[
                  {
                     type:"code",
                     language:"javascript",
                     code:`let x = "100";

function draw(){
  x += vx;
  y += vy;
  
  return 1 + 1
}`
                  }
               ]
            },
            {
               title:"Section 4 Title",
               blocks:[
                  {
                     type:"table",
                     columns:[
                        "First column",
                        "Second column",
                        "Third column"
                     ],
                     data:[
                        {
                           "First column":"Value 1",
                           "Second column":"Value 2",
                           "Third column":"Value 3"
                        },
                        {
                           "First column":"Value 1",
                           "Second column":"Value 2",
                           "Third column":"Value 3"
                        },
                        {
                           "First column":"Value 1",
                           "Second column":"Value 2",
                           "Third column":"Value 3"
                        }
                     ]
                  }
               ]
            },
            {
               title:"Section 5 Title",
               blocks:[
                  {
                     type:"callout",
                     calloutType:"info",
                     title:"Info",
                     text:"This is a info."
                  },
                  {
                     type:"callout",
                     calloutType:"warning",
                     title:"Attention!",
                     text:"This is a warning."
                  },
                  {
                     type:"callout",
                     calloutType:"tip",
                     title:"Smart Tip!",
                     text:"This is a tip."
                  },
                  {
                     type:"callout",
                     calloutType:"success",
                     title:"Success!",
                     text:"Congratulation, you won!"
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