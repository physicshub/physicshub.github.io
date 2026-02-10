# TODO: Fix ESLint Issues

## Step 1: Fix scripts/sitemap-generator.js

- Replace unused 'e' in catch block with underscore.

## Step 2: Fix simulations/test.jsx - Remove unused imports

- Remove 'useMemo' from React imports.
- Remove 'getTimeScale' from Time.js imports.
- Remove 'PHYSICS_CONTROLS' and 'VISUALIZATION_CONTROLS' from config imports.

## Step 3: Fix simulations/test.jsx - Fix useEffect dependencies

- Add 'inputs.timeScale' to the first useEffect dependency array.
- Extract 'simData["Total Energy"]' to a variable for the warnings useEffect.
- Add 'simData' to the warnings useEffect dependency array.

## Step 4: Fix simulations/test.jsx - Refactor warnings logic

- Move warnings calculation from useEffect to useMemo to avoid setState in effect.
- Update the component to use warnings from useMemo.

## Step 5: Run ESLint to verify fixes

- Execute `npm run lint` to check if all issues are resolved.
