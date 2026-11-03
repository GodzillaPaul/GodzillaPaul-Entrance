/* ══════════════════════════════════════
   calc.js — 核心試算邏輯
   ══════════════════════════════════════ */

function parseRoc(s) {
  s = s.replace(/[^0-9]/g, '');
  if (s.length === 6) s = '0' + s;
  if (s.length !== 7) return null;
  const y = parseInt(s.slice(0, 3));
  const m = parseInt(s.slice(3, 5));
  const d = parseInt(s.slice(5, 7));
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y + 1911, m - 1, d);
  if (dt.getMonth() !== m - 1) return null;
  return { year: y + 1911, month: m, day: d };
}

function calcInsureAge(by, bm, bd) {
  const now = new Date();
  const ty = now.getFullYear(), tm = now.getMonth() + 1, td = now.getDate();
  let yd = ty - by, md = tm - bm;
  if (md < 0) { md += 12; yd--; }
  let age = yd;
  if (md > 6 || (md === 6 && td - bd >= 0)) age++;
  return Math.max(0, age);
}

// 實際足歲（判斷是否未滿 15 足歲用）
function calcFullAge(by, bm, bd) {
  const now = new Date();
  const ty = now.getFullYear(), tm = now.getMonth() + 1, td = now.getDate();
  let age = ty - by;
  if (tm < bm || (tm === bm && td < bd)) age--;
  return Math.max(0, age);
}

function isChild(birth) {
  return !!birth && calcFullAge(birth.year, birth.month, birth.day) < 15;
}

// 第幾個保單月（含）以前仍未滿 15 足歲；依 Excel「15 足歲當月」算法
function calcMonthsBefore15(birth) {
  const now = new Date();
  const iy = now.getFullYear(), im = now.getMonth() + 1, id = now.getDate();
  const y15 = birth.year + 15, m15 = birth.month, d15 = birth.day;
  const full = (y15 - iy) * 12 + (m15 - im) - (d15 < id ? 1 : 0);
  return Math.max(0, full + (d15 !== id ? 1 : 0));
}

function getMultTable(sex) { return sex === 'M' ? MULT_M : MULT_F; }

function fmt(n) { return Math.round(n).toLocaleString('zh-TW'); }
function pct(r) { return (r * 100).toFixed(1) + '%'; }

function getExtraStages() {
  const stages = [];
  for (let i = 1; i <= 4; i++) {
    const y = document.getElementById(`extra_yr${i}`).value.trim();
    const a = document.getElementById(`extra_amt${i}`).value.trim();
    if (!y && !a) continue;
    stages.push({ slot: i, yr: y ? Number(y) : 0, amt: a ? Number(a) : 0 });
  }
  return stages.sort((a, b) => a.yr - b.yr);
}

function getExtraAtYear(yr, stages) {
  stages = stages || getExtraStages();
  let cur = 0;
  for (const s of stages) { if (yr >= s.yr) cur = s.amt; else break; }
  return cur;
}

function getSingleEvents() {
  const events = [];
  for (let i = 1; i <= 2; i++) {
    const yearRaw = document.getElementById(`single_yr${i}`).value.trim();
    const amtRaw  = document.getElementById(`single_amt${i}`).value.trim();
    if (!yearRaw && !amtRaw) continue;
    events.push({
      slot: i,
      yr: yearRaw ? Number(yearRaw) : 0,
      amt: amtRaw ? Number(amtRaw) : 0
    });
  }
  return events.sort((a, b) => a.yr - b.yr);
}

function getSingleAtYear(yr, events) {
  return events.filter(e => e.yr === yr).reduce((sum, e) => sum + e.amt, 0);
}

function getPayway(id, fallback) {
  const el = document.getElementById(id);
  return (el && el.value) || fallback;
}

