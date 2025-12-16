import type { NextConfig } from "next";
import packageJson from "./package.json" assert { type: "json" };

const nextConfig: NextConfig = {
  output: "export",
  
  env: {
    // Creiamo una variabile accessibile lato client
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
};

export default nextConfig;
