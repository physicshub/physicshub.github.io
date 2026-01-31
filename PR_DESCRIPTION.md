# Fix: Sitemap Not Updating in CI/CD

## 🐛 The Problem

The user reported that `sitemap.xml` was buggy or not being read correctly by Google Search Console.
Upon investigation, it was found that the deployed `sitemap.xml` might be stale or not reflecting the latest routes because the generation script was not running during the automated deployment.

## 🔍 Root Cause Analysis

In `package.json`, the build script is defined as:

```json
"build": "npm run generate:sitemap && next build"
```

This script ensures that the sitemap is regenerated **before** the Next.js build occurs.

However, the GitHub Actions workflow (`.github/workflows/release.yml`) was explicitly running:

```yaml
run: npx next build
```

By running `next build` directly via `npx`, the CI pipeline was **bypassing** the `npm run generate:sitemap` step defined in `package.json`. Consequently, the sitemap in the `out/` directory was either missing, stale, or relying on a previously committed version.

## 🛠 The Solution

I have updated the `.github/workflows/release.yml` file to use the project's defined build script instead of the default Next.js command.

**Change:**

```diff
- run: npx next build
+ run: npm run build
```

## ✅ Verification Steps

To verify this fix:

1. **Merge** this pull request.
2. Go to the **Actions** tab in GitHub.
3. Open the running **Release and Build** workflow.
4. Click on the **build** step.
5. Verify that you see the output `✅ Sitemap generated...` in the logs before the Next.js build starts.
6. Once deployed, check `https://physicshub.github.io/sitemap.xml` to ensure it matches the latest content.
