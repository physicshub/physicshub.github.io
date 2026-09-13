"use client";

/**
 * Kirchhoff's circuit laws — a DC resistive network solved by nodal analysis.
 *
 * This simulation deliberately leaves the force/integrate pipeline, for the same
 * kind of reason PiCollisions and DoublePendulum do: a resistive circuit has no
 * dynamics to integrate. Its state is the solution of a *linear system* — one
 * KCL equation per node — and that solution is exact, so stepping towards it
 * would only add error. An element solves the system every frame instead, and
 * the bodies in the world are the draggable meter probes, nothing else.
 *
 * Circuit model. A branch runs from one node to another and carries a series of
 * parts, each with a resistance and (for a cell) an EMF. Positive EMF drives
 * conventional current from `from` to `to` *inside* the branch, so
 *
 *     I_branch = (V_from - V_to + E_branch) / R_branch
 *
 * Substituting that into "current leaving a node sums to zero" gives the usual
 * conductance system G·v = i, assembled in `solveCircuit` below.
 */

import {
  createSimulation,
  Dragging,
  drawSegment,
  drawCoil,
  toScreen,
} from "../app/(core)/engine/index.js";
import { toMeters } from "../app/(core)/constants/Utils.js";
import {
  CIRCUIT_PRESETS,
  INITIAL_INPUTS,
  INPUT_FIELDS,
  SimInfoMapper,
} from "../app/(core)/data/configs/KirchhoffCircuit.js";

/** Smallest resistance a part may take. Keeps the matrix away from singular. */
const MIN_R = 0.01;
/** Charge dots per branch, and how fast one metre of wire flows per amp. */
const DOTS_PER_BRANCH = 7;
const FLOW_METRES_PER_AMP = 0.5;
const MAX_FLOW_SPEED = 2.5;
/** Power (W) at which a resistor's glow is roughly saturated. */
const GLOW_REFERENCE_POWER = 2;
/**
 * Width of the sim-info panel overlaying the canvas (15rem + its inset), and the
 * viewport below which it stops sitting beside the circuit. Both mirror
 * `.sim-info-panel` in styles/components/simulation.css — keep them in step.
 */
const INFO_PANEL_PX = 260;
const INFO_PANEL_DOCKS_BELOW_PX = 768;

const COLORS = {
  node: "#e2e8f0",
  resistor: "#f59e0b",
  battery: "#22d3ee",
  charge: "#facc15",
  arrow: "#38bdf8",
  text: "#e2e8f0",
  muted: "#94a3b8",
  probePlus: "#ef4444",
  probeMinus: "#e2e8f0",
  ammeter: "#a855f7",
};

const num = (v, fallback = 0) =>
  Number.isFinite(Number(v)) ? Number(v) : fallback;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// -----------------------------------------------------------------------------
// The circuits. Positions are normalised to [0, 1]² and mapped into the canvas
// at build time, so every preset is resolution independent.
// -----------------------------------------------------------------------------

const cell = (label, emfKey, rKey) => [
  {
    kind: "battery",
    label,
    emf: (i) => num(i[emfKey]),
    R: (i) => num(i[rKey]),
  },
];
const resistor = (label, key) => ({
  kind: "resistor",
  label,
  R: (i) => num(i[key]),
});

