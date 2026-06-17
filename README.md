# Sea Trading OS v7.5.1 — Vercel Fixed

Build marker: `v7.5.1-vercel-fixed`

## 修复点

- 压缩包改为根目录平铺结构：`package.json`、`vercel.json`、`src/`、`api/` 直接在压缩包根目录。
- 新增 `package-lock.json`，Vercel 使用 `npm ci`，避免依赖安装阶段长期 Building。
- 保留 Vite 配置：Build Command `npm run build`，Output Directory `dist`。
- 保留 API 路由：`/api/quote`、`/api/macro`。
- 添加部署标记，便于确认 Vercel 不是旧缓存。

## Vercel 设置

- Framework Preset: Vite
- Install Command: `npm ci --no-audit --no-fund --progress=false`
- Build Command: `npm run build`
- Output Directory: `dist`
- Root Directory: 留空或选择仓库根目录，不要选择外层旧文件夹。

## 本地验证

```bash
npm ci --no-audit --no-fund --progress=false
npm run build
```
