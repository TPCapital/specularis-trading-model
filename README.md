# Sea Trading OS v7 — 四模块极简执行终端

## 四大模块

| 模块 | 系统逻辑 | 关键条件 |
|------|----------|----------|
| QQQ 期权 | GEX + VWAP + EMA + 量能 + 时间窗口 | 09:45–11:30 ET 主战 |
| 正股配置 | 基本面筛选 → 技术择时 → 周线持有 | VIX 环境过滤 |
| 黄金 XAU | 宏观DXY+实际利率 → SMC结构 → Kill Zone | 北京 15:00 / 21:30 |
| EUR/USD | EMA顺排 + ADX>25 → Kill Zone → 回踩确认 | ADX<20 时系统无效 |

## 实时行情

通过 `/api/quote` Vercel Edge Function 代理 Yahoo Finance，解决 CORS 问题。
支持：QQQ / VIX / SPY / GLD / EUR-USD / DXY(UUP)

## 部署到 Vercel

```bash
npm install
npm run build
vercel --prod
```

或直接 `vercel deploy` 无需预先 build（Vercel 会自动执行）。

## 直接覆盖部署

将本包解压到原有 GitHub 仓库根目录，直接覆盖所有文件，push 后 Vercel 自动重新部署。

覆盖说明：
- `src/App.jsx` — 主程序（全新）
- `api/quote.js` — 行情代理（新增）
- `vercel.json` — 路由配置（更新）
- `src/index.css` / `src/main.jsx` — 不变
- `package.json` / `vite.config.js` 等 — 不变

旧版的 `src/i18n.js` 已不再需要（内容已内联到 App.jsx），保留无影响。


## v7.1 修复说明

本包修复 v7 上传后仍显示 v6 的关键问题：

1. `index.html` 标题仍是 `Sea Trading OS v6` → 已改为 `Sea Trading OS v7`。
2. 旧包里 `package.json` 曾残留 v6 版本号；本包已升级为 `7.2.0`，避免 Vercel 构建日志和缓存识别混乱。
3. 增加 `meta name="sea-build"` 与页面底部 `v7.1 build fixed` 标识，方便确认线上是否已真正更新。
4. `vercel.json` 增加 `index.html` / `/` 的 no-store 缓存头，降低旧页面缓存导致继续显示 v6 的概率。
5. 修复 `/api/quote` 的 Yahoo Finance 解析路径：原代码读取 `d.result`，实际应读取 `d.chart.result[0]`。

部署后如仍看到旧版，请在浏览器按 `Ctrl/Cmd + Shift + R` 强制刷新，或在 Vercel 删除旧 Deployment 后重新部署本包。


## v7.2 Vercel install hardening

- Removed package-lock.json generated in sandbox to avoid non-public registry URLs in Vercel.
- Pinned Vercel runtime to Node 20.x via package.json engines and .nvmrc.
- Added explicit Vercel install/build/output settings.
- Hardened .npmrc for public registry, no audit/fund/progress, and longer fetch retries.

Expected Vercel flow: npm install -> npm run build -> dist output.


## v7.3 Compact Layout
- Removed Quick Ref · $1,000 Account block.
- Compressed Gold XAU layout into a compact two-column execution board.
- Reduced checklist/rule spacing for one-screen visibility.
