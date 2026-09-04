import { existsSync } from "fs";
import path from "path";
import packageJson from "./package.json" with { type: "json" };

// This app is built in two modes.
//
//   npm run build         → a normal Next.js app: `app/api` is present, so the
//                           route handlers (OAuth sign-in, blog publishing)
//                           actually run server-side. This is what Vercel uses,
//                           and what you want locally.
//   npm run build:static  → the GitHub Pages export. `output: "export"` cannot
//                           coexist with request-time route handlers, so
//                           scripts/strip-api-for-static-export.js moves
//                           `app/api` aside first (and restores it after).
//
// The absence of `app/api` is therefore the switch: one source of truth, set by
// the strip script rather than by an env var, so it behaves identically in CI,
// on Vercel and on any contributor's machine (Windows included).
const shouldStaticExport = !existsSync(path.resolve("app/api"));

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