const PRESETS = {
  single: {
    nodes: [
      { id: "A", at: [0.5, 0.84] },
      { id: "B", at: [0.5, 0.16] },
    ],
    ground: "B",
    branches: [
      {
        id: "b0",
        label: "cell",
        from: "B",
        to: "A",
        via: [
          [0.12, 0.16],
          [0.12, 0.84],
        ],
        parts: cell("E₁", "emf1", "internalR1"),
      },
      {
        id: "b1",
        label: "R₁",
        from: "A",
        to: "B",
        via: [
          [0.88, 0.84],
          [0.88, 0.16],
        ],
        parts: [resistor("R₁", "r1")],
      },
    ],
    loops: [
      {
        label: "①",
        walk: [
          ["b0", 1],
          ["b1", 1],
        ],
      },
    ],
  },

  series: {
    nodes: [
      { id: "A", at: [0.1, 0.82] },
      { id: "B", at: [0.37, 0.82] },
      { id: "C", at: [0.63, 0.82] },
      { id: "D", at: [0.9, 0.82] },
    ],
    ground: "D",
    branches: [
      {
        id: "b0",
        label: "cell",
        from: "D",
        to: "A",
        via: [
          [0.9, 0.18],
          [0.1, 0.18],
        ],
        parts: cell("E₁", "emf1", "internalR1"),
      },
      {
        id: "b1",
        label: "R₁",
        from: "A",
        to: "B",
        parts: [resistor("R₁", "r1")],
      },
      {
        id: "b2",
        label: "R₂",
        from: "B",
        to: "C",
        parts: [resistor("R₂", "r2")],
      },
      {
        id: "b3",
        label: "R₃",
        from: "C",
        to: "D",
        parts: [resistor("R₃", "r3")],
      },
    ],
    loops: [
      {
        label: "①",
        walk: [
          ["b0", 1],
          ["b1", 1],
          ["b2", 1],
          ["b3", 1],
        ],
      },
    ],
  },

  parallel: {
    nodes: [
      { id: "T", at: [0.5, 0.85] },
      { id: "B", at: [0.5, 0.15] },
    ],
    ground: "B",
    branches: [
      {
        id: "b0",
        label: "cell",
        from: "B",
        to: "T",
        via: [
          [0.1, 0.15],
          [0.1, 0.85],
        ],
        parts: cell("E₁", "emf1", "internalR1"),
      },
      {
        id: "b1",
        label: "R₁",
        from: "T",
        to: "B",
        via: [
          [0.4, 0.85],
          [0.4, 0.15],
        ],
        parts: [resistor("R₁", "r1")],
      },
      {
        id: "b2",
        label: "R₂",
        from: "T",
        to: "B",
        via: [
          [0.63, 0.85],
          [0.63, 0.15],
        ],
        parts: [resistor("R₂", "r2")],
      },
      {
        id: "b3",
        label: "R₃",
        from: "T",
        to: "B",
        via: [
          [0.86, 0.85],
          [0.86, 0.15],
        ],
        parts: [resistor("R₃", "r3")],
      },
    ],
    loops: [
      {
        label: "①",
        walk: [
          ["b0", 1],
          ["b1", 1],
        ],
      },
      {
        label: "②",
        walk: [
          ["b1", -1],
          ["b2", 1],
        ],
      },
      {
        label: "③",
        walk: [
          ["b2", -1],
          ["b3", 1],
        ],
      },
    ],
  },

  twoLoop: {
    nodes: [
      { id: "A", at: [0.5, 0.86] },
      { id: "B", at: [0.5, 0.14] },
    ],
    ground: "B",
    branches: [
      {
        id: "b1",
        label: "E₁ branch",
        from: "B",
        to: "A",
        via: [
          [0.1, 0.14],
          [0.1, 0.86],
        ],
        parts: [...cell("E₁", "emf1", "internalR1"), resistor("R₁", "r1")],
      },
      {
        id: "b2",
        label: "R₂ branch",
        from: "A",
        to: "B",
        parts: [resistor("R₂", "r2")],
      },
      {
        id: "b3",
        label: "E₂ branch",
        from: "B",
        to: "A",
        via: [
          [0.9, 0.14],
          [0.9, 0.86],
        ],
        parts: [...cell("E₂", "emf2", "internalR2"), resistor("R₃", "r3")],
      },
    ],
    loops: [
      {
        label: "①",
        walk: [
          ["b1", 1],
          ["b2", 1],
        ],
      },
      {
        label: "②",
        walk: [
          ["b3", 1],
          ["b2", 1],
        ],
      },
    ],
  },
};

const presetLabel = (id) =>
  CIRCUIT_PRESETS.find((option) => option.value === id)?.label ?? id;

