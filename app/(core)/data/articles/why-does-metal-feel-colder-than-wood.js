import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const metalColderThanWoodBlog = {
  slug: "why-does-metal-feel-colder-than-wood",
  name: "Why does metal feel colder than wood?",
  desc: "Metal and wood in the same room are at the same temperature. Metal feels colder because it conducts heat out of your skin much faster than wood does.",
  tags: [
    LEVELS.upperSecondary,
    DIFFICULTIES.core,
    TAGS.PHYSICS,
    TAGS.THERMODYNAMICS,
  ],
  date: "24/09/2026",
  theory: {
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Why does metal feel colder than wood?",
          },
          {
            type: "paragraph",
            text: "Metal feels colder because it is a **much better conductor of heat**. Your skin does not measure the object's temperature; it senses how fast heat leaves your hand. Metal pulls heat away quickly and cools your skin, while wood barely conducts and lets your skin stay warm.",
          },
          {
            type: "paragraph",
            text: "Leave a metal spoon and a wooden spoon in the same room for an hour and a thermometer will read the same for both.",
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "Skin senses the **rate of heat flow**, not temperature. A material with high thermal conductivity, like metal, drains heat from your hand fast and so feels cold even at room temperature.",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "Objects left in the same room reach the same temperature; how cold they **feel** is a different thing.",
              "Heat always flows from warm to cold, and the flow rate depends on the material's thermal conductivity $k$.",
              "Aluminium conducts about $2000$ times better than wood, so it drains your hand's heat far faster.",
              "At body temperature (or in a hot sauna) the effect reverses: metal feels hotter than wood.",
              "Trapped air is a terrible conductor, which is why blankets, fleece and double glazing insulate.",
            ],
          },
          {
            type: "sectionTitle",
            text: "What does your skin actually sense?",
          },
          {
            type: "paragraph",
            text: "Nerve endings in the skin respond to the **temperature of the skin itself** and to how fast it changes. When you touch a cooler object, heat flows from your hand into it and the contact surface cools. The faster the heat is carried away from the contact point, the lower the skin temperature drops and the colder the object seems.",
          },
          {
            type: "formula",
            ref: "heat-conduction",
            latex: "\\dot Q = -k\\,A\\,\\frac{\\Delta T}{d}",
          },
          {
            type: "paragraph",
            text: "This is Fourier's law of conduction: the heat flow rate $\\dot Q$ is proportional to the thermal conductivity $k$, the contact area $A$ and the temperature difference $\\Delta T$ across a thickness $d$. Only $k$ differs between a metal and wooden handle of the same shape.",
          },
          {
            type: "table",
            columns: ["Material", "Thermal conductivity (W/m·K)"],
            data: [
              {
                Material: "Aluminium",
                "Thermal conductivity (W/m·K)": "$\\approx 237$",
              },
              {
                Material: "Steel",
                "Thermal conductivity (W/m·K)": "$\\approx 50$",
              },
              {
                Material: "Glass",
                "Thermal conductivity (W/m·K)": "$\\approx 1$",
              },
              {
                Material: "Wood",
                "Thermal conductivity (W/m·K)": "$\\approx 0.1$ to $0.2$",
              },
              {
                Material: "Still air",
                "Thermal conductivity (W/m·K)": "$\\approx 0.026$",
              },
            ],
          },
          {
            type: "toggle",
            title: "What temperature does the contact surface reach?",
            content:
              "When two bodies touch, the interface settles at $T_c = \\dfrac{e_1 T_1 + e_2 T_2}{e_1 + e_2}$, where $e = \\sqrt{k\\rho c}$ is the thermal effusivity. Skin has $e \\approx 1000$, aluminium $\\approx 24{,}000$ and wood $\\approx 300$ (in W·s^½/m²·K). For a $33\\,°\\text{C}$ hand touching a $20\\,°\\text{C}$ object, the contact temperature is about $20.5\\,°\\text{C}$ on aluminium but about $30\\,°\\text{C}$ on wood. Your skin instantly drops to almost the metal's temperature and stays close to its own with wood.",
          },
          {
            type: "sectionTitle",
            text: "When does metal feel hotter than wood?",
          },
          {
            type: "paragraph",
            text: "Above skin temperature the story reverses. A metal bench and a wooden one in strong sun, or the metal bar in a sauna at $80\\,°\\text{C}$, feel very different: metal pours heat into your hand and feels much hotter, while wood barely warms the skin. It is the same physics, just with heat flowing the other way.",
          },
          {
            type: "callout",
            calloutType: "info",
            title: "Everyday versions",
            text: "Tiles feel colder than carpet, a car door handle feels colder than the plastic dashboard, and a wet hand sticks to a frozen metal tray. In each case, the higher-conductivity surface drains more heat from you.",
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "Is metal really the same temperature as wood in a room?",
                a: "Yes. Once they have been in the same room long enough to reach thermal equilibrium, they are at the same temperature. A thermometer placed on each will read the same value; only your skin perceives a difference.",
              },
              {
                q: "Why does a tile floor feel colder than a carpet?",
                a: "Tiles conduct heat far better than carpet, and carpet also traps insulating air. Tile removes heat from your foot faster, so your skin cools more and the floor feels colder, even though both are at room temperature.",
              },
              {
                q: "What is thermal conductivity?",
                a: "It measures how well a material passes heat through itself, in watts per metre per kelvin. High values (metals) move heat quickly; low values (wood, foam, air) resist it and make good insulators.",
              },
              {
                q: "Why do blankets keep you warm if they are not heat sources?",
                a: "They trap still air, which conducts heat roughly $9000$ times worse than aluminium. Your body's heat leaks out more slowly, so you stay warmer without the blanket producing any heat itself.",
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
              "Another everyday phenomenon explained by physics: [Why is the sky blue?](/blog/why-is-the-sky-blue)",
              "Energy and where it goes: [Bouncing ball physics](/blog/physics-bouncing-ball-comprehensive-educational-guide).",
              "What physics is really about: [What is physics?](/blog/what-is-physics).",
              "Browse all interactive experiments in the [simulations catalogue](/simulations).",
            ],
          },
        ],
      },
    ],
  },
};
