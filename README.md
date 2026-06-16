# Sea Trading OS v6 — 极简纪律执行终端

## 核心功能

- **实时行情** — QQQ / VIX / SPY / IV% / DXY / GLD 实时拉取 Yahoo Finance，每60秒自动刷新
- **GEX 每日设置** — 正/负GEX一键选择，Gamma Flip / Call Wall / Put Wall / Vol Trigger价位录入
- **开盘前清单** — 5项开盘前检查 + VIX环境实时标注
- **入场前清单** — 13项入场条件 + 进度条 + 全满提示
- **快速参考** — 固定止损$20 / 目标$40 / 日限$50 / 时间45min
- **时间窗口** — 三色显示禁做/主战时段
- **铁律面板** — 10条执行铁律，第8条危险标红
- **双语支持** — 中/英文一键切换

## 部署

```bash
npm install
npm run build
# vercel deploy --prod
```

## 数据说明

- 行情通过 Yahoo Finance 公开 API 拉取，无需 API Key
- DXY 近似值使用 UUP ETF（美元指数基金）替代
- IV% 为基于 VXX 的估算值，供参考
- 所有 GEX / 清单数据储存在本地浏览器 localStorage，不上传
