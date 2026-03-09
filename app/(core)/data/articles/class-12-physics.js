import TAGS from "../tags.js";

export const class12PhysicsBlog = {
  slug: "class-12-physics-complete-guide",
  name: "Class 12 Physics: The Complete Guide to Every Chapter",
  desc: "Master every chapter of Class 12 Physics (CBSE 2025–26) with clear explanations, key formulas, derivations, solved examples, and exam tips—covering Electrostatics, Current Electricity, Magnetism, Optics, Modern Physics, and more.",
  tags: [
    TAGS.PHYSICS,
    TAGS.ELECTROMAGNETISM,
    TAGS.OPTICS,
    TAGS.QUANTUM,
    TAGS.WAVES,
    TAGS.MEDIUM,
  ],
  date: "09/03/2026",
  theory: {
    title: "Class 12 Physics: Master Every Chapter for Board Exams",
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Overview: What You Will Learn in Class 12 Physics",
          },
          {
            type: "paragraph",
            text: "Class 12 Physics is one of the most important subjects you will study in your school career. It forms the foundation for engineering, medicine, research, and technology—and its concepts appear in every major competitive exam, from JEE and NEET to university entrance tests worldwide. The CBSE Class 12 Physics syllabus (2025–26) is divided into **9 units** covering 14 chapters, worth 70 marks in theory and 30 marks in practicals.",
          },
          {
            type: "paragraph",
            text: "This guide walks through every chapter in a way that actually makes sense—starting with the concept, building the mathematics, and giving you the key formulas, typical exam questions, and tricks that will help you score full marks. Whether you're studying for the first time or revising the night before an exam, this is your complete reference.",
          },
          {
            type: "table",
            columns: ["Unit", "Chapters", "Theory Marks"],
            data: [
              {
                Unit: "Unit I – Electrostatics",
                Chapters:
                  "Ch 1: Electric Charges & Fields | Ch 2: Electrostatic Potential & Capacitance",
                "Theory Marks": "16",
              },
              {
                Unit: "Unit II – Current Electricity",
                Chapters: "Ch 3: Current Electricity",
                "Theory Marks": "17",
              },
              {
                Unit: "Unit III – Magnetic Effects & Magnetism",
                Chapters:
                  "Ch 4: Moving Charges & Magnetism | Ch 5: Magnetism & Matter",
                "Theory Marks": "17",
              },
              {
                Unit: "Unit IV – EM Induction & AC",
                Chapters:
                  "Ch 6: Electromagnetic Induction | Ch 7: Alternating Current",
                "Theory Marks": "—",
              },
              {
                Unit: "Unit V – EM Waves",
                Chapters: "Ch 8: Electromagnetic Waves",
                "Theory Marks": "18",
              },
              {
                Unit: "Unit VI – Optics",
                Chapters: "Ch 9: Ray Optics | Ch 10: Wave Optics",
                "Theory Marks": "—",
              },
              {
                Unit: "Unit VII – Dual Nature of Radiation",
                Chapters: "Ch 11: Dual Nature of Radiation & Matter",
                "Theory Marks": "12",
              },
              {
                Unit: "Unit VIII – Atoms & Nuclei",
                Chapters: "Ch 12: Atoms | Ch 13: Nuclei",
                "Theory Marks": "—",
              },
              {
                Unit: "Unit IX – Electronic Devices",
                Chapters: "Ch 14: Semiconductor Devices",
                "Theory Marks": "7",
              },
            ],
          },
          {
            type: "callout",
            calloutType: "info",
            title: "How to Use This Guide",
            text: "Each section below covers one unit. Read the conceptual explanation first, then study the formulas, then try the example problems mentally before looking at the answers. Use the toggle boxes for extra depth when you feel ready. Bookmark the formula tables for last-minute revision.",
          },
        ],
      },

      // ─────────────────────────────────────────────
      // UNIT I – ELECTROSTATICS
      // ─────────────────────────────────────────────
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Unit I: Electrostatics — Electric Charges, Fields & Potential",
          },
          {
            type: "paragraph",
            text: "Electrostatics is the study of charges **at rest**. Everything starts with a simple observation: rub a plastic ruler on your hair and it attracts tiny bits of paper. That invisible force is the **electric force**, and it is one of the four fundamental forces of nature. Unit I (Chapters 1 & 2) carries 16 marks—the highest single unit—so understanding it deeply pays off enormously.",
          },
          {
            type: "subtitle",
            text: "Chapter 1 – Electric Charges and Fields",
            level: 1,
          },
          {
            type: "paragraph",
            text: "All matter is made of atoms containing protons (+) and electrons (−). When a body has unequal numbers of protons and electrons it becomes **charged**. The SI unit of charge is the **Coulomb (C)**. The fundamental charge (charge on one proton or electron) is $e = 1.6 \\times 10^{-19}$ C. Charge is always **quantised** ($q = ne$, where $n$ is an integer) and **conserved** (total charge of an isolated system never changes).",
          },
          {
            type: "subtitle",
            text: "Coulomb's Law",
            level: 1,
          },
          {
            type: "paragraph",
            text: "The force between two point charges $q_1$ and $q_2$ separated by distance $r$ in a medium of permittivity $\\varepsilon$ is:",
          },
          {
            type: "formula",
            latex:
              "F = k \\frac{q_1 q_2}{r^2} = \\frac{1}{4\\pi\\varepsilon_0} \\cdot \\frac{q_1 q_2}{r^2}",
            inline: false,
          },
          {
            type: "paragraph",
            text: "where $k = 9 \\times 10^9$ N m² C⁻² and $\\varepsilon_0 = 8.85 \\times 10^{-12}$ C² N⁻¹ m⁻² is the **permittivity of free space**. The force is along the line joining the charges: attractive for unlike charges, repulsive for like charges. For a system of multiple charges, use the **superposition principle**: the total force on any charge is the vector sum of forces due to all other individual charges.",
          },
          {
            type: "subtitle",
            text: "Electric Field",
            level: 1,
          },
          {
            type: "paragraph",
            text: "The **electric field** $\\vec{E}$ at a point is the force per unit positive test charge placed at that point:",
          },
          {
            type: "formula",
            latex:
              "\\vec{E} = \\frac{\\vec{F}}{q_0} = \\frac{1}{4\\pi\\varepsilon_0} \\cdot \\frac{q}{r^2} \\hat{r}",
            inline: false,
          },
          {
            type: "paragraph",
            text: "SI unit: N C⁻¹ (or V m⁻¹). Electric field lines start on positive charges and end on negative charges; they never cross each other. For a **dipole** (two equal and opposite charges $±q$ separated by distance $2a$), the field on the axial line is $E_{axial} = \\frac{2kp}{r^3}$ and on the equatorial line is $E_{equatorial} = \\frac{kp}{r^3}$, where $p = q \\cdot 2a$ is the **dipole moment**.",
          },
          {
            type: "image",
            src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Dipole_field.svg/600px-Dipole_field.svg.png",
            alt: "Electric field lines of an electric dipole.",
            caption:
              "Electric field lines of a dipole. Lines emerge from the positive charge and converge into the negative charge, showing the characteristic dipole pattern.",
            href: "https://en.wikipedia.org/wiki/Electric_dipole_moment",
            size: "medium",
          },
          {
            type: "subtitle",
            text: "Gauss's Law",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Gauss's Law is a powerful tool for calculating electric fields of highly symmetric charge distributions. It states that the **total electric flux** through any closed surface (Gaussian surface) equals the enclosed charge divided by $\\varepsilon_0$:",
          },
          {
            type: "formula",
            latex:
              "\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{enc}}{\\varepsilon_0}",
            inline: false,
          },
          {
            type: "table",
            columns: [
              "Charge Distribution",
              "Gaussian Surface",
              "Electric Field",
            ],
            data: [
              {
                "Charge Distribution": "Infinite line charge (λ C/m)",
                "Gaussian Surface": "Coaxial cylinder of radius r",
                "Electric Field":
                  "$E = \\dfrac{\\lambda}{2\\pi\\varepsilon_0 r}$",
              },
              {
                "Charge Distribution": "Infinite plane sheet (σ C/m²)",
                "Gaussian Surface": "Pillbox/cylinder",
                "Electric Field": "$E = \\dfrac{\\sigma}{2\\varepsilon_0}$",
              },
              {
                "Charge Distribution": "Thin spherical shell (Q)",
                "Gaussian Surface": "Concentric sphere (outside, r > R)",
                "Electric Field": "$E = \\dfrac{Q}{4\\pi\\varepsilon_0 r^2}$",
              },
              {
                "Charge Distribution": "Thin spherical shell (Q)",
                "Gaussian Surface": "Concentric sphere (inside, r < R)",
                "Electric Field": "$E = 0$",
              },
            ],
          },
          {
            type: "subtitle",
            text: "Chapter 2 – Electrostatic Potential and Capacitance",
            level: 1,
          },
          {
            type: "paragraph",
            text: "The **electric potential** $V$ at a point is the work done per unit positive charge in bringing a test charge from infinity to that point:",
          },
          {
            type: "formula",
            latex:
              "V = \\frac{W}{q_0} = \\frac{1}{4\\pi\\varepsilon_0} \\cdot \\frac{q}{r}",
            inline: false,
          },
          {
            type: "paragraph",
            text: "SI unit: Volt (V = J C⁻¹). Potential is a **scalar** quantity. The potential difference $V_{AB} = V_A - V_B$ is the work done per unit charge in moving from $B$ to $A$. The relationship between field and potential is $E = -\\frac{dV}{dr}$—the field points from high to low potential.",
          },
          {
            type: "paragraph",
            text: "A **capacitor** stores electric charge. The capacitance $C$ is defined as $C = Q/V$, measured in Farads (F). For a parallel-plate capacitor with plate area $A$, separation $d$, and dielectric constant $K$:",
          },
          {
            type: "formula",
            latex: "C = \\frac{K\\varepsilon_0 A}{d}",
            inline: false,
          },
          {
            type: "paragraph",
            text: "Energy stored in a capacitor: $U = \\frac{1}{2}CV^2 = \\frac{Q^2}{2C} = \\frac{1}{2}QV$. When capacitors are combined in **series**: $\\frac{1}{C_s} = \\frac{1}{C_1} + \\frac{1}{C_2} + \\cdots$ and in **parallel**: $C_p = C_1 + C_2 + \\cdots$",
          },
          {
            type: "callout",
            calloutType: "success",
            title: "High-Yield Exam Tips for Unit I",
            text: "1. Always draw a diagram for Coulomb's Law problems to identify force directions. 2. Remember: E = 0 inside a conductor and inside a charged hollow sphere. 3. The insertion of a dielectric increases capacitance by factor K. 4. Equipotential surfaces are always perpendicular to field lines. 5. For capacitors: series decreases C, parallel increases C.",
          },
          {
            type: "toggle",
            title: "Derivation: Potential Energy of a System of Charges",
            content:
              "To bring a charge $q_1$ from infinity to a point, no work is done (no existing field). To bring $q_2$ to distance $r_{12}$ from $q_1$, work done $W_{12} = k q_1 q_2 / r_{12}$. For three charges: $U = k \\left( \\frac{q_1 q_2}{r_{12}} + \\frac{q_2 q_3}{r_{23}} + \\frac{q_1 q_3}{r_{13}} \\right)$. This is the total electrostatic potential energy of the system. In general, for $N$ charges: $U = \\frac{1}{2} \\sum_{i \\neq j} k \\frac{q_i q_j}{r_{ij}}$ (the factor ½ avoids double-counting each pair).",
          },
        ],
      },

      // ─────────────────────────────────────────────
      // UNIT II – CURRENT ELECTRICITY
      // ─────────────────────────────────────────────
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Unit II: Current Electricity — Circuits, Resistance & Kirchhoff's Laws",
          },
          {
            type: "paragraph",
            text: "When charges move in an ordered fashion through a conductor, we have **electric current**. Current electricity (Chapter 3) explains how circuits work, why some materials resist current flow more than others, and the rules that let us analyse any circuit no matter how complex. This unit carries significant exam weight and produces a large number of numerical problems.",
          },
          {
            type: "subtitle",
            text: "Electric Current and Drift Velocity",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Electric current is the rate of flow of charge: $I = \\frac{dQ}{dt}$, measured in Amperes (A). In metallic conductors, current flows due to the **drift** of free electrons opposite to the applied electric field. The drift velocity $v_d$ is tiny—typically $\\sim 10^{-4}$ m/s—yet the electric signal propagates at nearly the speed of light because the field is established throughout the wire almost instantaneously.",
          },
          {
            type: "formula",
            latex: "I = nAev_d",
            inline: false,
          },
          {
            type: "paragraph",
            text: "where $n$ is the number density of free electrons, $A$ is the cross-sectional area, $e$ is electron charge, and $v_d$ is drift velocity.",
          },
          {
            type: "subtitle",
            text: "Ohm's Law and Resistance",
            level: 1,
          },
          {
            type: "paragraph",
            text: "For ohmic conductors, the current through a conductor is directly proportional to the potential difference across it at constant temperature: $V = IR$. The resistance $R$ depends on geometry and material:",
          },
          {
            type: "formula",
            latex: "R = \\frac{\\rho L}{A}",
            inline: false,
          },
          {
            type: "paragraph",
            text: "where $\\rho$ (resistivity) is a material property, $L$ is length, and $A$ is cross-sectional area. Resistivity varies with temperature: $\\rho_T = \\rho_0 [1 + \\alpha(T - T_0)]$, where $\\alpha$ is the **temperature coefficient of resistance**. For metals, $\\alpha > 0$ (resistance increases with temperature); for semiconductors and insulators, $\\alpha < 0$.",
          },
          {
            type: "image",
            src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Ohm%27s_Law_with_Voltage_source_TeX.svg/600px-Ohm%27s_Law_with_Voltage_source_TeX.svg.png",
            alt: "Simple Ohm's Law circuit diagram with battery, resistor and labels.",
            caption:
              "A basic Ohm's Law circuit: a voltage source V drives current I through resistance R. The relationship V = IR is the cornerstone of circuit analysis.",
            href: "https://en.wikipedia.org/wiki/Ohm%27s_law",
            size: "medium",
          },
          {
            type: "subtitle",
            text: "Kirchhoff's Laws",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Kirchhoff's laws are essential for analysing multi-loop circuits:",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "**KCL (Junction Rule):** The algebraic sum of all currents at a junction is zero: $\\sum I = 0$. This is a statement of conservation of charge—charge cannot accumulate at a node.",
              "**KVL (Loop Rule):** The algebraic sum of potential differences around any closed loop is zero: $\\sum V = 0$. This reflects conservation of energy—a charge returning to its starting point has the same potential energy.",
            ],
          },
          {
            type: "subtitle",
            text: "Key Circuit Elements & Formulas",
            level: 1,
          },
          {
            type: "table",
            columns: ["Concept", "Formula", "Notes"],
            data: [
              {
                Concept: "Resistors in Series",
                Formula: "$R_s = R_1 + R_2 + R_3$",
                Notes: "Same current through each; voltages add",
              },
              {
                Concept: "Resistors in Parallel",
                Formula:
                  "$\\dfrac{1}{R_p} = \\dfrac{1}{R_1} + \\dfrac{1}{R_2}$",
                Notes: "Same voltage across each; currents add",
              },
              {
                Concept: "EMF & Terminal Voltage",
                Formula: "$V = \\varepsilon - Ir$",
                Notes: "r = internal resistance of cell",
              },
              {
                Concept: "Power Dissipated",
                Formula: "$P = VI = I^2 R = V^2/R$",
                Notes: "Unit: Watt (W)",
              },
              {
                Concept: "Wheatstone Bridge (balanced)",
                Formula: "$\\dfrac{P}{Q} = \\dfrac{R}{S}$",
                Notes: "No current through galvanometer",
              },
              {
                Concept: "Metre Bridge (slide wire)",
                Formula: "$\\dfrac{R}{S} = \\dfrac{\\ell}{100 - \\ell}$",
                Notes: "ℓ = balance length from left",
              },
            ],
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "Common Mistakes in Current Electricity",
            text: "1. When applying KVL, be careful with sign conventions: potential increases going through a battery from − to + and decreases going through a resistor in the direction of current. 2. The terminal voltage of a battery equals EMF only when no current flows (open circuit). Under load, V < ε. 3. In the metre bridge experiment, the unknown resistance S must be placed in the right gap and known R in the left gap—swapping them doesn't invalidate the result mathematically, but know your setup for the viva.",
          },
          {
            type: "toggle",
            title: "Potentiometer: Principle and Applications",
            content:
              "A potentiometer is a long resistance wire of uniform cross-section. Because current through it is constant, the potential drop per unit length is constant. For a potentiometer of length L connected to a driver EMF: $\\frac{V}{L} = $ constant (potential gradient $k$). It is used to: (1) compare EMFs of two cells: $\\frac{\\varepsilon_1}{\\varepsilon_2} = \\frac{\\ell_1}{\\ell_2}$ where ℓ₁ and ℓ₂ are balance lengths, and (2) find internal resistance: $r = R\\left(\\frac{\\ell_1 - \\ell_2}{\\ell_2}\\right)$ where R is the external resistance. The potentiometer draws no current from the source being measured, making it superior to a voltmeter for EMF comparison.",
          },
        ],
      },

      // ─────────────────────────────────────────────
      // UNIT III – MAGNETISM
      // ─────────────────────────────────────────────
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Unit III: Magnetic Effects of Current and Magnetism",
          },
          {
            type: "paragraph",
            text: "Moving charges create magnetic fields, and magnetic fields exert forces on moving charges. This elegant symmetry—charge creates field, field acts on charge—underpins the entire technology of electric motors, generators, transformers, and MRI machines. Unit III (Chapters 4 & 5) is high-weightage (17 marks combined with Unit IV) and rich in derivations.",
          },
          {
            type: "subtitle",
            text: "Chapter 4 – Moving Charges and Magnetism",
            level: 1,
          },
          {
            type: "paragraph",
            text: "The **Lorentz Force** is the total force on a charged particle in combined electric and magnetic fields:",
          },
          {
            type: "formula",
            latex: "\\vec{F} = q(\\vec{E} + \\vec{v} \\times \\vec{B})",
            inline: false,
          },
          {
            type: "paragraph",
            text: "The magnetic force $\\vec{F}_B = q\\vec{v} \\times \\vec{B}$ is always **perpendicular** to both $\\vec{v}$ and $\\vec{B}$—it does no work and cannot change the particle's speed, only its direction. A charged particle in a uniform magnetic field moves in a **circle** (or helix if it has a component along $\\vec{B}$). The radius of this circular path is:",
          },
          {
            type: "formula",
            latex: "r = \\frac{mv}{qB}",
            inline: false,
          },
          {
            type: "subtitle",
            text: "Biot–Savart Law",
            level: 1,
          },
          {
            type: "paragraph",
            text: "The Biot–Savart Law gives the magnetic field $d\\vec{B}$ due to a small current element $Id\\vec{\\ell}$:",
          },
          {
            type: "formula",
            latex:
              "d\\vec{B} = \\frac{\\mu_0}{4\\pi} \\cdot \\frac{I\\,d\\vec{\\ell} \\times \\hat{r}}{r^2}",
            inline: false,
          },
          {
            type: "paragraph",
            text: "where $\\mu_0 = 4\\pi \\times 10^{-7}$ T m A⁻¹ is the **permeability of free space**. Important results derived using Biot–Savart:",
          },
          {
            type: "table",
            columns: ["Configuration", "Magnetic Field", "Location"],
            data: [
              {
                Configuration: "Long straight wire carrying I",
                "Magnetic Field": "$B = \\dfrac{\\mu_0 I}{2\\pi r}$",
                Location: "At perpendicular distance r",
              },
              {
                Configuration: "Circular loop of radius R, current I",
                "Magnetic Field": "$B = \\dfrac{\\mu_0 I}{2R}$",
                Location: "At centre of loop",
              },
              {
                Configuration: "Solenoid (n turns/m, current I)",
                "Magnetic Field": "$B = \\mu_0 nI$",
                Location: "Inside (uniform field)",
              },
              {
                Configuration: "Toroid (N turns, current I, radius r)",
                "Magnetic Field": "$B = \\dfrac{\\mu_0 NI}{2\\pi r}$",
                Location: "Inside the toroid",
              },
            ],
          },
          {
            type: "subtitle",
            text: "Ampere's Circuital Law",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Ampere's Law is the magnetic analogue of Gauss's Law. For a closed path (Amperian loop) enclosing total current $I_{enc}$:",
          },
          {
            type: "formula",
            latex: "\\oint \\vec{B} \\cdot d\\vec{\\ell} = \\mu_0 I_{enc}",
            inline: false,
          },
          {
            type: "paragraph",
            text: "This law is most useful for highly symmetric current distributions (infinite straight wire, solenoid, toroid). The **force per unit length** between two parallel wires carrying currents $I_1$ and $I_2$ separated by distance $d$ is:",
          },
          {
            type: "formula",
            latex: "\\frac{F}{L} = \\frac{\\mu_0 I_1 I_2}{2\\pi d}",
            inline: false,
          },
          {
            type: "paragraph",
            text: "Currents in the same direction attract; currents in opposite directions repel. This is the basis for the SI definition of the Ampere.",
          },
          {
            type: "subtitle",
            text: "Galvanometer, Ammeter, and Voltmeter",
            level: 1,
          },
          {
            type: "paragraph",
            text: "A **galvanometer** detects small currents. To convert it into an **ammeter** (low resistance, in series with circuit), a **shunt** $S$ is connected in parallel: $S = \\frac{I_g G}{I - I_g}$. To convert it into a **voltmeter** (high resistance, in parallel with circuit), a high resistance $R$ is connected in series: $R = \\frac{V}{I_g} - G$, where $G$ is the galvanometer resistance and $I_g$ is its full-scale deflection current.",
          },
          {
            type: "subtitle",
            text: "Chapter 5 – Magnetism and Matter",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Materials respond to magnetic fields differently. The **magnetisation** $M$ is the magnetic dipole moment per unit volume. The **magnetic susceptibility** $\\chi_m = M/H$ classifies materials:",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "**Diamagnetic** ($\\chi_m$ small and negative): Weakly repelled by magnets; examples: bismuth, copper, water. No permanent dipoles.",
              "**Paramagnetic** ($\\chi_m$ small and positive): Weakly attracted; examples: aluminium, platinum. Random atomic dipoles align slightly with external field. Obeys **Curie's Law**: $\\chi_m = C/T$.",
              "**Ferromagnetic** ($\\chi_m$ large and positive): Strongly attracted; examples: iron, cobalt, nickel. Permanent domains; shows **hysteresis**.",
            ],
          },
          {
            type: "callout",
            calloutType: "info",
            title: "Earth's Magnetic Field",
            text: "Earth behaves as a giant bar magnet with its magnetic south pole near the geographic north pole (that's why a compass needle's north pole points geographically north). Key terms: (1) Magnetic Declination — angle between geographic north and magnetic north. (2) Magnetic Dip (Inclination) — angle that Earth's field makes with the horizontal at a location. (3) Horizontal Component $H = B_E \\cos\\delta$ and Vertical Component $V = B_E \\sin\\delta$, where $\\delta$ is the angle of dip.",
          },
        ],
      },

      // ─────────────────────────────────────────────
      // UNIT IV – EM INDUCTION & AC
      // ─────────────────────────────────────────────
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Unit IV: Electromagnetic Induction and Alternating Current",
          },
          {
            type: "paragraph",
            text: "In 1831, Michael Faraday discovered that a **changing magnetic field creates an electric field**—electromagnetic induction. This single discovery is responsible for every electric generator, transformer, and inductor on Earth. Chapter 6 (EMI) and Chapter 7 (AC) together form the engine of modern power systems.",
          },
          {
            type: "subtitle",
            text: "Chapter 6 – Electromagnetic Induction",
            level: 1,
          },
          {
            type: "paragraph",
            text: "**Magnetic Flux** through a surface is $\\Phi = \\int \\vec{B} \\cdot d\\vec{A} = BA\\cos\\theta$, measured in Weber (Wb). **Faraday's First Law**: An EMF is induced in a coil whenever the magnetic flux through it changes. **Faraday's Second Law**: The magnitude of the induced EMF equals the rate of change of flux:",
          },
          {
            type: "formula",
            latex: "\\varepsilon = -N \\frac{d\\Phi}{dt}",
            inline: false,
          },
          {
            type: "paragraph",
            text: "The negative sign embodies **Lenz's Law**: the induced current always opposes the change that caused it (a consequence of energy conservation). For a rectangular coil of $N$ turns, area $A$, rotating at angular velocity $\\omega$ in field $B$: $\\varepsilon = NBA\\omega\\sin\\omega t = \\varepsilon_0 \\sin\\omega t$.",
          },
          {
            type: "paragraph",
            text: "**Self-Inductance** ($L$): A coil opposes changes in its own current. $\\varepsilon = -L\\frac{dI}{dt}$. For a solenoid: $L = \\mu_0 n^2 V$ (V = volume). **Mutual Inductance** ($M$): Two coils coupled so that changing current in coil 1 induces EMF in coil 2: $\\varepsilon_2 = -M\\frac{dI_1}{dt}$. The energy stored in an inductor is:",
          },
          {
            type: "formula",
            latex: "U = \\frac{1}{2}LI^2",
            inline: false,
          },
          {
            type: "subtitle",
            text: "Chapter 7 – Alternating Current",
            level: 1,
          },
          {
            type: "paragraph",
            text: "AC voltage and current vary sinusoidally with time. The **RMS (root mean square)** values are what we use for power calculations: $V_{rms} = V_0/\\sqrt{2}$ and $I_{rms} = I_0/\\sqrt{2}$. The **average power** in an AC circuit is $P = V_{rms} I_{rms} \\cos\\phi$, where $\\phi$ is the **phase angle** between voltage and current and $\\cos\\phi$ is the **power factor**.",
          },
          {
            type: "table",
            columns: [
              "Circuit Element",
              "Reactance/Impedance",
              "Phase (V leads I by)",
            ],
            data: [
              {
                "Circuit Element": "Pure Resistor (R)",
                "Reactance/Impedance": "Z = R",
                "Phase (V leads I by)": "0° (in phase)",
              },
              {
                "Circuit Element": "Pure Inductor (L)",
                "Reactance/Impedance": "$X_L = \\omega L = 2\\pi f L$",
                "Phase (V leads I by)": "+90°",
              },
              {
                "Circuit Element": "Pure Capacitor (C)",
                "Reactance/Impedance": "$X_C = \\dfrac{1}{\\omega C}$",
                "Phase (V leads I by)": "−90°",
              },
              {
                "Circuit Element": "Series RLC",
                "Reactance/Impedance": "$Z = \\sqrt{R^2 + (X_L - X_C)^2}$",
                "Phase (V leads I by)": "$\\tan\\phi = \\dfrac{X_L - X_C}{R}$",
              },
            ],
          },
          {
            type: "paragraph",
            text: "**Resonance** in a series RLC circuit occurs when $X_L = X_C$, i.e., $\\omega_0 = 1/\\sqrt{LC}$. At resonance, impedance is minimum ($Z = R$), current is maximum, and power factor equals 1. The **quality factor** $Q = \\omega_0 L / R$ measures sharpness of resonance.",
          },
          {
            type: "image",
            src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/RLC_series_circuit_v1.svg/600px-RLC_series_circuit_v1.svg.png",
            alt: "Series RLC circuit diagram showing resistor, inductor, capacitor in series with AC source.",
            caption:
              "A series RLC circuit. At resonance the inductive and capacitive reactances cancel, giving minimum impedance and maximum current.",
            href: "https://en.wikipedia.org/wiki/RLC_circuit",
            size: "medium",
          },
          {
            type: "paragraph",
            text: "A **transformer** uses mutual induction to change voltage levels. For an ideal transformer with $N_p$ primary turns and $N_s$ secondary turns: $\\frac{V_s}{V_p} = \\frac{N_s}{N_p} = \\frac{I_p}{I_s}$. Step-up: $N_s > N_p$ (increases voltage, decreases current); step-down: $N_s < N_p$. Real transformers have losses from eddy currents, hysteresis, and resistance heating.",
          },
          {
            type: "callout",
            calloutType: "success",
            title: "Key AC Circuit Tips",
            text: "• Capacitors block DC but pass AC (smaller X_C at higher frequency). • Inductors pass DC easily but oppose AC (larger X_L at higher frequency). • Wattless current: in a pure L or C circuit, average power = 0 because cos φ = 0. • Power is only dissipated in resistance, not in ideal L or C. • For a transformer, always state input on primary side and output on secondary side.",
          },
        ],
      },

      // ─────────────────────────────────────────────
      // UNIT V – EM WAVES
      // ─────────────────────────────────────────────
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Unit V: Electromagnetic Waves",
          },
          {
            type: "paragraph",
            text: "In 1865, James Clerk Maxwell unified electricity, magnetism, and optics by predicting the existence of **electromagnetic waves**—self-sustaining oscillating electric and magnetic fields that travel through space at the speed of light. This was one of the greatest intellectual achievements in the history of science.",
          },
          {
            type: "subtitle",
            text: "Maxwell's Displacement Current",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Ampere's Law worked perfectly for steady currents. But Maxwell noticed an inconsistency when applied to a charging capacitor: current flows in the wires but not between the plates, yet a magnetic field clearly exists there. Maxwell introduced the **displacement current** $I_d = \\varepsilon_0 \\frac{d\\Phi_E}{dt}$ to complete the picture. This modifies Ampere's Law to:",
          },
          {
            type: "formula",
            latex:
              "\\oint \\vec{B} \\cdot d\\vec{\\ell} = \\mu_0 (I + I_d) = \\mu_0 I + \\mu_0 \\varepsilon_0 \\frac{d\\Phi_E}{dt}",
            inline: false,
          },
          {
            type: "subtitle",
            text: "Properties of EM Waves",
            level: 1,
          },
          {
            type: "list",
            ordered: false,
            items: [
              "EM waves are **transverse**: $\\vec{E}$ and $\\vec{B}$ are perpendicular to each other and to the direction of propagation.",
              "They travel in vacuum at speed $c = \\frac{1}{\\sqrt{\\mu_0 \\varepsilon_0}} = 3 \\times 10^8$ m/s.",
              "At every point, $E_0 / B_0 = c$.",
              "They carry both energy and momentum but **do not require a medium** (they travel through vacuum).",
              "**Intensity** (average power per unit area): $I = \\frac{1}{2} c \\varepsilon_0 E_0^2$.",
            ],
          },
          {
            type: "image",
            src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/EM-Wave.gif/300px-EM-Wave.gif",
            alt: "Animation of an electromagnetic wave showing perpendicular E and B fields.",
            caption:
              "An electromagnetic wave: the electric field (E, blue) and magnetic field (B, red) oscillate perpendicular to each other and to the direction of propagation.",
            href: "https://en.wikipedia.org/wiki/Electromagnetic_radiation",
            size: "medium",
          },
          {
            type: "subtitle",
            text: "The Electromagnetic Spectrum",
            level: 1,
          },
          {
            type: "table",
            columns: ["Type", "Wavelength Range", "Source / Use"],
            data: [
              {
                Type: "Radio Waves",
                "Wavelength Range": "> 0.1 m",
                "Source / Use": "Oscillating circuits; broadcasting, radar",
              },
              {
                Type: "Microwaves",
                "Wavelength Range": "1 mm – 0.1 m",
                "Source / Use":
                  "Klystron, magnetron; microwave ovens, satellite communication",
              },
              {
                Type: "Infrared",
                "Wavelength Range": "700 nm – 1 mm",
                "Source / Use": "Hot bodies; remote controls, thermal imaging",
              },
              {
                Type: "Visible Light",
                "Wavelength Range": "400 – 700 nm",
                "Source / Use": "Excited atoms; human vision",
              },
              {
                Type: "Ultraviolet",
                "Wavelength Range": "1 – 400 nm",
                "Source / Use": "Sun, UV lamps; sterilisation, photography",
              },
              {
                Type: "X-rays",
                "Wavelength Range": "0.01 – 10 nm",
                "Source / Use": "X-ray tubes, synchrotrons; medical imaging",
              },
              {
                Type: "Gamma Rays",
                "Wavelength Range": "< 0.01 nm",
                "Source / Use": "Radioactive nuclei; cancer treatment",
              },
            ],
          },
        ],
      },

      // ─────────────────────────────────────────────
      // UNIT VI – OPTICS
      // ─────────────────────────────────────────────
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Unit VI: Optics — Ray Optics and Wave Optics",
          },
          {
            type: "paragraph",
            text: "Optics (Chapters 9 & 10) is the study of light and its interactions with matter. It is split into **ray (geometric) optics**—which treats light as rays obeying simple reflection and refraction laws—and **wave optics**—which explains interference, diffraction, and polarisation using the wave nature of light. This unit carries the highest combined marks (18) and contains many derivation-based questions.",
          },
          {
            type: "subtitle",
            text: "Chapter 9 – Ray Optics and Optical Instruments",
            level: 1,
          },
          {
            type: "paragraph",
            text: "**Reflection** at a curved mirror follows the mirror formula:",
          },
          {
            type: "formula",
            latex: "\\frac{1}{v} + \\frac{1}{u} = \\frac{1}{f} = \\frac{2}{R}",
            inline: false,
          },
          {
            type: "paragraph",
            text: "where $u$ = object distance, $v$ = image distance, $f$ = focal length, $R$ = radius of curvature. **Linear magnification**: $m = -v/u$. Sign convention: distances measured from the pole of the mirror; distances in the direction of incident light are positive.",
          },
          {
            type: "paragraph",
            text: "**Refraction** occurs when light passes from one medium to another. **Snell's Law**:",
          },
          {
            type: "formula",
            latex:
              "n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2 \\quad \\Rightarrow \\quad \\frac{\\sin i}{\\sin r} = \\frac{n_2}{n_1} = {_1}\\mu_2",
            inline: false,
          },
          {
            type: "paragraph",
            text: "**Total Internal Reflection (TIR)** occurs when light travels from denser to rarer medium and the angle of incidence exceeds the **critical angle** $\\theta_c = \\sin^{-1}(n_2/n_1)$. TIR is exploited in optical fibres, diamonds, and binoculars.",
          },
          {
            type: "paragraph",
            text: "For a **thin lens**, the lens maker's equation and lens formula are:",
          },
          {
            type: "formula",
            latex:
              "\\frac{1}{f} = (n-1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right) \\qquad \\text{and} \\qquad \\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}",
            inline: false,
          },
          {
            type: "paragraph",
            text: "**Power of a lens**: $P = 1/f$ (f in metres), measured in Dioptres (D). For lenses in contact: $P = P_1 + P_2$.",
          },
          {
            type: "table",
            columns: [
              "Optical Instrument",
              "Key Formula",
              "Magnification (normal adjustment)",
            ],
            data: [
              {
                "Optical Instrument": "Simple Microscope",
                "Key Formula": "Uses convex lens as magnifier",
                "Magnification (normal adjustment)":
                  "$m = 1 + D/f$ (D = 25 cm)",
              },
              {
                "Optical Instrument": "Compound Microscope",
                "Key Formula": "Objective + eyepiece in series",
                "Magnification (normal adjustment)":
                  "$m = m_o \\times m_e = \\frac{L}{f_o} \\times \\frac{D}{f_e}$",
              },
              {
                "Optical Instrument": "Astronomical Telescope",
                "Key Formula": "Refracting; objective large $f_o$",
                "Magnification (normal adjustment)": "$m = -f_o / f_e$",
              },
              {
                "Optical Instrument": "Reflecting Telescope",
                "Key Formula": "Concave mirror as objective",
                "Magnification (normal adjustment)": "No chromatic aberration",
              },
            ],
          },
          {
            type: "subtitle",
            text: "Chapter 10 – Wave Optics",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Wave optics describes phenomena that ray optics cannot: **interference**, **diffraction**, and **polarisation**. Huygen's Principle states that every point on a wavefront acts as a secondary source of spherical wavelets; the new wavefront is the tangent envelope of these wavelets.",
          },
          {
            type: "paragraph",
            text: "**Young's Double Slit Experiment (YDSE)**: Two coherent sources separated by distance $d$, placed at distance $D$ from screen, produce bright fringes (constructive interference) and dark fringes (destructive interference). Fringe width:",
          },
          {
            type: "formula",
            latex: "\\beta = \\frac{\\lambda D}{d}",
            inline: false,
          },
          {
            type: "paragraph",
            text: "Position of $n$th bright fringe: $y_n = n\\frac{\\lambda D}{d}$. Position of $n$th dark fringe: $y_n = (2n-1)\\frac{\\lambda D}{2d}$. The intensity distribution is $I = 4I_0 \\cos^2(\\delta/2)$ where $\\delta$ is the phase difference.",
          },
          {
            type: "image",
            src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Single_slit_and_double_slit2.jpg/600px-Single_slit_and_double_slit2.jpg",
            alt: "Photograph of single-slit and double-slit diffraction patterns on a screen.",
            caption:
              "Double-slit interference pattern (bottom): evenly spaced bright fringes modulated by the single-slit diffraction envelope (top). The central maximum is brightest.",
            href: "https://en.wikipedia.org/wiki/Double-slit_experiment",
            size: "large",
          },
          {
            type: "paragraph",
            text: "**Single Slit Diffraction**: A slit of width $a$ produces a central maximum of width $2\\lambda D/a$ and minima at $a\\sin\\theta = m\\lambda$ ($m = \\pm 1, \\pm 2, \\ldots$). The central maximum is **twice as wide** as the secondary maxima.",
          },
          {
            type: "paragraph",
            text: "**Polarisation**: Light is a transverse wave. Natural (unpolarised) light has $\\vec{E}$ oscillating in all directions perpendicular to propagation. A **Polaroid** transmits only one plane of oscillation. **Malus's Law**: $I = I_0 \\cos^2\\theta$, where $\\theta$ is the angle between the polariser and analyser transmission axes. **Brewster's Law**: At the polarising angle $\\theta_B$, reflected light is completely polarised: $\\tan\\theta_B = n$.",
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "YDSE vs Single Slit: Don't Confuse Them",
            text: "In YDSE, all bright fringes (including central) have equal intensity. In single-slit diffraction, the central maximum is ~21× more intense than secondary maxima. When a slit width becomes comparable to the wavelength, diffraction dominates and you see fewer, wider fringes. When the slit is much wider than λ, diffraction effects diminish and you approach geometric (ray) optics.",
          },
        ],
      },

      // ─────────────────────────────────────────────
      // UNIT VII – DUAL NATURE
      // ─────────────────────────────────────────────
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Unit VII: Dual Nature of Radiation and Matter",
          },
          {
            type: "paragraph",
            text: "By the late 19th century, experiments showed that light couldn't be purely a wave (photoelectric effect) and that matter couldn't be purely particle-like (electron diffraction). The resolution was profound: **light and matter both have wave-particle duality**. This unit (Chapter 11, 12 marks) introduced quantum mechanics to the world.",
          },
          {
            type: "subtitle",
            text: "The Photoelectric Effect",
            level: 1,
          },
          {
            type: "paragraph",
            text: "When light of sufficient frequency shines on a metal surface, electrons are emitted. Einstein's explanation (1905, Nobel Prize 1921): light consists of **photons**, each of energy $E = h\\nu$ (where $h = 6.626 \\times 10^{-34}$ J s is Planck's constant). An electron absorbs one photon; if $h\\nu$ exceeds the **work function** $\\phi_0$ (minimum energy to free the electron), the electron is emitted with maximum kinetic energy:",
          },
          {
            type: "formula",
            latex: "K_{max} = h\\nu - \\phi_0 = eV_0",
            inline: false,
          },
          {
            type: "paragraph",
            text: "where $V_0$ is the **stopping potential** (minimum retarding voltage to stop all emitted electrons). Key experimental observations: (1) Emission starts only above a **threshold frequency** $\\nu_0 = \\phi_0/h$, regardless of intensity. (2) $K_{max}$ depends on frequency, not intensity. (3) Emission is instantaneous ($< 10^{-9}$ s). All three facts are inconsistent with classical wave theory but perfectly explained by the photon model.",
          },
          {
            type: "subtitle",
            text: "de Broglie Hypothesis: Matter Waves",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Louis de Broglie (1924) proposed that matter, like light, has a wave character. The **de Broglie wavelength** of a particle with momentum $p = mv$ is:",
          },
          {
            type: "formula",
            latex: "\\lambda = \\frac{h}{p} = \\frac{h}{mv}",
            inline: false,
          },
          {
            type: "paragraph",
            text: "For an electron accelerated through potential difference $V$: $\\lambda = \\frac{h}{\\sqrt{2meV}} = \\frac{1.227}{\\sqrt{V}}$ nm. The **Davisson–Germer experiment** (1927) confirmed de Broglie's hypothesis by showing that electrons diffract from a crystal just like X-rays.",
          },
          {
            type: "table",
            columns: [
              "Concept",
              "Classical Picture",
              "Quantum (Photon/Wave) Picture",
            ],
            data: [
              {
                Concept: "Nature of light",
                "Classical Picture": "Continuous wave; energy spread uniformly",
                "Quantum (Photon/Wave) Picture":
                  "Discrete photons; $E = h\\nu$",
              },
              {
                Concept: "Energy depends on",
                "Classical Picture": "Amplitude (intensity)",
                "Quantum (Photon/Wave) Picture": "Frequency ($\\nu$)",
              },
              {
                Concept: "Threshold frequency",
                "Classical Picture": "Should not exist",
                "Quantum (Photon/Wave) Picture":
                  "Exists: $\\nu_0 = \\phi_0 / h$",
              },
              {
                Concept: "Time delay",
                "Classical Picture": "Long delay expected",
                "Quantum (Photon/Wave) Picture": "Instantaneous emission",
              },
            ],
          },
          {
            type: "callout",
            calloutType: "info",
            title:
              "Why Don't We Notice Wave Properties of Macroscopic Objects?",
            text: "A cricket ball of mass 0.15 kg moving at 30 m/s has a de Broglie wavelength λ = h/mv ≈ 1.5 × 10⁻³⁴ m — immeasurably smaller than any atom. Wave effects are only observable when λ is comparable to the size of the object or gap it encounters. This is why quantum effects are confined to the microscopic world.",
          },
        ],
      },

      // ─────────────────────────────────────────────
      // UNIT VIII – ATOMS & NUCLEI
      // ─────────────────────────────────────────────
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Unit VIII: Atoms and Nuclei",
          },
          {
            type: "paragraph",
            text: "Chapters 12 and 13 take us inside the atom—first to the electron orbits, then into the nucleus itself. These chapters connect directly to modern technology: nuclear power, radiocarbon dating, PET scans, and radiation therapy all rest on the physics explored here.",
          },
          {
            type: "subtitle",
            text: "Chapter 12 – Atoms: The Bohr Model",
            level: 1,
          },
          {
            type: "paragraph",
            text: "Rutherford's 1911 scattering experiment established the nuclear model of the atom: a tiny, massive, positively charged nucleus surrounded by electrons. Niels Bohr (1913) added quantum postulates to explain the discrete spectrum of hydrogen. **Bohr's Postulates**: (1) Electrons occupy only certain allowed orbits where the angular momentum is quantised: $mvr = \\frac{nh}{2\\pi} = n\\hbar$. (2) Electrons in allowed orbits do not radiate. (3) Radiation is emitted or absorbed when an electron transitions between orbits.",
          },
          {
            type: "paragraph",
            text: "For hydrogen (atomic number $Z=1$), the key results are:",
          },
          {
            type: "formula",
            latex:
              "r_n = n^2 a_0 \\quad (a_0 = 0.529 \\text{ Å}) \\qquad E_n = -\\frac{13.6}{n^2} \\text{ eV}",
            inline: false,
          },
          {
            type: "paragraph",
            text: "The ground state energy is $E_1 = -13.6$ eV (negative because the electron is bound). When an electron falls from level $n_2$ to $n_1$, the emitted photon has frequency:",
          },
          {
            type: "formula",
            latex:
              "\\bar{\\nu} = \\frac{1}{\\lambda} = R_H \\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right)",
            inline: false,
          },
          {
            type: "paragraph",
            text: "where $R_H = 1.097 \\times 10^7$ m⁻¹ is the **Rydberg constant**. The spectral series are: Lyman ($n_1=1$, UV), Balmer ($n_1=2$, visible), Paschen ($n_1=3$, IR), Brackett ($n_1=4$, IR), Pfund ($n_1=5$, IR).",
          },
          {
            type: "image",
            src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Hydrogen_transitions.svg/600px-Hydrogen_transitions.svg.png",
            alt: "Energy level diagram of hydrogen atom showing Lyman, Balmer and Paschen series transitions.",
            caption:
              "Energy levels of the hydrogen atom. Electron transitions between levels emit photons of specific energies, producing the characteristic emission spectrum. The Balmer series (transitions to n=2) falls in the visible range.",
            href: "https://en.wikipedia.org/wiki/Bohr_model",
            size: "large",
          },
          {
            type: "subtitle",
            text: "Chapter 13 – Nuclei: Radioactivity and Nuclear Reactions",
            level: 1,
          },
          {
            type: "paragraph",
            text: "The nucleus consists of **protons** and **neutrons** (collectively **nucleons**) held together by the **strong nuclear force**—far stronger than electromagnetic repulsion but very short-ranged (~1–3 fm). Nuclear size follows $R = R_0 A^{1/3}$ with $R_0 \\approx 1.2$ fm, $A$ = mass number. The nuclear density (~$2.3 \\times 10^{17}$ kg/m³) is constant for all nuclei.",
          },
          {
            type: "paragraph",
            text: "**Mass Defect and Binding Energy**: The actual mass of a nucleus is less than the sum of its constituent nucleon masses. This missing mass, the **mass defect** $\\Delta m$, is converted to binding energy $E_B = \\Delta m \\cdot c^2$ (using Einstein's $E = mc^2$). The **binding energy per nucleon** ($E_B/A$) peaks around iron-56 (~8.8 MeV/nucleon), explaining why both fusion (light nuclei fusing) and fission (heavy nuclei splitting) release energy.",
          },
          {
            type: "paragraph",
            text: "**Radioactivity**: Unstable nuclei decay spontaneously. The three main types are:",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "**Alpha (α) decay**: Emission of $^4_2$He nucleus. A decreases by 4, Z decreases by 2. Least penetrating; stopped by paper.",
              "**Beta (β⁻) decay**: Emission of electron and antineutrino; a neutron converts to a proton. Z increases by 1, A unchanged. Stopped by a few mm of aluminium.",
              "**Gamma (γ) decay**: Emission of high-energy photon from excited nucleus. A and Z unchanged. Most penetrating; requires thick lead or concrete shielding.",
            ],
          },
          {
            type: "paragraph",
            text: "Radioactive decay follows an exponential law:",
          },
          {
            type: "formula",
            latex:
              "N(t) = N_0 e^{-\\lambda t} \\qquad T_{1/2} = \\frac{\\ln 2}{\\lambda} = \\frac{0.693}{\\lambda}",
            inline: false,
          },
          {
            type: "paragraph",
            text: "where $\\lambda$ is the **decay constant** and $T_{1/2}$ is the **half-life** (time for half the nuclei to decay). **Activity** $A = \\lambda N$, measured in Becquerel (Bq = 1 decay/s) or Curie ($1$ Ci $= 3.7 \\times 10^{10}$ Bq).",
          },
          {
            type: "toggle",
            title: "Nuclear Fission and Fusion",
            content:
              "**Fission**: A heavy nucleus (e.g., $^{235}$U) absorbs a slow neutron and splits into two smaller nuclei plus 2–3 fast neutrons and ~200 MeV of energy. The released neutrons can trigger further fissions—a **chain reaction**. In a nuclear reactor, the chain reaction is controlled; in a bomb, it is uncontrolled. $^{235}$U (0.7% of natural uranium) is the fissile fuel. **Fusion**: Light nuclei combine to form a heavier nucleus, releasing even more energy per unit mass than fission. The Sun produces energy by fusing hydrogen into helium (proton–proton chain). Temperature of ~$10^7$ K is required to overcome Coulomb repulsion (thermonuclear conditions). Controlled fusion remains the holy grail of clean energy technology (ITER project).",
          },
          {
            type: "callout",
            calloutType: "info",
            title: "1 a.m.u = 931.5 MeV — Memorise This",
            text: "The unified atomic mass unit (1 u = 1.66 × 10⁻²⁷ kg) is defined as 1/12 of the mass of a carbon-12 atom. Converting using E = mc²: 1 u × c² = 931.5 MeV. Use this to quickly convert mass defect (in u) to binding energy (in MeV) without messy calculations.",
          },
        ],
      },

      // ─────────────────────────────────────────────
      // UNIT IX – SEMICONDUCTOR DEVICES
      // ─────────────────────────────────────────────
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Unit IX: Semiconductor Devices — Diodes, Transistors and Logic Gates",
          },
          {
            type: "paragraph",
            text: "Every smartphone, computer, and digital gadget runs on semiconductor physics. Chapter 14 (7 marks) introduces the quantum-mechanical basis of how silicon and other semiconductors work, and how tiny junctions between differently-doped materials can control enormous currents—forming the transistors that power the modern world.",
          },
          {
            type: "subtitle",
            text: "Energy Bands and Semiconductor Types",
            level: 1,
          },
          {
            type: "paragraph",
            text: "In a solid, atomic energy levels broaden into **bands**. The **valence band** is the highest filled band; the **conduction band** is above it. The **band gap** $E_g$ separates them. For conductors: $E_g = 0$ (bands overlap). For semiconductors: $E_g \\approx 0.1 – 3$ eV (e.g., Si: 1.1 eV, Ge: 0.7 eV). For insulators: $E_g > 3$ eV.",
          },
          {
            type: "paragraph",
            text: "An **intrinsic semiconductor** (pure crystal) has equal numbers of electrons (n) in the conduction band and holes (p) in the valence band: $n = p = n_i$, where $n_i$ increases sharply with temperature. **Doping** adds impurities: adding pentavalent atoms (P, As) creates **n-type** (extra electrons); adding trivalent atoms (B, In) creates **p-type** (extra holes). In both cases, $np = n_i^2$ at equilibrium.",
          },
          {
            type: "subtitle",
            text: "The p-n Junction and Diode",
            level: 1,
          },
          {
            type: "paragraph",
            text: "When p-type and n-type materials are joined, electrons diffuse to the p-side and holes diffuse to the n-side, leaving behind charged ions. This creates a **depletion region** with a built-in electric field (contact potential $V_0 \\approx 0.6$–$0.7$ V for Si) that opposes further diffusion. In **forward bias** (p connected to +), the barrier decreases and current flows easily. In **reverse bias** (p connected to −), the barrier increases and only a tiny reverse saturation current flows until **breakdown**.",
          },
          {
            type: "image",
            src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PN_diode_with_electrical_symbol.svg/600px-PN_diode_with_electrical_symbol.svg.png",
            alt: "Diagram of a p-n junction diode with circuit symbol showing depletion region.",
            caption:
              "A p-n junction diode. The depletion region acts as a barrier. Forward bias reduces this barrier; reverse bias increases it, giving the diode its one-way current property.",
            href: "https://en.wikipedia.org/wiki/P%E2%80%93n_junction",
            size: "medium",
          },
          {
            type: "paragraph",
            text: "**Rectification**: A diode converts AC to DC. In a **half-wave rectifier**, only one half-cycle passes. In a **full-wave rectifier** (bridge circuit with 4 diodes), both halves are rectified. A **Zener diode** is specially doped to undergo controlled breakdown at a precise **Zener voltage** $V_Z$; it is used in voltage regulators to maintain constant output voltage.",
          },
          {
            type: "subtitle",
            text: "Transistors and Logic Gates",
            level: 1,
          },
          {
            type: "paragraph",
            text: "A **bipolar junction transistor (BJT)** has three doped regions: Emitter (heavily doped), Base (very thin, lightly doped), and Collector. In the **common-emitter (CE) configuration**, a small base current $I_B$ controls a much larger collector current $I_C$. The **current gain** $\\beta = I_C / I_B$ is typically 50–300. The transistor acts as an amplifier (in active region) or switch (in saturation/cut-off). **Voltage gain** of CE amplifier: $A_v = -\\beta \\frac{R_C}{R_{in}}$.",
          },
          {
            type: "table",
            columns: ["Logic Gate", "Boolean Expression", "Output Rule"],
            data: [
              {
                "Logic Gate": "NOT",
                "Boolean Expression": "$Y = \\bar{A}$",
                "Output Rule": "Output is complement of input",
              },
              {
                "Logic Gate": "AND",
                "Boolean Expression": "$Y = A \\cdot B$",
                "Output Rule": "Output 1 only if both inputs are 1",
              },
              {
                "Logic Gate": "OR",
                "Boolean Expression": "$Y = A + B$",
                "Output Rule": "Output 1 if at least one input is 1",
              },
              {
                "Logic Gate": "NAND",
                "Boolean Expression": "$Y = \\overline{A \\cdot B}$",
                "Output Rule": "Output 0 only if both inputs are 1",
              },
              {
                "Logic Gate": "NOR",
                "Boolean Expression": "$Y = \\overline{A + B}$",
                "Output Rule": "Output 1 only if both inputs are 0",
              },
            ],
          },
          {
            type: "callout",
            calloutType: "success",
            title: "NAND and NOR are Universal Gates",
            text: "Any logic function can be built using only NAND gates (or only NOR gates). Knowing this, you can implement NOT, AND, and OR using just NAND: NOT A = A NAND A; A AND B = (A NAND B) NAND (A NAND B); A OR B = (A NAND A) NAND (B NAND B). This is crucial in digital IC design because it means a chip needs only one type of gate structure.",
          },
          {
            type: "toggle",
            title: "Optoelectronic Devices",
            content:
              "**LED (Light Emitting Diode)**: Forward-biased p-n junction where electron-hole recombination releases energy as photons. The wavelength (colour) depends on the band gap: $\\lambda = hc/E_g$. Used in displays, indicators, and lighting. **Photodiode**: Reverse-biased junction where incident photons generate electron-hole pairs, increasing reverse current. Used in light sensors, optical communication, solar cells. **Solar Cell**: A large-area p-n junction that converts sunlight to electrical energy (photovoltaic effect). Open-circuit voltage ~0.5 V per cell; practical panels connect many cells in series and parallel.",
          },
        ],
      },

      // ─────────────────────────────────────────────
      // EXAM STRATEGY & FORMULA SHEET
      // ─────────────────────────────────────────────
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Exam Strategy, High-Weightage Derivations & Formula Quick-Reference",
          },
          {
            type: "paragraph",
            text: "Class 12 Physics board exams consistently reward students who (a) understand concepts deeply enough to apply them to new situations, (b) know which derivations are asked repeatedly, and (c) present solutions clearly with diagrams and proper units. Use this final section as your revision checklist.",
          },
          {
            type: "subtitle",
            text: "Must-Know Derivations (5-mark questions)",
            level: 1,
          },
          {
            type: "list",
            ordered: true,
            items: [
              "**Electric field due to a dipole** on axial and equatorial positions",
              "**Gauss's Law application**: field due to uniformly charged spherical shell",
              "**Drift velocity and resistance**: deriving $R = \\rho L/A$ from microscopic view",
              "**Magnetic field on axis of circular loop** using Biot–Savart Law",
              "**Faraday's Law**: EMF of a rotating rectangular coil in a uniform magnetic field",
              "**Lens Maker's Equation** using refraction at two spherical surfaces",
              "**Young's Double Slit**: fringe width derivation",
              "**Bohr's model**: derivation of $r_n$ and $E_n$ for hydrogen",
              "**de Broglie wavelength** for an accelerated electron",
              "**Transistor as amplifier** in CE configuration with voltage gain derivation",
            ],
          },
          {
            type: "subtitle",
            text: "Ultimate Formula Quick-Reference",
            level: 1,
          },
          {
            type: "table",
            columns: ["Chapter", "Formula", "Symbol Guide"],
            data: [
              {
                Chapter: "Coulomb's Law",
                Formula: "$F = kq_1q_2/r^2$",
                "Symbol Guide": "k = 9×10⁹ N m² C⁻²",
              },
              {
                Chapter: "Electric Field (point charge)",
                Formula: "$E = kq/r^2$",
                "Symbol Guide": "r = distance from charge",
              },
              {
                Chapter: "Capacitance (parallel plate)",
                Formula: "$C = K\\varepsilon_0 A/d$",
                "Symbol Guide": "K = dielectric constant",
              },
              {
                Chapter: "Ohm's Law",
                Formula: "$V = IR$",
                "Symbol Guide": "R = resistance in Ω",
              },
              {
                Chapter: "Magnetic Force on current",
                Formula: "$F = BIL\\sin\\theta$",
                "Symbol Guide": "L = length of conductor",
              },
              {
                Chapter: "Solenoid field",
                Formula: "$B = \\mu_0 nI$",
                "Symbol Guide": "n = turns per metre",
              },
              {
                Chapter: "Induced EMF",
                Formula: "$\\varepsilon = -N\\,d\\Phi/dt$",
                "Symbol Guide": "N = number of turns",
              },
              {
                Chapter: "RLC Impedance",
                Formula: "$Z = \\sqrt{R^2+(X_L-X_C)^2}$",
                "Symbol Guide": "$X_L=\\omega L$, $X_C=1/\\omega C$",
              },
              {
                Chapter: "Lens Formula",
                Formula: "$1/v - 1/u = 1/f$",
                "Symbol Guide": "Sign convention: incident light → +ve",
              },
              {
                Chapter: "YDSE Fringe Width",
                Formula: "$\\beta = \\lambda D/d$",
                "Symbol Guide": "D = screen distance, d = slit separation",
              },
              {
                Chapter: "Photoelectric Effect",
                Formula: "$K_{max} = h\\nu - \\phi_0$",
                "Symbol Guide": "h = 6.626×10⁻³⁴ J s",
              },
              {
                Chapter: "de Broglie Wavelength",
                Formula: "$\\lambda = h/mv$",
                "Symbol Guide": "p = mv = momentum",
              },
              {
                Chapter: "Bohr Energy Level",
                Formula: "$E_n = -13.6/n^2$ eV",
                "Symbol Guide": "n = principal quantum number",
              },
              {
                Chapter: "Radioactive Decay",
                Formula: "$N = N_0 e^{-\\lambda t}$",
                "Symbol Guide": "$T_{1/2} = 0.693/\\lambda$",
              },
              {
                Chapter: "Transistor Current Gain",
                Formula: "$\\beta = I_C / I_B$",
                "Symbol Guide":
                  "Also: $\\alpha = I_C/I_E$; $\\beta = \\alpha/(1-\\alpha)$",
              },
            ],
          },
          {
            type: "subtitle",
            text: "Time-Saving Exam Techniques",
            level: 1,
          },
          {
            type: "list",
            ordered: true,
            items: [
              "**Read questions carefully**: Many students lose marks by answering what they assumed was asked, not what was actually asked. Underline key words.",
              "**Diagrams earn marks**: In optics and magnetism, a clearly labelled diagram often accounts for 1–2 marks of a 5-mark question.",
              "**Units in every answer**: Writing the unit of your final answer is mandatory. Dimensionless answers should still state 'dimensionless' if that's correct.",
              "**SI units throughout**: Convert all given quantities to SI before substituting into formulas to avoid factor-of-1000 errors.",
              "**Start with high-weightage questions you know**: This secures marks early and reduces anxiety. Skip and return to uncertain questions.",
              "**State the law/principle before deriving**: In derivation questions, always state the law you're applying (e.g., 'Applying Gauss's Law to the Gaussian surface…') before the mathematical steps.",
            ],
          },
          {
            type: "callout",
            calloutType: "success",
            title: "Final Revision Strategy (Last 2 Weeks)",
            text: "Week 1: Revise all derivations (write them out by hand—not just read), solve all NCERT examples and exercises, and do at least 2 previous-year board papers under timed conditions. Week 2: Focus on weak chapters, revise all formula sheets daily, practise 3-mark and 5-mark questions from sample papers, and review all diagrams (optical instruments, circuit diagrams, spectral series, logic gates). Sleep well the night before—your brain consolidates memory during sleep.",
          },
          {
            type: "toggle",
            title: "Important Physical Constants to Memorise",
            content:
              "Speed of light: c = 3 × 10⁸ m/s | Planck's constant: h = 6.626 × 10⁻³⁴ J s | Electron charge: e = 1.6 × 10⁻¹⁹ C | Electron mass: mₑ = 9.1 × 10⁻³¹ kg | Proton mass: mₚ = 1.67 × 10⁻²⁷ kg | Permittivity of free space: ε₀ = 8.85 × 10⁻¹² C² N⁻¹ m⁻² | Permeability of free space: μ₀ = 4π × 10⁻⁷ T m A⁻¹ | Boltzmann constant: k_B = 1.38 × 10⁻²³ J/K | Avogadro number: Nₐ = 6.023 × 10²³ mol⁻¹ | 1 eV = 1.6 × 10⁻¹⁹ J | 1 u = 1.66 × 10⁻²⁷ kg = 931.5 MeV/c²",
          },
        ],
      },
    ],
  },
};
