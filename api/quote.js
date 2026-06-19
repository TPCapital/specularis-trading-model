function send(res, payload, status = 200, maxAge = 0) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Cache-Control",
    maxAge > 0 ? `public, s-maxage=${maxAge}, stale-while-revalidate=60` : "no-store, max-age=0, must-revalidate"
  );
  res.end(JSON.stringify(payload));
}

function fetchWithTimeout(url, options = {}, timeoutMs = 4500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return send(res, { ok: true }, 200);

  const symbol = req.query?.symbol;
  if (!symbol || typeof symbol !== "string") return send(res, { error: "missing symbol" }, 400);

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;

  try {
    const r = await fetchWithTimeout(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 Sea-Trading-OS/7.5.2",
        "Accept": "application/json"
      }
    });

    if (!r.ok) return send(res, { error: "upstream error", status: r.status }, 200, 30);

    const d = await r.json();
    const result = d?.chart?.result?.[0];
    const meta = result?.meta;
    const quote = result?.indicators?.quote?.[0];
    const closes = (quote?.close || []).filter(v => typeof v === "number");

    const price = Number(meta?.regularMarketPrice ?? meta?.previousClose ?? closes.at(-1));
    const prev = Number(meta?.chartPreviousClose ?? meta?.regularMarketPreviousClose ?? closes.at(-2) ?? price);

    if (!Number.isFinite(price)) return send(res, { error: "invalid price", symbol, source: "fallback" }, 200, 30);

    const chg = Number.isFinite(prev) ? price - prev : 0;
    const pct = Number.isFinite(prev) && prev !== 0 ? (chg / prev) * 100 : 0;

    return send(res, { symbol, price, chg, pct, source: "yahoo-chart", build: "v7.5.2" }, 200, 45);
  } catch (e) {
    return send(res, { error: "fetch timeout/fallback", symbol, message: e?.name || e?.message || String(e), build: "v7.5.2" }, 200, 15);
  }
}
