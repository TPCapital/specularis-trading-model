<div align="center">

# ⚡ Sea Trading OS

**个人交易操作系统 · Personal Trading Operating System**

*系统高于感觉，纪律高于判断*  
*System over instinct. Discipline over judgment.*

[![Version](https://img.shields.io/badge/version-v7.6.3-10d9b8?style=flat-square)](.)
[![Stack](https://img.shields.io/badge/stack-React_18_+_Vite_4-60a5fa?style=flat-square)](.)
[![Deploy](https://img.shields.io/badge/deploy-Vercel-ffffff?style=flat-square&logo=vercel)](.)
[![Lang](https://img.shields.io/badge/bilingual-中文_/_EN-a78bfa?style=flat-square)](.)

</div>

---

## 这是什么

Sea Trading OS 是一个**自用的交易执行终端**，不是行情看盘工具，不是策略回测平台。它解决一个非常具体的问题：

> 每天开盘前，面对屏幕，如何**系统性地**决定今天能不能交易、什么时候能进场、出了问题如何强制止损退出。

它把交易系统的每一条规则**物化成界面**——清单、警报、实时数据——让人在情绪压力下仍然只能按规矩行事。

---

## 为什么要构建这个

交易中真正杀死账户的不是分析错误，而是：

- 开盘乱流里手痒进场
- 止损位到了"再等一下"
- 盈利了两周，加仓，一次亏回去
- FOMC 前后的行情不知道要不要参与

这套系统是**行为约束工具**，在最容易犯错的节点上设置强制检查点。

---

## 实时数据层

顶部常驻的行情栏 + 宏观数据栏，全天刷新。

### 价格行情（6 列）

| 代码 | 说明 |
|------|------|
| **QQQ** | 纳斯达克 100 ETF，主交易标的 |
| **VIX** | 恐慌指数（波动率指数）|
| **SPY** | 标普 500 ETF，大盘参照 |
| **GLD** | 黄金 ETF |
| **EUR/USD** | 欧元/美元汇率 |
| **DXY (UUP)** | 美元指数 |

### 宏观数据栏（Macro Bar）

实时拉取美国国债收益率，叠加当日风险日历：

**收益率（Yield）**
- **5Y** — 5 年期国债收益率（联储政策敏感端）
- **10Y** — 10 年期国债收益率（市场基准利率）
- **30Y** — 30 年期国债收益率（长期通胀预期）
- **10Y-5Y 利差** — 曲线形态（正常 / 倒挂预警）

**风险日历（当日自动识别）**

| 类别 | 事件 | 中文名称 | 风险级别 |
|------|------|----------|----------|
| 宏观数据 | FOMC | 联储利率决议 | 🔴 极高 |
| 宏观数据 | CPI | 消费者价格指数 | 🟠 高 |
| 宏观数据 | NFP | 非农就业人数 | 🟠 高 |
| 宏观数据 | PPI | 生产者价格指数 | 🟡 中 |
| 宏观数据 | GDP | 国内生产总值 | 🟡 中 |
| 宏观数据 | PCE | 个人消费支出通胀 | 🟡 中 |
| 期权交割 | Quad Witching | 四巫日（季度交割日）| 🟠 高 |
| 期权交割 | Monthly OPEX | 月度期权交割日 | 🟡 中 |
| 国债竞标 | 10Y Auction | 10 年期国债竞标 | 🟡 中 |
| 国债竞标 | 30Y Auction | 30 年期国债竞标 | 🟡 中 |

> **关于交割日**：每月第三个周五，所有期权合约到期。成交量比平日高 50–100%，做市商大量对冲使盘中出现"Pin 效应"（价格被高 OI 行权价磁吸），OPEX 周一波动尤其放大。四巫日（每季度一次）额外叠加股指期货到期，是全年波动最极端的几天之一。
>
> **关于国债竞标**：10Y 和 30Y 竞标结果在下午 1 点（ET）公布。若竞标"尾翘"（需求弱），收益率会在几分钟内跳涨，直接压制 QQQ 等成长股。

---

## 四个交易模块

### Tab 1 · QQQ 期权（主力模块）

针对 QQQ 0DTE / 短期期权的完整日内执行框架。

**每日 GEX 手动录入**

开盘前从 SpotGamma 读取当日数据，录入以下四个 GEX 关键位：

| 字段 | 说明 |
|------|------|
| **Gamma Flip** | 正负 GEX 的切换临界价位 |
| **Call Wall** | 上方最大 Gamma 聚集，阻力区 |
| **Put Wall** | 下方最大 Gamma 聚集，支撑区 |
| **Vol Trigger** | 波动率启动临界价位 |

GEX 录入是每天的第一个必填仪式——强制在开盘前读懂市场结构。

**四项入场条件（缺一不可）**

```
① VWAP 方向     价格明确站上 / 下 VWAP，不在附近反复横跳
② EMA 趋势      9EMA 在 21EMA 上 / 下方，且两线发散（不粘合）
③ 成交量        当前 K 线量 > 前 5 根均量 × 1.5 倍
④ 时间窗口      09:45–11:30 ET（开盘 15 分钟后至 11:30）
```

**铁律（不可覆盖）**

- 只做 QQQ，不碰个股
- 固定 1 张合约，永不加张（重建阶段）
- 止损 = 入场权利金的 50%，无条件市价出场
- 当日亏损累计 ≥ 2× 单笔止损则停止当日交易
- 连续亏损 2 笔 → 停止 30 分钟强制复盘
- 11:30 ET 后不开新仓
- 补偿心理出现 → 立刻停止

**开盘前清单**（6 项）+ **入场条件清单**（14 项）逐项勾选，全部打勾才能入场。

---

### Tab 2 · 正股配置（Equities）

针对持股周级别以上的选股 + 仓位管理框架。

- 基本面筛选（营收增长、行业景气）→ 技术位置确认
- 周线趋势方向 + 日线结构 + 60 分钟入场确认
- 止损放主结构下方，不因短期噪音出场
- VIX 急速上行时降低仓位或观望

---

### Tab 3 · 黄金 XAU

基于 ICT（Inner Circle Trader）概念的黄金多空框架。

**宏观前置过滤**

| 条件 | 做多黄金前必须确认 |
|------|-------------------|
| DXY（美元指数）| 未同时走强 |
| 10Y 实际利率 | 未同时上行 |

以上两项同时走强 → 黄金做多系统失效，跳过当日。

**执行逻辑（四步）**

```
Step 1  日线确认宏观方向
Step 2  在 Kill Zone 内等待方向确立
         伦敦 Kill Zone  15:00–17:00（北京时间）
         纽约 Kill Zone  21:30–23:30（北京时间）
Step 3  4H/1H 找流动性：BSL/SSL 已扫出，FVG/OB/POC 有重叠
Step 4  15M/5M 确认信号：CHoCH/BOS + 长影线拒绝 + 量能启动
```

> **术语说明**  
> BSL / SSL — 买方 / 卖方流动性（Buy/Sell Side Liquidity）  
> FVG — 公允价值缺口（Fair Value Gap）  
> OB — 订单块（Order Block）  
> POC — 成交量峰值价（Point of Control）  
> CHoCH — 结构转换（Change of Character）  
> BOS — 结构突破（Break of Structure）

---

### Tab 4 · EUR/USD（欧元/美元）

基于趋势跟踪的外汇执行框架。

**趋势过滤（入场前置条件）**

- EMA 9 / 21 / 55 三线顺排
- ADX > 25（趋势强度确认）
- ADX < 20 + 均线缠绕 → **系统无效，不做**

**执行逻辑**

```
Kill Zone 确定方向 → 等回踩 EMA21 或关键结构位
→ 拒绝 K 线确认 → RR ≥ 1:2 进场 → 到 1:1.5 先锁一半仓
```

禁区：重大数据发布前后 15 分钟不入场。

---

## 行为保护机制

这是整个系统最核心的设计思路：**让纪律变得比违反它更省力**。

| 机制 | 实现方式 |
|------|----------|
| 开盘前强制检查 | 6 项清单全部勾选才能"开始交易" |
| 入场前强制确认 | 14 项清单全部打勾才显示"可以入场" |
| GEX 录入仪式 | 每天第一件事，不录入则系统持续提醒 |
| 风险日历 | 自动标记 FOMC / 交割日 / 国债竞标日，显示在最顶部 |
| 铁律常驻展示 | 交易规则不藏在设置里，直接显示在操作面板旁边 |
| 中英双语 | 一键切换，确保在任何状态下都能读懂系统 |
| 深色 / 浅色主题 | 适配不同时间段的盘前准备环境 |

---

## 技术架构

```
sea-trading-os/
├── src/
│   ├── App.jsx          主应用（所有模块、组件、状态管理）
│   ├── i18n.js          双语翻译数据
│   ├── index.css        全局样式
│   └── main.jsx         React 18 入口
├── api/
│   ├── macro.js         Vercel Serverless — 收益率 + 风险日历
│   └── quote.js         Vercel Serverless — 单个标的报价
├── public/
│   ├── flag-gb.png      英文切换图标
│   └── flag-us.png      英文切换图标
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```

**前端**

- React 18 + Vite 4
- Tailwind CSS 3（样式辅助）
- 纯 CSS 变量实现深色 / 浅色主题切换
- localStorage 持久化 GEX 录入、清单状态、主题设置

**后端（Vercel Serverless）**

- `/api/quote` — 通过 Yahoo Finance Chart API 获取实时报价
- `/api/macro` — 收益率数据（Yahoo Finance）+ 静态风险日历

**风险日历数据说明**

- **FOMC / CPI / NFP / PPI / GDP / PCE**：由各政府部门和美联储官方公布，每年或每季度发布下一年日期。系统按年更新。
- **月度 OPEX / 四巫日**：算法动态计算（每月第三个周五，六月因 Juneteenth 节假日自动前移至周四）
- **国债竞标日**：根据美国财政部《Tentative Auction Schedule》整理，10Y 和 30Y 竞标日覆盖 2025–2026

---

## 本地运行

```bash
git clone <repo>
cd sea-trading-os
npm ci
npm run dev
```

访问 `http://localhost:5173`

---

## Vercel 部署

| 设置项 | 值 |
|--------|----|
| Framework Preset | Vite |
| Root Directory | （留空，repo 根目录）|
| Install Command | `npm ci --no-audit --no-fund --progress=false` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js Version | 20.x |

> **重要**：如果 `package-lock.json` 在特殊网络环境下生成，其中的 `resolved` URL 可能指向私有 registry，导致 Vercel 构建卡在 Building 阶段。运行以下命令重新生成：
> ```bash
> rm package-lock.json
> npm install
> git add package-lock.json && git commit -m "fix: regenerate lockfile with public registry"
> ```

---

## 版本历史

| 版本 | 主要更新 |
|------|----------|
| **v7.6.3** | 风险日历新增月度 OPEX、四巫日（Quad Witching）、10Y/30Y 国债竞标日；开盘前清单和入场清单同步更新 |
| **v7.6.3** | Vercel 部署修复（package-lock.json 清理）；宏观数据栏稳定版 |
| **v5.5** | 深色 / 浅色主题切换；完整中英双语支持 |
| **v5.x** | GEX 面板集成（Gamma Flip / Call Wall / Put Wall / Vol Trigger）；0DTE 教育内容 |

---

## 核心理念

> **弱水三千，只取一瓢。**  
> *The river is vast — fill only one ladle.*

不追求每个机会。只在四个条件全部满足、风险环境清晰的情况下进场。  
账户重建阶段的目标不是赚钱，是**积累稳定执行的记录**。

> **先活下来，再赚钱。**  
> *Survive first. Profit second.*

---

<div align="center">

*Sea Trading OS is a personal discipline tool, not financial advice.*  
*本系统为个人纪律执行工具，不构成任何投资建议。*

</div>
