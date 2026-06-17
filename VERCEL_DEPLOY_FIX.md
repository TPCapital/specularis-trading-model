# Sea Trading OS v7.6.3 - Clean Vercel Deploy Fix

This package fixes the stale-version deployment problem.

## What was wrong

- The uploaded v7_6_3 zip still contained old legacy build markers in `package.json`, `package-lock.json`, `vercel.json`, and `/api/quote.js`.
- The UI contained previous build markers while the deployment headers still said legacy build.
- The zip had a nested `sea-trading-os/` folder instead of a flat project root.

## Fixed

- Unified all build markers to `v7.6.3-macro-matrix`.
- Added `public/deploy-version.json` as an external deployment verification file.
- Added no-store headers for `/`, `/index.html`, and `/api/*`.
- Preserved immutable caching only for hashed Vite assets under `/assets/*`.
- Output zip is flat-root: `package.json`, `vercel.json`, `src/`, `api/`, and `index.html` are at the first level.

## Verification URL after deployment

Open this file on your Vercel domain:

`/deploy-version.json`

It must show `v7.6.3-macro-matrix`. If not, Vercel is deploying the wrong GitHub root/branch or an old commit.
