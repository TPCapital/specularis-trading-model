// ─────────────────────────────────────────────────────────────────────────────
// Sea Trading OS v7.6.3 — Macro API
// Returns: yields (5Y/10Y/30Y), economic calendar events, OPEX/witching,
//          Treasury auction days — all for the current ET trading day.
// ─────────────────────────────────────────────────────────────────────────────

// ── FOMC / CPI / NFP / PPI / GDP / PCE ──────────────────────────────────────
const FOMC_DATES = new Set([
  "2025-01-29","2025-03-19","2025-05-07","2025-06-18","2025-07-30","2025-09-17","2025-10-29","2025-12-17",
  "2026-01-28","2026-03-18","2026-05-06","2026-06-17","2026-07-29","2026-09-16","2026-10-28","2026-12-16"
]);
const CPI_DATES = new Set([
  "2025-01-15","2025-02-12","2025-03-12","2025-04-10","2025-05-13","2025-06-11","2025-07-15","2025-08-12","2025-09-10","2025-10-15","2025-11-13","2025-12-10",
  "2026-01-14","2026-02-11","2026-03-11","2026-04-09","2026-05-12","2026-06-10","2026-07-14","2026-08-11","2026-09-09","2026-10-14","2026-11-12","2026-12-09"
]);
const NFP_DATES = new Set([
  "2025-01-10","2025-02-07","2025-03-07","2025-04-04","2025-05-02","2025-06-06","2025-07-03","2025-08-01","2025-09-05","2025-10-03","2025-11-07","2025-12-05",
  "2026-01-09","2026-02-06","2026-03-06","2026-04-03","2026-05-01","2026-06-05","2026-07-02","2026-08-07","2026-09-04","2026-10-02","2026-11-06","2026-12-04"
]);
const PPI_DATES = new Set([
  "2025-01-16","2025-02-13","2025-03-13","2025-04-11","2025-05-15","2025-06-12","2025-07-16","2025-08-14","2025-09-11","2025-10-16","2025-11-14","2025-12-11",
  "2026-01-15","2026-02-12","2026-03-12","2026-04-10","2026-05-14","2026-06-11","2026-07-15","2026-08-13","2026-09-10","2026-10-15","2026-11-13","2026-12-10"
]);
const GDP_DATES = new Set(["2025-01-30","2025-04-30","2025-07-30","2025-10-30","2026-01-29","2026-04-29","2026-07-29","2026-10-29"]);
const PCE_DATES = new Set([
  "2025-01-31","2025-02-28","2025-03-28","2025-04-30","2025-05-30","2025-06-27","2025-07-31","2025-08-29","2025-09-26","2025-10-31","2025-11-26","2025-12-19",
  "2026-01-30","2026-02-27","2026-03-27","2026-04-30","2026-05-29","2026-06-26","2026-07-31","2026-08-28","2026-09-25","2026-10-30","2026-11-25","2026-12-18"
]);

// ── OPEX / WITCHING ──────────────────────────────────────────────────────────
// Monthly OPEX: 3rd Friday of every month.
// Jun 2026: Juneteenth holiday falls on Jun 19 (Fri) → OPEX shifts to Thu Jun 18.
// Quad Witching (also called Triple Witching): OPEX in Mar / Jun / Sep / Dec.
// These days: stock options + index options + index futures all expire simultaneously.
// Effect: 50–100% above-average volume, intraday pin risk, directional breakout in final hour.
const QUAD_WITCHING_DATES = new Set([
  "2026-03-20",  // Mar: 3rd Fri ✓
  "2026-06-18",  // Jun: shifted Thu (3rd Fri=Jun19 is Juneteenth holiday)
  "2026-09-18",  // Sep: 3rd Fri ✓
  "2026-12-18",  // Dec: 3rd Fri ✓
]);
const MONTHLY_OPEX_DATES = new Set([
  "2026-01-16",  // Jan
  "2026-02-20",  // Feb
  // Mar = quad witching (in QUAD set)
  "2026-04-17",  // Apr
  "2026-05-15",  // May
  // Jun = quad witching, shifted (in QUAD set)
  "2026-07-17",  // Jul
  "2026-08-21",  // Aug
  // Sep = quad witching (in QUAD set)
  "2026-10-16",  // Oct
  "2026-11-20",  // Nov
  // Dec = quad witching (in QUAD set)
]);

// ── TREASURY AUCTION DAYS ────────────────────────────────────────────────────
// 10Y Note and 30Y Bond auctions: ~2nd week of every month.
// These can cause intraday yield spikes that directly pressure QQQ (rate-sensitive).
// Tail risk (poor demand) = rates spike = growth stocks sell off intraday.
// Source: US Treasury tentative auction schedule (confirmed against published PDFs).
// 10Y auctions: typically Tue or Wed of 2nd week
// 30Y auctions: typically Wed or Thu of 2nd week
const TREASURY_10Y_DATES = new Set([
  "2026-01-14","2026-02-11","2026-03-11","2026-04-08",
  "2026-05-12","2026-06-10","2026-07-15","2026-08-12",
  "2026-09-09","2026-10-14","2026-11-11","2026-12-09"
]);
const TREASURY_30Y_DATES = new Set([
  "2026-01-15","2026-02-12","2026-03-12","2026-04-09",
  "2026-05-13","2026-06-11","2026-07-16","2026-08-13",
  "2026-09-10","2026-10-15","2026-11-12","2026-12-10"
]);

