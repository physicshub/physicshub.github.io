"use client";

import { createSimulation } from "../app/(core)/engine/index.js";
import {
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/TrigonometricCircle.js";

/**
 * Trigonometric Circle — a pure-math laboratory, not a physics sim.
 *
 * Left panel: the unit circle with a draggable, auto-rotating point P at angle
 * θ. All six trigonometric functions appear as line segments (sin and cos are
 * the legs of the reference triangle; tan, cot, sec, csc are read where the ray
 * OP meets the tangent lines at x = 1 and y = 1, the classic construction).
 *
 * Right panel: the graph of the selected function over the window [θ−2π, θ+2π],
 * phase-locked to the circle. sin/cos/tan/cot/sec/csc are drawn in the
 * generalized form A·f(ωθ + φ); the four inverses are drawn over their principal
 * domain and the marker traces the reflected curve (arcsin(sinθ) = θ).
 *
 * No physics runs here: there is no force to integrate, so the whole sim is
 * drawn in pixel space by the draw hook and the angle lives in refs, advanced
 * by the fixed dt the runtime provides (like VectorsOperations).
 */
export default createSimulation({
  config: { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper },

  build({ world, inputs, refs }) {
    if (refs.theta === undefined) {
      refs.theta = (inputs.initialAngle * Math.PI) / 180;
    }
    refs.dragging = false;

    // The point P is dragged by projecting the pointer back onto the circle —
    // clipping a raw angle onto the ring, exactly like projecting onto an arc.
    world.add({
      onPointerDown(ctx) {
        const p = ctx.p;
        const { cx, cy, radius } = panelLayout(p);
        const dx = p.mouseX - cx;
        const dy = p.mouseY - cy;
        const d = Math.hypot(dx, dy);
        if (d < radius * 1.6) {
          refs.dragging = true;
          setAngleFromPointer(ctx, cx, cy);
        }
      },
      onPointerMove(ctx) {
        if (!refs.dragging) return;
        const { cx, cy } = panelLayout(ctx.p);
        setAngleFromPointer(ctx, cx, cy);
      },
      onPointerUp() {
        refs.dragging = false;
      },
    });

    return {};
  },

  update({ inputs, refs, dt }) {
    // The runtime hands us a fixed dt; this is the only clock the engine owns.
    if (!refs.dragging && inputs.autoRotate) {
      refs.theta += ((inputs.rotationSpeed * Math.PI) / 180) * dt;
    }
  },

  draw({ p, inputs, refs }) {
    drawCirclePanel(p, inputs, refs);
    drawGraphPanel(p, inputs, refs.theta);
  },

  info({ refs, inputs }) {
    const theta = refs.theta;
    const sin = Math.sin(theta);
    const cos = Math.cos(theta);
    const tan = Math.abs(cos) > 1e-9 ? Math.tan(theta) : null;
    const cot = Math.abs(sin) > 1e-9 ? cos / sin : null;
    const sec = Math.abs(cos) > 1e-9 ? 1 / cos : null;
    const csc = Math.abs(sin) > 1e-9 ? 1 / sin : null;

    const { value, deriv } = modelValue(inputs.model, theta, inputs);

    return {
      state: {
        thetaDeg: (theta * 180) / Math.PI,
        thetaRad: theta,
        sin,
        cos,
        tan,
        cot,
        sec,
        csc,
        sin2cos2: sin * sin + cos * cos,
        model: inputs.model,
        fvalue: value,
        fderiv: deriv,
      },
      context: {},
    };
  },
});

// -----------------------------------------------------------------------------
// Pointer interaction
// -----------------------------------------------------------------------------

/** Snap to the nearest 15° and write the angle back into refs. */
function setAngleFromPointer(ctx, cx, cy) {
  const p = ctx.p;
  const dx = p.mouseX - cx;
  // p5 y is down, the plan is y-up: negate dy before atan2.
  const dy = -(p.mouseY - cy);
  let angle = Math.atan2(dy, dx);
  if (ctx.inputs.snapSpecial) {
    const step = Math.PI / 12; // 15°
    angle = Math.round(angle / step) * step;
  }
  ctx.refs.theta = angle;
}

// -----------------------------------------------------------------------------
// Function tables
// -----------------------------------------------------------------------------

/** Six functions of angle + the four principal inverses, with derivatives. */
const FUNCS = {
  sin: {
    color: "#ef4444",
    label: "sin θ",
    paired: "arcsin",
    f: Math.sin,
    df: Math.cos,
  },
  cos: {
    color: "#3b82f6",
    label: "cos θ",
    paired: "arccos",
    f: Math.cos,
    df: (t) => -Math.sin(t),
  },
  tan: {
    color: "#f59e0b",
    label: "tan θ",
    paired: "arctan",
    f: Math.tan,
    df: (t) => 1 / Math.cos(t) ** 2,
  },
  cot: {
    color: "#10b981",
    label: "cot θ",
    paired: "arccot",
    f: (t) => Math.cos(t) / Math.sin(t),
    df: (t) => -1 / Math.sin(t) ** 2,
  },
  sec: {
    color: "#a855f7",
    label: "sec θ",
    paired: "arcsec",
    f: (t) => 1 / Math.cos(t),
    df: (t) => Math.sin(t) / Math.cos(t) ** 2,
  },
  csc: {
    color: "#06b6d4",
    label: "csc θ",
    paired: "arccsc",
    f: (t) => 1 / Math.sin(t),
    df: (t) => -Math.cos(t) / Math.sin(t) ** 2,
  },
  arcsin: {
    color: "#ef4444",
    label: "arcsin x",
    pair: "sin",
    domain: [-1.2, 1.2],
    range: [-1.9, 1.9],
    f: Math.asin,
    df: (x) => 1 / Math.sqrt(Math.max(0, 1 - x * x)),
  },
  arccos: {
    color: "#3b82f6",
    label: "arccos x",
    pair: "cos",
    domain: [-1.2, 1.2],
    range: [-0.4, 3.6],
    f: Math.acos,
    df: (x) => -1 / Math.sqrt(Math.max(0, 1 - x * x)),
  },
  arctan: {
    color: "#f59e0b",
    label: "arctan x",
    pair: "tan",
    domain: [-4, 4],
    range: [-1.9, 1.9],
    f: Math.atan,
    df: (x) => 1 / (1 + x * x),
  },
  arccot: {
    color: "#10b981",
    label: "arccot x",
    pair: "cot",
    domain: [-4, 4],
    range: [-0.4, 3.6],
    f: (x) => Math.atan2(1, x),
    df: (x) => -1 / (1 + x * x),
  },
};

/**
 * Value and d/dθ (or d/dx) of the selected function at θ, in the generalized
 * form A·f(ωθ + φ) for direct functions; plain principal branch for inverses.
 */
function modelValue(model, theta, inputs) {
  if (FUNCS[model].f === undefined) return { value: null, deriv: null };
  const def = FUNCS[model];

  if (def.pair) {
    const arg = pairedValue(def.pair, theta);
    return {
      value: def.f(arg),
      deriv: def.df(arg),
    };
  }

  const t = inputs.frequency * theta + inputs.phase;
  const A = inputs.amplitude;
  return {
    value: A * def.f(t),
    deriv: A * inputs.frequency * def.df(t),
  };
}

/** Direct value at θ for the pair of an inverse function. */
function pairedValue(pair, theta) {
  switch (pair) {
    case "sin":
      return Math.sin(theta);
    case "cos":
      return Math.cos(theta);
    case "tan":
      return Math.cos(theta) !== 0 ? Math.tan(theta) : Infinity;
    case "cot":
      return Math.sin(theta) !== 0
        ? Math.cos(theta) / Math.sin(theta)
        : Infinity;
    case "sec":
      return Math.cos(theta) !== 0 ? 1 / Math.cos(theta) : Infinity;
    case "csc":
      return Math.sin(theta) !== 0 ? 1 / Math.sin(theta) : Infinity;
    default:
      return 0;
  }
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

/** Pixel layout: unit circle on the left, graph panel on the right. */
function panelLayout(p) {
  const cx = p.width * 0.28;
  const cy = p.height * 0.5;
  const radius = Math.min(p.width * 0.2, p.height * 0.34);
  return { cx, cy, radius };
}

function graphBox(p) {
  return {
    x0: p.width * 0.56,
    x1: p.width * 0.95,
    y0: p.height * 0.08,
    y1: p.height * 0.92,
  };
}

/** Unit-circle coordinates (u, v, v up) to pixels. */
function unitToScreen(cx, cy, R, u, v) {
  return { x: cx + u * R, y: cy - v * R };
}

// -----------------------------------------------------------------------------
// Circle panel
// -----------------------------------------------------------------------------

function drawCirclePanel(p, inputs, refs) {
  const layout = panelLayout(p);
  const cx = layout.cx;
  const cy = layout.cy;
  const R = layout.radius * inputs.radius;
  const theta = refs.theta;

  p.push();
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(13);

  // Axes.
  p.strokeWeight(1);
  p.stroke(120, 120, 130, 140);
  p.line(cx - R * 1.5, cy, cx + R * 1.5, cy);
  p.line(cx, cy - R * 1.5, cx, cy + R * 1.5);

  // Unit-circle ticks at every 15°, emphasized every 30°.
  for (let deg = 0; deg < 360; deg += 15) {
    const a = (deg * Math.PI) / 180;
    const tick = deg % 30 === 0 ? R * 0.06 : R * 0.03;
    p.strokeWeight(deg % 30 === 0 ? 1.5 : 1);
    p.stroke(180, 180, 190, 120);
    const from = unitToScreen(cx, cy, R - tick, Math.cos(a), Math.sin(a));
    const to = unitToScreen(cx, cy, R + tick, Math.cos(a), Math.sin(a));
    p.line(from.x, from.y, to.x, to.y);
  }

  // The six segments.
  if (inputs.showSix) {
    drawSixSegments(p, cx, cy, R, theta);
  }

  // Projections of P onto the axes.
  if (inputs.showProjections) {
    drawProjections(p, inputs, cx, cy, R, theta);
  }

  // The reference triangle with SOH-CAH-TOA labelling.
  if (inputs.showTriangle) {
    drawTriangle(p, cx, cy, R, theta);
  }

  // The ray and the point P itself.
  drawRayAndPoint(p, inputs, cx, cy, R, theta);

  p.textSize(12);
  p.fill(200, 200, 210);
  p.noStroke();
  p.text("Unit circle", cx, p.height * 0.04);
  p.text(
    `sin²θ + cos²θ = ${(Math.sin(theta) ** 2 + Math.cos(theta) ** 2).toFixed(6)}`,
    cx,
    p.height * 0.96
  );

  p.pop();
}

/** The classic construction: all six functions as circle segments. */
function drawSixSegments(p, cx, cy, R, theta) {
  const sin = Math.sin(theta);
  const cos = Math.cos(theta);
  const tanOk = Math.abs(cos) > 1e-4;
  const cotOk = Math.abs(sin) > 1e-4;

  const O = { x: cx, y: cy };
  const P = unitToScreen(cx, cy, R, cos, sin);
  const F = unitToScreen(cx, cy, R, cos, 0); // foot of P on the x-axis

  // cos: center → foot; sin: foot → P.
  drawSegment(p, O, F, "#3b82f6", "cos");
  drawSegment(p, F, P, "#ef4444", "sin");

  // tan/sec: where the ray OP (λ·(cosθ, sinθ)) meets the tangent x = R.
  if (tanOk) {
    const Y = { x: cx + R, y: cy - R * Math.tan(theta) };
    drawSegment(p, { x: cx + R, y: cy }, Y, "#f59e0b", "tan");
    drawSegment(p, O, Y, "#a855f7", "sec");
  }

  // cot/csc: where the ray OP meets the tangent y = R.
  if (cotOk) {
    const X = { x: cx + R * (cos / sin), y: cy - R };
    drawSegment(p, { x: cx, y: cy - R }, X, "#10b981", "cot");
    drawSegment(p, O, X, "#06b6d4", "csc");
  }
}

function drawSegment(p, from, to, color, label) {
  p.strokeWeight(2);
  p.stroke(color);
  p.line(from.x, from.y, to.x, to.y);

  // Tiny label at the segment midpoint.
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  p.noFill();
  p.stroke(40, 40, 48);
  p.strokeWeight(1);
  p.rectMode(p.CENTER);
  p.rect(mx, my, 40, 16, 4);
  p.stroke(0);
  p.noStroke();
  p.fill(220);
  p.textSize(10);
  p.text(label, mx, my);
  p.rectMode(p.CORNER);
}

/** Dashed drop-lines from P to both axes, with the current values. */
function drawProjections(p, inputs, cx, cy, R, theta) {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const P = unitToScreen(cx, cy, R, cos, sin);

  p.push();
  p.stroke(255, 255, 255, 120);
  p.strokeWeight(1);
  p.drawingContext.setLineDash([4, 4]);
  p.line(P.x, cy, P.x, P.y);
  p.line(cx, P.y, P.x, P.y);
  p.drawingContext.setLineDash([]);

  p.noStroke();
  p.fill(230, 230, 240);
  p.textSize(11);
  p.textAlign(p.RIGHT, p.CENTER);
  p.text(`cos = ${cos.toFixed(2)}`, P.x, cy + 18);
  p.textAlign(p.CENTER, p.BOTTOM);
  p.text(`sin = ${sin.toFixed(2)}`, P.x + 18, cy - R * sin);
  p.pop();
}

/** The SOH-CAH-TOA triangle O–F–P with labeled sides. */
function drawTriangle(p, cx, cy, R, theta) {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const O = { x: cx, y: cy };
  const F = unitToScreen(cx, cy, R, cos, 0);
  const P = unitToScreen(cx, cy, R, cos, sin);

  p.push();
  p.strokeWeight(1.5);
  p.stroke(240, 240, 250, 200);
  p.fill(70, 80, 140, 40);
  p.rectMode(p.CORNER);
  p.triangle(O.x, O.y, F.x, F.y, P.x, P.y);

  p.noStroke();
  p.fill(240, 240, 250);
  p.textSize(11);
  p.text("adj = |cosθ|", (O.x + F.x) / 2, (O.y + F.y) / 2 + 14);
  p.text("opp = |sinθ|", (F.x + P.x) / 2 + 14, (F.y + P.y) / 2);
  p.text("hyp = 1", (O.x + P.x) / 2 - 26, (O.y + P.y) / 2 - 8);

  // SOH-CAH-TOA hint.
  p.textAlign(p.CENTER, p.TOP);
  p.textSize(10);
  p.fill(180, 180, 200);
  p.text(
    "SOH sin=opp/hyp · CAH cos=adj/hyp · TOA tan=opp/adj",
    cx,
    cy - R * 1.42
  );
  p.pop();
}

/** The ray OP extended, and the draggable point with its angle. */
function drawRayAndPoint(p, inputs, cx, cy, R, theta) {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const P = unitToScreen(cx, cy, R, cos, sin);

  // Faint ray beyond P.
  p.push();
  p.stroke(255, 255, 255, 60);
  p.strokeWeight(1);
  const ext = unitToScreen(cx, cy, R * 1.6, cos, sin);
  p.line(cx, cy, ext.x, ext.y);

  // The point itself.
  p.strokeWeight(3);
  p.stroke(20, 20, 26);
  p.fill(inputs.pointColor);
  p.circle(P.x, P.y, inputs.radius * 26);

  // Angle label, snapped to the dominant quadrant.
  const deg = (theta * 180) / Math.PI;
  p.noStroke();
  p.fill(inputs.pointColor);
  p.textSize(14);
  p.textAlign(p.LEFT, p.BOTTOM);
  p.text(`${deg.toFixed(1)}°`, P.x + 12, P.y - 10);
  p.pop();
}

// -----------------------------------------------------------------------------
// Graph panel
// -----------------------------------------------------------------------------

function drawGraphPanel(p, inputs, theta) {
  const box = graphBox(p);
  const def = FUNCS[inputs.model];
  const invDef = def.pair !== undefined;

  // Window in θ for direct functions, the principal domain for inverses.
  let xMin, xMax, yMin, yMax;
  let f;
  if (invDef) {
    [xMin, xMax] = def.domain;
    [yMin, yMax] = def.range;
    f = def.f;
  } else {
    xMin = theta - Math.PI * 2;
    xMax = theta + Math.PI * 2;
    [yMin, yMax] = directRange(inputs);
    f = (x) => modelValue(inputs.model, x, inputs).value;
  }

  const mapX = (x) => box.x0 + ((x - xMin) / (xMax - xMin)) * (box.x1 - box.x0);
  const mapY = (y) => box.y1 - ((y - yMin) / (yMax - yMin)) * (box.y1 - box.y0);

  p.push();
  p.textAlign(p.CENTER, p.BOTTOM);
  p.textSize(11);

  // Panel frame.
  p.strokeWeight(1);
  p.stroke(90, 90, 100);
  p.noFill();
  p.rect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);

  if (inputs.showGrid) {
    // Vertical π/2 grid for angles, a coarser one for inverse domains.
    const step = invDef ? 1 : Math.PI / 2;
    for (let i = Math.ceil(xMin / step); i <= Math.floor(xMax / step); i++) {
      const px = mapX(i * step);
      p.stroke(70, 70, 80, i % 2 === 0 ? 150 : 90);
      p.line(px, box.y0, px, box.y1);
    }
    for (let j = Math.ceil(yMin); j <= Math.floor(yMax); j++) {
      p.stroke(70, 70, 80, 120);
      p.line(box.x0, mapY(j), box.x1, mapY(j));
    }
  }

  // Asymptotes for tan/cot/sec/csc.
  if (
    inputs.showAsymptotes &&
    !invDef &&
    ["tan", "cot", "sec", "csc"].includes(inputs.model)
  ) {
    drawAsymptotes(p, box, inputs, xMin, xMax, mapX);
  }

  // The curve itself (split at asymptote jumps).
  drawCurve(p, box, f, xMin, xMax, yMin, yMax, mapX, mapY, def.color);

  // Marker: current θ for direct, the paired value for inverses.
  drawMarker(
    p,
    inputs,
    theta,
    invDef,
    def,
    f,
    xMin,
    xMax,
    yMin,
    yMax,
    mapX,
    mapY
  );

  // Tangent line at the marker (derivative of the selected function).
  if (inputs.showTangent) {
    drawTangent(
      p,
      inputs,
      theta,
      box,
      xMin,
      xMax,
      yMin,
      yMax,
      mapX,
      mapY,
      def.color
    );
  }

  // Title.
  p.noStroke();
  p.fill(220, 220, 230);
  p.textAlign(p.CENTER, p.TOP);
  p.text(
    `y = ${invDef ? def.label : `A·${def.label}`}`,
    (box.x0 + box.x1) / 2,
    p.height * 0.02
  );
  p.pop();
}

/** Symmetric y-range for the direct functions with a teaching-friendly scale. */
function directRange(inputs) {
  const unbounded = ["tan", "cot", "sec", "csc"].includes(inputs.model);
  const half = unbounded ? 8 : inputs.amplitude * 1.2 + 0.3;
  return [-half, half];
}

/** Dashed vertical asymptotes where the argument hits its singularity. */
function drawAsymptotes(p, box, inputs, xMin, xMax, mapX) {
  const { frequency: w, phase } = inputs;
  // cot/csc blow up when ωx + φ = kπ; tan/sec when ωx + φ = π/2 + kπ.
  const kink =
    inputs.model === "cot" || inputs.model === "csc" ? 0 : Math.PI / 2;
  const k0 = Math.ceil((kink - phase - xMax * w) / Math.PI);
  const k1 = Math.floor((kink - phase - xMin * w) / Math.PI);
  if (w <= 0) return;

  p.strokeWeight(1);
  p.stroke(255, 255, 255, 45);
  p.drawingContext.setLineDash([4, 4]);
  for (let k = k0; k <= k1; k++) {
    const x = (kink - phase + k * Math.PI) / w;
    const px = mapX(x);
    p.line(px, box.y0, px, box.y1);
  }
  p.drawingContext.setLineDash([]);
}

/** Polyline through the sampled function, breaking across asymptotes. */
function drawCurve(p, box, f, xMin, xMax, yMin, yMax, mapX, mapY, color) {
  const N = 400;
  const spanPx = box.y1 - box.y0;
  const yClip = (yMax - yMin) * 4;
  let prev = null;

  p.strokeWeight(2);
  p.stroke(color);
  p.noFill();

  for (let i = 0; i <= N; i++) {
    const x = xMin + (i / N) * (xMax - xMin);
    const y = f(x);
    if (!Number.isFinite(y) || Math.abs(y) > yClip) {
      prev = null; // leave the asymptote visible by dropping a point
      continue;
    }
    const px = mapX(x);
    const py = mapY(y);
    if (prev && Math.abs(py - prev.py) < spanPx * 1.2) {
      p.line(prev.px, prev.py, px, py);
    }
    prev = { px, py };
  }
}

/** The phase-locked point on the curve, with guide lines to the axes. */
function drawMarker(
  p,
  inputs,
  theta,
  invDef,
  def,
  f,
  xMin,
  xMax,
  yMin,
  yMax,
  mapX,
  mapY
) {
  const markerX = invDef ? pairedValue(def.pair, theta) : theta;
  let markerY = f(markerX);
  if (!Number.isFinite(markerY)) return;

  const mX = clamp(mapX(markerX), mapX(xMin), mapX(xMax));
  const mY = clamp(mapY(markerY), mapY(yMin), mapY(yMax));

  p.push();
  p.stroke(255, 255, 255, 130);
  p.strokeWeight(1);
  p.drawingContext.setLineDash([3, 3]);
  p.line(mapX(xMin), mY, mX, mY);
  p.line(mX, mapY(yMax), mX, mY);

  p.drawingContext.setLineDash([]);
  p.strokeWeight(3);
  p.stroke(20, 20, 26);
  p.fill(inputs.pointColor);
  p.circle(mX, mY, 9);
  p.pop();
}

/** Short segment with the local slope df/dθ (or dy/dx for inverses). */
function drawTangent(
  p,
  inputs,
  theta,
  box,
  xMin,
  xMax,
  yMin,
  yMax,
  mapX,
  mapY,
  color
) {
  const def = FUNCS[inputs.model];
  const invDef = def.pair !== undefined;
  const x0 = invDef ? pairedValue(def.pair, theta) : theta;

  let deriv, value;
  if (invDef) {
    value = def.f(x0);
    deriv = def.df(x0);
  } else {
    ({ value, deriv } = modelValue(inputs.model, x0, inputs));
  }

  if (!Number.isFinite(value) || !Number.isFinite(deriv)) return;
  if (Math.abs(value) > (yMax - yMin) * 4) return; // near an asymptote: hide it

  // d(y_px)/d(x_px): y is plotted y-up, so the slope sign flips in pixels.
  const scaleX = (box.x1 - box.x0) / (xMax - xMin);
  const scaleY = (box.y1 - box.y0) / (yMax - yMin);
  const slopePx = -deriv * (scaleY / scaleX);

  const px0 = mapX(x0);
  const py0 = mapY(value);
  const dxPx = 60;
  p.push();
  p.strokeWeight(1.5);
  p.stroke(color, 220);
  p.line(px0 - dxPx, py0 + slopePx * -dxPx, px0 + dxPx, py0 + slopePx * dxPx);
  p.pop();
}

// -----------------------------------------------------------------------------
// Small pixel-space utilities
// -----------------------------------------------------------------------------

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
