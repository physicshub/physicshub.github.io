import packageJson from "./package.json" with { type: "json" };

const nextConfig = {
  output: "export",
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
