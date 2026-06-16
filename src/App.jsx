import React, { useState, useEffect, useCallback, useRef } from "react";

/* ── helpers ── */
function ls(k,d){try{var v=localStorage.getItem(k);return v!==null?v:d}catch(e){return d}}
function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}

const TODAY = new Date().toDateString();

/* ── translations ── */
const PRE_ZH=[
  {t:"今日有无美联储讲话或重大经济数据发布？",w:"有 → 降低预期或跳过当天"},
  {t:"VIX是否高于25？",w:"是 → 期权成本贵，缩仓或跳过"},
  {t:"QQQ的IV Rank是否高于50%？",w:"是 → 需更大方向移动才盈利"},
  {t:"昨日QQQ收盘方向 + 今日开盘缺口情况？",w:"反向缺口谨慎执行"},
  {t:"SpotGamma GEX已读取并填入系统？",w:"正GEX偏震荡；负GEX偏趋势；Flip/Wall已记录"},
];
const PRE_EN=[
  {t:"Any Fed speakers or major data releases today?",w:"Yes → lower expectations or skip"},
  {t:"Is VIX above 25?",w:"Yes → options expensive; reduce or skip"},
  {t:"Is QQQ IV Rank above 50%?",w:"Yes → needs bigger move to profit"},
  {t:"Yesterday's QQQ close + today's opening gap?",w:"Gap against trend = caution"},
  {t:"SpotGamma GEX read and entered in system?",w:"Positive GEX = range; Negative GEX = trend"},
];
const DAY_ZH=[
  "GEX环境已填入系统：正/负GEX已确认，Flip和Call/Put Wall价位已记录。",
  "仓位已过计算器：QQQ固定1张，符合单笔权利金上限。",
  "标的已确认为QQQ，当日不混用系统。",
  "时间已确认在09:45–11:30 ET窗口内，不在禁区。",
  "方向完整：QQQ VWAP方向明确（不横跳附近）。",
  "EMA已确认：9EMA在21EMA上/下方且发散（不粘合）。",
  "量能已确认：当前量 > 前5根K线平均量 × 1.5倍。",
  "四项入场条件全部满足（VWAP + EMA + 量能 + 时间）。",
  "失效位已写清：止损具体价格，QQQ期权止损 −$20。",
  "今日无重大数据（FOMC/CPI）发布前后15分钟。",
  "VIX未超过25，IV Rank未超过50%。",
  "未触发熔断：当日未亏$50 / 未连亏2笔。",
  "情绪正常：不是回本、证明自己、补偿心理驱动。",
];
const DAY_EN=[
  "GEX entered: Positive/Negative confirmed, Flip and Call/Put Wall logged.",
  "Position sized: 1 contract, within per-trade premium limit.",
  "Instrument confirmed as QQQ — no cross-system mixing.",
  "Time confirmed within 09:45–11:30 ET window.",
  "Direction clear: QQQ VWAP decisively above or below.",
  "EMA confirmed: 9EMA above/below 21EMA and diverging.",
  "Volume confirmed: current bar > prior 5-bar average × 1.5×.",
  "All 4 entry conditions satisfied (VWAP + EMA + Volume + Time).",
  "Invalidation written: specific stop price, option stop = −$20.",
  "No major data release (FOMC/CPI) within 15 min.",
  "VIX below 25 and IV Rank below 50%.",
  "No circuit breakers: daily loss < $50, consecutive losses < 2.",
  "Emotional state normal: no chasing, no proving, no revenge.",
];
const RULES_ZH=[
  "只做QQQ，暂不碰个股",
  "固定一张，永不加张（重建阶段）",
  "前15分钟只看不动",
  "四项入场条件缺一不可",
  "亏$20无条件出场",
  "日亏$50停止交易",
  "11:30后不开新仓",
  "补偿心理出现 → 立刻停止",
  "盈利后积累执行记录，不放大",
  "系统高于感觉 · 纪律高于判断",
];
const RULES_EN=[
  "Trade QQQ only — no individual stocks",
  "Fixed 1 contract, never scale up (rebuilding)",
  "First 15 min: observe only, no entries",
  "All 4 entry conditions required",
  "−$20 stop loss: unconditional exit",
  "Daily −$50 limit: stop trading",
  "No new positions after 11:30 ET",
  "Revenge psychology → stop immediately",
  "After profits, build execution record before scaling",
  "System over instinct, discipline over judgment",
];

