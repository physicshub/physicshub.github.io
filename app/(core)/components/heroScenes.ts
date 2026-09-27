// The live previews that rotate in the landing hero (HeroPreview.tsx).
//
// These are deliberately tiny, self-contained models rather than engine
// simulations: the homepage must not pull in p5 or the engine for a teaser.
// Each one still computes real physics — exact equations, RK4 or closed-form
// kinematics — and links to the full simulation.
//
// A scene is { id, label, caption, href, readout, prewarm, create }.
// `create(perturb)` returns an instance with step(dt), draw(ctx, w, h, colors)
// and values() (one string per `readout` symbol). `prewarm` is how many
// seconds to advance before drawing the still frame shown under reduced motion.

export type SceneColors = { fg: string; accent: string };

export type SceneInstance = {
  step(dt: number): void;
  draw(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    c: SceneColors
  ): void;
  values(): string[];
};

export type HeroScene = {
  id: string;
  label: string;
  caption: string;
  href: string;
  readout: string[];
  prewarm: number;
  create(perturb: boolean): SceneInstance;
};

type Deriv = (s: number[]) => number[];

function rk4(s: number[], h: number, f: Deriv): number[] {
  const n = s.length;
  const k1 = f(s);
  const k2 = f(s.map((v, i) => v + (k1[i] * h) / 2));
  const k3 = f(s.map((v, i) => v + (k2[i] * h) / 2));
  const k4 = f(s.map((v, i) => v + k3[i] * h));
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = s[i] + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
  }
  return out;
}

/** Push a point onto a flat [x, y, …] trail, keeping at most `max` points. */
function pushTrail(trail: number[], x: number, y: number, max: number) {
  trail.push(x, y);
  if (trail.length > max * 2) trail.splice(0, trail.length - max * 2);
}

/** Draw a flat trail in bands so older points fade out. */
function drawTrail(
  ctx: CanvasRenderingContext2D,
  trail: number[],
  px: (x: number) => number,
  py: (y: number) => number,
  color: string,
  maxAlpha = 0.8
) {
  const points = trail.length / 2;
  if (points < 2) return;
  const bands = 12;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let b = 0; b < bands; b++) {
    const from = Math.floor((b * points) / bands);
    const to = Math.min(points - 1, Math.floor(((b + 1) * points) / bands));
    if (to <= from) continue;
    ctx.globalAlpha = 0.06 + (maxAlpha - 0.06) * ((b + 1) / bands) ** 2;
    ctx.beginPath();
    ctx.moveTo(px(trail[from * 2]), py(trail[from * 2 + 1]));
    for (let i = from + 1; i <= to; i++) {
      ctx.lineTo(px(trail[i * 2]), py(trail[i * 2 + 1]));
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function dot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

const MINUS = "−";
const signed = (v: number, digits: number) =>
  `${v < 0 ? MINUS : ""}${Math.abs(v).toFixed(digits)}`;

/** Wrap an angle in radians to (−180°, 180°] and format it. */
const degrees = (rad: number) => {
  const deg = (((((rad * 180) / Math.PI + 180) % 360) + 360) % 360) - 180;
  return `${signed(deg, 1)}°`;
};

// --- Double pendulum -------------------------------------------------------
// The exact Lagrangian equations for (θ₁, θ₂) with unit masses and rods, as in
// simulations/DoublePendulum.jsx.

const G_EARTH = 9.81;

const pendulumDerivs: Deriv = ([t1, w1, t2, w2]) => {
  const d = t1 - t2;
  const den = 3 - Math.cos(2 * d); // 2m₁ + m₂ − m₂·cos(2Δ), m = l = 1
  const a1 =
    (-3 * G_EARTH * Math.sin(t1) -
      G_EARTH * Math.sin(t1 - 2 * t2) -
      2 * Math.sin(d) * (w2 * w2 + w1 * w1 * Math.cos(d))) /
    den;
  const a2 =
    (2 *
      Math.sin(d) *
      (2 * w1 * w1 + 2 * G_EARTH * Math.cos(t1) + w2 * w2 * Math.cos(d))) /
    den;
  return [w1, a1, w2, a2];
};

const doublePendulum: HeroScene = {
  id: "double-pendulum",
  label: /* i18n */ "Pendulum",
  caption: /* i18n */ "A double pendulum, computed live in your browser.",
  href: "/simulations/DoublePendulum",
  readout: ["θ₁", "θ₂"],
  prewarm: 6,
  create(perturb) {
    const jitter = () => (perturb ? (Math.random() - 0.5) * 0.4 : 0);
    let s = [2.1 + jitter(), 0, 2.7 + jitter(), 0];
    const trail: number[] = [];
    const bobs = () => {
      const x1 = Math.sin(s[0]);
      const y1 = Math.cos(s[0]);
      return [x1, y1, x1 + Math.sin(s[2]), y1 + Math.cos(s[2])];
    };
    return {
      step(dt) {
        s = rk4(s, dt, pendulumDerivs);
        const [, , x2, y2] = bobs();
        pushTrail(trail, x2, y2, 520);
      },
      draw(ctx, w, h, c) {
        const scale = Math.min(w, h) * 0.23;
        const cx = w / 2;
        const cy = h * 0.46;
        const px = (x: number) => cx + x * scale;
        const py = (y: number) => cy + y * scale;
        drawTrail(ctx, trail, px, py, c.accent);
        const [x1, y1, x2, y2] = bobs();
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = c.fg;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px(x1), py(y1));
        ctx.lineTo(px(x2), py(y2));
        ctx.stroke();
        ctx.globalAlpha = 1;
        dot(ctx, cx, cy, 3.5, c.fg);
        dot(ctx, px(x1), py(y1), 7, c.fg);
        dot(ctx, px(x2), py(y2), 8, c.accent);
      },
      values: () => [degrees(s[0]), degrees(s[2])],
    };
  },
};

// --- Three bodies on a figure eight -----------------------------------------
// Three equal masses (G = m = 1) on the Chenciner–Montgomery figure-eight
// choreography, period ≈ 6.3259, E = −1.2871. The readout shows total
// energy, which RK4 keeps constant to the digits shown. A click nudges one
// body's velocity by up to ±2% and shows the orbit's stability: the figure
// eight is linearly stable (Simó), so the perturbed orbit stays a slightly
// deformed eight rather than breaking up. That makes it a rare, special
// solution; the generic three-body problem, on /simulations/ThreeBody, is
// chaotic.

const threeBodyDerivs: Deriv = (s) => {
  const out = new Array(12).fill(0);
  for (let i = 0; i < 3; i++) {
    out[i * 2] = s[6 + i * 2];
    out[i * 2 + 1] = s[6 + i * 2 + 1];
  }
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      const dx = s[j * 2] - s[i * 2];
      const dy = s[j * 2 + 1] - s[i * 2 + 1];
      const r2 = dx * dx + dy * dy;
      const inv = 1 / (r2 * Math.sqrt(r2));
      out[6 + i * 2] += dx * inv;
      out[6 + i * 2 + 1] += dy * inv;
      out[6 + j * 2] -= dx * inv;
      out[6 + j * 2 + 1] -= dy * inv;
    }
  }
  return out;
};

