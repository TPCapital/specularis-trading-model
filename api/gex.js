// ─────────────────────────────────────────────────────────────────────────────
// Sea Trading OS v7.7.0 — GEX Auto-Fetch API
// Proxies FlashAlpha /v1/exposure/levels/QQQ (Basic+) or NVDA (Free tier test)
// Returns normalised GEX key levels for QQQ options panel.
// Env var: FLASHALPHA_KEY (set in Vercel Environment Variables)
// ─────────────────────────────────────────────────────────────────────────────

const BASE = "https://lab.flashalpha.com";

function send(res, payload, status = 200) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Short cache: 5 min during session, stale-while-revalidate 2 min
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=120");
  res.end(JSON.stringify(payload));
}

function fetchWithTimeout(url, options = {}, ms = 5000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(id));
}

async function fetchLevels(symbol, apiKey) {
  const url = `${BASE}/v1/exposure/levels/${encodeURIComponent(symbol)}`;
  const r = await fetchWithTimeout(url, {
    headers: { "X-Api-Key": apiKey, "Accept": "application/json" }
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    return { error: r.status, body };
  }
  return r.json();
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return send(res, { ok: true });

  const apiKey = process.env.FLASHALPHA_KEY;
  if (!apiKey) {
    return send(res, {
      ok: false,
      error: "FLASHALPHA_KEY not configured",
      tier: "none"
    }, 500);
  }

  // Try QQQ first (requires Basic+), fall back to detecting tier
  let data = await fetchLevels("QQQ", apiKey);

  // If 403/401 on QQQ → Free tier, ETFs not allowed
  if (data.error === 403 || data.error === 401) {
    return send(res, {
      ok: false,
      error: "QQQ requires Basic plan ($79/mo). Current plan is Free.",
      tier: "free",
      upgrade_url: "https://flashalpha.com/pricing",
      // Return empty levels so frontend can show "upgrade needed" state
      levels: null,
      symbol: "QQQ",
      underlying_price: null,
      as_of: new Date().toISOString(),
    });
  }

  if (data.error) {
    return send(res, {
      ok: false,
      error: `FlashAlpha error ${data.error}`,
      tier: "unknown"
    }, 502);
  }

  // Success — normalise to our field names
  const lvl = data.levels || {};
  return send(res, {
    ok: true,
    tier: "basic",
    symbol: data.symbol || "QQQ",
    underlying_price: data.underlying_price,
    as_of: data.as_of,
    levels: {
      flip:     lvl.gamma_flip,           // Gamma Flip
      call:     lvl.call_wall,            // Call Wall (resistance)
      put:      lvl.put_wall,             // Put Wall (support)
      vol:      lvl.max_positive_gamma,   // Vol Trigger (highest pos GEX strike)
      magnet:   lvl.zero_dte_magnet,      // 0DTE magnet (bonus)
      max_neg:  lvl.max_negative_gamma,   // Max negative GEX zone
      high_oi:  lvl.highest_oi_strike,    // Highest OI strike
    },
    // Regime from net GEX — levels endpoint doesn't have net_gex,
    // so we derive from flip vs spot
    regime: data.underlying_price && lvl.gamma_flip
      ? (data.underlying_price > lvl.gamma_flip ? "positive" : "negative")
      : null,
    ts: Date.now(),
    build: "v7.7.0",
  });
}
