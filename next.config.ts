import type { NextConfig } from "next";
import packageJson from "./package.json" assert { type: "json" };

const nextConfig: NextConfig = {
  output: "export",
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
  /*   images: {
    unoptimized: true, // Obbligatorio per GitHub Pages
  }, */
};

export default nextConfig;