const threeBody: HeroScene = {
  id: "three-body",
  label: /* i18n */ "Orbits",
  caption:
    /* i18n */ "Three equal masses chasing each other along a figure eight.",
  href: "/simulations/ThreeBody",
  readout: ["t", "E"],
  prewarm: 5,
  create(perturb) {
    const x1 = 0.97000436;
    const y1 = -0.24308753;
    const vx3 = -0.93240737;
    const vy3 = -0.86473146;
    const nudge = perturb ? 1 + (Math.random() - 0.5) * 0.04 : 1;
    // Positions (x, y) ×3, then velocities (vx, vy) ×3.
    let s = [
      x1,
      y1,
      -x1,
      -y1,
      0,
      0,
      (-vx3 / 2) * nudge,
      -vy3 / 2,
      -vx3 / 2,
      -vy3 / 2,
      vx3,
      vy3,
    ];
    // Remove the centre-of-mass velocity the nudge introduced, so total
    // momentum stays zero and the system doesn't drift across the plate.
    for (let axis = 0; axis < 2; axis++) {
      const vcm = (s[6 + axis] + s[8 + axis] + s[10 + axis]) / 3;
      for (let i = 0; i < 3; i++) s[6 + i * 2 + axis] -= vcm;
    }
    let time = 0;
    const trails: number[][] = [[], [], []];
    const energy = () => {
      let e = 0;
      for (let i = 0; i < 3; i++) {
        e += 0.5 * (s[6 + i * 2] ** 2 + s[7 + i * 2] ** 2);
      }
      for (let i = 0; i < 3; i++) {
        for (let j = i + 1; j < 3; j++) {
          e -= 1 / Math.hypot(s[j * 2] - s[i * 2], s[j * 2 + 1] - s[i * 2 + 1]);
        }
      }
      return e;
    };
    return {
      step(dt) {
        s = rk4(s, dt, threeBodyDerivs);
        time += dt;
        for (let i = 0; i < 3; i++) {
          pushTrail(trails[i], s[i * 2], s[i * 2 + 1], 700);
        }
      },
      draw(ctx, w, h, c) {
        const scale = Math.min(w / 2.6, h / 1.7);
        const cx = w / 2;
        const cy = h * 0.46;
        const px = (x: number) => cx + x * scale;
        const py = (y: number) => cy - y * scale;
        const colors = [c.accent, c.fg, c.accent];
        for (let i = 0; i < 3; i++) {
          drawTrail(ctx, trails[i], px, py, colors[i], i === 1 ? 0.45 : 0.75);
        }
        for (let i = 0; i < 3; i++) {
          dot(ctx, px(s[i * 2]), py(s[i * 2 + 1]), i === 1 ? 7 : 8, colors[i]);
        }
      },
      values: () => [time.toFixed(2), signed(energy(), 4)],
    };
  },
};

