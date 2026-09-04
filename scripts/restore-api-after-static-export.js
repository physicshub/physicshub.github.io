// scripts/restore-api-after-static-export.js
//
// Counterpart to strip-api-for-static-export.js: puts `app/api` back after the
// static export build has finished, so the working tree is left as it was.
// Irrelevant in CI (fresh checkout, thrown away) but essential locally, where
// a contributor running `npm run build:static` would otherwise be left with
// app/api missing.
//
// Deliberately never fails the build: the export artifact in out/ is already
// correct by the time this runs, and a restore problem is a working-tree
// annoyance, not a bad deploy.

import { rename } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const apiDir = path.resolve("app/api");
const backupDir = path.resolve(".api-backup-during-static-build");

async function main() {
  if (!existsSync(backupDir)) {
    return; // nothing was stripped
  }

  if (existsSync(apiDir)) {
    console.warn(
      "app/api already exists — leaving the backup in .api-backup-during-static-build for you to inspect."
    );
    return;
  }

  await rename(backupDir, apiDir);
  console.log("Restored app/api after the static export build.");
}

main().catch((err) => {
  console.error("Failed to restore app/api:", err);
  console.error("Recover it with: git checkout app/api");
});
