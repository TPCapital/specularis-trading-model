// Sea Trading OS — Bilingual Translation Data
// Usage: import { I } from './i18n.js'
// Access: I.seaIronRules[lang]  or  r[lang] for inline items

export const I = {
  seaIronRules: [
    { n:1, zh:"只做QQQ，暂不碰个股", en:"Trade QQQ only — no individual stocks", critical:false },
    { n:2, zh:"固定一张，永不加张（账户重建阶段）", en:"Fixed 1 contract, never scale up (rebuilding phase)", critical:false },
    { n:3, zh:"前15分钟只看不动", en:"First 15 min: observe only, no entries", critical:false },
    { n:4, zh:"四项入场条件缺一不可（VWAP+EMA+量能+时间）", en:"All 4 entry conditions required — no exceptions", critical:false },
    { n:5, zh:"亏20刀无条件出场", en:"−$20 stop loss: unconditional exit", critical:false },
    { n:6, zh:"日亏50刀停止交易", en:"Daily −$50 limit: stop trading", critical:false },
    { n:7, zh:"11:30后不开新仓", en:"No new positions after 11:30 ET", critical:false },
    { n:8, zh:"补偿心理出现时，立刻停止交易", en:"Revenge psychology appears → stop immediately", critical:true },
    { n:9, zh:"盈利积累后，不放大规模，先积累执行记录", en:"After profits, build execution record before scaling", critical:false },
    { n:10, zh:"系统高于感觉，纪律高于判断", en:"System over instinct, discipline over judgment", critical:false },
  ],

  coreBeliefs: [
    { zh:"弱水三千，只取一瓢。", en:"The river is vast — fill only one ladle." },
    { zh:"只做A+机会。", en:"Only take A+ setups." },
    { zh:"先活下来，再赚钱。", en:"Survive first, profit second." },
  ],

  fourEntryConditions: [
    { n:"01", zh_t:"VWAP方向", en_t:"VWAP Direction", zh_d:"价格明确站上/下VWAP，不在附近反复横跳", en_d:"Price clearly above/below VWAP — not choppy near it" },
    { n:"02", zh_t:"EMA趋势", en_t:"EMA Trend", zh_d:"9EMA在21EMA上/下方，且两线发散（不粘合）", en_d:"9EMA above/below 21EMA and diverging — not tangled" },
    { n:"03", zh_t:"成交量", en_t:"Volume", zh_d:"当前量 > 前5根K线平均量 × 1.5倍", en_d:"Current bar volume > prior 5-bar average × 1.5×" },
    { n:"04", zh_t:"时间窗口", en_t:"Time Window", zh_d:"09:45–11:30 ET（开盘15分钟后至11:30）", en_d:"09:45–11:30 ET (15 min post-open to 11:30)" },
  ],

  preMarketItems: [
    { zh:"今天有无美联储讲话或重大经济数据发布？", en:"Any Fed speakers or major data releases today?", zh_w:"有→降低预期或跳过当天", en_w:"Yes → lower expectations or skip the day" },
    { zh:"VIX是否高于25？", en:"Is VIX above 25?", zh_w:"是→期权成本贵，缩仓或跳过", en_w:"Yes → options expensive; reduce size or skip" },
    { zh:"QQQ的IV Rank是否高于50%？", en:"Is QQQ IV Rank above 50%?", zh_w:"是→需更大方向移动才盈利，提高目标或缩仓", en_w:"Yes → needs bigger move to profit; raise target or cut size" },
    { zh:"昨日QQQ收盘方向 + 今日开盘缺口情况？", en:"Yesterday's QQQ close direction + today's opening gap?", zh_w:"与趋势同向优先；反向缺口谨慎执行", en_w:"Same direction preferred; fading gap = caution" },
    { zh:"SpotGamma GEX已读取并填入系统？", en:"SpotGamma GEX read and entered in system?", zh_w:"正GEX→偏震荡等回踩；负GEX→偏趋势顺势；已记录Flip/Wall价位", en_w:"Positive GEX → range mode; Negative GEX → trend mode; Flip/Wall levels logged" },
  ],

  checklist: [
    { zh:"GEX环境已填入系统：正/负GEX已确认，Gamma Flip和Call/Put Wall价位已记录。", en:"GEX entered: Positive/Negative confirmed, Gamma Flip and Call/Put Wall levels logged." },
    { zh:"仓位已过计算器：张数符合单笔权利金上限，QQQ固定1张。", en:"Position sized: within per-trade premium limit, QQQ fixed 1 contract." },
    { zh:"标的已确认为QQQ，当日不混用系统。", en:"Instrument confirmed as QQQ — no cross-system mixing today." },
    { zh:"时间已确认在09:45–11:30 ET窗口内，不在禁区。", en:"Time confirmed within 09:45–11:30 ET window — not in a banned zone." },
    { zh:"方向完整：QQQ VWAP方向明确（不横跳附近）。", en:"Direction clear: QQQ VWAP is decisively above or below (not choppy)." },
    { zh:"EMA已确认：9EMA在21EMA上/下方且发散（不粘合）。", en:"EMA confirmed: 9EMA above/below 21EMA and diverging (not tangled)." },
    { zh:"量能已确认：当前量 > 前5根K线平均量 × 1.5倍。", en:"Volume confirmed: current bar > prior 5-bar average × 1.5×." },
    { zh:"四项入场条件全部满足（VWAP+EMA+量能+时间）。", en:"All 4 entry conditions satisfied (VWAP + EMA + Volume + Time)." },
    { zh:"失效位已写清：止损具体价格，QQQ期权止损-$20。", en:"Invalidation written: specific stop price for this option (−$20)." },
    { zh:"今日无重大数据（FOMC/CPI）发布前后15分钟。", en:"No major data release (FOMC/CPI) within 15 min of now." },
    { zh:"VIX未超过25，IV Rank未超过50%。", en:"VIX below 25 and IV Rank below 50%." },
    { zh:"未触发熔断：当日未亏$50 / 未连亏2笔。", en:"No circuit breakers triggered: daily loss < $50, consecutive losses < 2." },
    { zh:"情绪正常：不是回本、证明自己、补偿心理驱动。", en:"Emotional state normal: not chasing, not proving, no revenge psychology." },
  ],

  zeroDTEMistakes: [
    { n:1, zh_t:"开盘就冲", en_t:"Rushing In at the Open", zh_d:"开盘30分钟Gamma重新定价，结构最乱。先等VWAP方向明确+第一轮高低点形成", en_d:"First 30 min: Gamma repricing, maximum noise. Wait for VWAP direction + first high/low to form" },
    { n:2, zh_t:"当股票扛着拿", en_t:"Holding Like a Stock", zh_d:"Theta每分钟都在杀你。即使标的横盘，Call和Put都在跌，没有等回来的时间", en_d:"Theta erodes every minute. Even sideways, Calls and Puts both decay. There is no 'waiting for it back'" },
    { n:3, zh_t:"追大阳线Call", en_t:"Chasing Big Green Candles", zh_d:"往往已是第三根阳线+RSI超买+离VWAP过远。追进去遇回踩，Call直接腰斩", en_d:"Usually 3rd candle + RSI overbought + far from VWAP. Enter and any pullback halves the Call" },
    { n:4, zh_t:"追大阴线Put", en_t:"Chasing Big Red Candles", zh_d:"支撑/VWAP/日内低点附近最容易出现空头回补。追进去Put归零", en_d:"Support/VWAP/daily lows are prime short-squeeze zones. Chase Put → Put goes to zero" },
    { n:5, zh_t:"不看VWAP", en_t:"Ignoring VWAP", zh_d:"VWAP是机构成本线和多空分界线。逆VWAP做单成功率大幅下降，最常见新手病", en_d:"VWAP is the institutional cost basis and intraday bull/bear line. Trading against it drops win rate sharply" },
    { n:6, zh_t:"不设止损等归零", en_t:"No Stop Loss → Bleed to Zero", zh_d:"方向错时期权崩溃速度远超股票：-20%→-40%→-95%，全在同一天内", en_d:"Wrong direction: options collapse far faster than stocks — −20%→−40%→−95% in a single session" },
    { n:7, zh_t:"满仓梭哈一把", en_t:"All-In on One Trade", zh_d:"即使70%胜率也会出现3-4连亏。满仓遇假突破一次就爆仓，活下来是第一位的", en_d:"Even 70% win rate produces 3–4 consecutive losses. One all-in on a false break = account blown" },
    { n:8, zh_t:"亏后立刻报复单", en_t:"Revenge Trading After a Loss", zh_d:"亏→情绪上头→加倍→再亏→梭哈→归零。市场收割的永远是情绪失控的人", en_d:"Loss → emotional → double up → loss again → all-in → zero. Markets always harvest emotional traders first" },
    { n:9, zh_t:"一天交易十几次", en_t:"Over-Trading", zh_d:"高质量结构一天只出现2-4次。频繁出手=频繁在噪音区犯错", en_d:"High-quality setups appear only 2–4 times per day. More trades = more errors in the noise" },
    { n:10, zh_t:"预测方向而非阅读结构", en_t:"Predicting vs Reading Structure", zh_d:"坚持'今天必涨'→市场变了自己没变→在错误节奏里坚持正确方向→照样亏钱", en_d:"Believing 'it must go up' → market changed, you didn't → right direction, wrong regime → still lose" },
  ],

  questions: [
    { cat:{zh:"GEX",en:"GEX"}, q:{zh:"今日处于正GEX环境，价格在VWAP附近反复横跳，正确做法是？",en:"Today is Positive GEX. Price is choppy near VWAP repeatedly. Correct action?"}, opts:{zh:["少追突破，等VWAP回踩EMA确认","立刻追方向入场","加大仓位捉趋势","开盘第一根就入场"],en:["Fewer breakout chases — wait for VWAP pullback + EMA confirmation","Enter direction immediately","Size up to catch the trend","Enter on the first candle at open"]}, a:0, exp:{zh:"正GEX=压制波动。假突破多，追单易被反杀。应等VWAP回踩+EMA支撑确认，偏区间均值回归思维。",en:"Positive GEX = suppresses volatility. Fakeouts are frequent; chasing gets faded. Wait for VWAP pullback + EMA support — range/mean-reversion mindset."} },
    { cat:{zh:"GEX",en:"GEX"}, q:{zh:"价格刚跌破Gamma Flip，此时应该？",en:"Price just broke below the Gamma Flip. What should you do?"}, opts:{zh:["抄底买Call","偏Put顺势，波动放大特性已激活","立刻做区间单","忽略GEX只看K线"],en:["Buy the dip with Calls","Bias Put — volatility-amplifying regime now active","Trade the range","Ignore GEX, just read candles"]}, a:1, exp:{zh:"跌破Gamma Flip=负GEX激活=做市商追卖=波动放大。Put节奏更顺，不是逆势抄底时机。",en:"Breaking Gamma Flip = Negative GEX activated = dealers selling = volatility amplification. Put bias is correct; this is not a dip-buy zone."} },
    { cat:{zh:"GEX",en:"GEX"}, q:{zh:"价格靠近Call Wall，你在考虑追Call，应该？",en:"Price is approaching the Call Wall. You're considering buying Calls. What should you do?"}, opts:{zh:["立刻买Call追涨","观察冲高失败/量能衰竭信号，不追Call","满仓Call","跌破Call Wall再买"],en:["Buy Calls immediately","Watch for failed breakout / volume exhaustion — do NOT chase Calls","All-in Calls","Buy Calls after the break"]}, a:1, exp:{zh:"Call Wall是上方最大压力区，容易出现钉盘或受压。靠近不追Call，等突破确认或冲高衰竭信号。",en:"Call Wall is the largest overhead gamma concentration — market tends to stall or reject. Don't chase at the wall; wait for confirmed break or exhaustion."} },
    { cat:{zh:"QQQ入场",en:"QQQ Entry"}, q:{zh:"三项指标中量能未达标（<1.5倍），但VWAP和EMA都正确，应该？",en:"Volume is below 1.5× threshold, but VWAP and EMA are both aligned. Should you enter?"}, opts:{zh:["正常开仓，两项满足就够了","不开仓，三项缺一不可","缩小仓位入场","等量能来了再说"],en:["Yes — two conditions are enough","No — all three required, no exceptions","Enter with smaller size","Wait until volume arrives"]}, a:1, exp:{zh:"四项入场条件缺一不可。量能未达标=不开仓。这是铁律，没有例外。",en:"All 4 entry conditions are non-negotiable. Volume below threshold = no entry. This is an iron rule with zero exceptions."} },
    { cat:{zh:"止损",en:"Stop Loss"}, q:{zh:"期权开仓后亏了$18，接近$20止损线，但感觉'快到支撑了'，应该？",en:"Your option is down $18, near the $20 stop. You think 'support is close.' What should you do?"}, opts:{zh:["再等一下，快到支撑了","到$20立刻无条件市价出场","移动止损到$25","换合约继续持有"],en:["Wait a little — support is near","Hit $20 → unconditional market exit","Move stop to −$25","Switch contracts and keep holding"]}, a:1, exp:{zh:"亏$20无条件市价出场，没有'再等等'。止损规则不给情绪留空间。",en:"The −$20 stop is unconditional. No 'a little longer.' Stop rules leave no room for emotion."} },
    { cat:{zh:"心理",en:"Psychology"}, q:{zh:"昨天错过了一个大波段，今天开盘特别想赶回来，这是什么信号？",en:"You missed a big move yesterday. At today's open you urgently want to 'make it back.' What is this?"}, opts:{zh:["信心满满，积极状态","补偿心理出现，立刻停止交易","正常的交易欲望","市场机会好，加仓信号"],en:["Confidence — you're in a good state","Revenge psychology — stop trading immediately","Normal trading motivation","Good opportunity — add size"]}, a:1, exp:{zh:"这正是两次破坏性亏损的共同根源。补偿心理是开关，出现时立刻停止，不是减仓，是停止。",en:"This is the exact root of both catastrophic losses. Revenge psychology is the switch. When it appears: stop — not reduce size, stop."} },
    { cat:{zh:"时间规则",en:"Time Rule"}, q:{zh:"现在是11:45 ET，QQQ刚出现完美四项同时满足信号，应该？",en:"It's 11:45 ET. QQQ just triggered all 4 entry conditions perfectly. What do you do?"}, opts:{zh:["信号这么好，做一笔","不开仓，11:30后铁律禁止","观察记录但不交易","做短线15分钟就出来"],en:["Too good to pass — take it","No entry — 11:30 ET cutoff is an iron rule","Observe and log but do not trade","Take it and exit within 15 min"]}, a:1, exp:{zh:"11:30后不开新仓是铁律。再好的信号也不做。系统高于感觉。",en:"No new positions after 11:30 ET is an iron rule. No signal quality exceptions. System over instinct."} },
    { cat:{zh:"量能",en:"Volume"}, q:{zh:"有效放量的标准是什么？",en:"What is the valid volume threshold?"}, opts:{zh:["当前量比前一根K线大就行","当前量>前5根K线平均量×1.5倍","量比昨日平均量大","随便量大就行"],en:["Current bar just needs to beat the previous bar","Current bar volume > prior 5-bar average × 1.5×","Volume above yesterday's daily average","Feel it out — if it looks big, it's fine"]}, a:1, exp:{zh:"标准是前5根K线平均量的1.5倍以上。精确标准，不是感觉。",en:"The standard is ×1.5 of the prior 5-bar average. A precise standard, not a feeling."} },
    { cat:{zh:"风控",en:"Risk Mgmt"}, q:{zh:"当日已亏$47，又出现信号，距$50日亏熔断还有$3，应该？",en:"You've lost $47 today. Another setup appears. $3 left before the $50 daily circuit breaker."}, opts:{zh:["做这笔，还没到$50","停止交易，已接近熔断线","做小仓位试试","信号好可以做"],en:["Take it — haven't hit $50 yet","Stop — you're already at the circuit breaker threshold","Try with very small size","Good setup = fine to take"]}, a:1, exp:{zh:"接近熔断线就应停止，不是到了才停。且该信号的止损是$20，超过剩余空间，本就不该做。",en:"Stop well before the threshold, not only when reached. Also, the $20 stop exceeds remaining room — this trade should not be taken regardless."} },
    { cat:{zh:"QQQ选择",en:"Instrument"}, q:{zh:"为什么当前主力标的选QQQ而不是NVDA？",en:"Why is QQQ the primary instrument over NVDA?"}, opts:{zh:["QQQ波动更大","QQQ趋势更干净+流动性好+价差小+个股消息影响小","NVDA太贵","随机选的"],en:["QQQ has bigger moves","QQQ has cleaner trends + tighter spreads + less headline risk","NVDA is too expensive","It was chosen randomly"]}, a:1, exp:{zh:"复盘10个交易日确认：QQQ趋势和波段结构明显优于NVDA，且市价价差损耗问题已解决。",en:"10-day backtesting confirmed: QQQ trend and swing structure is meaningfully better than NVDA, and the market-order spread problem is solved."} },
    { cat:{zh:"VIX",en:"VIX"}, q:{zh:"VIX突然从18暴涨到32，当天应该？",en:"VIX suddenly spikes from 18 to 32. What should you do today?"}, opts:{zh:["VIX高期权便宜，加仓","跳过当天不参与","做Put顺势","减半仓位参与"],en:["High VIX = cheap options — add size","Skip the day entirely","Trade Puts to ride it","Halve size and participate"]}, a:1, exp:{zh:"VIX突然暴涨=方向极难判断，建议跳过当天。不是缩仓，是不参与。",en:"Sudden VIX spike = direction extremely unpredictable. Skip the day. Not reduce size — skip entirely."} },
    { cat:{zh:"仓位",en:"Position"}, q:{zh:"账户重建阶段赚了一些，信号极好，可以加到2张吗？",en:"Rebuilding phase. You've made some profit. Perfect signal. Can you go to 2 contracts?"}, opts:{zh:["信号好可以加","不可以，连续20笔稳定执行才讨论加张","赚钱了当然可以加","看VIX决定"],en:["Great signal — yes","No — 20 consecutive clean executions required first","Profits allow scaling","Decide based on VIX"]}, a:1, exp:{zh:"账户重建阶段：固定一张，永不加张。连续稳定执行20笔后再讨论。盈利不是加仓的理由。",en:"Rebuilding phase: 1 contract, never scale up. 20 consecutive stable executions before any discussion. Profits are not permission to scale."} },
    { cat:{zh:"黄金",en:"Gold"}, q:{zh:"黄金的'大盘'是什么？",en:"What is gold's 'macro context'?"}, opts:{zh:["QQQ和科技ETF","美元指数DXY+10年期实际收益率","A股指数","VIX走势"],en:["QQQ and tech ETFs","DXY (dollar index) + 10Y real interest rate","Chinese equity index","VIX direction"]}, a:1, exp:{zh:"黄金无板块。第一驱动是实际利率，第二是DXY。与股票板块完全无关。",en:"Gold has no sector ETF. Primary driver = real interest rates. Secondary = DXY. Completely unrelated to equity sectors."} },
    { cat:{zh:"黄金",en:"Gold"}, q:{zh:"DXY走强+10年实际利率同时上行，做多黄金应该？",en:"DXY strengthening AND 10Y real rates rising simultaneously. Should you go long gold?"}, opts:{zh:["正常做多","降级处理或放弃，宏观双向反转","加大仓位对抗","换EUR做多"],en:["Yes — gold is a safe-haven","Lower conviction or pass — dual macro headwinds","Add size to fight the macro","Go long EUR instead"]}, a:1, exp:{zh:"实际利率和DXY双向反转是黄金做多最差的宏观环境，放弃或极小仓。",en:"Rising real rates + rising DXY simultaneously is the worst macro environment for long gold. Pass or extremely small size."} },
    { cat:{zh:"EUR",en:"EUR"}, q:{zh:"EUR均线缠绕、ADX低于20，还能做趋势回踩吗？",en:"EUR moving averages are tangled. ADX below 20. Can you trade the trend pullback?"}, opts:{zh:["能做","不能，趋势强度不足","只看MACD","追突破"],en:["Yes","No — no trend environment; system has no edge here","Use MACD instead","Chase the breakout"]}, a:1, exp:{zh:"趋势系统必须先有趋势环境。ADX低=无趋势=系统无效。",en:"Trend-following systems require a trending environment. ADX below 20 = no trend = system invalid."} },
    { cat:{zh:"风控计算",en:"Position Calc"}, q:{zh:"账户$1000，单笔风险2%，期权价$1.00，最多几张？",en:"Account $1,000. Per-trade risk 2%. Option price $1.00. Maximum contracts?"}, opts:{zh:["1张","2张","5张","随意"],en:["1 contract","2 contracts","5 contracts","Feel it out"]}, a:0, exp:{zh:"1000×2%=$20；$1.00×100=$100；20÷100<1，最多1张。$1000账户期权超过$1就要谨慎选合约。",en:"$1,000×2%=$20 budget; $1.00×100=$100 per contract; $20÷$100<1 → 1 contract max. For a $1,000 account, options above $0.20 begin to strain the 2% rule."} },
    { cat:{zh:"0DTE误区",en:"0DTE Mistake"}, q:{zh:"看到大阳线急拉升，FOMO上头，此刻应该？",en:"You see a big green candle ripping higher. FOMO is kicking in. What should you do?"}, opts:{zh:["立刻冲进去追Call","等待VWAP回踩或EMA支撑确认再参与","满仓Call","追进去再设止损"],en:["Rush in and buy Calls","Wait for VWAP pullback or EMA support confirmation","All-in Calls","Enter then set a stop afterward"]}, a:1, exp:{zh:"大阳线追Call是最常见死法。往往已是第三根+RSI超买+离VWAP过远，追进去遇回踩Call腰斩。",en:"Chasing big candles is the most common account-killer. Usually 3rd candle + RSI overbought + far from VWAP. Any pullback halves the Call."} },
    { cat:{zh:"纪律",en:"Discipline"}, q:{zh:"今日已连续亏损2笔，第三个信号出现且完美，应该？",en:"You've had 2 consecutive losses today. A third, perfect-looking setup appears. What do you do?"}, opts:{zh:["信号好立即出手","触发连亏熔断，停止30分钟后再评估","换标的继续","加仓弥补亏损"],en:["Great signal — take it","2-loss circuit breaker triggered — stop, 30-min review, then reassess","Switch instruments and continue","Add size to recover losses"]}, a:1, exp:{zh:"连续亏损2笔触发熔断，停止30分钟冷静再评估。不因信号质量破例。系统高于感觉。",en:"2 consecutive losses triggers the circuit breaker. Stop for 30 min, review calmly, then reassess. No signal quality exceptions. System over instinct."} },
  ],
};
