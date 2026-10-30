const PATHS = {
  DSP5: 'WFUND/25/DSP5', NGB1: 'WFUND/32/NGB1', NGB2: 'WFUND/32/NGB2',
  FBD6: 'DIA/45/FBD6', ACE17: 'WFUND/40/ACE17', DST3: 'FUND/10/DST3',
  ACC3: 'FUND/20/ACC3', JFP11: 'WFUND/39/JFP11', SCP6: 'WFUND/29/SCP6',
};
const SOURCE_URL = 'https://invest.fubonlife.com.tw/funds/overview/' + PATHS.JFP11;
function date(value) {
  const m = String(value || '').match(/^(\d{4})[/-](\d{2})[/-](\d{2})$/);
  if (!m) return '';
  const result = m[1]+'-'+m[2]+'-'+m[3];
  return new Date(result+'T00:00:00Z').toISOString().slice(0,10) === result ? result : '';
}
// The official overview embeds the full fund list as indexed Nuxt JSON.
// Resolve only scalar fields of the exact fund/type/company; never execute page scripts.
export function parseFunds(html, codes) {
  const script = String(html).match(/<script\b(?=[^>]*\bid=["']__NUXT_DATA__["'])[^>]*>([\s\S]*?)<\/script>/i);
  if (!script) throw new Error('official fund data not found');
  const data = JSON.parse(script[1]);
  if (!Array.isArray(data)) throw new Error('invalid official fund data');
  const scalar = index => Number.isInteger(index) && index >= 0 ? data[index] : undefined;
  const funds = [], errors = [];
  for (const code of codes) {
    if (!Object.hasOwn(PATHS, code)) { errors.push({code,error:'unsupported fund'}); continue; }
    try {
      const [type, company] = PATHS[code].split('/');
      const matches = data.filter(row => row && !Array.isArray(row) && typeof row === 'object'
        && scalar(row.optionFbCode) === code && scalar(row.optionType) === type
        && String(scalar(row.optionCompany)) === company);
      if (matches.length !== 1) throw new Error('fund identity missing or ambiguous');
      const row = matches[0], nav = Number(scalar(row.netAssetValue));
      const navDate = date(scalar(row.navDate));
      const rate = code === 'FBD6' ? 0.0468 : Number(scalar(row.dividendPerUnit));
      const rateDate = date(scalar(row.recordDate));
      if (!(nav > 0) || !Number.isFinite(nav) || !navDate) throw new Error('dated NAV missing');
      if (!(rate > 0) || !Number.isFinite(rate) || (code !== 'FBD6' && !rateDate)) throw new Error('dated distribution missing');
      funds.push({code, nav, navDate, rate, rateDate,
        currency: code === 'FBD6' ? 'TWD' : 'USD',
        sourceUrl: 'https://invest.fubonlife.com.tw/funds/overview/'+PATHS[code]});
    } catch (error) { errors.push({code,error:error.message}); }
  }
  return {funds, errors};
}
export default async request => {
  if (request.method !== 'GET') return Response.json({ok:false,error:'Method Not Allowed'},{status:405});
  const codes = [...new Set((new URL(request.url).searchParams.get('codes') || Object.keys(PATHS).join(','))
    .split(',').map(code=>code.trim().toUpperCase()).filter(Boolean))];
  try {
    const response = await fetch(SOURCE_URL, {headers:{Accept:'text/html','User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(15000)});
    if (!response.ok) throw new Error('official HTTP '+response.status);
    const {funds, errors} = parseFunds(await response.text(), codes);
    return Response.json({ok:funds.length>0,asOf:new Date().toISOString(),funds,errors}, {
      status:funds.length ? 200 : 502,
      headers:{'Cache-Control':'public, max-age=300','Netlify-CDN-Cache-Control':'public, s-maxage=1800'}});
  } catch (error) {
    return Response.json({ok:false,funds:[],errors:codes.map(code=>({code,error:error.message}))},{status:502,headers:{'Cache-Control':'no-store'}});
  }
};