// --- Projectile ----------------------------------------------------------------
// Closed-form kinematics with no air resistance: each launch uses a new angle,
// the last few arcs stay on screen, and the velocity vector rides on the ball.

const V0 = 12; // m/s
const ANGLES = [45, 30, 60, 75, 52, 38];

const projectile: HeroScene = {
  id: "projectile",
  label: /* i18n */ "Projectile",
  caption:
    /* i18n */ "A projectile launched at a new angle each time, with no drag.",
  href: "/simulations/ParabolicMotion",
  readout: ["θ", "v"],
  prewarm: 5,
  create(perturb) {
    let launch = perturb ? Math.floor(Math.random() * ANGLES.length) : 0;
    let t = 0;
    let rest = 0; // pause on the ground between launches
    let arc: number[] = [];
    const past: number[][] = [];
    const angle = () => (ANGLES[launch % ANGLES.length] * Math.PI) / 180;
    const state = () => {
      const a = angle();
      const vx = V0 * Math.cos(a);
      const vy = V0 * Math.sin(a) - G_EARTH * t;
      return {
        x: vx * t,
        y: V0 * Math.sin(a) * t - 0.5 * G_EARTH * t * t,
        vx,
        vy,
      };
    };
    return {
      step(dt) {
        if (rest > 0) {
          rest -= dt;
          if (rest <= 0) {
            past.push(arc);
            if (past.length > 3) past.shift();
            arc = [];
            t = 0;
            launch++;
          }
          return;
        }
        t += dt;
        const flight = (2 * V0 * Math.sin(angle())) / G_EARTH;
        if (t >= flight) {
          t = flight;
          rest = 0.7;
        }
        const p = state();
        pushTrail(arc, p.x, Math.max(0, p.y), 2000);
      },
      draw(ctx, w, h, c) {
        const scale = Math.min((w * 0.84) / 15.5, (h * 0.66) / 7);
        const ox = (w - 15.5 * scale) / 2;
        const oy = h * 0.8;
        const px = (x: number) => ox + x * scale;
        const py = (y: number) => oy - y * scale;

        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = c.fg;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px(-0.4), oy);
        ctx.lineTo(px(15.9), oy);
        ctx.stroke();
        ctx.globalAlpha = 1;

        past.forEach((p, i) => drawTrail(ctx, p, px, py, c.fg, 0.12 + 0.1 * i));
        drawTrail(ctx, arc, px, py, c.accent, 0.9);

        const p = state();
        const bx = px(p.x);
        const by = py(Math.max(0, p.y));
        if (rest <= 0) {
          // Velocity vector, 0.12 s of travel long.
          const ex = bx + p.vx * scale * 0.12;
          const ey = by - p.vy * scale * 0.12;
          const head = Math.atan2(ey - by, ex - bx);
          ctx.strokeStyle = c.fg;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(ex, ey);
          ctx.lineTo(
            ex - 7 * Math.cos(head - 0.45),
            ey - 7 * Math.sin(head - 0.45)
          );
          ctx.moveTo(ex, ey);
          ctx.lineTo(
            ex - 7 * Math.cos(head + 0.45),
            ey - 7 * Math.sin(head + 0.45)
          );
          ctx.stroke();
        }
        dot(ctx, bx, by, 7, c.accent);
      },
      values: () => {
        const p = state();
        const speed = rest > 0 ? 0 : Math.hypot(p.vx, p.vy);
        return [
          `${ANGLES[launch % ANGLES.length]}°`,
          `${speed.toFixed(1)} m/s`,
        ];
      },
    };
  },
};

export const HERO_SCENES: HeroScene[] = [doublePendulum, threeBody, projectile];
