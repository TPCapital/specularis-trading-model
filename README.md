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
