"use client";

import { createSimulation } from "../app/(core)/engine/index.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/RayTracing.js";

/**
 * Ray Tracing — geometric optics, one ray at a time.
 *
 * Left: a real (Whitted-style) ray-traced image of a sphere on a checkered
 * floor lit by a point light. Every pixel is a ray cast backwards from the
 * camera; at the first hit we apply Lambert's cosine law, the inverse-square
 * law, a shadow ray and a mirror bounce. Click a pixel to follow its ray.
 *
 * Right: a side or top projection of the 3D scene. The camera, sphere and light
 * can be dragged there (the sliders follow through `setInput`), and the chosen
 * ray is drawn with its normal, shadow ray and reflected ray. Below the image,
 * the same ray's equations are written out with the live numbers substituted.
 *
 * No forces act, so like TrigonometricCircle nothing goes through the physics
 * pipeline: the sketch draws in pixel space from the draw hook. Tracing a full
 * image every frame is far too slow, so the image is cached and only re-traced
 * when the scene changes: a quick low-resolution preview first, then a sharp
 * anti-aliased pass spread over a few frames once the scene is still.
 */

// --- Tunables ----------------------------------------------------------------
const EPS = 1e-3; // offset that keeps secondary rays off their own surface
const MAX_DEPTH = 2; // mirror bounces
const FLOOR_REFLECTIVITY = 0.15;
const FLOOR_KS = 0.15;
const TARGET = [0, 1, 0]; // the camera always looks here
const PREVIEW_SCALE = 4; // preview = 1/4 resolution, traced in one frame
const HD_SAMPLES = 2; // 2×2 anti-aliasing rays per pixel in the sharp pass
const HD_DELAY_MS = 150; // wait this long after the last change before sharpening
const HD_BUDGET_MS = 10; // per-frame time budget for the sharp pass (not physics time)
const FLASH_MS = 900; // how long a changed equation line stays highlighted

const COLORS = {
  camera: "#5aa9ff",
  sphere: "#ff7a59",
  light: "#ffc94a",
  ray: "#4fd1c5",
  normal: "#6ee7a8",
  blocked: "#ff4d6d",
  reflected: "#b48cff",
};

// --- Vector helpers (plain [x, y, z] arrays) ---------------------------------
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const length = (a) => Math.sqrt(dot(a, a));
const normalize = (a) => {
  const l = length(a);
  return l > 0 ? scale(a, 1 / l) : [0, 0, 0];
};
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

export default createSimulation({
  config: { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper },

  build({ world, inputs, refs, setInput }) {
    refs.pick ??= { u: 0.5, v: 0.5 };
    refs.dragging = null;

    world.add({
      onPointerDown(ctx) {
        const { p } = ctx;
        const L = layout(p, inputs);
        const m = { x: p.mouseX, y: p.mouseY };

        if (inside(m, L.render)) {
          refs.dragging = "pick";
          pickPixel(m, L.render, refs);
          if (inputs.followSphere) setInput("followSphere", false);
          return;
        }
        if (!inside(m, L.diagram)) return;

        // Light and camera are small handles drawn on top, so test them first.
        const view = diagramView(L.diagram, inputs.diagramView);
        const scene = sceneFrom(inputs);
        const near = (pos, r) => {
          const s = view.toScreen(pos);
          return Math.hypot(s.x - m.x, s.y - m.y) <= r;
        };
        if (near(scene.light.pos, 16)) refs.dragging = "light";
        else if (near(scene.camera.pos, 16)) refs.dragging = "camera";
        else if (near(scene.sphere.center, scene.sphere.radius * view.scale))
          refs.dragging = "sphere";
      },

      onPointerMove(ctx) {
        const { p } = ctx;
        if (!refs.dragging) return;
        const L = layout(p, inputs);
        const m = { x: p.mouseX, y: p.mouseY };

        if (refs.dragging === "pick") {
          pickPixel(m, L.render, refs);
          return;
        }

        // Write the two axes this projection shows back into the inputs, so
        // the sliders move together with the object.
        const view = diagramView(L.diagram, inputs.diagramView);
        const [a, b] = view.toWorld(m);
        const names = AXIS_INPUTS[refs.dragging];
        setClamped(setInput, names[view.h], a);
        setClamped(setInput, names[view.v], b);
      },

      onPointerUp() {
        refs.dragging = null;
      },
    });

    return {};
  },

  draw({ p, inputs, refs }) {
    const L = layout(p, inputs);
    const scene = sceneFrom(inputs);
    const W = Math.max(1, Math.round(L.render.w));
    const H = Math.max(1, Math.round(L.render.h));

    if (inputs.followSphere) {
      refs.pick = aimAtSphere(scene, W, H) ?? refs.pick;
    }
    const rec = traceRecord(scene, refs.pick, W, H);
    refs.rec = rec;

    const rt = progressiveRender(p, refs, scene, W, H);
    drawRender(p, L.render, rt, rec);
    drawDiagram(p, L.diagram, scene, rec, inputs, W, H);
    if (inputs.showEquations && L.equations) {
      drawEquations(p, L.equations, rec, scene, refs);
    }
  },

  info({ refs }) {
    return refs.rec ? { state: refs.rec, context: {} } : null;
  },
});

