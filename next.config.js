import packageJson from "./package.json" with { type: "json" };

// GitHub Pages needs a fully static export (no server, no API routes).
// Vercel needs the opposite — a normal Next.js app so API routes like
// /api/auth/* and /api/publish actually run server-side. Vercel sets the
// VERCEL env var automatically on every build, so we use that to decide
// which mode to build in, rather than needing a second config file.
//
// Also exclude local dev (`next dev`, NODE_ENV=development) — contributors
// need working API routes to test locally, and only `next build` (used by
// both the GitHub Pages CI job and Vercel) should ever produce a static
// export in the first place.
const isVercelBuild = !!process.env.VERCEL;
const isProductionBuild = process.env.NODE_ENV === "production";
const shouldStaticExport = isProductionBuild && !isVercelBuild;

const nextConfig = {
  ...(shouldStaticExport ? { output: "export" } : {}),
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