/** The preset the inputs ask for, falling back to the default circuit. */
const presetFor = (inputs) =>
  PRESETS[inputs.preset] ? inputs.preset : INITIAL_INPUTS.preset;

// -----------------------------------------------------------------------------
// Geometry
// -----------------------------------------------------------------------------

/**
 * Map a preset's normalised coordinates into metres inside the canvas.
 *
 * The left inset also has to clear the sim-info panel, which is absolutely
 * positioned over the top-left of the canvas and matters more here than in most
 * simulations: this readout is the KVL/KCL proof, so it is worth keeping open,
 * and a circuit hidden behind it would be useless. On a narrow viewport the
 * panel docks to the bottom edge instead, so there the circuit keeps the full
 * width — which is where it is scarcest.
 */
function layout(preset, bounds, viewportWidth) {
  const padRight = bounds.width * 0.08;
  const padLeft =
    viewportWidth >= INFO_PANEL_DOCKS_BELOW_PX
      ? clamp(toMeters(INFO_PANEL_PX), bounds.width * 0.12, bounds.width * 0.38)
      : padRight;
  const padY = bounds.height * 0.16;
  const w = Math.max(0.1, bounds.width - padLeft - padRight);
  const h = Math.max(0.1, bounds.height - 2 * padY);
  const place = ([x, y]) => ({ x: padLeft + x * w, y: padY + y * h });

  const nodes = preset.nodes.map((node) => ({ ...node, pos: place(node.at) }));
  const byId = new Map(nodes.map((node) => [node.id, node]));

  const branches = preset.branches.map((branch) => {
    const points = [
      byId.get(branch.from).pos,
      ...(branch.via ?? []).map(place),
      byId.get(branch.to).pos,
    ];
    const lengths = points
      .slice(1)
      .map((q, i) => Math.hypot(q.x - points[i].x, q.y - points[i].y));
    return {
      ...branch,
      points,
      lengths,
      total: lengths.reduce((sum, l) => sum + l, 0),
      // Components belong on the branch's long straight run, never spread over
      // its whole path — placing them by total arc length parks them on the
      // corners. Every preset routes a branch as one run with a stub at each
      // end (or a single straight segment), so the middle segment is it.
      run: Math.floor(lengths.length / 2),
    };
  });

  return { nodes, byId, branches, ground: preset.ground, loops: preset.loops };
}

/** Point and unit tangent at fraction `t` of a branch's arc length. */
function pointOn(branch, t) {
  const { points, lengths, total } = branch;
  let distance = clamp(t, 0, 1) * total;
  for (let i = 0; i < lengths.length; i++) {
    const length = lengths[i];
    if (distance <= length || i === lengths.length - 1) {
      const f = length > 0 ? clamp(distance / length, 0, 1) : 0;
      const a = points[i];
      const b = points[i + 1];
      return {
        x: a.x + (b.x - a.x) * f,
        y: a.y + (b.y - a.y) * f,
        dx: length > 0 ? (b.x - a.x) / length : 1,
        dy: length > 0 ? (b.y - a.y) / length : 0,
      };
    }
    distance -= length;
  }
  return { ...points[0], dx: 1, dy: 0 };
}

/**
 * One line of canvas text in the simulation's font. Every label here — component
 * values, node potentials, meter readings — goes through this, so they cannot
 * drift apart typographically.
 */
function drawLabel(p, x, y, text, options = {}) {
  p.push();
  p.noStroke();
  p.textFont("Poppins");
  p.textSize(options.size ?? (p.width < 640 ? 11 : 13));
  p.textAlign(options.alignX ?? p.CENTER, options.alignY ?? p.BOTTOM);
  p.fill(options.color ?? COLORS.text);
  p.text(text, x, y);
  p.pop();
}

/** Point and unit tangent at fraction `f` of a single segment of a branch. */
function pointOnRun(branch, f) {
  const i = branch.run;
  const a = branch.points[i];
  const b = branch.points[i + 1];
  const length = branch.lengths[i] || 1;
  const t = clamp(f, 0, 1);
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    dx: (b.x - a.x) / length,
    dy: (b.y - a.y) / length,
  };
}