// -----------------------------------------------------------------------------
// Scene
// -----------------------------------------------------------------------------

/** Which input names hold each draggable object's x, y, z. */
const AXIS_INPUTS = {
  camera: ["camX", "camY", "camZ"],
  sphere: ["sphereX", "sphereY", "sphereZ"],
  light: ["lightX", "lightY", "lightZ"],
};

const FIELD_BY_NAME = Object.fromEntries(INPUT_FIELDS.map((f) => [f.name, f]));

function setClamped(setInput, name, value) {
  const field = FIELD_BY_NAME[name];
  const v = clamp(value, field.min, field.max);
  setInput(name, Math.round(v * 10) / 10);
}

/**
 * Build the scene from the inputs. The sliders only bound the thumb — a learner
 * can type any value — so every input is guarded here: a field of view of 180°
 * would make tan(fov/2) infinite, a negative exponent would blow the highlight
 * up, and ρ > 1 would reflect more light than arrives.
 */
function sceneFrom(inputs) {
  const num = (v, fallback) => (Number.isFinite(v) ? v : fallback);
  let camPos = [
    num(inputs.camX, 0),
    Math.max(0.05, num(inputs.camY, 1.8)), // keep the eye above the floor
    num(inputs.camZ, 6.5),
  ];
  // A camera sitting on its own target has no viewing direction: back it off.
  if (length(sub(camPos, TARGET)) < 0.5) camPos = add(TARGET, [0, 0, 0.5]);

  return {
    camera: { pos: camPos, fov: clamp(num(inputs.fov, 50), 5, 150) },
    sphere: {
      center: [
        num(inputs.sphereX, 0),
        num(inputs.sphereY, 1),
        num(inputs.sphereZ, 0),
      ],
      radius: Math.max(0.05, num(inputs.radius, 1)),
      color: hexToLinear(inputs.sphereColor),
    },
    light: {
      pos: [
        num(inputs.lightX, 3),
        num(inputs.lightY, 5),
        num(inputs.lightZ, 3),
      ],
      intensity: Math.max(0, num(inputs.intensity, 22)),
    },
    material: {
      ka: clamp(num(inputs.ka, 0.08), 0, 1),
      kd: clamp(num(inputs.kd, 0.9), 0, 1),
      ks: clamp(num(inputs.ks, 0.6), 0, 1),
      shininess: clamp(num(inputs.shininess, 32), 1, 1000),
      reflectivity: clamp(num(inputs.reflectivity, 0.25), 0, 1),
    },
  };
}

/** "#rrggbb" → linear-light RGB in [0, 1] (undo the sRGB gamma of the picker). */
function hexToLinear(hex) {
  const n = parseInt(String(hex).replace("#", ""), 16);
  if (Number.isNaN(n)) return [0.8, 0.3, 0.2];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.pow(c / 255, 2.2)
  );
}

// -----------------------------------------------------------------------------
// Ray tracer
// -----------------------------------------------------------------------------

/** Orthonormal camera basis: w points backwards (target → eye), u right, v up. */
function cameraBasis(camera) {
  const w = normalize(sub(camera.pos, TARGET));
  let u = cross([0, 1, 0], w);
  u = length(u) < 1e-6 ? [1, 0, 0] : normalize(u);
  return { u, v: cross(w, u), w };
}

/**
 * The primary ray through image point (u, v) ∈ [0, 1]², v downwards:
 * D̂ = normalize(sₓ û + s_y v̂ − ŵ), with sₓ, s_y spanning tan(fov/2).
 */
function primaryRay(scene, u, v, aspect) {
  const { camera } = scene;
  const basis = cameraBasis(camera);
  const h = Math.tan((camera.fov * Math.PI) / 360);
  const sx = (2 * u - 1) * h * aspect;
  const sy = (1 - 2 * v) * h;
  const D = normalize(
    sub(add(scale(basis.u, sx), scale(basis.v, sy)), basis.w)
  );
  return { O: camera.pos, D, sx, sy };
}

