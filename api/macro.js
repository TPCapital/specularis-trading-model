export const config = { runtime: "edge" };

// ─── ECONOMIC CALENDAR 2025-2026 ───────────────────────────────────────────
// Format: "YYYY-MM-DD"
// FOMC: 8 meetings/year, 2-day (decision on day 2)
const FOMC_DATES = new Set([
  // 2025
  "2025-01-29","2025-03-19","2025-05-07","2025-06-18",
  "2025-07-30","2025-09-17","2025-10-29","2025-12-17",
  // 2026
  "2026-01-28","2026-03-18","2026-05-06","2026-06-17",
  "2026-07-29","2026-09-16","2026-10-28","2026-12-16",
]);

// CPI (US CPI-U release, usually 3rd week of month)
const CPI_DATES = new Set([
  // 2025
  "2025-01-15","2025-02-12","2025-03-12","2025-04-10",
  "2025-05-13","2025-06-11","2025-07-15","2025-08-12",
  "2025-09-10","2025-10-15","2025-11-13","2025-12-10",
  // 2026
  "2026-01-14","2026-02-11","2026-03-11","2026-04-09",
  "2026-05-12","2026-06-10","2026-07-14","2026-08-11",
  "2026-09-09","2026-10-14","2026-11-12","2026-12-09",
]);

// NFP (Non-Farm Payrolls, first Friday of each month)
const NFP_DATES = new Set([
  // 2025
  "2025-01-10","2025-02-07","2025-03-07","2025-04-04",
  "2025-05-02","2025-06-06","2025-07-03","2025-08-01",
  "2025-09-05","2025-10-03","2025-11-07","2025-12-05",
  // 2026
  "2026-01-09","2026-02-06","2026-03-06","2026-04-03",
  "2026-05-01","2026-06-05","2026-07-02","2026-08-07",
  "2026-09-04","2026-10-02","2026-11-06","2026-12-04",
]);

// PPI (usually day after CPI)
const PPI_DATES = new Set([
  "2025-01-16","2025-02-13","2025-03-13","2025-04-11",
  "2025-05-15","2025-06-12","2025-07-16","2025-08-14",
  "2025-09-11","2025-10-16","2025-11-14","2025-12-11",
  "2026-01-15","2026-02-12","2026-03-12","2026-04-10",
  "2026-05-14","2026-06-11","2026-07-15","2026-08-13",
  "2026-09-10","2026-10-15","2026-11-13","2026-12-10",
]);

// GDP advance (quarterly: late Jan, late Apr, late Jul, late Oct)
const GDP_DATES = new Set([
  "2025-01-30","2025-04-30","2025-07-30","2025-10-30",
  "2026-01-29","2026-04-29","2026-07-29","2026-10-29",
]);

// PCE (Personal Consumption Expenditures, monthly)
const PCE_DATES = new Set([
  "2025-01-31","2025-02-28","2025-03-28","2025-04-30",
  "2025-05-30","2025-06-27","2025-07-31","2025-08-29",
  "2025-09-26","2025-10-31","2025-11-26","2025-12-19",
  "2026-01-30","2026-02-27","2026-03-27","2026-04-30",
  "2026-05-29","2026-06-26","2026-07-31","2026-08-28",
  "2026-09-25","2026-10-30","2026-11-25","2026-12-18",
]);

function getTodayET() {
  const now = new Date();
  const etStr = now.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  return etStr; // "YYYY-MM-DD"
}

function getCalendar(dateStr) {
  const events = [];
  if (FOMC_DATES.has(dateStr)) events.push({ key: "FOMC", label: "FOMC", risk: "extreme", emoji: "🏛" });
  if (CPI_DATES.has(dateStr))  events.push({ key: "CPI",  label: "CPI",  risk: "high",    emoji: "📊" });
  if (NFP_DATES.has(dateStr))  events.push({ key: "NFP",  label: "NFP",  risk: "high",    emoji: "💼" });
  if (PPI_DATES.has(dateStr))  events.push({ key: "PPI",  label: "PPI",  risk: "medium",  emoji: "📈" });
  if (GDP_DATES.has(dateStr))  events.push({ key: "GDP",  label: "GDP",  risk: "medium",  emoji: "🌐" });
  if (PCE_DATES.has(dateStr))  events.push({ key: "PCE",  label: "PCE",  risk: "medium",  emoji: "📉" });
  return events;
}

async function fetchYield(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 Sea-Trading-OS/7.5", "Accept": "application/json" },
      cache: "no-store"
    });
    if (!r.ok) return null;
    const d = await r.json();
    const meta = d?.chart?.result?.[0]?.meta;
    const price = Number(meta?.regularMarketPrice ?? meta?.previousClose);
    const prev  = Number(meta?.chartPreviousClose ?? meta?.regularMarketPreviousClose ?? price);
    if (!Number.isFinite(price)) return null;
    const chg = Number.isFinite(prev) ? price - prev : 0;
    return { price, chg };
  } catch {
    return null;
  }
}

export default async function handler(req) {
  const today = getTodayET();
  const events = getCalendar(today);

  // Fetch yields in parallel
  // ^IRX = 13-week T-bill (~3M), ^FVX = 5Y, ^TNX = 10Y, ^TYX = 30Y
  // Closest to 2Y is ZT=F (2Y futures) but not always on Yahoo; use ^FVX for 5Y
  // We'll fetch 2Y via ZT=F and fall back to null, plus 10Y ^TNX
  const [y2raw, y5raw, y10raw, y30raw] = await Promise.all([
    fetchYield("ZT=F"),     // 2-year T-note futures (yield-inverse), may return price not yield
    fetchYield("^FVX"),     // 5-year yield index
    fetchYield("^TNX"),     // 10-year yield index
    fetchYield("^TYX"),     // 30-year yield index
  ]);

  // Yahoo ^TNX/^FVX/^TYX give yield×10, divide by 10
  const normalizeYield = (d) => d ? { price: d.price / 10, chg: d.chg / 10 } : null;

  const yields = {
    y5:  normalizeYield(y5raw),
    y10: normalizeYield(y10raw),
    y30: normalizeYield(y30raw),
    // ZT=F is a price (not yield), skip for now — or handle below
  };

  // Build risk level for the day
  let dayRisk = "clear";
  if (events.some(e => e.risk === "extreme")) dayRisk = "extreme";
  else if (events.some(e => e.risk === "high")) dayRisk = "high";
  else if (events.some(e => e.risk === "medium")) dayRisk = "medium";

  return new Response(JSON.stringify({
    date: today,
    events,
    dayRisk,
    yields,
    ts: Date.now()
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60"
    }
  });
}