// -----------------------------------------------------------------------------
// The solver
// -----------------------------------------------------------------------------

/** Gaussian elimination with partial pivoting. Returns null if singular. */
function gaussian(A, b) {
  const n = b.length;
  if (n === 0) return [];
  const M = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    }
    if (Math.abs(M[pivot][col]) < 1e-12) return null;
    [M[col], M[pivot]] = [M[pivot], M[col]];
    for (let r = col + 1; r < n; r++) {
      const factor = M[r][col] / M[col][col];
      for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
    }
  }

  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let sum = M[r][n];
    for (let c = r + 1; c < n; c++) sum -= M[r][c] * x[c];
    x[r] = sum / M[r][r];
  }
  return x.every(Number.isFinite) ? x : null;
}

/**
 * Solve the network for the current inputs.
 *
 * KCL at a non-ground node n, summing the current *leaving* n:
 *   leaving through a branch = s·(V_from − V_to + E)/R,  s = +1 if n is `from`
 * and since V_from − V_to = s·(Vₙ − V_other) with s² = 1, that is
 *   (Vₙ − V_other)/R + s·E/R.
 * Setting the sum to zero gives the row
 *   Σ(1/R)·Vₙ − Σ(1/R)·V_other = −Σ s·E/R.
 */
function solveCircuit(circuit, inputs) {
  const unknowns = new Map();
  for (const node of circuit.nodes) {
    if (node.id !== circuit.ground) unknowns.set(node.id, unknowns.size);
  }
  const n = unknowns.size;

  const branches = circuit.branches.map((branch) => {
    const parts = branch.parts.map((part) => ({
      kind: part.kind,
      label: part.label,
      R: Math.max(MIN_R, num(part.R?.(inputs))),
      emf: num(part.emf?.(inputs)),
    }));
    return {
      ref: branch,
      parts,
      R: parts.reduce((sum, part) => sum + part.R, 0),
      emf: parts.reduce((sum, part) => sum + part.emf, 0),
      I: 0,
    };
  });

  const G = Array.from({ length: n }, () => new Array(n).fill(0));
  const rhs = new Array(n).fill(0);

  for (const branch of branches) {
    const g = 1 / branch.R;
    for (const [id, s] of [
      [branch.ref.from, 1],
      [branch.ref.to, -1],
    ]) {
      const row = unknowns.get(id);
      if (row === undefined) continue; // the ground row is dropped
      G[row][row] += g;
      const otherId = s === 1 ? branch.ref.to : branch.ref.from;
      const col = unknowns.get(otherId);
      if (col !== undefined) G[row][col] -= g;
      rhs[row] -= s * branch.emf * g;
    }
  }

  const x = gaussian(G, rhs);
  if (!x) return { ok: false, branches, potentials: new Map() };

  const potentials = new Map([[circuit.ground, 0]]);
  for (const [id, row] of unknowns) potentials.set(id, x[row]);

  for (const branch of branches) {
    branch.I =
      (potentials.get(branch.ref.from) -
        potentials.get(branch.ref.to) +
        branch.emf) /
      branch.R;
  }

  return { ok: true, branches, potentials };
}

/** The KVL walk for each declared loop: every rise and drop, in order. */
function loopTerms(circuit, solution) {
  const byId = new Map(solution.branches.map((b) => [b.ref.id, b]));
  return circuit.loops.map((loop) => {
    const terms = [];
    for (const [id, s] of loop.walk) {
      const branch = byId.get(id);
      if (!branch) continue;
      // Traversing from → to, the potential change is E − I·R. Walking the
      // branch backwards negates it, and visits its parts in reverse order.
      const parts = s > 0 ? branch.parts : [...branch.parts].reverse();
      for (const part of parts) {
        // A cell always contributes its EMF term, even at 0 V: the walk has to
        // account for every component you pass, or the readout stops matching
        // the circuit you can see.
        if (part.kind === "battery") terms.push(s * part.emf);
        terms.push(-s * branch.I * part.R);
      }
    }
    return {
      label: loop.label,
      terms,
      sum: terms.reduce((sum, t) => sum + t, 0),
    };
  });
}

