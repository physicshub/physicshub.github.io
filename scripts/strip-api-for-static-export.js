// scripts/strip-api-for-static-export.js
//
// GitHub Pages serves this site as a fully static export (`output: "export"`,
// see next.config.js) — there is no Node server to run route handlers. Next.js
// hard-fails a static export as soon as a route handler needs request-time
// data, which the OAuth GET routes (`app/api/auth/*`, they all read cookies)
// do. They cannot coexist with `output: "export"`, config flag or not.
//
// So the static build moves `app/api` out of the way first, and
// `restore-api-after-static-export.js` moves it back afterwards. Only
// `npm run build:static` does this; the plain `npm run build` used by Vercel
// leaves app/api in place, which is the whole point — that is the deploy where
// the API actually runs.
//
// The move is a rename, so it is atomic and cheap. If a build crashes between
// strip and restore the directory stays in the backup, showing up as a deleted
// app/api in `git status`; the next strip run puts it back before doing
// anything else, and `git checkout app/api` recovers it by hand.
//
// It also clears the generated route types under `.next/`. tsconfig.json
// includes `.next/types` and `.next/dev/types`, and `next dev` / a server-mode
// build leave a `validator.ts` there that imports every `app/api/**/route.js`.
// With app/api moved aside, the type-check of the export would fail with
// TS2307 "Cannot find module '../../../app/api/...'". Next regenerates them.

import { rename, rm } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const apiDir = path.resolve("app/api");
const backupDir = path.resolve(".api-backup-during-static-build");
const staleTypeDirs = [
  path.resolve(".next/types"),
  path.resolve(".next/dev/types"),
];

async function main() {
  // Self-heal a backup left behind by an earlier crashed build.
  if (existsSync(backupDir)) {
    if (existsSync(apiDir)) {
      console.log("Discarding a stale app/api backup from a previous build.");
      await rm(backupDir, { recursive: true, force: true });
    } else {
      console.log("Restoring app/api left stripped by a previous build.");
      await rename(backupDir, apiDir);
    }
  }

  if (!existsSync(apiDir)) {
    console.log("No app/api directory found — nothing to strip.");
    return;
  }

  console.log("Moving app/api aside for the static export build...");
  await rename(apiDir, backupDir);

  for (const dir of staleTypeDirs) {
    await rm(dir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error("Failed to strip app/api:", err);
  process.exit(1);
});