/** Inverse of primaryRay: the image point (u, v) that world point X lands on. */
function projectToImage(scene, X, aspect) {
  const { camera } = scene;
  const { u, v, w } = cameraBasis(camera);
  const d = sub(X, camera.pos);
  const z = -dot(d, w);
  if (z <= 0) return null;
  const h = Math.tan((camera.fov * Math.PI) / 360);
  return {
    u: (dot(d, u) / z / (h * aspect) + 1) / 2,
    v: (1 - dot(d, v) / z / h) / 2,
  };
}

/**
 * Substitute P(t) = O + tD̂ into |P − C|² = r²:
 *   a t² + b t + c = 0,  a = D̂·D̂,  b = 2 D̂·(O − C),  c = |O − C|² − r².
 * Δ = b² − 4ac < 0 means a miss; otherwise the smaller positive root is the
 * visible surface.
 */
function intersectSphere(O, D, C, r) {
  const oc = sub(O, C);
  const a = dot(D, D);
  const b = 2 * dot(D, oc);
  const c = dot(oc, oc) - r * r;
  const disc = b * b - 4 * a * c;
  const out = { a, b, c, disc, t0: null, t: null };
  if (disc < 0) return out;
  const sq = Math.sqrt(disc);
  out.t0 = (-b - sq) / (2 * a);
  const t1 = (-b + sq) / (2 * a);
  if (out.t0 > EPS) out.t = out.t0;
  else if (t1 > EPS) out.t = t1;
  return out;
}

/** Ground plane y = 0: O_y + t D_y = 0. */
function intersectPlane(O, D) {
  if (D[1] > -1e-6) return null;
  const t = -O[1] / D[1];
  return t > EPS ? t : null;
}

function skyColor(D) {
  const k = clamp(0.5 * (D[1] + 1), 0, 1);
  return add(scale([0.95, 0.93, 0.9], 1 - k), scale([0.35, 0.55, 0.9], k));
}

function checker(P) {
  const odd = (Math.floor(P[0]) + Math.floor(P[2])) & 1;
  return odd ? [0.82, 0.8, 0.76] : [0.3, 0.32, 0.36];
}

/**
 * Trace one ray and return its linear RGB. When `rec` is an object every
 * intermediate quantity is written into it, so the readout shows exactly the
 * numbers the image was made from rather than a second calculation.
 *
 * Brightness model: the light is a point source of radiant intensity I₀
 * (W/sr), so the irradiance at distance d is E = I₀/d² (W/m²). E is used as the
 * exposure directly — 1 W/m² on a white matte surface facing the light is
 * full white.
 */
function trace(scene, O, D, depth = 0, rec = null) {
  const { sphere, light, material } = scene;

  const sph = intersectSphere(O, D, sphere.center, sphere.radius);
  const tPlane = intersectPlane(O, D);
  if (rec) Object.assign(rec, { O, D, sphereHit: sph, tPlane });

  let hit = null;
  if (sph.t !== null && (tPlane === null || sph.t < tPlane)) hit = "sphere";
  else if (tPlane !== null) hit = "plane";

  if (!hit) {
    const color = skyColor(D);
    if (rec) Object.assign(rec, { hit: "sky", color });
    return color;
  }

  const onSphere = hit === "sphere";
  const t = onSphere ? sph.t : tPlane;
  const P = add(O, scale(D, t));
  const N = onSphere
    ? scale(sub(P, sphere.center), 1 / sphere.radius)
    : [0, 1, 0];
  const albedo = onSphere ? sphere.color : checker(P);
  const reflectivity = onSphere ? material.reflectivity : FLOOR_REFLECTIVITY;
  const ks = onSphere ? material.ks : FLOOR_KS;

  // Light direction and the inverse-square law
  const toL = sub(light.pos, P);
  const d = length(toL);
  const L = scale(toL, 1 / d);
  const E = light.intensity / (d * d);
  const NdotL = dot(N, L);

  // Shadow ray: is anything between P and the light?
  const shadowOrigin = add(P, scale(N, EPS));
  const sh = intersectSphere(shadowOrigin, L, sphere.center, sphere.radius);
  const blocked = NdotL > 0 && sh.t !== null && sh.t < d;
  const lit = blocked ? 0 : 1;

  // Lambert: I_d = k_d E max(0, N̂·L̂)
  const diffuse = material.kd * Math.max(0, NdotL) * E * lit;

  // Phong: mirror L̂ about N̂ and compare with the direction to the eye
  const V = scale(D, -1);
  const R = sub(scale(N, 2 * NdotL), L);
  const RdotV = dot(R, V);
  const specular =
    NdotL > 0
      ? ks * Math.pow(Math.max(0, RdotV), material.shininess) * E * lit
      : 0;

  const local = add(scale(albedo, material.ka + diffuse), [
    specular,
    specular,
    specular,
  ]);

  // Law of reflection: D̂ᵣ = D̂ − 2(D̂·N̂)N̂
  const DdotN = dot(D, N);
  const Rv = sub(D, scale(N, 2 * DdotN));
  let color = local;
  const reflRec = rec ? {} : null;
  if (depth < MAX_DEPTH && reflectivity > 0) {
    const reflected = trace(
      scene,
      add(P, scale(N, EPS)),
      Rv,
      depth + 1,
      reflRec
    );
    color = add(scale(local, 1 - reflectivity), scale(reflected, reflectivity));
  }

  if (rec) {
    Object.assign(rec, {
      hit,
      t,
      P,
      N,
      d,
      L,
      E,
      NdotL,
      blocked,
      shadowT: sh.t,
      shadowOrigin,
      diffuse,
      RdotV,
      specular,
      ks,
      reflectivity,
      Rv,
      reflection: reflRec,
      reflectionAngle: (Math.acos(clamp(-DdotN, -1, 1)) * 180) / Math.PI,
      color,
    });
  }
  return color;
}