/** KCL at every node: current in against current out. */
function nodeBalance(circuit, solution) {
  return circuit.nodes.map((node) => {
    let inSum = 0;
    let outSum = 0;
    for (const branch of solution.branches) {
      const s =
        branch.ref.from === node.id ? 1 : branch.ref.to === node.id ? -1 : 0;
      if (s === 0) continue;
      const leaving = s * branch.I;
      if (leaving >= 0) outSum += leaving;
      else inSum -= leaving;
    }
    return { label: node.id, inSum, outSum, residual: outSum - inSum };
  });
}

// -----------------------------------------------------------------------------
// Elements
// -----------------------------------------------------------------------------

/**
 * Advances each branch's charge animation, using the solution the `update` hook
 * has already put on `refs.solution`. This is the one part of the simulation that
 * belongs on the clock, which is why it is the only part in a step hook.
 */
function chargeClock(circuit, refs) {
  return {
    attach() {
      refs.phases = Object.fromEntries(circuit.branches.map((b) => [b.id, 0]));
    },

    beforeStep(ctx) {
      const solution = refs.solution;
      if (!solution?.ok) return;
      // Dots move along a branch at a speed proportional to its current, so
      // direction and magnitude are both visible; the cap keeps a near-short
      // circuit from strobing.
      for (const branch of solution.branches) {
        const speed = clamp(
          branch.I * FLOW_METRES_PER_AMP,
          -MAX_FLOW_SPEED,
          MAX_FLOW_SPEED
        );
        const total = branch.ref.total || 1;
        const phase = refs.phases[branch.ref.id] + (speed * ctx.dt) / total;
        refs.phases[branch.ref.id] = phase - Math.floor(phase);
      }
    },
  };
}

/** Wires, resistors, cells and node dots. */
function circuitRenderer(circuit, refs) {
  const drawResistor = (p, point, glow) => {
    const half = 0.22;
    const a = { x: point.x - point.dx * half, y: point.y - point.dy * half };
    const b = { x: point.x + point.dx * half, y: point.y + point.dy * half };
    p.drawingContext.shadowBlur = glow * 26;
    p.drawingContext.shadowColor = COLORS.resistor;
    drawCoil(p, a, b, {
      coils: 10,
      width: 7,
      color: COLORS.resistor,
      weight: 3,
    });
    p.drawingContext.shadowBlur = 0;
  };

  // The long plate is the + terminal, and it faces `to` — which is the end the
  // EMF drives conventional current towards inside the branch.
  const drawBattery = (p, point) => {
    const nx = -point.dy;
    const ny = point.dx;
    const plate = (offset, halfHeight, weight) => {
      const cx = point.x + point.dx * offset;
      const cy = point.y + point.dy * offset;
      drawSegment(
        p,
        { x: cx - nx * halfHeight, y: cy - ny * halfHeight },
        { x: cx + nx * halfHeight, y: cy + ny * halfHeight },
        { color: COLORS.battery, weight }
      );
    };
    plate(0.05, 0.15, 3); // long plate, towards `to`  → positive terminal
    plate(-0.05, 0.08, 6); // short thick plate        → negative terminal
  };

  return {
    zIndex: -20,

    render(ctx) {
      const { p } = ctx;
      const solution = refs.solution;
      const wire = ctx.inputs.wireColor || "#94a3b8";
      const glowOn = ctx.inputs.showGlow !== false;
      const small = p.width < 640;

      for (const branch of circuit.branches) {
        for (let i = 0; i < branch.points.length - 1; i++) {
          drawSegment(p, branch.points[i], branch.points[i + 1], {
            color: wire,
            weight: 3,
          });
        }
      }

      for (const branch of circuit.branches) {
        const solved = solution?.branches.find((b) => b.ref.id === branch.id);
        const parts = solved ? solved.parts : branch.parts.map(() => null);
        const count = branch.parts.length;

        branch.parts.forEach((part, index) => {
          const point = pointOnRun(branch, (index + 1) / (count + 1));
          const resolved = parts[index];

          if (part.kind === "battery") {
            drawBattery(p, point);
          } else {
            // Brightness saturates with dissipated power, so a resistor carrying
            // more current really does look hotter — P = I²R.
            const power = resolved ? solved.I * solved.I * resolved.R : 0;
            const glow =
              glowOn && solution?.ok
                ? 1 - Math.exp(-power / GLOW_REFERENCE_POWER)
                : 0;
            drawResistor(p, point, glow);
          }

          // Label beside a vertical component, above a horizontal one, so it
          // never lands on top of the symbol it names.
          const screen = toScreen(point);
          const vertical = Math.abs(point.dy) > Math.abs(point.dx);
          const text =
            part.kind === "battery" && resolved
              ? `${part.label} ${resolved.emf.toFixed(1)} V`
              : `${part.label}${resolved ? ` ${resolved.R.toFixed(2)} Ω` : ""}`;

          if (vertical) {
            drawLabel(p, screen.x + 22, screen.y, text, {
              alignX: p.LEFT,
              alignY: p.CENTER,
            });
          } else {
            drawLabel(p, screen.x, screen.y - 20, text);
          }
        });
      }

      for (const node of circuit.nodes) {
        const screen = toScreen(node.pos);
        const potential = solution?.potentials.get(node.id);
        p.push();
        p.noStroke();
        p.fill(COLORS.node);
        p.circle(screen.x, screen.y, 12);
        p.pop();

        const label =
          node.id === circuit.ground
            ? `${node.id} (0 V)`
            : `${node.id}${
                Number.isFinite(potential) ? ` ${potential.toFixed(2)} V` : ""
              }`;
        drawLabel(p, screen.x, screen.y - 12, label, { size: small ? 12 : 14 });
      }
    },
  };
}

