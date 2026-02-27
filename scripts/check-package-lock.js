import { execSync } from "child_process";

try {
  const stagedFiles = execSync("git diff --cached --name-only", {
    encoding: "utf8",
  });

  if (stagedFiles.includes("package-lock.json")) {
    console.error("\n❌ Error: package-lock.json is staged for commit!");
    console.error("This file should not be committed.\n");
    console.error("Run: git reset HEAD package-lock.json\n");
    process.exit(1);
  }

  console.log("✅ Pre-commit checks passed");
} catch (error) {
  console.error("Pre-commit check failed:", error.message);
  process.exit(1);
}