function runCalc() {
  const birth  = parseRoc(document.getElementById('bday').value.trim());
  const sex    = document.getElementById('sex').value;
  const ptype  = document.getElementById('ptype').value;
  const rorPct = parseFloat(document.getElementById('ror').value);
  const monthly = parseFloat(document.getElementById('monthly').value) || 0;
  const payFirst = getPayway('payway_first', 'transfer');
  const payRenew = getPayway('payway_renew', 'transfer');

  // 繳費期間限制（由 ui.js getPayLimit 提供）
  const payLimit = (typeof getPayLimit === 'function') ? getPayLimit() : { mode: 'none', val: 999 };

  // ── 基本驗證 ──
  if (!birth) return { error: '生日格式錯誤，請輸入民國生日如 690831' };
  if (!Number.isFinite(rorPct) || rorPct < ROR_MIN || rorPct > ROR_MAX) {
    return { error: `預估年投報率須介於 ${ROR_MIN}% ～ ${ROR_MAX}%` };
  }
  const ror = rorPct / 100;

  const iAge  = calcInsureAge(birth.year, birth.month, birth.day);
  const child = isChild(birth);
  const maxAge = MAX_AGE_BY_TYPE[ptype];
  if (iAge > maxAge) {
    return { error: `投保年齡 ${iAge} 歲超過${ptype === 'A' ? '甲型上限 64 歲' : '乙型上限 70 歲'}` };
  }

  let target;
  if (child) {
    target = CHILD_TARGET; // 未滿 15 足歲限年繳，目標保費固定 7,500 元
  } else {
    if (monthly < 2000) return { error: '月存金額下限 2,000 元' };
    if (Math.round(monthly) !== monthly || monthly % 100 !== 0) return { error: '月存金額須為百元整數' };
    target = Math.round(monthly * 12);
    if (target < 24000) return { error: '年繳保費下限 24,000 元' };
  }

  const years = LAST_INSURE_AGE + 1 - iAge;

  // 繳費期間
  let lastPayYear = years;
  if (payLimit.mode === 'age' && payLimit.val < 999) {
    // 「存到 65 歲」= 繳完保險年齡 65 歲那一年的保費（含該歲）
    if (!Number.isInteger(payLimit.val) || payLimit.val < iAge || payLimit.val > LAST_INSURE_AGE) {
      return { error: `「存到幾歲」須介於投保年齡 ${iAge} 歲 ～ ${LAST_INSURE_AGE} 歲` };
    }
    lastPayYear = payLimit.val - iAge + 1;
  }
  if (payLimit.mode === 'yr' && payLimit.val < 999) {
    if (!Number.isInteger(payLimit.val) || payLimit.val < 1 || payLimit.val > years) {
      return { error: `「存幾年」須介於 1 ～ ${years} 年` };
    }
    lastPayYear = payLimit.val;
  }

  // 保額
  const minSA = calcMinSA(target, iAge, sex);
  const maxSA = calcMaxSA(target, iAge, sex);
  const saRaw = document.getElementById('sa').value.trim();
  const SA = saRaw === '' ? minSA : Number(saRaw);
  if (!Number.isFinite(SA) || SA <= 0) return { error: '保額格式錯誤' };
  if (SA % 1000 !== 0) return { error: '保額須以千元為單位' };
  if (SA < minSA) return { error: `保額低於下限 ${fmt(minSA)} 元` };
  if (SA > maxSA) return { error: `保額超過上限 ${fmt(maxSA)} 元` };

  // 分段定期定額增額
  const extraStages = getExtraStages();
  for (const s of extraStages) {
    if (!Number.isInteger(s.yr) || s.yr < 1 || s.yr > years || !s.amt) {
      return { error: `加碼段 ${s.slot} 請同時填寫正確的起始年度與月額` };
    }
    if (!Number.isInteger(s.amt) || s.amt < 1000) return { error: `加碼段 ${s.slot} 每月下限 1,000 元，且須為整數` };
  }
  if (new Set(extraStages.map(s => s.yr)).size !== extraStages.length) {
    return { error: '各加碼段的起始年度請勿重複' };
  }

  // 單筆增額
  const singleEvents = getSingleEvents();
  for (const event of singleEvents) {
    if (!Number.isInteger(event.yr) || event.yr < 1 || !event.amt) {
      return { error: `單筆增額 ${event.slot} 請同時填寫正確的投入年度與金額` };
    }
    if (!Number.isInteger(event.amt) || event.amt < 10000) {
      return { error: `單筆增額 ${event.slot} 金額最低 10,000 元，且須為整數` };
    }
    if (event.yr > lastPayYear) {
      return { error: `單筆增額 ${event.slot} 的第 ${event.yr} 年已超過目前設定的繳費期間` };
    }
  }
  if (singleEvents.length === 2 && singleEvents[0].yr === singleEvents[1].yr) {
    return { error: '兩次單筆增額請設定在不同年度' };
  }

  // 同一保單年度超額保費 ≤ 目標保費 100 倍
  for (let yr = 1; yr <= lastPayYear; yr++) {
    const excess = getExtraAtYear(yr, extraStages) * 12 + getSingleAtYear(yr, singleEvents);
    if (excess > target * EXCESS_TARGET_MULT) {
      return { error: `第 ${yr} 年超額保費 ${fmt(excess)} 元，超過當年度目標保費 100 倍（${fmt(target * EXCESS_TARGET_MULT)} 元）` };
    }
  }

  const highDisc  = getHighFeeDiscount(target);
  const firstDisc = PAYWAY_FIRST_DISC[payFirst] ? PAYWAY_DISC : 0;
  const renewDisc = PAYWAY_RENEW_DISC[payRenew] ? PAYWAY_DISC : 0;
  const monthsBefore15 = child ? calcMonthsBefore15(birth) : 0;

  // 首期即須符合第十一條（公司 Excel 輸入頁亦會擋下）
  {
    const F1 = target - Math.round(target * BASE_FEE[0]);
    if (!canPayPremium(ptype, SA, F1, iAge, monthsBefore15 >= 1)) {
      return { error: '首期目標保費不符第十一條保額比例門檻，請提高保額' };
    }
    const s1 = getSingleAtYear(1, singleEvents);
    if (s1 > 0) {
      const G1 = s1 - Math.round(s1 * getSingleFeeRate(s1));
      if (!canPayPremium(ptype, SA, F1 + G1, iAge, monthsBefore15 >= 1)) {
        return { error: '首期單筆增額不符第十一條保額比例門檻，請降低金額或提高保額' };
      }
    }
  }

  let payLimitLabel = '終身繳費（至 110 歲）';
  if (payLimit.mode === 'age' && payLimit.val < 999) payLimitLabel = `繳費至 ${payLimit.val} 歲（含）`;
  else if (payLimit.mode === 'yr' && payLimit.val < 999) payLimitLabel = `繳費 ${payLimit.val} 年`;

  const rows = UNDEngine.simulate({
    iAge, sex, ptype, target, SA, ror, lastPayYear,
    extraAtYear:  yr => getExtraAtYear(yr, extraStages),
    singleAtYear: yr => getSingleAtYear(yr, singleEvents),
    firstDisc, renewDisc, monthsBefore15
  });

  const [lo_, hi_] = getMult(iAge, sex);
  const avg_       = (lo_ + hi_) / 2;
  const stages     = extraStages.map(s => `年${s.yr}: ${fmt(s.amt)}/月`);
  const skippedYears = rows.filter(r => r.targetSkipped).map(r => r.yr);
  const lapsed = rows.length && rows[rows.length - 1].av === 0;

  return {
    rows, iAge, child, minSA, maxSA, SA, target, highDisc, firstDisc, renewDisc, rorPct,
    lo_, hi_, avg_, stages, singleEvents, skippedYears, payLimitLabel, lapsed
  };
}