/** Arrows showing the direction conventional current actually flows. */
function currentArrows(circuit, refs) {
  return {
    zIndex: 6,
    render(ctx) {
      if (ctx.inputs.showCurrentArrows === false) return;
      const solution = refs.solution;
      if (!solution?.ok) return;
      const { p } = ctx;

      for (const solved of solution.branches) {
        if (Math.abs(solved.I) < 1e-9) continue;
        const point = pointOnRun(solved.ref, 0.12);
        const sign = Math.sign(solved.I);
        const screen = toScreen(point);
        // Screen Y grows downward, so the tangent's y component flips.
        const angle = Math.atan2(-point.dy * sign, point.dx * sign);

        p.push();
        p.translate(screen.x, screen.y);
        p.rotate(angle);
        p.noStroke();
        p.fill(COLORS.arrow);
        p.triangle(-7, -6, -7, 6, 10, 0);
        p.pop();
      }
    },
  };
}

/** Charge carriers drifting along each branch at a speed set by its current. */
function chargeFlow(circuit, refs) {
  return {
    zIndex: 5,
    render(ctx) {
      if (ctx.inputs.showChargeFlow === false) return;
      const solution = refs.solution;
      if (!solution?.ok) return;
      const { p } = ctx;

      p.push();
      p.noStroke();
      for (const solved of solution.branches) {
        if (Math.abs(solved.I) < 1e-6) continue;
        const phase = refs.phases?.[solved.ref.id] ?? 0;
        const alpha = clamp(60 + Math.abs(solved.I) * 90, 60, 255);
        p.fill(COLORS.charge + Math.round(alpha).toString(16).padStart(2, "0"));
        for (let k = 0; k < DOTS_PER_BRANCH; k++) {
          let t = phase + k / DOTS_PER_BRANCH;
          t -= Math.floor(t);
          const point = pointOn(solved.ref, t);
          const screen = toScreen(point);
          p.circle(screen.x, screen.y, 7);
        }
      }
      p.pop();
    },
  };
}

