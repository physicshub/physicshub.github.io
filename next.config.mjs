/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  env: {
    NEXT_PUBLIC_APP_VERSION: "0.0.0",
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;


