// tailwind.config.ts

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeSlide: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 15px rgba(0,255,255,0.2)" },
          "50%": { boxShadow: "0 0 35px rgba(0,255,255,0.5)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        fadeSlide: "fadeSlide 5s ease-in-out forwards",
        glowPulse: "glowPulse 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