/**
 * The voltmeter leads and the ammeter clamp.
 *
 * The probe bodies are invisible and kinematic — they never integrate, they only
 * follow the pointer through `Dragging` — and this element snaps them onto the
 * circuit and draws them itself, so the meters look like meters rather than like
 * the engine's default circles.
 */
function probes(circuit, refs, bodies) {
  const nearestNode = (position) =>
    circuit.nodes.reduce((best, node) => {
      const d = Math.hypot(node.pos.x - position.x, node.pos.y - position.y);
      return !best || d < best.d ? { node, d } : best;
    }, null).node;

  /** Nearest point on any branch, sampled along its arc length. */
  const nearestOnBranch = (position) => {
    let best = null;
    for (const branch of circuit.branches) {
      for (let k = 1; k < 24; k++) {
        const t = k / 24;
        const point = pointOn(branch, t);
        const d = Math.hypot(point.x - position.x, point.y - position.y);
        if (!best || d < best.d) best = { branch, t, point, d };
      }
    }
    return best;
  };

  /** A meter reading in a dark pill, so it stays legible over a wire. */
  const readingBox = (p, screen, text, color) => {
    p.push();
    p.textFont("Poppins");
    p.textSize(p.width < 640 ? 11 : 13);
    p.rectMode(p.CENTER);
    p.noStroke();
    p.fill(15, 23, 42, 225);
    p.rect(screen.x, screen.y - 26, p.textWidth(text) + 16, 22, 6);
    p.pop();
    drawLabel(p, screen.x, screen.y - 26, text, {
      color,
      alignY: p.CENTER,
    });
  };

  return {
    zIndex: 20,

    render(ctx) {
      if (ctx.inputs.showProbes === false) {
        refs.voltmeter = null;
        refs.ammeter = null;
        return;
      }
      const { p } = ctx;
      const solution = refs.solution;

      // --- Voltmeter: two leads, each snapped to the node nearest the pointer.
      const plusNode = nearestNode(bodies.probePlus.state.position);
      const minusNode = nearestNode(bodies.probeMinus.state.position);
      if (!bodies.probePlus.isDragged) {
        bodies.probePlus.state.position.set(plusNode.pos.x, plusNode.pos.y);
      }
      if (!bodies.probeMinus.isDragged) {
        bodies.probeMinus.state.position.set(minusNode.pos.x, minusNode.pos.y);
      }

      drawSegment(p, plusNode.pos, minusNode.pos, {
        color: COLORS.muted,
        weight: 2,
        dashed: true,
      });

      const plusScreen = toScreen(plusNode.pos);
      const minusScreen = toScreen(minusNode.pos);
      p.push();
      p.noStroke();
      p.fill(COLORS.probePlus);
      p.circle(plusScreen.x, plusScreen.y, 16);
      p.fill(COLORS.probeMinus);
      p.circle(minusScreen.x, minusScreen.y, 16);
      p.pop();

      const reading =
        solution?.ok && plusNode.id !== minusNode.id
          ? solution.potentials.get(plusNode.id) -
            solution.potentials.get(minusNode.id)
          : 0;
      refs.voltmeter = {
        from: plusNode.id,
        to: minusNode.id,
        reading,
      };
      readingBox(
        p,
        {
          x: (plusScreen.x + minusScreen.x) / 2,
          y: (plusScreen.y + minusScreen.y) / 2,
        },
        `V ${reading.toFixed(2)} V`,
        COLORS.probePlus
      );

      // --- Ammeter: clamps onto whichever branch is nearest the pointer.
      const hit = nearestOnBranch(bodies.ammeter.state.position);
      if (hit) {
        if (!bodies.ammeter.isDragged) {
          bodies.ammeter.state.position.set(hit.point.x, hit.point.y);
        }
        const solved = solution?.branches.find(
          (b) => b.ref.id === hit.branch.id
        );
        const current = solution?.ok && solved ? solved.I : 0;
        refs.ammeter = { label: hit.branch.label, reading: current };

        const screen = toScreen(hit.point);
        p.push();
        p.noFill();
        p.stroke(COLORS.ammeter);
        p.strokeWeight(3);
        p.circle(screen.x, screen.y, 26);
        p.pop();
        drawLabel(p, screen.x, screen.y + 1, "A", {
          color: COLORS.ammeter,
          alignY: p.CENTER,
          size: 13,
        });
        readingBox(p, screen, `${current.toFixed(3)} A`, COLORS.ammeter);
      }
    },
  };
}

