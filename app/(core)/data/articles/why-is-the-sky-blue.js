import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const skyBlueBlog = {
  slug: "why-is-the-sky-blue",
  name: "Why is the sky blue?",
  desc: "Air molecules scatter short-wavelength blue light about six times more than red — Rayleigh scattering. The same effect turns sunsets red and clouds white.",
  tags: [
    LEVELS.lowerSecondary,
    DIFFICULTIES.core,
    TAGS.PHYSICS,
    TAGS.OPTICS,
    TAGS.WAVES,
  ],
  date: "24/09/2026",
  theory: {
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Why is the sky blue?",
          },
          {
            type: "paragraph",
            text: "The sky is blue because the gases in the atmosphere **scatter blue light much more strongly than red light**. Sunlight looks white but is a mix of all colours; as it crosses the air, the short blue wavelengths get bounced in every direction, so blue light reaches your eyes from the whole sky and not only from the Sun.",
          },
          {
            type: "paragraph",
            text: "The physics behind it is called **Rayleigh scattering**, and the same rule explains why sunsets are red and why the Moon's sky is black.",
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "Scattering by air molecules is proportional to $1/\\lambda^4$, so blue light (about $450$ nm) is scattered roughly six times more than red light (about $700$ nm).",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "Sunlight is white light: a mixture of all visible wavelengths, from violet ($\\approx 400$ nm) to red ($\\approx 700$ nm).",
              "Molecules much smaller than the wavelength scatter light with strength $\\propto 1/\\lambda^4$ — short wavelengths win by a large margin.",
              "Scattered blue light comes at you from every direction, so the whole sky glows blue.",
              "At sunrise and sunset the light crosses far more air, most blue is scattered away, and the red-orange remainder reaches you.",
              "Clouds are white because water droplets are large enough to scatter every colour about equally.",
            ],
          },
          {
            type: "sectionTitle",
            text: "What is Rayleigh scattering?",
          },
          {
            type: "paragraph",
            text: "Light is an electromagnetic wave. When it meets a molecule of nitrogen or oxygen, its oscillating electric field shakes the electrons in the molecule, and the shaking electrons re-radiate light in all directions. That re-radiation is scattering. The smaller the wavelength, the faster the shaking and the stronger the scattered light:",
          },
          {
            type: "formula",
            latex: "I_{\\text{scattered}} \\propto \\frac{1}{\\lambda^{4}}",
          },
          {
            type: "paragraph",
            text: "The fourth power is what makes the difference so dramatic. Halving the wavelength would scatter $2^4 = 16$ times more light. The table compares the colours of the spectrum with red as the reference:",
          },
          {
            type: "table",
            columns: ["Colour", "Wavelength", "Scattering vs red"],
            data: [
              {
                Colour: "Red",
                Wavelength: "700 nm",
                "Scattering vs red": "$1\\times$",
              },
              {
                Colour: "Green",
                Wavelength: "550 nm",
                "Scattering vs red": "$\\approx 2.6\\times$",
              },
              {
                Colour: "Blue",
                Wavelength: "450 nm",
                "Scattering vs red": "$\\approx 5.9\\times$",
              },
              {
                Colour: "Violet",
                Wavelength: "400 nm",
                "Scattering vs red": "$\\approx 9.4\\times$",
              },
            ],
          },
          {
            type: "sectionTitle",
            text: "Why isn't the sky violet?",
          },
          {
            type: "paragraph",
            text: "Violet is scattered even more than blue, but three things push the sky's colour toward blue: the Sun emits less violet light than blue, the upper atmosphere absorbs some of it, and human eyes are far less sensitive to violet than to blue. The mix your eye adds up is a pale, bright blue.",
          },
          {
            type: "sectionTitle",
            text: "Why are sunsets red?",
          },
          {
            type: "paragraph",
            text: "When the Sun is low, its light travels through many times more air before it reaches you. On that long path most of the blue and green is scattered out of the direct beam, and what remains is orange and red. The blue has not vanished — it was scattered toward other observers, where it is still daytime.",
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "Common misconception",
            text: "The sky is not blue because it reflects the ocean. The reverse is closer to the truth: the sea looks blue partly because it mirrors the sky, and mostly because water absorbs red light more than blue.",
          },
          {
            type: "sectionTitle",
            text: "Why are clouds white?",
          },
          {
            type: "paragraph",
            text: "Cloud droplets are thousands of times larger than air molecules, comparable to or bigger than the wavelength of light. At that size the scattering, called Mie scattering, hardly depends on wavelength, so all colours are scattered equally and the sum looks white. Thick clouds also block sunlight, which is why their bases look grey.",
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "Why is the sky blue and not violet?",
                a: "Violet is scattered more than blue, but sunlight contains less violet, some of it is absorbed high in the atmosphere, and our eyes respond weakly to it. The combined result the eye perceives is blue.",
              },
              {
                q: "Why is the sky black on the Moon?",
                a: "The Moon has almost no atmosphere, so there are no molecules to scatter sunlight toward the observer. Light only arrives directly from the Sun, and everywhere else the sky is black, even during the lunar day.",
              },
              {
                q: "Why does the sky turn red at sunset?",
                a: "At sunset sunlight crosses a much longer stretch of atmosphere. Blue and green are scattered out of the direct beam along the way, leaving mostly orange and red light to reach your eyes.",
              },
              {
                q: "Is the sky blue on other planets?",
                a: "Not necessarily. The colour depends on the atmosphere. Mars has a butterscotch daytime sky because of suspended dust, while its sunsets are bluish. Any thin gas of small molecules scatters blue more than red.",
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
              "Another everyday puzzle solved by waves and speed: [Why do we see lightning before we hear thunder?](/blog/why-do-we-see-lightning-before-thunder)",
              "Wavelength, frequency and angles on the circle: [The unit circle and trigonometry](/blog/unit-circle-trigonometry).",
              "The big picture of how physics explains the world: [What is physics?](/blog/what-is-physics).",
              "Browse every interactive experiment in the [simulations catalogue](/simulations).",
            ],
          },
        ],
      },
    ],
  },
};
