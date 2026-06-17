# Sea Trading OS v7.5.2 Vercel Clean

Build marker: `v7.5.2-vercel-clean`

## Local verification

```bash
npm ci --no-audit --no-fund --progress=false
npm run build
```

Expected output directory: `dist/`

## Vercel

- Framework Preset: Vite
- Root Directory: repository root / empty
- Install Command: `npm ci --no-audit --no-fund --progress=false`
- Build Command: `npm run build`
- Output Directory: `dist`

See `VERCEL_DEPLOY_FIX.md` for cleanup instructions.