/** Linear light → screen bytes: clamp, then gamma-encode (x^(1/2.2)). */
function toDisplay(c) {
  return c.map((x) => Math.round(255 * Math.pow(clamp(x, 0, 1), 1 / 2.2)));
}

/** Trace rows [y0, y1) of a W×H image into `data` (full-image RGBA). */
function renderRows(scene, W, H, y0, y1, ss, data) {
  const aspect = W / H;
  const inv = 1 / (ss * ss);
  for (let py = y0; py < y1; py++) {
    for (let px = 0; px < W; px++) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const { O, D } = primaryRay(
            scene,
            (px + (sx + 0.5) / ss) / W,
            (py + (sy + 0.5) / ss) / H,
            aspect
          );
          const c = trace(scene, O, D);
          r += c[0];
          g += c[1];
          b += c[2];
        }
      }
      const out = toDisplay([r * inv, g * inv, b * inv]);
      const i = 4 * (py * W + px);
      data[i] = out[0];
      data[i + 1] = out[1];
      data[i + 2] = out[2];
      data[i + 3] = 255;
    }
  }
}

/** Full record of the ray through image point `pick`, for the readouts. */
function traceRecord(scene, pick, W, H) {
  const ray = primaryRay(scene, pick.u, pick.v, W / H);
  const rec = {};
  trace(scene, ray.O, ray.D, 0, rec);
  return {
    ...rec,
    px: Math.floor(pick.u * W),
    py: Math.floor(pick.v * H),
    display: toDisplay(rec.color),
  };
}

/** An image point on the lit side of the sphere, so the followed ray is interesting. */
function aimAtSphere(scene, W, H) {
  const { center, radius } = scene.sphere;
  const toLight = normalize(sub(scene.light.pos, center));
  const toCam = normalize(sub(scene.camera.pos, center));
  const dir = normalize(add(toLight, scale(toCam, 1.5)));
  const uv = projectToImage(
    scene,
    add(center, scale(dir, radius * 0.9)),
    W / H
  );
  if (!uv) return null;
  return { u: clamp(uv.u, 0, 0.999), v: clamp(uv.v, 0, 0.999) };
}

/**
 * Keep a cached image of the scene and refine it progressively: on a change,
 * trace a 1/PREVIEW_SCALE preview immediately (cheap enough for one frame);
 * once the scene has been still for HD_DELAY_MS, trace the full-resolution
 * anti-aliased image a few rows per frame within HD_BUDGET_MS.
 */