// ── HELPERS ──────────────────────────────────────────────────────────────────
function send(res, payload, status = 200) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=60");
  res.end(JSON.stringify(payload));
}

function getTodayET() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

function getCalendar(dateStr) {
  const events = [];

  // Macro data releases
  if (FOMC_DATES.has(dateStr))  events.push({ key:"FOMC",  label:"FOMC",  risk:"extreme", emoji:"🏛",  category:"macro" });
  if (CPI_DATES.has(dateStr))   events.push({ key:"CPI",   label:"CPI",   risk:"high",    emoji:"📊",  category:"macro" });
  if (NFP_DATES.has(dateStr))   events.push({ key:"NFP",   label:"NFP",   risk:"high",    emoji:"💼",  category:"macro" });
  if (PPI_DATES.has(dateStr))   events.push({ key:"PPI",   label:"PPI",   risk:"medium",  emoji:"📈",  category:"macro" });
  if (GDP_DATES.has(dateStr))   events.push({ key:"GDP",   label:"GDP",   risk:"medium",  emoji:"🌐",  category:"macro" });
  if (PCE_DATES.has(dateStr))   events.push({ key:"PCE",   label:"PCE",   risk:"medium",  emoji:"📉",  category:"macro" });

  // Options expiry events
  if (QUAD_WITCHING_DATES.has(dateStr)) {
    events.push({ key:"WITCHING", label:"Quad Witching", risk:"high", emoji:"🔮", category:"opex" });
  } else if (MONTHLY_OPEX_DATES.has(dateStr)) {
    events.push({ key:"OPEX", label:"Monthly OPEX", risk:"medium", emoji:"⏰", category:"opex" });
  }

  // Treasury auctions — only flag 10Y and 30Y (highest market impact)
  if (TREASURY_10Y_DATES.has(dateStr)) {
    events.push({ key:"T10Y_AUC", label:"10Y Auction", risk:"medium", emoji:"🏦", category:"treasury" });
  }
  if (TREASURY_30Y_DATES.has(dateStr)) {
    events.push({ key:"T30Y_AUC", label:"30Y Auction", risk:"medium", emoji:"🏦", category:"treasury" });
  }

  return events;
}

function fetchWithTimeout(url, options = {}, timeoutMs = 3500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}

async function fetchYield(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
    const r = await fetchWithTimeout(url, { headers: { "User-Agent": "Mozilla/5.0 Sea-Trading-OS/7.6.3", "Accept": "application/json" } });
    if (!r.ok) return null;
    const d = await r.json();
    const meta = d?.chart?.result?.[0]?.meta;
    const price = Number(meta?.regularMarketPrice ?? meta?.previousClose);
    const prev = Number(meta?.chartPreviousClose ?? meta?.regularMarketPreviousClose ?? price);
    if (!Number.isFinite(price)) return null;
    return { price, chg: Number.isFinite(prev) ? price - prev : 0 };
  } catch {
    return null;
  }
}

function normalizeYield(d) {
  return d ? { price: d.price / 10, chg: d.chg / 10 } : null;
}

// ── HANDLER ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method === "OPTIONS") return send(res, { ok: true });

  const today = getTodayET();
  const events = getCalendar(today);
  const [y5raw, y10raw, y30raw] = await Promise.all([
    fetchYield("^FVX"),
    fetchYield("^TNX"),
    fetchYield("^TYX")
  ]);

  const yields = {
    y5:  normalizeYield(y5raw),
    y10: normalizeYield(y10raw),
    y30: normalizeYield(y30raw)
  };

  // dayRisk: macro events dominate; opex/treasury add at most "medium"
  let dayRisk = "clear";
  const macroEvents   = events.filter(e => e.category === "macro");
  const opexEvents    = events.filter(e => e.category === "opex");
  const treasuryEvs   = events.filter(e => e.category === "treasury");

  if      (macroEvents.some(e => e.risk === "extreme")) dayRisk = "extreme";
  else if (macroEvents.some(e => e.risk === "high"))    dayRisk = "high";
  else if (opexEvents.some(e => e.risk === "high"))     dayRisk = "high";    // witching = high
  else if (macroEvents.some(e => e.risk === "medium") || opexEvents.length > 0 || treasuryEvs.length > 0) dayRisk = "medium";

  return send(res, {
    date: today,
    events,
    dayRisk,
    yields,
    source: "yahoo-chart+static-calendar",
    build: "v7.6.3",
    ts: Date.now()
  });
}