// -----------------------------------------------------------------------------

export default createSimulation({
  config: { INITIAL_INPUTS, INPUT_FIELDS, SimInfoMapper },

  build({ p, world, inputs, bounds, refs }) {
    const presetId = presetFor(inputs);
    const circuit = layout(
      PRESETS[presetId],
      { width: bounds.width, height: bounds.height },
      p.windowWidth
    );

    refs.preset = presetId;
    refs.circuit = circuit;
    refs.solution = null;

    // Probes are the only bodies here: kinematic so the World never integrates
    // them, invisible because this simulation draws them as meters.
    const probeBody = (label, color, at) =>
      world.addBody({
        label,
        color,
        at,
        size: 0.26,
        kinematic: true,
        visible: false,
      });

    const first = circuit.nodes[0].pos;
    const last = circuit.nodes[circuit.nodes.length - 1].pos;
    const clampStart = pointOnRun(circuit.branches[0], 0.85);
    const bodies = {
      probePlus: probeBody("V+", COLORS.probePlus, [first.x, first.y]),
      probeMinus: probeBody("V−", COLORS.probeMinus, [last.x, last.y]),
      ammeter: probeBody("A", COLORS.ammeter, [clampStart.x, clampStart.y]),
    };

    world.add(
      chargeClock(circuit, refs),
      circuitRenderer(circuit, refs),
      chargeFlow(circuit, refs),
      currentArrows(circuit, refs),
      probes(circuit, refs, bodies),
      Dragging({
        bodies: Object.values(bodies),
        enabled: () => inputs.showProbes !== false,
      })
    );

    return { circuit, ...bodies };
  },

  // Switching preset changes *what exists*, so the world is rebuilt rather than
  // re-parameterised. Every other input is read live by the solve below.
  //
  // The solve lives here rather than in a step hook because `update` runs every
  // frame whether or not the clock is running, and a learner will drag a slider
  // while paused. It is also the only ordering that guarantees every renderer
  // and the readout see the same solution: `update` runs before the steps, which
  // run before `render`.
  update({ inputs, refs, rebuild }) {
    const wanted = presetFor(inputs);
    if (refs.preset !== wanted) rebuild();
    refs.solution = solveCircuit(refs.circuit, inputs);
  },

  info({ inputs, refs }) {
    const circuit = refs.circuit;
    const solution = refs.solution;
    if (!circuit || !solution) return null;

    const label = presetLabel(refs.preset ?? inputs.preset);
    if (!solution.ok) return { state: { ok: false, presetLabel: label } };

    const dissipation = [];
    let powerDelivered = 0;
    let powerDissipated = 0;
    for (const branch of solution.branches) {
      for (const part of branch.parts) {
        const heat = branch.I * branch.I * part.R;
        powerDissipated += heat;
        powerDelivered += part.emf * branch.I;
        if (part.kind === "resistor") {
          dissipation.push({ label: part.label, P: heat });
        }
      }
    }

    return {
      state: {
        ok: true,
        presetLabel: label,
        nodes: circuit.nodes.map((node) => ({
          label: node.id,
          V: solution.potentials.get(node.id) ?? 0,
          isGround: node.id === circuit.ground,
        })),
        branches: solution.branches.map((branch) => ({
          label: branch.ref.label,
          from: branch.ref.from,
          to: branch.ref.to,
          I: branch.I,
        })),
        kcl: nodeBalance(circuit, solution),
        loops: loopTerms(circuit, solution),
        dissipation,
        powerDelivered,
        powerDissipated,
        voltmeter: refs.voltmeter ?? null,
        ammeter: refs.ammeter ?? null,
      },
      context: {},
    };
  },
});