function progressiveRender(p, refs, scene, W, H) {
  const key = `${W}x${H}|${JSON.stringify(scene)}`;
  let rt = refs.rt;

  if (!rt || rt.W !== W || rt.H !== H) {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    rt = { W, H, canvas, ctx, image: ctx.createImageData(W, H), key: null };
    refs.rt = rt;
  }

  if (rt.key !== key) {
    const pw = Math.max(1, Math.ceil(W / PREVIEW_SCALE));
    const ph = Math.max(1, Math.ceil(H / PREVIEW_SCALE));
    const preview = document.createElement("canvas");
    preview.width = pw;
    preview.height = ph;
    const pctx = preview.getContext("2d");
    const img = pctx.createImageData(pw, ph);
    renderRows(scene, pw, ph, 0, ph, 1, img.data);
    pctx.putImageData(img, 0, 0);
    rt.ctx.imageSmoothingEnabled = true;
    rt.ctx.drawImage(preview, 0, 0, W, H);

    rt.key = key;
    rt.row = 0;
    rt.changedAt = p.millis();
  }

  if (rt.row < H && p.millis() - rt.changedAt >= HD_DELAY_MS) {
    const start = performance.now();
    while (rt.row < H && performance.now() - start < HD_BUDGET_MS) {
      const y1 = Math.min(H, rt.row + 2);
      renderRows(scene, W, H, rt.row, y1, HD_SAMPLES, rt.image.data);
      rt.ctx.putImageData(rt.image, 0, 0, 0, rt.row, W, y1 - rt.row);
      rt.row = y1;
    }
  }
  return rt;
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

/**
 * The shared sim-info panel is pinned to the canvas's top-left corner, so the
 * layout keeps that corner for content that can take the overlap.
 * Wide canvas: diagram on the left (anchored to the bottom, leaving the top
 * for the panel), image + equations on the right.
 * Narrow canvas: diagram, image and equations stacked.
 */
function layout(p, inputs) {
  const m = 14;
  const W = p.width;
  const H = p.height;

  if (W / H >= 1.15) {
    const leftW = (W - 3 * m) * 0.42;
    const rightX = 2 * m + leftW;
    const rightW = W - m - rightX;
    const rh = Math.min(rightW / 1.5, (H - 2 * m) * 0.6);
    const render = {
      x: rightX + (rightW - rh * 1.5) / 2,
      y: m,
      w: rh * 1.5,
      h: rh,
    };
    const eqTop = render.y + render.h + m;
    return {
      render,
      diagram: { x: m, y: m, w: leftW, h: H - 2 * m, align: "bottom" },
      equations:
        inputs.showEquations && H - eqTop - m > 60
          ? { x: rightX, y: eqTop, w: rightW, h: H - eqTop - m }
          : null,
    };
  }

  const rw = W - 2 * m;
  const diagram = { x: m, y: m, w: rw, h: Math.min(H * 0.34, rw * 0.7) };
  const rh = Math.min(rw / 1.5, H * 0.36);
  const render = {
    x: (W - rh * 1.5) / 2,
    y: diagram.y + diagram.h + m,
    w: rh * 1.5,
    h: rh,
  };
  const eqTop = render.y + render.h + m;
  return {
    render,
    diagram,
    equations:
      inputs.showEquations && H - eqTop - m > 60
        ? { x: m, y: eqTop, w: rw, h: H - eqTop - m }
        : null,
  };
}

const inside = (pt, r) =>
  pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h;

function pickPixel(m, rect, refs) {
  refs.pick = {
    u: clamp((m.x - rect.x) / rect.w, 0, 0.999),
    v: clamp((m.y - rect.y) / rect.h, 0, 0.999),
  };
}

/** Orthographic projection of the scene into the diagram rectangle. */
const VIEWS = {
  side: { h: 2, v: 1, hRange: [-5, 10], vRange: [-1, 8], flipV: true },
  top: { h: 0, v: 2, hRange: [-8, 8], vRange: [-4.5, 9], flipV: false },
};

function diagramView(rect, key) {
  const view = VIEWS[key] ?? VIEWS.side;
  const spanH = view.hRange[1] - view.hRange[0];
  const spanV = view.vRange[1] - view.vRange[0];
  const legendH = 44; // room for a legend that may wrap to two lines
  const s = Math.min(rect.w / spanH, (rect.h - legendH) / spanV);
  const ox = rect.x + (rect.w - spanH * s) / 2;
  const free = rect.h - legendH - spanV * s;
  const oy = rect.y + (rect.align === "bottom" ? free : free / 2);

  return {
    ...view,
    scale: s,
    box: { x: ox, y: oy, w: spanH * s, h: spanV * s },
    toScreen(P) {
      const a = P[view.h];
      const b = P[view.v];
      return {
        x: ox + (a - view.hRange[0]) * s,
        y: view.flipV
          ? oy + (view.vRange[1] - b) * s
          : oy + (b - view.vRange[0]) * s,
      };
    },
    toWorld(pt) {
      const a = (pt.x - ox) / s + view.hRange[0];
      const b = view.flipV
        ? view.vRange[1] - (pt.y - oy) / s
        : (pt.y - oy) / s + view.vRange[0];
      return [a, b];
    },
  };
}

// -----------------------------------------------------------------------------
// Drawing
// -----------------------------------------------------------------------------

function drawRender(p, rect, rt, rec) {
  p.push();
  p.drawingContext.drawImage(rt.canvas, rect.x, rect.y, rect.w, rect.h);

  // Crosshair on the followed pixel
  const x = rect.x + ((rec.px + 0.5) / rt.W) * rect.w;
  const y = rect.y + ((rec.py + 0.5) / rt.H) * rect.h;
  p.noFill();
  p.stroke(0, 0, 0, 140);
  p.strokeWeight(4);
  p.circle(x, y, 20);
  p.stroke(COLORS.ray);
  p.strokeWeight(2);
  p.circle(x, y, 20);
  p.line(x - 16, y, x - 6, y);
  p.line(x + 6, y, x + 16, y);
  p.line(x, y - 16, x, y - 6);
  p.line(x, y + 6, x, y + 16);

  // Quality badge
  const hd = rt.row >= rt.H;
  const label = hd ? `HD ${rt.W}×${rt.H} · 4× AA` : "Preview…";
  p.textFont("monospace");
  p.textSize(11);
  const tw = p.textWidth(label) + 14;
  p.noStroke();
  p.fill(13, 17, 23, 190);
  p.rect(rect.x + rect.w - tw - 8, rect.y + rect.h - 26, tw, 18, 9);
  p.fill(hd ? COLORS.normal : "#8b98a9");
  p.textAlign(p.LEFT, p.CENTER);
  p.text(label, rect.x + rect.w - tw - 1, rect.y + rect.h - 17);
  p.pop();
}

function drawDiagram(p, rect, scene, rec, inputs, W, H) {
  const view = diagramView(rect, inputs.diagramView);
  const { box, scale: s } = view;
  const S = view.toScreen;
  const seg = (a, b) => {
    const A = S(a);
    const B = S(b);
    p.line(A.x, A.y, B.x, B.y);
  };

  p.push();
  // Panel and grid
  p.noStroke();
  p.fill(15, 20, 28, 220);
  p.rect(box.x, box.y, box.w, box.h, 8);
  p.strokeWeight(1);
  for (let i = Math.ceil(view.hRange[0]); i <= view.hRange[1]; i++) {
    p.stroke(i === 0 ? 70 : 38, i === 0 ? 85 : 46, i === 0 ? 110 : 60);
    const x = box.x + (i - view.hRange[0]) * s;
    p.line(x, box.y, x, box.y + box.h);
  }
  for (let j = Math.ceil(view.vRange[0]); j <= view.vRange[1]; j++) {
    p.stroke(j === 0 ? 70 : 38, j === 0 ? 85 : 46, j === 0 ? 110 : 60);
    const y = view.flipV
      ? box.y + (view.vRange[1] - j) * s
      : box.y + (j - view.vRange[0]) * s;
    p.line(box.x, y, box.x + box.w, y);
  }
  if (view.flipV) {
    // Ground (y < 0) in the side view
    p.noStroke();
    p.fill(42, 47, 56);
    p.rect(box.x, box.y + view.vRange[1] * s, box.w, -view.vRange[0] * s);
  }
  const axisNames = ["x", "y", "z"];
  p.noStroke();
  p.fill(139, 152, 169);
  p.textFont("monospace");
  p.textSize(12);
  p.textAlign(p.RIGHT, p.BOTTOM);
  p.text(`${axisNames[view.h]} (m) →`, box.x + box.w - 6, box.y + box.h - 4);
  p.textAlign(p.LEFT, p.TOP);
  p.text(
    `${axisNames[view.v]} (m) ${view.flipV ? "↑" : "↓"}`,
    box.x + 6,
    box.y + 4
  );

  // Camera frustum and image plane, from the rays through the edge pixels
  const aspect = W / H;
  const edges = (
    inputs.diagramView === "top"
      ? [
          [0, 0.5],
          [1, 0.5],
        ]
      : [
          [0.5, 0],
          [0.5, 1],
        ]
  ).map(([u, v]) => primaryRay(scene, u, v, aspect).D);
  const cam = scene.camera.pos;
  p.stroke(90, 169, 255, 90);
  p.drawingContext.setLineDash([4, 4]);
  edges.forEach((D) => seg(cam, add(cam, scale(D, 3.2))));
  p.drawingContext.setLineDash([]);
  p.stroke(90, 169, 255, 210);
  p.strokeWeight(3);
  seg(add(cam, scale(edges[0], 0.9)), add(cam, scale(edges[1], 0.9)));

  // Sphere (an orthographic projection of a sphere is a circle of radius r)
  const C = S(scene.sphere.center);
  p.strokeWeight(2);
  p.stroke(255, 179, 158);
  p.fill(255, 122, 89, 215);
  p.circle(C.x, C.y, 2 * scene.sphere.radius * s);
  p.noStroke();
  p.fill(26, 13, 8);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(13);
  p.text("C", C.x, C.y);

  // The followed ray and its secondary rays
  p.strokeWeight(2.5);
  if (rec.hit === "sky") {
    p.stroke(COLORS.ray);
    arrow(p, S(rec.O), S(add(rec.O, scale(rec.D, 14))));
  } else {
    p.stroke(COLORS.ray);
    arrow(p, S(rec.O), S(rec.P));
    if (inputs.showRays) {
      p.drawingContext.setLineDash([6, 5]);
      p.stroke(rec.blocked ? "rgba(255,77,109,0.45)" : COLORS.light);
      seg(rec.P, scene.light.pos);
      p.drawingContext.setLineDash([]);
      if (rec.blocked) {
        p.stroke(COLORS.blocked);
        p.strokeWeight(3.5);
        seg(rec.P, add(rec.shadowOrigin, scale(rec.L, rec.shadowT)));
        p.strokeWeight(2.5);
      }
      const refl = rec.reflection;
      const reflEnd =
        refl?.hit && refl.hit !== "sky" ? refl.P : add(rec.P, scale(rec.Rv, 3));
      p.stroke(COLORS.reflected);
      p.drawingContext.setLineDash([2, 4]);
      arrow(p, S(rec.P), S(reflEnd));
      p.drawingContext.setLineDash([]);
      p.stroke(COLORS.normal);
      arrow(p, S(rec.P), S(add(rec.P, scale(rec.N, 1.1))));
    }
    const P = S(rec.P);
    p.stroke(COLORS.ray);
    p.strokeWeight(2);
    p.fill(255);
    p.circle(P.x, P.y, 9);
  }

  // Light
  const Lp = S(scene.light.pos);
  p.noStroke();
  for (let r = 44; r > 12; r -= 8) {
    p.fill(255, 201, 74, 18);
    p.circle(Lp.x, Lp.y, r * 2);
  }
  p.stroke(255, 243, 196);
  p.strokeWeight(2);
  p.fill(COLORS.light);
  p.circle(Lp.x, Lp.y, 22);

  // Camera
  const K = S(cam);
  p.stroke(207, 230, 255);
  p.fill(COLORS.camera);
  p.circle(K.x, K.y, 24);
  p.noStroke();
  p.fill(11, 18, 32);
  p.circle(K.x, K.y, 8);

  p.fill(230, 237, 243);
  p.textSize(13);
  p.textStyle(p.BOLD);
  p.textAlign(p.LEFT, p.BOTTOM);
  p.text("Light S", Lp.x + 16, Lp.y - 10);
  p.textAlign(p.LEFT, p.TOP);
  p.text("Camera O", K.x + 16, K.y + 10);
  p.textStyle(p.NORMAL);

  drawLegend(p, rect, box);
  p.pop();
}

function drawLegend(p, rect, box) {
  const items = [
    ["primary ray", COLORS.ray],
    ["normal N̂", COLORS.normal],
    ["shadow ray", COLORS.light],
    ["blocked", COLORS.blocked],
    ["reflected", COLORS.reflected],
  ];
  let x = box.x;
  let y = box.y + box.h + 14;
  p.textSize(11);
  p.textAlign(p.LEFT, p.CENTER);
  for (const [label, color] of items) {
    const w = 21 + p.textWidth(label);
    if (x > box.x && x + w > box.x + box.w) {
      x = box.x; // wrap onto a second line
      y += 18;
    }
    p.stroke(color);
    p.strokeWeight(3);
    p.line(x, y, x + 16, y);
    p.noStroke();
    p.fill(139, 152, 169);
    p.text(label, x + 21, y);
    x += 21 + p.textWidth(label) + 14;
  }
}

function arrow(p, A, B) {
  p.line(A.x, A.y, B.x, B.y);
  const ang = Math.atan2(B.y - A.y, B.x - A.x);
  const len = 9;
  p.line(
    B.x,
    B.y,
    B.x - len * Math.cos(ang - 0.4),
    B.y - len * Math.sin(ang - 0.4)
  );
  p.line(
    B.x,
    B.y,
    B.x - len * Math.cos(ang + 0.4),
    B.y - len * Math.sin(ang + 0.4)
  );
}

/**
 * The followed ray's equations with its live numbers substituted. A line
 * glows briefly whenever its value changes, so moving the light visibly
 * leaves the ray and intersection lines untouched.
 */
function drawEquations(p, rect, rec, scene, refs) {
  const f = (x, d = 2) => (x === null || x === undefined ? "—" : x.toFixed(d));
  const n = (x, d = 2) => (x < 0 ? `(${f(x, d)})` : f(x, d));
  const s = rec.sphereHit;
  const m = scene.material;

  const lines = [
    ["Ray", `P(t) = O + t·D̂,   D̂ = (${rec.D.map((x) => f(x, 3)).join(", ")})`],
    [
      "Sphere",
      `Δ = b² − 4ac = ${n(s.b)}² − 4·${f(s.a)}·${n(s.c)} = ${f(s.disc, 3)}`,
    ],
  ];
  if (rec.hit === "sky") {
    lines.push(["Result", "no hit — the pixel shows the sky"]);
  } else {
    lines.push(
      [
        "Hit",
        `t = ${f(rec.t, 3)} m on the ${rec.hit},   N̂ = (${rec.N.map((x) => f(x, 2)).join(", ")})`,
      ],
      [
        "Light",
        `E = I₀/d² = ${f(scene.light.intensity, 0)}/${f(rec.d)}² = ${f(rec.E, 3)} W/m²`,
      ],
      [
        "Shadow",
        rec.blocked
          ? `shadow ray blocked at s = ${f(rec.shadowT)} m < d`
          : "shadow ray reaches the light",
      ],
      [
        "Lambert",
        `I_d = k_d·E·max(0, N̂·L̂) = ${f(m.kd)}·${f(rec.E)}·${f(Math.max(0, rec.NdotL), 3)}${rec.blocked ? "·0" : ""} = ${f(rec.diffuse, 3)}`,
      ],
      [
        "Phong",
        `I_s = k_s·E·max(0, R̂·V̂)ⁿ = ${f(rec.ks)}·${f(rec.E)}·${f(Math.max(0, rec.RdotV), 3)}^${f(m.shininess, 0)} = ${f(rec.specular, 3)}`,
      ],
      ["Mirror", `D̂ᵣ = D̂ − 2(D̂·N̂)N̂,   θᵢ = θᵣ = ${f(rec.reflectionAngle, 1)}°`]
    );
  }

  // Track when each line last changed
  const now = p.millis();
  refs.eqCache ??= {};
  for (const [label, text] of lines) {
    const prev = refs.eqCache[label];
    if (!prev || prev.text !== text) {
      refs.eqCache[label] = { text, at: prev ? now : -Infinity };
    }
  }

  p.push();
  p.noStroke();
  p.fill(15, 20, 28, 220);
  p.rect(rect.x, rect.y, rect.w, rect.h, 8);
  p.textFont("monospace");
  const lineH = Math.min(22, (rect.h - 34) / lines.length);
  // Shrink the font until the longest line fits (monospace ≈ 0.6 em per char).
  const longest = Math.max(...lines.map(([, text]) => text.length)) + 9;
  const size = clamp(
    Math.min(lineH * 0.6, (rect.w - 24) / (longest * 0.6)),
    8,
    13
  );
  p.textSize(12);
  p.textStyle(p.BOLD);
  p.fill(124, 196, 255);
  p.textAlign(p.LEFT, p.TOP);
  p.text("Following one ray — live equations", rect.x + 12, rect.y + 9);
  p.textStyle(p.NORMAL);
  p.textSize(size);
  p.textAlign(p.LEFT, p.CENTER);

  lines.forEach(([label, text], i) => {
    const y = rect.y + 32 + i * lineH + lineH / 2;
    const age = now - refs.eqCache[label].at;
    if (age < FLASH_MS) {
      p.fill(255, 201, 74, 110 * (1 - age / FLASH_MS));
      p.rect(rect.x + 6, y - lineH / 2 + 1, rect.w - 12, lineH - 2, 4);
    }
    p.fill(139, 152, 169);
    p.text(label, rect.x + 12, y);
    p.fill(230, 237, 243);
    p.text(text, rect.x + 12 + size * 5.2, y);
  });
  p.pop();
}
