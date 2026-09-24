import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const lightningThunderBlog = {
  slug: "why-do-we-see-lightning-before-thunder",
  name: "Why do we see lightning before we hear thunder?",
  desc: "Light travels almost a million times faster than sound. Count the seconds between flash and thunder, divide by 3, and you have the distance in kilometres.",
  tags: [
    LEVELS.lowerSecondary,
    DIFFICULTIES.core,
    TAGS.PHYSICS,
    TAGS.WAVES,
    TAGS.KINEMATICS,
  ],
  date: "24/09/2026",
  theory: {
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "Why do we see lightning before we hear thunder?",
          },
          {
            type: "paragraph",
            text: "Lightning and thunder are produced at the same instant, but **light travels at about 300,000 km/s while sound travels at only about 343 m/s**. The flash reaches you almost immediately; the thunder takes seconds to cover the same distance.",
          },
          {
            type: "paragraph",
            text: "That gap is a free rangefinder. Every $3$ seconds between flash and thunder means the strike was about $1$ km away.",
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "Sound in air travels at roughly $343$ m/s, about $1$ km every $3$ seconds, while light arrives essentially instantly. Distance $\\approx$ seconds between flash and thunder $\\times\\ 343$ m.",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "Light is about $875{,}000$ times faster than sound in air, so the flash is effectively instant.",
              "Sound travels about $343$ m/s at $20\\,°\\text{C}$: roughly $1$ km per $3$ s, or $1$ mile per $5$ s.",
              "Distance to the strike: $d = v_{\\text{sound}} \\times t$, where $t$ is the delay you counted.",
              "Thunder is a shock wave from air heated to roughly $30{,}000\\,°\\text{C}$ in a fraction of a second.",
              "If you can hear thunder, you are close enough to be struck: go indoors.",
            ],
          },
          {
            type: "sectionTitle",
            text: "How do you find the distance to a lightning strike?",
          },
          {
            type: "paragraph",
            text: "Start counting when you see the flash and stop when you hear the thunder. Because light takes a negligible time to arrive, the delay $t$ is simply the travel time of sound, so distance is speed times time:",
          },
          {
            type: "formula",
            latex:
              "d = v_{\\text{sound}}\\, t \\approx 343\\ \\text{m/s} \\times t",
          },
          {
            type: "table",
            columns: ["Delay (flash to thunder)", "Distance"],
            data: [
              {
                "Delay (flash to thunder)": "1 s",
                Distance: "$\\approx 0.34$ km",
              },
              {
                "Delay (flash to thunder)": "3 s",
                Distance: "$\\approx 1$ km",
              },
              {
                "Delay (flash to thunder)": "10 s",
                Distance: "$\\approx 3.4$ km",
              },
              {
                "Delay (flash to thunder)": "30 s",
                Distance: "$\\approx 10$ km",
              },
            ],
          },
          {
            type: "paragraph",
            text: "Example: you count $6$ seconds. Then $d = 343 \\times 6 \\approx 2058$ m, a little over $2$ km. Light took only about $7$ microseconds to cover that distance, so ignoring it is safe.",
          },
          {
            type: "callout",
            calloutType: "tip",
            title: "Speed of sound depends on temperature",
            text: 'In air, $v \\approx 331 + 0.6\\,T$ m/s with $T$ in °C. On a $30\\,°\\text{C}$ summer day that is about $349$ m/s; at $0\\,°\\text{C}$ it is $331$ m/s. The change is small, so "3 seconds per km" works all year.',
          },
          {
            type: "sectionTitle",
            text: "What causes thunder?",
          },
          {
            type: "paragraph",
            text: "A lightning bolt heats the air along its path to about $30{,}000\\,°\\text{C}$, several times hotter than the surface of the Sun, within microseconds. The air expands explosively, launching a **shock wave** that becomes the sound we call thunder.",
          },
          {
            type: "sectionTitle",
            text: "Why does thunder rumble instead of bang?",
          },
          {
            type: "paragraph",
            text: "A lightning channel is several kilometres long. Sound from the nearest part reaches you first and sound from the farthest part arrives later, so one instant of lightning is stretched into a rolling rumble. Reflections from hills and clouds add to the effect. Close strikes, where the whole channel is at a similar distance, produce a sharp crack.",
          },
          {
            type: "callout",
            calloutType: "warning",
            title: "Safety",
            text: "Lightning can strike more than $10$ km from the storm's core. If you hear thunder, you are within striking range. Shelter in a building or a closed car, and wait about $30$ minutes after the last thunder before going out again.",
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "Is light really instantaneous?",
                a: "No, but it is fast enough not to matter here. Light covers $3$ km in about $10$ microseconds, while sound takes around $9$ seconds. For everyday distances you can treat the flash as arriving at the moment it happens.",
              },
              {
                q: "How far away can you hear thunder?",
                a: "Usually up to about $15$ to $25$ km. Beyond that, the sound is bent upward and absorbed by the atmosphere, so a distant storm can look bright yet stay silent.",
              },
              {
                q: "What does it mean if lightning and thunder come together?",
                a: "The strike is very close, likely less than a few hundred metres away. When the delay is under a second or two, treat it as dangerous and get to safe shelter at once.",
              },
              {
                q: "Why does thunder sound different each time?",
                a: "The sound depends on how far the bolt is, its shape and length, the terrain and the temperature layers in the air. Nearby, straight bolts crack; distant or long bolts rumble.",
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
              "Speed, distance and time in more depth: [A ball in uniformly accelerated motion](/blog/ball-uniformly-accelerated-motion).",
              "Another effect of light and the atmosphere: [Why is the sky blue?](/blog/why-is-the-sky-blue)",
              "Oscillations, the motion behind every sound wave: [Springs and simple harmonic motion](/blog/spring-connection).",
              "Try motion experiments yourself in the [simulations catalogue](/simulations).",
            ],
          },
        ],
      },
    ],
  },
};
