// scripts/strip-api-for-static-export.js
//
// GitHub Pages serves this site as a fully static export (output: "export"
// in next.config.js) — there's no live Node server to run API route
// handlers. Next.js's static export will hard-fail the build if any
// dynamic (GET-based) route handler exists under app/api, since it can't
// produce static output for them.
//
// The actual API routes (OAuth, blog publishing) are deployed separately
// to Vercel, which DOES run a real server and needs these files present.
// See next.config.js for the corresponding VERCEL env var check.
//
// This script temporarily removes app/api before the static export build
// runs. It's only invoked by `npm run build:static` (used in CI for the
// GitHub Pages deploy) — the regular `npm run build` (used by Vercel)
// never calls this, so app/api stays intact there.

import { rm, cp, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const apiDir = path.resolve("app/api");
const backupDir = path.resolve(".api-backup-during-static-build");

async function main() {
  if (!existsSync(apiDir)) {
    console.log("No app/api directory found — nothing to strip.");
    return;
  }

  console.log("Temporarily removing app/api for the static export build...");
  await mkdir(backupDir, { recursive: true });
  await cp(apiDir, backupDir, { recursive: true });
  await rm(apiDir, { recursive: true, force: true });
  console.log(
    "Done. (Backed up to .api-backup-during-static-build in case a restore script is added later.)"
  );
}

main().catch((err) => {
  console.error("Failed to strip app/api:", err);
  process.exit(1);
});
