import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const rayTracingBlog = {
  slug: "how-does-ray-tracing-work",
  name: "How does ray tracing work?",
  desc: "Ray tracing follows straight-line light rays backwards from the camera through each pixel, then applies the laws of optics where they hit to decide the pixel's colour.",
  tags: [
    LEVELS.undergraduate,
    DIFFICULTIES.core,
    TAGS.PHYSICS,
    TAGS.OPTICS,
    TAGS.VECTORS,
  ],
  date: "23/09/2026",
  thumbnail: "/thumbnails/ray-tracing.webp",
  theory: {
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "How does ray tracing work?",
          },
          {
            type: "paragraph",
            text: "Ray tracing makes an image by sending one straight-line ray from the camera through every pixel and asking what it hits first. At that point, the laws of geometric optics — Lambert's cosine law, the inverse-square law, shadows and the law of reflection — decide how much light travels back along the ray, and that becomes the pixel's colour.",
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "A ray tracer runs light paths in reverse: from the eye into the scene. Because light paths are reversible, the path from the eye to a lamp carries light exactly like the path from the lamp to the eye — and almost no computation is wasted on light nobody sees.",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "A ray is a line $\\vec{P}(t) = \\vec{O} + t\\hat{D}$: a starting point, a unit direction and a distance $t$.",
              "Hitting a sphere is a quadratic in $t$; its discriminant $\\Delta = b^2 - 4ac$ says miss ($\\Delta<0$), graze ($\\Delta=0$) or hit ($\\Delta>0$).",
              "Brightness at the hit point follows **Lambert's cosine law** $\\cos\\theta_i = \\hat{N}\\cdot\\hat{L}$ and the **inverse-square law** $E = I_0/d^2$.",
              "A **shadow** is a second ray toward the light that hits something first.",
              "Mirrors obey $\\theta_i = \\theta_r$, written as $\\hat{D}_r = \\hat{D} - 2(\\hat{D}\\cdot\\hat{N})\\hat{N}$ — and the reflected ray is traced exactly like the first one.",
            ],
          },
          {
            type: "sectionTitle",
            text: "Why can light be modelled as rays?",
          },
          {
            type: "paragraph",
            text: "Light is an electromagnetic wave, but when every object in the scene is much larger than its wavelength (about $400$–$700\\ \\text{nm}$ for visible light) diffraction is negligible and light travels in straight lines. This is **geometric optics**: energy flows along rays, and rays only change direction where they meet a surface. Every step of a ray tracer is a statement from geometric optics.",
          },
          {
            type: "paragraph",
            text: "Real lamps emit rays in every direction and only a tiny fraction ever reaches a camera. Simulating them forwards would waste nearly all the work, so a ray tracer starts at the camera instead. This is allowed by the **Helmholtz reciprocity principle**: a light path from A to B behaves the same as the path from B to A. The method of tracing backwards with shadow and mirror rays is called Whitted-style ray tracing, after Turner Whitted (1980).",
          },
          {
            type: "sectionTitle",
            text: "How is a ray sent through a pixel?",
          },
          {
            type: "paragraph",
            text: "The camera sits at $\\vec{O}$ and looks along $-\\hat{w}$, with $\\hat{u}$ pointing right and $\\hat{v}$ up. A pixel is a point $(s_x, s_y)$ on an image plane one unit in front of the camera, spread across $\\pm\\tan(\\text{fov}/2)$. The ray through it is:",
          },
          {
            type: "formula",
            ref: "ray-equation",
            latex:
              "\\vec{P}(t) = \\vec{O} + t\\,\\hat{D},\\qquad \\hat{D} = \\operatorname{normalize}\\!\\left(s_x\\hat{u} + s_y\\hat{v} - \\hat{w}\\right)",
          },
          {
            type: "paragraph",
            text: "Because $\\hat{D}$ is a unit vector, $t$ is simply the distance travelled in metres. Notice that nothing here depends on the objects or the light — move them and this step does not change.",
          },
          {
            type: "sectionTitle",
            text: "How do you find where a ray hits a sphere?",
          },
          {
            type: "paragraph",
            text: "A sphere of centre $\\vec{C}$ and radius $r$ is every point at distance $r$ from $\\vec{C}$. Substituting the ray into that condition gives a quadratic equation in $t$:",
          },
          {
            type: "formula",
            latex:
              "|\\vec{O} + t\\hat{D} - \\vec{C}|^2 = r^2 \\;\\Longrightarrow\\; a t^2 + b t + c = 0",
          },
          {
            type: "formula",
            ref: "ray-sphere-intersection",
            latex:
              "a = \\hat{D}\\cdot\\hat{D},\\quad b = 2\\,\\hat{D}\\cdot(\\vec{O}-\\vec{C}),\\quad c = |\\vec{O}-\\vec{C}|^2 - r^2",
          },
          {
            type: "table",
            columns: ["Discriminant", "Roots", "What the ray does"],
            data: [
              {
                Discriminant: "$\\Delta < 0$",
                Roots: "none",
                "What the ray does": "misses the sphere",
              },
              {
                Discriminant: "$\\Delta = 0$",
                Roots: "one",
                "What the ray does": "grazes the edge (a tangent line)",
              },
              {
                Discriminant: "$\\Delta > 0$",
                Roots: "two",
                "What the ray does": "enters at $t_0$ and leaves at $t_1$",
              },
            ],
          },
          {
            type: "paragraph",
            text: "The visible surface is the **smallest positive** root, $t = (-b - \\sqrt{\\Delta})/2a$. A negative root means the intersection is behind the camera. The flat floor is even simpler: the plane $y = 0$ is hit when $O_y + tD_y = 0$, so $t = -O_y/D_y$. Whichever object gives the smaller positive $t$ is the one the pixel shows.",
          },
          {
            type: "paragraph",
            text: "At the hit point $\\vec{P} = \\vec{O} + t\\hat{D}$ the ray tracer needs the **surface normal** — the unit vector sticking straight out of the surface. For a sphere it points from the centre through $\\vec{P}$: $\\hat{N} = (\\vec{P}-\\vec{C})/r$. Every lighting law below measures angles from $\\hat{N}$.",
          },
          {
            type: "sectionTitle",
            text: "How bright is the surface where the ray lands?",
          },
          {
            type: "subheading",
            text: "The inverse-square law",
          },
          {
            type: "paragraph",
            text: "A point light of radiant intensity $I_0$ (watts per steradian) spreads its power over spheres of area $4\\pi d^2$, so the irradiance it delivers at distance $d$ falls as the square of the distance. Doubling the distance to the light cuts the light arriving to a quarter.",
          },
          {
            type: "formula",
            ref: "inverse-square-law",
            latex:
              "\\vec{L} = \\vec{S} - \\vec{P},\\quad d = |\\vec{L}|,\\quad \\hat{L} = \\vec{L}/d,\\qquad E = \\frac{I_0}{d^2}",
          },
          {
            type: "subheading",
            text: "Lambert's cosine law",
          },
          {
            type: "paragraph",
            text: "A beam arriving at angle $\\theta_i$ from the normal is spread over a patch $1/\\cos\\theta_i$ times larger than when it arrives head-on, so the energy per unit area falls by $\\cos\\theta_i$. With unit vectors, $\\cos\\theta_i = \\hat{N}\\cdot\\hat{L}$, and a matte (diffuse) surface of reflectance $k_d$ looks this bright:",
          },
          {
            type: "formula",
            ref: "lamberts-cosine-law",
            latex: "I_d = k_d\\,E\\,\\max(0,\\ \\hat{N}\\cdot\\hat{L})",
          },
          {
            type: "paragraph",
            text: "The $\\max(0,\\cdot)$ removes surfaces facing away from the light. This single dot product is why a sphere looks round: its brightness fades smoothly from the point facing the lamp to the terminator, where $\\hat{N}\\cdot\\hat{L} = 0$. It is also why winter sunlight, arriving at a slant, heats the ground less.",
          },
          {
            type: "subheading",
            text: "Shiny highlights",
          },
          {
            type: "paragraph",
            text: "Glossy surfaces also reflect light mostly in the mirror direction. The Phong model mirrors $\\hat{L}$ about the normal to get $\\hat{R} = 2(\\hat{N}\\cdot\\hat{L})\\hat{N} - \\hat{L}$, then checks how closely it points at the viewer $\\hat{V} = -\\hat{D}$. The exponent $n$ (shininess) sets how tight the highlight is:",
          },
          {
            type: "formula",
            latex:
              "I_s = k_s\\,E\\,\\max(0,\\ \\hat{R}\\cdot\\hat{V})^{\\,n},\\qquad I = k_a + I_d + I_s",
          },
          {
            type: "callout",
            calloutType: "info",
            title: "An empirical model",
            text: "Lambert's law is real physics for ideal matte surfaces, but the Phong highlight is an empirical fit, not a law of nature. Physically based renderers replace it with microfacet models that conserve energy. The small ambient term $k_a$ stands in for all the light bouncing around the room, which this simple tracer does not follow.",
          },
          {
            type: "sectionTitle",
            text: "How does a ray tracer make shadows?",
          },
          {
            type: "paragraph",
            text: "A point is in shadow when something blocks the straight line between it and the light. So the tracer casts a second ray, the **shadow ray**, from $\\vec{P}$ toward the light. If it hits an object at a distance $s$ smaller than $d$, the direct light is removed and only the ambient term remains.",
          },
          {
            type: "formula",
            latex:
              "\\vec{P} + \\varepsilon\\hat{N} + s\\,\\hat{L},\\qquad \\text{in shadow if } 0 < s < d",
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "Shadow acne",
            text: "The shadow ray starts a tiny distance $\\varepsilon$ above the surface. Without that offset, rounding errors make the ray hit the very surface it left, and the object covers itself in speckled false shadows.",
          },
          {
            type: "paragraph",
            text: "With one point light, shadows have perfectly sharp edges. Real lamps have a size, so points near the edge see part of the lamp: that partial shadow is the penumbra, which a point-light tracer cannot produce.",
          },
          {
            type: "sectionTitle",
            text: "How are reflections traced?",
          },
          {
            type: "paragraph",
            text: "At a mirror, the angle of incidence equals the angle of reflection, and the incoming ray, the normal and the outgoing ray lie in one plane. Subtracting twice the component of $\\hat{D}$ along the normal flips it and gives exactly that direction:",
          },
          {
            type: "formula",
            ref: "law-of-reflection",
            latex:
              "\\hat{D}_r = \\hat{D} - 2(\\hat{D}\\cdot\\hat{N})\\,\\hat{N},\\qquad \\theta_i = \\theta_r",
          },
          {
            type: "paragraph",
            text: "The reflected ray is then traced with exactly the same steps — intersection, lighting, shadows — which makes ray tracing **recursive**. The pixel mixes the surface's own colour with what the mirror ray sees, weighted by the reflectivity $\\rho$: $\\text{colour} = (1-\\rho)\\,\\text{local} + \\rho\\,\\text{reflected}$. Recursion stops after a fixed number of bounces.",
          },
          {
            type: "callout",
            calloutType: "tip",
            title: "Try it",
            text: "In the simulation, drag only the light and watch the live equations: the ray, the discriminant and the reflection angle $\\theta_r$ stay fixed, while $E$, $\\hat{N}\\cdot\\hat{L}$ and the highlight change. The mirror direction depends on the viewer, not on the light.",
          },
          {
            type: "sectionTitle",
            text: "What does simple ray tracing leave out?",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "**Refraction** — transparent materials bend rays by Snell's law, $n_1\\sin\\theta_1 = n_2\\sin\\theta_2$; a tracer adds a refracted ray alongside the reflected one.",
              "**Soft shadows** — sampling many points over an area light produces the penumbra.",
              "**Global illumination** — light bouncing between diffuse surfaces (colour bleeding). **Path tracing** handles it by averaging many random bounces, a Monte Carlo solution of the rendering equation.",
              "**Wave optics** — diffraction, interference and polarisation cannot be described by rays at all.",
            ],
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "Why does ray tracing start at the camera instead of the light?",
                a: "Almost none of the light leaving a lamp reaches the camera, so tracing it forwards wastes nearly all the work. Light paths are reversible (Helmholtz reciprocity), so following them backwards from the eye gives the same answer while only computing rays that end up in the image.",
              },
              {
                q: "What does the discriminant tell you in ray–sphere intersection?",
                a: "Substituting the ray into the sphere's equation gives a quadratic in the distance $t$. If $\\Delta = b^2 - 4ac$ is negative the ray misses, if it is zero the ray just touches the sphere, and if it is positive the ray passes through, entering at the smaller root.",
              },
              {
                q: "Why does brightness depend on the cosine of the angle?",
                a: "A beam hitting a surface at angle $\\theta$ from the normal spreads the same power over an area $1/\\cos\\theta$ times larger, so the power per unit area falls by $\\cos\\theta$. That is Lambert's cosine law, and it is computed as the dot product $\\hat{N}\\cdot\\hat{L}$.",
              },
              {
                q: "Is ray tracing physically accurate?",
                a: "Its geometry is: straight rays, the law of reflection, the inverse-square and cosine laws all come from geometric optics. The simple version here uses an empirical highlight model and ignores light bouncing between diffuse surfaces; path tracing and physically based materials close most of that gap.",
              },
              {
                q: "What is the difference between ray tracing and path tracing?",
                a: "Whitted ray tracing follows one deterministic ray per pixel plus shadow and mirror rays. Path tracing sends many rays per pixel and lets each bounce in a random direction, averaging the results to capture soft shadows, indirect light and colour bleeding.",
              },
            ],
          },
          {
            type: "sectionTitle",
            text: "Keep exploring",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Follow a ray and move the camera, sphere and light in the [Ray Tracing simulation](/simulations/RayTracing).",
              "Every step above is vector algebra: [Vectors: components, addition, dot and cross products](/blog/comprehensive-guide-to-vector-operations).",
              "Another question geometric optics answers — light scattering off air molecules: [Why is the sky blue?](/blog/why-is-the-sky-blue).",
              "Angles, cosines and radians from the ground up: [What is the unit circle?](/blog/unit-circle-trigonometry).",
              "The same reflection rule for a moving ball — the velocity component along the normal flips: [How does a bouncing ball work?](/blog/physics-bouncing-ball-comprehensive-educational-guide).",
            ],
          },
        ],
      },
    ],
  },
};
