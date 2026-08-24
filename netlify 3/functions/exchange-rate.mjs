const DEFAULT_RATE = 32
const MIN_USD_TWD = 20
const MAX_USD_TWD = 60

const providers = [
  {
    name: "ExchangeRate-API",
    url: "https://open.er-api.com/v6/latest/USD",
    read: (data) => data?.rates?.TWD,
    timestamp: (data) => data?.time_last_update_utc,
  },
  {
    name: "ExchangeRate API",
    url: "https://api.exchangerate-api.com/v4/latest/USD",
    read: (data) => data?.rates?.TWD,
    timestamp: (data) => data?.date,
  },
  {
    name: "Currency API",
    url: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
    read: (data) => data?.usd?.twd,
    timestamp: (data) => data?.date,
  },
]

async function fetchProvider(provider) {
  const response = await fetch(provider.url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(4500),
  })
  if (!response.ok) throw new Error(`${provider.name}: HTTP ${response.status}`)

  const data = await response.json()
  const rate = Number(provider.read(data))
  if (!Number.isFinite(rate) || rate < MIN_USD_TWD || rate > MAX_USD_TWD) {
    throw new Error(`${provider.name}: invalid USD/TWD rate`)
  }

  return {
    rate: Number(rate.toFixed(1)),
    source: provider.name,
    asOf: provider.timestamp(data) || new Date().toISOString(),
  }
}

export default async (request) => {
  if (request.method !== "GET") {
    return Response.json({ error: "Method Not Allowed" }, { status: 405 })
  }

  try {
    // Query all independent providers concurrently; use the first valid response.
    const result = await Promise.any(providers.map(fetchProvider))
    return Response.json(
      { ok: true, base: "USD", quote: "TWD", ...result },
      {
        headers: {
          "Cache-Control": "public, max-age=300",
          "Netlify-CDN-Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
        },
      },
    )
  } catch {
    return Response.json(
      { ok: false, rate: DEFAULT_RATE, source: "fallback", asOf: null },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }
}
