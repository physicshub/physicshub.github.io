import { execSync } from "child_process";

try {
  const stagedFiles = execSync("git diff --cached --name-only", {
    encoding: "utf8",
  });

  if (stagedFiles.includes("package-lock.json")) {
    console.log(
      "package-lock.json detected in staged files. Automatically unstaging it..."
    );

    try {
      execSync("git restore --staged package-lock.json");
    } catch {
      try {
        execSync("git reset HEAD -- package-lock.json");
      } catch {
        console.warn(
          "\n Warning: failed to automatically unstage package-lock.json. Please run:"
        );
        console.warn("  git reset HEAD package-lock.json\n");
      }
    }
  }

  console.log("Pre-commit checks passed");
} catch (error) {
  console.error("Pre-commit check failed:", error.message);
  process.exit(1);
}