/* ── market data hook ── */
function useMarketData() {
  const [ticks, setTicks] = useState({});
  const [status, setStatus] = useState("connecting");

  const fetchQuote = useCallback(async (symbol) => {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
      const r = await fetch(url);
      if (!r.ok) return null;
      const d = await r.json();
      const meta = d?.result?.[0]?.meta;
      if (!meta) return null;
      const price = meta.regularMarketPrice ?? meta.chartPreviousClose;
      const prev = meta.chartPreviousClose ?? meta.previousClose ?? price;
      const chg = price - prev;
      const pct = prev ? (chg / prev) * 100 : 0;
      return { price, chg, pct };
    } catch { return null; }
  }, []);

  const refresh = useCallback(async () => {
    const pairs = [
      ["QQQ","QQQ"],["SPY","SPY"],["GLD","GLD"],
      ["^VIX","VIX"],["UUP","DXY"],["VXX","VXX"]
    ];
    const results = {};
    let anyOk = false;
    for (const [sym, key] of pairs) {
      const d = await fetchQuote(sym);
      if (d) { results[key] = d; anyOk = true; }
    }
    if (results.VXX) {
      results["IVR"] = { price: 15 + results.VXX.price * 0.9, chg: 0, pct: 0 };
    }
    setTicks(results);
    setStatus(anyOk ? "live" : "offline");
  }, [fetchQuote]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 60000);
    return () => clearInterval(id);
  }, [refresh]);

  return { ticks, status };
}

/* ── clock hook ── */
function useClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      try {
        const et = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
        const pad = n => String(n).padStart(2, "0");
        setTime(`${pad(et.getHours())}:${pad(et.getMinutes())}:${pad(et.getSeconds())} ET`);
      } catch {}
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/* ── GEX hook ── */
function useGEX() {
  const EMPTY = { date: TODAY, state: null, flip: "", call: "", put: "", vol: "" };
  const [gex, setGex] = useState(() => {
    try {
      const s = ls("sea-gex-v6", null);
      if (s) { const p = JSON.parse(s); if (p.date === TODAY) return p; }
    } catch {}
    return EMPTY;
  });
  const save = useCallback((data) => {
    lsSet("sea-gex-v6", JSON.stringify({ ...data, date: TODAY }));
    setGex({ ...data, date: TODAY });
  }, []);
  return { gex, save, isToday: gex.state !== null && gex.date === TODAY };
}

