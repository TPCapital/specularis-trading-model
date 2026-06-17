export const config = { runtime: "edge" };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  if (!symbol) return json({ error: "missing symbol" }, 400);

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;

  try {
    const r = await fetchWithTimeout(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 Sea-Trading-OS/7.1",
        "Accept": "application/json"
      },
      cache: "no-store"
    });

    if (!r.ok) return json({ error: "upstream error", status: r.status }, r.status);

    const d = await r.json();
    const result = d?.chart?.result?.[0];
    const meta = result?.meta;
    const quote = result?.indicators?.quote?.[0];
    const closes = (quote?.close || []).filter(v => typeof v === "number");

    if (!meta && closes.length === 0) return json({ error: "no data" }, 404);

    const price = Number(meta?.regularMarketPrice ?? meta?.previousClose ?? closes.at(-1));
    const prev = Number(meta?.chartPreviousClose ?? meta?.regularMarketPreviousClose ?? closes.at(-2) ?? price);

    if (!Number.isFinite(price)) return json({ error: "invalid price" }, 404);

    const chg = Number.isFinite(prev) ? price - prev : 0;
    const pct = Number.isFinite(prev) && prev !== 0 ? (chg / prev) * 100 : 0;

    return json({ symbol, price, chg, pct, source: "yahoo-chart", build: "v7.1.0" }, 200, 45);
  } catch (e) {
    return json({ error: "fetch error", message: e?.message || String(e) }, 500);
  }
}

function json(payload, status = 200, maxAge = 0) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": maxAge > 0 ? `public, s-maxage=${maxAge}, stale-while-revalidate=60` : "no-store, max-age=0, must-revalidate"
    }
  });
}


function fetchWithTimeout(url, options = {}, timeoutMs = 7000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}
