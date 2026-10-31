import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const kirchhoffLawsBlog = {
  id: "bb-012",
  slug: "kirchhoffs-circuit-laws-explained",
  name: "Kirchhoff's Circuit Laws Explained",
  desc: "Why current splits at a junction and why voltages around a loop always add to zero — with a fully worked two-loop network, sign conventions that actually survive contact with a problem, and the nodal method the simulation uses to solve any circuit you build.",
  tags: [
    LEVELS.upperSecondary,
    DIFFICULTIES.extended,
    TAGS.PHYSICS,
    TAGS.ELECTROMAGNETISM,
    TAGS.ENERGY,
  ],
  date: "11/09/2026",
  theory: {
    sections: [
      {
        title: "Introduction",
        blocks: [
          {
            type: "paragraph",
            text: "Ohm's law tells you what a single resistor does. It says nothing about what happens when three resistors and two batteries are wired into a loop that feeds back on itself. For that you need two statements that Gustav Kirchhoff published in 1845, while he was still a student: the **junction rule** and the **loop rule**.",
          },
          {
            type: "paragraph",
            text: "Neither is a new law of nature. The junction rule is conservation of charge, written for a wire. The loop rule is conservation of energy, written for a charge that goes all the way around and comes back to where it started. Everything else in DC circuit analysis — series resistance, parallel resistance, potential dividers, internal resistance — falls out of those two.",
          },
          {
            type: "callout",
            calloutType: "info",
            title: "What the simulation shows",
            text: "Pick one of four circuits, set the EMFs and resistances, and the readout solves the network and then **checks itself in front of you**: it walks each loop term by term and shows the running sum landing on zero, and it shows the current into each junction matching the current out. If the physics were wrong, those rows would not balance.",
          },
        ],
      },

      {
        title: "The vocabulary: nodes, branches and loops",
        blocks: [
          {
            type: "paragraph",
            text: "Before either law makes sense you need three words, and the first one is the one people get wrong.",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "A **node** (or junction) is a point where the circuit divides. Crucially, **everything joined by plain wire is the same node** — an ideal wire has no resistance, so it has no potential difference across it. A long stretch of wire with nothing in it is not two nodes, it is one.",
              "A **branch** is a path from one node to another with components in it. Every component in a branch carries the same current, because there is nowhere else for the charge to go.",
              "A **loop** is any closed path you can trace through the circuit and return to your starting point.",
            ],
          },
          {
            type: "callout",
            calloutType: "tip",
            title: "Smart Tip!",
            text: "In the simulation, nodes are the labelled white dots and each one shows its own potential. Notice that the parallel circuit has only **two** nodes, even though it looks busy — the entire top rail is one node and the entire bottom rail is another. That single observation explains why parallel components all have the same voltage across them.",
          },
        ],
      },

      {
        title: "Kirchhoff's current law (the junction rule)",
        blocks: [
          {
            type: "paragraph",
            text: "Charge does not pile up in a wire. Whatever flows into a junction in one second must flow out of it in the same second, so:",
          },
          {
            type: "formula",
            latex:
              "\\sum_{\\text{into node}} I \\;=\\; \\sum_{\\text{out of node}} I",
          },
          {
            type: "paragraph",
            text: "It is often more convenient to count everything as **leaving** the node, letting currents that actually flow inwards come out negative. Then the law is simply:",
          },
          {
            type: "formula",
            latex: "\\sum_{k} I_k = 0",
          },
          {
            type: "note",
            text: "This is the form the simulation's solver uses. One such equation is written for every node except one, which is chosen as the zero-volt reference.",
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "Attention!",
            text: "The junction rule is about **current**, not charge carriers, and not energy. Electrons are not consumed by a lamp. The same number per second leave the lamp as entered it — what the lamp takes is energy, and that is the other law's business.",
          },
        ],
      },

      {
        title: "Kirchhoff's voltage law (the loop rule)",
        blocks: [
          {
            type: "paragraph",
            text: "Electric potential is a property of a point in the circuit. If you walk from a point all the way around a loop and arrive back at that same point, you must be back at the same potential — there is only one value there. So the rises and drops you accumulated on the way round have to cancel exactly:",
          },
          {
            type: "formula",
            latex: "\\sum_{\\text{closed loop}} \\Delta V = 0",
          },
          {
            type: "paragraph",
            text: "Physically: a cell of EMF $E$ does $qE$ joules of work pushing charge $q$ through itself, and every resistance the charge then passes through takes some of that energy back out as heat. Round a full loop, the energy given equals the energy taken. KVL is conservation of energy per unit charge.",
          },
          {
            type: "callout",
            calloutType: "info",
            title: "Where the readout comes from",
            text: "The `KVL loop` rows in the simulation are literally this walk, written out: one signed number for each EMF you pass through and one for each resistance you pass through, followed by the total. Change any slider and watch every term move while the total stays pinned at 0.00 V.",
          },
        ],
      },

      {
        title: "Sign conventions — the part that actually goes wrong",
        blocks: [
          {
            type: "paragraph",
            text: "Almost every mistake in Kirchhoff problems is a sign, not a formula. Two habits make it reliable.",
          },
          {
            type: "paragraph",
            text: "**First: guess the current directions and commit.** You do not need to guess correctly. Mark an arrow on every branch, do the algebra, and if a current comes out negative that simply means the real flow is the other way. A negative answer is information, not an error.",
          },
          {
            type: "paragraph",
            text: "**Second: pick a direction to walk each loop and apply the same two rules at every component you meet.**",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Crossing a **cell** from its − plate to its + plate is a **rise** of $+E$. Crossing the other way is $-E$.",
              "Crossing a **resistance** **along** your assumed current direction is a **drop** of $-IR$. Crossing it against the current direction is $+IR$.",
            ],
          },
          {
            type: "note",
            text: "Internal resistance is not special. A real cell is an ideal EMF in series with a resistance r, so crossing it gives you both a +E term and a −Ir term, one after the other. The simulation prints them as two separate numbers for exactly this reason.",
          },
        ],
      },

      {
        title: "A fully worked example: the two-loop network",
        blocks: [
          {
            type: "paragraph",
            text: "This is the circuit the simulation opens on, with its default values. Two cells and three resistors are wired between the same pair of nodes, $A$ at the top and $B$ at the bottom.",
          },
          {
            type: "table",
            columns: ["Branch", "Contents", "Total R", "EMF"],
            data: [
              {
                Branch: "Left (B → A)",
                Contents: "Cell E₁ with internal r₁, then R₁",
                "Total R": "0.5 + 4 = 4.5 Ω",
                EMF: "12 V",
              },
              {
                Branch: "Middle (A → B)",
                Contents: "R₂ alone",
                "Total R": "6 Ω",
                EMF: "0 V",
              },
              {
                Branch: "Right (B → A)",
                Contents: "Cell E₂ with internal r₂, then R₃",
                "Total R": "0.5 + 3 = 3.5 Ω",
                EMF: "6 V",
              },
            ],
          },
          {
            type: "paragraph",
            text: "Take $B$ as the zero of potential and let $V_A$ be the unknown. Each branch current follows from Ohm's law applied across the whole branch — the potential you start at, minus the potential you end at, plus whatever the cell adds, all over the resistance:",
          },
          {
            type: "formula",
            latex:
              "I_1 = \\frac{12 - V_A}{4.5}, \\qquad I_2 = \\frac{V_A}{6}, \\qquad I_3 = \\frac{6 - V_A}{3.5}",
          },
          {
            type: "paragraph",
            text: "Now apply the junction rule at $A$. Two branches feed it and one drains it:",
          },
          {
            type: "formula",
            latex: "I_1 + I_3 = I_2",
          },
          {
            type: "formula",
            latex:
              "\\frac{12 - V_A}{4.5} + \\frac{6 - V_A}{3.5} = \\frac{V_A}{6}",
          },
          {
            type: "paragraph",
            text: "That is one equation in one unknown. Collecting terms gives $0.6746\\,V_A = 4.3810$, so:",
          },
          {
            type: "formula",
            latex:
              "V_A = 6.494\\ \\text{V} \\;\\Rightarrow\\; I_1 = 1.224\\ \\text{A},\\quad I_2 = 1.082\\ \\text{A},\\quad I_3 = -0.141\\ \\text{A}",
          },
          {
            type: "callout",
            calloutType: "success",
            title: "Read that third current again",
            text: "$I_3$ came out **negative**. The 6 V cell is not driving current into the circuit at all — the 12 V cell has pushed node $A$ up to 6.49 V, which is above E₂, so current is being forced **backwards** through the second cell. It is being charged. This is exactly what happens when you connect a charger to a battery, and it is why you should never dismiss a negative current as a mistake.",
          },
          {
            type: "paragraph",
            text: "Check it with the loop rule. Walking loop ① up the left branch and back down the middle:",
          },
          {
            type: "formula",
            latex:
              "\\underbrace{+12}_{E_1} \\;\\underbrace{-\\,0.61}_{I_1 r_1} \\;\\underbrace{-\\,4.89}_{I_1 R_1} \\;\\underbrace{-\\,6.49}_{I_2 R_2} \\;=\\; 0",
          },
          {
            type: "toggle",
            title: "Why does the middle term come out as a rise for loop ②?",
            content:
              "Walking loop ② up the right branch you pass E₂ as a rise of +6 V, then meet r₂ and R₃ — but $I_3$ is negative, so $-I_3 R$ is **positive**. The two resistances therefore add +0.07 V and +0.42 V instead of subtracting, and the loop still closes on the same $-6.49$ V drop through R₂. The algebra handles the reversed flow for you, provided you never quietly flip a sign by hand.",
          },
        ],
      },

      {
        title: "Series and parallel are just special cases",
        blocks: [
          {
            type: "paragraph",
            text: "The rules you were taught first are what the two laws reduce to in simple topologies. Switch the simulation between the `Series` and `Parallel` presets and watch the readout.",
          },
          {
            type: "paragraph",
            text: "**Series.** A chain of resistors has no junctions between them, so KCL leaves no choice: the current is identical in every branch. KVL round the single loop then gives $E = I(r + R_1 + R_2 + R_3)$, which is the same as one resistor of value:",
          },
          {
            type: "formula",
            latex: "R_{\\text{eq}} = R_1 + R_2 + R_3",
          },
          {
            type: "paragraph",
            text: "**Parallel.** All three resistors sit between the same two nodes, so they all have the same potential difference $V$ across them. KCL at the top node says the branch currents add to the total:",
          },
          {
            type: "formula",
            latex:
              "I = \\frac{V}{R_1} + \\frac{V}{R_2} + \\frac{V}{R_3} \\;\\Rightarrow\\; \\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}",
          },
          {
            type: "callout",
            calloutType: "tip",
            title: "Try this",
            text: "In the parallel preset, drag the ammeter onto each branch in turn and add the three readings. With the defaults they come to 2.182 + 1.455 + 2.909 = 6.545 A, which is exactly the reading on the cell's branch. Then lower R₁ and watch the **smallest** resistor take the **largest** share.",
          },
        ],
      },

      {
        title: "Real cells: EMF, internal resistance and terminal voltage",
        blocks: [
          {
            type: "paragraph",
            text: "An ideal cell would hold its terminals at $E$ volts no matter how much current you drew. A real one cannot: its own chemistry has resistance $r$, and the current has to get through that too. What the outside world actually sees is the **terminal voltage**:",
          },
          {
            type: "formula",
            latex: "V_{\\text{term}} = E - I r",
          },
          {
            type: "paragraph",
            text: "This is why headlights dim when you crank an engine, and why a battery reads a healthy voltage with nothing attached and sags the moment it has to do work. Put the simulation on the single-loop preset, drag the voltmeter leads onto the two nodes, and lower $R_1$: as the current climbs, the reading falls away from $E$.",
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "Why the simulation will not let r be zero",
            text: "A branch with no resistance at all is a short circuit: the equations demand infinite current and the matrix becomes singular. That is not a numerical wobble, it is the model honestly reporting that an ideal EMF across an ideal wire is unphysical. Every resistance in the simulation is therefore held at or above 0.01 Ω.",
          },
        ],
      },

      {
        title: "Power: where the energy actually goes",
        blocks: [
          {
            type: "paragraph",
            text: "Each cell delivers $P = EI$ into the circuit, and each resistance turns $P = I^2R$ of it into heat. Because KVL is conservation of energy, multiplying the loop equation by the current proves these must be equal overall:",
          },
          {
            type: "formula",
            latex:
              "\\sum_{\\text{cells}} E_k I_k \\;=\\; \\sum_{\\text{resistances}} I_k^{2} R_k",
          },
          {
            type: "paragraph",
            text: "The simulation shows both totals side by side, and they agree to the last decimal in every circuit — that is a genuine check on the solution, not decoration. In the default two-loop network it comes to 13.84 W each way, and note that E₂'s contribution to the left-hand side is **negative**: it is absorbing energy, not supplying it.",
          },
          {
            type: "note",
            text: "The glow on each resistor is scaled by its own I²R, so brightness is a fair visual proxy for how hot that component is getting. In the parallel preset the smallest resistor glows brightest.",
          },
        ],
      },

      {
        title: "How the simulation solves an arbitrary circuit",
        blocks: [
          {
            type: "paragraph",
            text: "Guessing loops by hand does not scale. The simulation uses **nodal analysis**, which turns the junction rule into a matrix equation and solves it by Gaussian elimination — the same method any circuit simulator uses.",
          },
          {
            type: "paragraph",
            text: "Every branch is treated as an EMF in series with a resistance, so its current is a function of the potentials at its two ends. Substituting that into $\\sum I = 0$ at each node gives one linear equation per unknown potential:",
          },
          {
            type: "formula",
            latex:
              "\\sum_b \\frac{1}{R_b}\\,V_n \\;-\\; \\sum_b \\frac{1}{R_b}\\,V_{\\text{other}} \\;=\\; -\\sum_b \\frac{s_b E_b}{R_b}",
          },
          {
            type: "note",
            text: "Here s = +1 when the branch is oriented away from node n and −1 when it points into it. One node is grounded at 0 V and its row is dropped, which is what makes the system solvable at all — only potential **differences** are physical.",
          },
          {
            type: "code",
            language: "javascript",
            code: `
// Assemble the conductance system G·v = i, one row per unsolved node.
for (const branch of branches) {
  const g = 1 / branch.R;
  for (const [id, s] of [[branch.from, 1], [branch.to, -1]]) {
    const row = unknowns.get(id);
    if (row === undefined) continue;       // the grounded node has no row
    G[row][row] += g;
    const col = unknowns.get(s === 1 ? branch.to : branch.from);
    if (col !== undefined) G[row][col] -= g;
    rhs[row] -= s * branch.emf * g;
  }
}

// Solve for the node potentials, then read every branch current back off them.
const V = gaussian(G, rhs);
for (const branch of branches) {
  branch.I = (V[branch.from] - V[branch.to] + branch.emf) / branch.R;
}`,
          },
          {
            type: "paragraph",
            text: "Unlike the rest of the site's simulations, there is nothing to integrate here — no positions, no velocities, no timestep. A resistive circuit settles instantly, so its state is the **exact** solution of a linear system, recomputed from scratch every frame. The only thing that advances with time is the animation of the charge carriers.",
          },
        ],
      },

      {
        title: "Simulation Parameters",
        blocks: [
          {
            type: "table",
            columns: ["Parameter", "Symbol", "Description"],
            data: [
              {
                Parameter: "Circuit",
                Symbol: "—",
                Description:
                  "Which network to build: single loop, series, parallel, or the two-loop network with two cells.",
              },
              {
                Parameter: "First cell EMF",
                Symbol: "E₁",
                Description:
                  "Energy the main cell gives each coulomb of charge, in volts. Used by every preset.",
              },
              {
                Parameter: "First cell internal resistance",
                Symbol: "r₁",
                Description:
                  "The main cell's own resistance (Ω). Raising it lowers the terminal voltage under load.",
              },
              {
                Parameter: "Second cell EMF",
                Symbol: "E₂",
                Description:
                  "The opposing cell in the two-loop network (V). Ignored by the other presets.",
              },
              {
                Parameter: "Second cell internal resistance",
                Symbol: "r₂",
                Description: "Internal resistance of the second cell (Ω).",
              },
              {
                Parameter: "Resistors",
                Symbol: "R₁, R₂, R₃",
                Description:
                  "The external resistances (Ω). Which of them appear depends on the circuit selected.",
              },
            ],
          },
        ],
      },

      {
        title: "Things worth trying",
        blocks: [
          {
            type: "list",
            ordered: true,
            items: [
              "On the two-loop circuit, raise **E₂** past 6.49 V and watch $I_3$ flip from negative to positive — the moment the second cell stops being charged and starts driving.",
              "Set **E₁** and **E₂** equal, then make R₁ and R₃ equal too. The two branches become symmetric and carry identical currents; the middle branch takes their sum.",
              "On the series circuit, drag the ammeter from branch to branch. The reading never changes. Then switch to parallel and repeat — now every branch is different.",
              "Push **r₁** to 5 Ω on the single loop with a small R₁. Most of the energy is now dissipated inside the cell itself: a flat battery, getting warm and delivering very little.",
              "Turn off the charge-flow animation and the arrows, and try to predict the direction of every current before turning them back on.",
            ],
          },
          {
            type: "callout",
            calloutType: "success",
            title: "Success!",
            text: "If you can look at any circuit, mark arbitrary current arrows, write one junction equation per node and one loop equation per mesh, and then trust a negative answer when you get one — you can solve any DC network that will ever be put in front of you.",
          },
        ],
      },
    ],
  },
};