/* ── checklist hooks ── */
function useChecklist(storageKey, total, autoFirst) {
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(ls(storageKey, "{}")); } catch { return {}; }
  });
  const toggle = useCallback((i) => {
    setChecked(prev => {
      const next = { ...prev, [i]: !prev[i] };
      lsSet(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);
  const reset = useCallback(() => {
    const next = autoFirst ? { 0: true } : {};
    setChecked(next);
    lsSet(storageKey, JSON.stringify(next));
  }, [storageKey, autoFirst]);
  const count = Object.values(checked).filter(Boolean).length;
  return { checked, toggle, reset, count, pct: Math.round(count / total * 100) };
}

/* ── components ── */
function TickCell({ sym, label, data, fmt }) {
  const isLoading = !data;
  const price = data?.price;
  const formatted = price != null
    ? (fmt ? fmt(price) : price >= 10 ? price.toFixed(2) : price.toFixed(3))
    : "—";
  const chgStr = data ? `${data.chg >= 0 ? "+" : ""}${data.chg.toFixed(2)} (${data.pct >= 0 ? "+" : ""}${data.pct.toFixed(2)}%)` : "—";
  const color = !data ? "#4a5568" : data.chg > 0 ? "#34d399" : data.chg < 0 ? "#f87171" : "#718096";
  return (
    <div style={{ background: "#0a0f1a", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#718096", fontWeight: 700, textTransform: "uppercase" }}>{label || sym}</div>
      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace", color: isLoading ? "#2d3748" : "#f7fafc", animation: isLoading ? "pulse 1.5s infinite" : "none" }}>
        {isLoading ? "———" : formatted}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color }}>{isLoading ? "—" : chgStr}</div>
    </div>
  );
}

function VixBadge({ vix }) {
  if (!vix) return null;
  const zones = [
    { label: "VIX<15", active: vix < 15, color: "#34d399" },
    { label: "15–25", active: vix >= 15 && vix < 25, color: "#60a5fa" },
    { label: "25–35", active: vix >= 25 && vix < 35, color: "#fbbf24" },
    { label: ">35 SKIP", active: vix >= 35, color: "#f87171" },
  ];
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {zones.map(z => (
        <span key={z.label} style={{
          fontSize: 9, letterSpacing: "0.08em", padding: "2px 6px", borderRadius: 4, fontWeight: 700,
          background: z.active ? `${z.color}18` : "transparent",
          border: `1px solid ${z.active ? z.color + "66" : "rgba(255,255,255,0.08)"}`,
          color: z.active ? z.color : "rgba(255,255,255,0.2)",
          transition: "all .3s"
        }}>{z.label}</span>
      ))}
    </div>
  );
}

function CheckItem({ text, warn, checked, onClick, locked }) {
  return (
    <div onClick={locked ? undefined : onClick} style={{
      display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 14px",
      borderBottom: "1px solid rgba(255,255,255,0.06)", cursor: locked ? "default" : "pointer",
      background: checked ? "rgba(13,217,184,0.04)" : "transparent",
      transition: "background .1s"
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${checked ? "#0dd9b8" : "rgba(255,255,255,0.2)"}`,
        background: checked ? "#0dd9b8" : "transparent", flexShrink: 0, marginTop: 1,
        display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s"
      }}>
        {checked && <svg width="10" height="10" viewBox="0 0 12 10" fill="none" stroke="#0a0f1a" strokeWidth="2.5"><polyline points="1,5 4.5,9 11,1"/></svg>}
      </div>
      <div>
        <div style={{ fontSize: 12, lineHeight: 1.5, color: checked ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.88)", textDecoration: checked ? "line-through" : "none", textDecorationColor: "rgba(255,255,255,0.2)" }}>{text}</div>
        {warn && <div style={{ fontSize: 10, color: "#fbbf24", marginTop: 2 }}>{warn}</div>}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>{children}</div>;
}

function ProgBar({ pct, done }) {
  const color = done ? "#34d399" : pct > 70 ? "#fbbf24" : "#f87171";
  return <div style={{ height: 2, background: "rgba(255,255,255,0.06)" }}><div style={{ height: "100%", width: `${pct}%`, background: color, transition: "width .3s, background .3s" }}/></div>;
}

/* ── main app ── */
export default function App() {
  const [lang, setLang] = useState(() => ls("sea-lang-v6", "zh"));
  const { ticks, status } = useMarketData();
  const clock = useClock();
  const { gex, save: saveGex, isToday: gexIsToday } = useGEX();
  const [editingGex, setEditingGex] = useState(!gexIsToday);
  const [localGex, setLocalGex] = useState({ state: gex.state, flip: gex.flip, call: gex.call, put: gex.put, vol: gex.vol });

  const preChecklist = useChecklist("sea-pre-v6", 5, false);
  const dayChecklist = useChecklist("sea-day-v6", 13, false);

  const zh = lang === "zh";
  const t = (a, b) => zh ? a : b;

  const toggleLang = useCallback(() => {
    const next = lang === "zh" ? "en" : "zh";
    setLang(next);
    lsSet("sea-lang-v6", next);
  }, [lang]);

  const handleSaveGex = () => {
    if (!localGex.state) return;
    saveGex(localGex);
    setEditingGex(false);
    if (!dayChecklist.checked[0]) dayChecklist.toggle(0);
  };

  const vix = ticks.VIX?.price;

  const gexBadgeStyle = !gexIsToday
    ? { background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }
    : gex.state === "positive"
    ? { background: "rgba(96,165,250,0.15)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.3)" }
    : { background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" };

  const gexBadgeText = !gexIsToday
    ? t("GEX 未设置", "GEX not set")
    : gex.state === "positive"
    ? t("今日 正GEX", "Today +GEX")
    : t("今日 负GEX", "Today −GEX");

  const preItems = zh ? PRE_ZH : PRE_EN;
  const dayItems = zh ? DAY_ZH : DAY_EN;
  const rules = zh ? RULES_ZH : RULES_EN;

  const C = (style) => ({ ...style });

  const card = { background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" };
  const levelCell = { background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "8px 10px" };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1a", color: "#f7fafc", fontFamily: "'SF Mono', 'Fira Code', monospace", paddingBottom: 40 }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        *{box-sizing:border-box}
        input{font-family:inherit}
        button{font-family:inherit;cursor:pointer}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#0a0f1a}
        ::-webkit-scrollbar-thumb{background:#1a2234;border-radius:2px}
      `}</style>

      {/* HEADER */}
      <div style={{ background: "#0a0f1a", borderBottom: "1px solid #0dd9b8", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.15em", color: "#0dd9b8" }}>SEA TRADING OS</div>
          <div style={{ ...gexBadgeStyle, borderRadius: 5, padding: "2px 8px", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{gexBadgeText}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: status === "live" ? "#34d399" : "#fbbf24", animation: status === "live" ? "blink 1.5s infinite" : "none" }}/>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>{status}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", letterSpacing: "0.06em" }}>{clock}</div>
          <button onClick={toggleLang} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", borderRadius: 6, padding: "4px 10px", fontSize: 11, letterSpacing: "0.08em" }}>
            {zh ? "EN" : "中"}
          </button>
        </div>
      </div>

      {/* TICK BAR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 1, background: "rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <TickCell sym="QQQ" data={ticks.QQQ}/>
        <TickCell sym="VIX" data={ticks.VIX}/>
        <TickCell sym="SPY" data={ticks.SPY}/>
        <TickCell sym="IVR" label="QQQ IV%" data={ticks.IVR} fmt={p => p.toFixed(0) + "%"}/>
        <TickCell sym="DXY" label="DXY (UUP)" data={ticks.DXY}/>
        <TickCell sym="GLD" data={ticks.GLD}/>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* GEX SETUP */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <SectionLabel>{t("GEX 每日设置", "GEX Daily Setup")}</SectionLabel>
            {gexIsToday && !editingGex && (
              <button onClick={() => setEditingGex(true)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.4)", borderRadius: 5, padding: "3px 8px", fontSize: 9, letterSpacing: "0.1em" }}>
                {t("编辑", "Edit")}
              </button>
            )}
          </div>

          {editingGex ? (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 6 }}>
                {[
                  { state: "positive", label: t("正 GEX · 震荡", "Positive GEX · Range"), sub: t("偏区间 · 等回踩 · 少追突破", "Range bias · wait pullback · avoid chasing"), color: "#60a5fa" },
                  { state: "negative", label: t("负 GEX · 趋势", "Negative GEX · Trend"), sub: t("偏顺势 · 等破位 · VWAP第一参考", "Trend bias · wait break · VWAP = regime line"), color: "#fbbf24" },
                ].map(btn => (
                  <button key={btn.state} onClick={() => setLocalGex(g => ({ ...g, state: btn.state }))}
                    style={{ border: `1px solid ${localGex.state === btn.state ? btn.color + "88" : "rgba(255,255,255,0.12)"}`, borderRadius: 8, padding: "10px 12px", background: localGex.state === btn.state ? btn.color + "14" : "transparent", textAlign: "left" }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.12em", fontWeight: 700, textTransform: "uppercase", color: btn.color, marginBottom: 3 }}>{btn.label}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{btn.sub}</div>
                  </button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 6 }}>
                {[
                  { key: "flip", label: "Gamma Flip", hint: t("正负切换位", "Regime flip"), ph: "480.00" },
                  { key: "call", label: "Call Wall", hint: t("上方压力", "Overhead resistance"), ph: "490.00" },
                  { key: "put", label: "Put Wall", hint: t("下方支撑", "Downside support"), ph: "470.00" },
                  { key: "vol", label: "Vol Trigger", hint: t("波动启动", "Vol expansion"), ph: "475.00" },
                ].map(f => (
                  <div key={f.key} style={levelCell}>
                    <div style={{ fontSize: 9, letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{f.label}</div>
                    <input value={localGex[f.key]} onChange={e => setLocalGex(g => ({ ...g, [f.key]: e.target.value }))}
                      placeholder={f.ph} inputMode="decimal"
                      style={{ background: "transparent", border: "none", color: "#0dd9b8", fontSize: 15, fontWeight: 700, fontFamily: "monospace", width: "100%", outline: "none" }}/>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>{f.hint}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={handleSaveGex} style={{ background: "#0dd9b8", border: "none", color: "#0a0f1a", borderRadius: 5, padding: "5px 16px", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>
                  {t("保存设置", "Save Setup")}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {[
                { label: "Gamma Flip", val: gex.flip },
                { label: "Call Wall", val: gex.call },
                { label: "Put Wall", val: gex.put },
                { label: "Vol Trigger", val: gex.vol },
              ].map(f => (
                <div key={f.label} style={levelCell}>
                  <div style={{ fontSize: 9, letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "monospace", color: "#0dd9b8" }}>{f.val ? "$" + f.val : "—"}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PRE-MARKET CHECKLIST */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <SectionLabel>{t("开盘前清单", "Pre-Market Checklist")}</SectionLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <VixBadge vix={vix}/>
              <button onClick={preChecklist.reset} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.25)", borderRadius: 5, padding: "2px 8px", fontSize: 9, letterSpacing: "0.08em" }}>
                {t("重置", "Reset")}
              </button>
            </div>
          </div>
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t("开盘前检查", "Pre-Market Check")}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>{preChecklist.count}/5</div>
            </div>
            <ProgBar pct={preChecklist.pct} done={preChecklist.count === 5}/>
            {preItems.map((item, i) => (
              <CheckItem key={i} text={item.t} warn={item.w} checked={!!preChecklist.checked[i]} onClick={() => preChecklist.toggle(i)}/>
            ))}
          </div>
        </div>

        {/* ENTRY CHECKLIST */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <SectionLabel>{t("入场前清单 · 缺一不可", "Entry Checklist · All Required")}</SectionLabel>
            <button onClick={dayChecklist.reset} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.25)", borderRadius: 5, padding: "2px 8px", fontSize: 9, letterSpacing: "0.08em" }}>
              {t("重置", "Reset")}
            </button>
          </div>
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t("入场条件", "Entry Conditions")}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>{dayChecklist.count}/13</div>
            </div>
            <ProgBar pct={dayChecklist.pct} done={dayChecklist.count === 13}/>
            {dayItems.map((text, i) => (
              <CheckItem key={i} text={text} checked={!!dayChecklist.checked[i]} onClick={() => dayChecklist.toggle(i)} locked={i === 0 && gexIsToday}/>
            ))}
          </div>
          {dayChecklist.count === 13 && (
            <div style={{ marginTop: 8, background: "rgba(13,217,184,0.1)", border: "1px solid rgba(13,217,184,0.3)", borderRadius: 8, padding: "10px 14px", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#0dd9b8", letterSpacing: "0.08em" }}>
              {t("✓ 全部确认 · 可以入场", "✓ All confirmed · Ready to enter")}
            </div>
          )}
        </div>

        {/* QUICK REF */}
        <div>
          <SectionLabel>{t("快速参考 · QQQ $1,000账户", "Quick Ref · QQQ $1,000 Account")}</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {[
              { label: t("每笔止损", "Per-Trade Stop"), val: "−$20", c: "#f87171", bg: "rgba(248,113,113,0.08)", bd: "rgba(248,113,113,0.2)" },
              { label: t("每笔目标", "Per-Trade Target"), val: "+$40", c: "#34d399", bg: "rgba(52,211,153,0.08)", bd: "rgba(52,211,153,0.2)" },
              { label: t("日亏熔断", "Daily Limit"), val: "−$50", c: "#f87171", bg: "rgba(248,113,113,0.08)", bd: "rgba(248,113,113,0.2)" },
              { label: t("时间止盈", "Time Stop"), val: "45 min", c: "#fbbf24", bg: "rgba(251,191,36,0.08)", bd: "rgba(251,191,36,0.2)" },
            ].map(item => (
              <div key={item.label} style={{ background: item.bg, border: `1px solid ${item.bd}`, borderRadius: 7, padding: "8px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 4, fontWeight: 700 }}>{item.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", color: item.c }}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TIME WINDOWS */}
        <div>
          <SectionLabel>{t("交易时间窗口 (ET)", "Time Windows (ET)")}</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {[
              { range: "09:30–09:45", status: t("禁做", "Banned"), note: t("开盘乱流 · 绝对禁区", "Opening chaos — no-entry zone"), active: false, banned: true },
              { range: "09:45–11:30", status: t("主战窗口", "Primary Window"), note: t("趋势确立后入场 · 全力执行", "Enter after trend establishes"), active: true, banned: false },
              { range: "11:30–16:00", status: t("禁做", "Banned"), note: t("11:30后不开新仓", "No new positions after 11:30 ET"), active: false, banned: true },
            ].map(w => (
              <div key={w.range} style={{
                borderRadius: 7, padding: 10, border: `1px solid ${w.banned ? "rgba(248,113,113,0.25)" : w.active ? "rgba(52,211,153,0.35)" : "rgba(255,255,255,0.08)"}`,
                background: w.banned ? "rgba(248,113,113,0.05)" : w.active ? "rgba(52,211,153,0.06)" : "#111827"
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 3, color: w.banned ? "#f87171" : w.active ? "#34d399" : "rgba(255,255,255,0.4)" }}>{w.status}</div>
                <div style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.05em", marginBottom: 4 }}>{w.range}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>{w.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* IRON RULES */}
        <div>
          <SectionLabel>{t("铁律 · QQQ期权", "Iron Rules · QQQ Options")}</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {rules.map((rule, i) => (
              <div key={i} style={{ background: "#111827", border: `1px solid ${i === 7 ? "rgba(248,113,113,0.25)" : "rgba(255,255,255,0.08)"}`, borderRadius: 6, padding: "8px 10px", display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, background: i === 7 ? "rgba(248,113,113,0.2)" : "#1a2234", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: i === 7 ? "#f87171" : "rgba(255,255,255,0.4)", flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: 11, color: i === 7 ? "#f87171" : "rgba(255,255,255,0.88)", lineHeight: 1.5, fontWeight: i === 7 ? 700 : 400 }}>{rule}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", paddingTop: 8 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.15)", letterSpacing: "0.15em" }}>
            SEA TRADING OS v6 · 弱水三千，只取一瓢 · 先活下来，再赚钱
          </div>
        </div>

      </div>
    </div>
  );
}
