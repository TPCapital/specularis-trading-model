# Sea Trading OS v7.4 — Visual Upgrade

**Build:** v7.4 visual upgrade · 2026-06-17
**Previous:** v7.3 compact layout

## v7.4 改动摘要 / What Changed

### 视觉层级全面升级
| 元素 | v7.3 | v7.4 |
|------|------|------|
| Ticker 价格字体 | 17px | **22px 加粗** |
| GEX 关键价位 | 14px | **20px 加粗** |
| Checklist 条目 | 10px | **11px 行高1.5** |
| 进度条厚度 | 1px | **4px** |
| 进度数字 | 10px文字 | **18px 大数字** |
| KZ 时间字体 | 10px | **16px 加粗** |
| 铁律文字 | 9px | **11px** |
| Step Rail 标题 | 10px | **12px 加粗** |

### 新增功能
- **VixBadge** — 顶栏实时显示 LOW VOL / NORMAL / ELEVATED / EXTREME
- **GEX 颜色区分** — Flip(teal) / Call Wall(red) / Put Wall(green) / Vol Trigger(amber)
- **GEX 模式 Badge** — 正/负GEX 展示更醒目

## 架构
React 18 + Vite + Tailwind CSS · Vercel Serverless

## 部署
```bash
npm install
npm run dev     # 本地
vercel          # 生产
```
