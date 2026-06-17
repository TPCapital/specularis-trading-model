# Sea Trading OS v7.5.2 - Vercel Clean Deploy

This package fixes deployment-stuck issues by removing the risky parts that can keep Vercel in `Building` or deploy stale output.

## What changed

1. Removed unnecessary `/api/:path* -> /api/:path*` self-rewrite.
2. Removed stale build markers from `index.html`, `App.jsx`, and response headers.
3. Converted API files from Edge runtime to conventional Vercel Node serverless handlers.
4. Added `.gitignore` and `.vercelignore` to prevent `node_modules`, `dist`, `.vercel`, old zip files, logs, and cache folders from being uploaded/deployed.
5. Kept root flat: `package.json`, `vercel.json`, `src/`, `api/`, and `index.html` must be directly in the GitHub repository root.

## Vercel settings

Use these exact settings:

- Framework Preset: Vite
- Root Directory: leave empty / repository root
- Install Command: `npm ci --no-audit --no-fund --progress=false`
- Build Command: `npm run build`
- Output Directory: `dist`
- Node.js Version: 20.x or 22.x

## Important cleanup before upload

Delete these from GitHub if they exist:

- old nested folder: `sea-trading-os/`
- `node_modules/`
- `dist/`
- `.vercel/`
- old `.zip` packages
- duplicated old `package.json` in subfolders
- old generated assets not used by the app

If Vercel is still stuck after replacing the files, cancel the stuck deployment, then trigger a fresh deployment with **Redeploy without Build Cache**.
