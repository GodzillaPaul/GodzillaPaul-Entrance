const FUNDS = {
  JFP11: {
    code: "JFP11",
    name: "JPM 多重收益美元對沖 A 股穩定月配",
    currency: "USD",
    navUrl: "https://invest.fubonlife.com.tw/w/wb/wb02.djhtm?a=JFZN3-JFP11&product=VCCF",
    rateUrl: "https://invest.fubonlife.com.tw/w/wb/wb05.djhtm?a=JFZN3-JFP11&product=VCCF",
  },
}

function normalizeDate(value) {
  const m = String(value || "").match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/)
  if (!m) return ""
  return `${m[1]}-${String(Number(m[2])).padStart(2, "0")}-${String(Number(m[3])).padStart(2, "0")}`
}

function htmlToText(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 GodzillaPaul Property Cashflow Fund Updater",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(7000),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.text()
}

function parseMaxPageDate(html) {
  const matches = [...String(html || "").matchAll(/['"](\d{4})-(\d{1,2})-(\d{1,2})['"]/g)]
    .map(match => normalizeDate(`${match[1]}-${match[2]}-${match[3]}`))
    .filter(Boolean)
    .sort()
  return matches[matches.length - 1] || new Date().toISOString().slice(0, 10)
}

function parseNav(html) {
  const brand = String(html || "").match(/navbar-brand[^>]*>\s*([0-9]+(?:\.[0-9]+)?)/i)
  const nav = brand ? Number(brand[1]) : NaN
  const text = htmlToText(html)
  const mmdd = (text.match(/\b(\d{2})\/(\d{2})\s+([0-9]+(?:\.[0-9]+)?)/) || [])[0]
  const pageDate = parseMaxPageDate(html)
  let navDate = pageDate

  if (mmdd) {
    const parts = mmdd.match(/(\d{2})\/(\d{2})/)
    if (parts) navDate = `${pageDate.slice(0, 4)}-${parts[1]}-${parts[2]}`
  }

  if (!Number.isFinite(nav) || nav <= 0) throw new Error("nav not found")
  return { nav, navDate }
}

function parseDistribution(html) {
  const row = String(html || "").match(
    /<tr>[\s\S]*?(\d{4}\/\d{2}\/\d{2})[\s\S]*?<td[^>]*text-right[^>]*>\s*([0-9]+(?:\.[0-9]+)?)\s*<\/td>[\s\S]*?<\/tr>/i,
  )
  if (!row) throw new Error("distribution not found")
  const rate = Number(row[2])
  if (!Number.isFinite(rate) || rate <= 0) throw new Error("invalid distribution")
  return { rate, rateDate: normalizeDate(row[1]) }
}

async function readFund(fund) {
  const [navHtml, rateHtml] = await Promise.all([fetchHtml(fund.navUrl), fetchHtml(fund.rateUrl)])
  const nav = parseNav(navHtml)
  const dist = parseDistribution(rateHtml)
  return {
    code: fund.code,
    name: fund.name,
    currency: fund.currency,
    ...nav,
    ...dist,
  }
}

export default async request => {
  if (request.method !== "GET") {
    return Response.json({ ok: false, error: "Method Not Allowed" }, { status: 405 })
  }

  const url = new URL(request.url)
  const requested = (url.searchParams.get("codes") || "JFP11")
    .split(",")
    .map(code => code.trim().toUpperCase())
    .filter(Boolean)

  const funds = []
  const errors = []

  await Promise.all(
    requested.map(async code => {
      const fund = FUNDS[code]
      if (!fund) {
        errors.push({ code, error: "unsupported fund" })
        return
      }
      try {
        funds.push(await readFund(fund))
      } catch (error) {
        errors.push({ code, error: error && error.message ? error.message : "fetch failed" })
      }
    }),
  )

  return Response.json(
    {
      ok: funds.length > 0,
      asOf: new Date().toISOString(),
      funds,
      errors,
    },
    {
      status: funds.length > 0 ? 200 : 502,
      headers: {
        "Cache-Control": "public, max-age=1800",
        "Netlify-CDN-Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
      },
    },
  )
}
