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

function getMultTable(sex) { return sex === 'M' ? MULT_M : MULT_F; }

function calcMinSA(target, age, sex) {
  const [lo, hi] = getMultTable(sex)[Math.min(age, 64)] || [0, 0];
  // Excel 輸入頁顯示的主約保額下限使用「平均倍數」而非低倍數。
  return Math.ceil(target * (lo + hi) / 2 / 1000) * 1000;
}

function calcMaxSA(target, age, sex) {
  const [, hi] = getMultTable(sex)[Math.min(age, 64)] || [0, 0];
  return Math.min(60000000, Math.ceil(target * hi / 1000) * 1000);
}

function getHighFeeDiscount(t) {
  if (t >= 500000) return .035;
  if (t >= 300000) return .03;
  if (t >= 200000) return .02;
  if (t >= 150000) return .015;
  if (t >= 100000) return .01;
  if (t >=  60000) return .005;
  return 0;
}

/* ── 第十一條：甲型保額充足比例門檻 ──────────────────────────
   分子 = MAX(基本保額, 帳戶價值 + 當次預定投資保費)
   分母 = 帳戶價值 + 當次預定投資保費
   比值須 >= 門檻，否則不得繳交當次保費
   ──────────────────────────────────────────────────────────── */
function getSAThreshold(age) {
  if (age <= 30) return 1.90;
  if (age <= 40) return 1.60;
  if (age <= 50) return 1.40;
  if (age <= 60) return 1.20;
  if (age <= 70) return 1.10;
  if (age <= 90) return 1.02;
  return 1.00;
}

function canPayPremium(ptype, SA, avBefore, investAmt, age) {
  // 乙型不受此限制
  if (ptype !== 'A') return true;
  // investAmt = 當次預定投資保費（扣除費用後尚未配置之金額）
  const denom = avBefore + investAmt;
  if (denom <= 0) return false;
  const numer = Math.max(SA, denom);
  return (numer / denom) >= getSAThreshold(age);
}

function fmt(n) { return Math.round(n).toLocaleString('zh-TW'); }
function pct(r) { return (r * 100).toFixed(1) + '%'; }

function getExtraAtYear(yr) {
  const stages = [];
  for (let i = 1; i <= 4; i++) {
    const y = document.getElementById(`extra_yr${i}`).value;
    const a = document.getElementById(`extra_amt${i}`).value;
    if (y && a) stages.push({ yr: parseInt(y), amt: parseFloat(a) || 0 });
  }
  stages.sort((a, b) => a.yr - b.yr);
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

// 公司 Excel「超額保險費」前置費用級距。
function getSingleFeeRate(amount) {
  if (amount >= 10000000) return .025;
  if (amount >=  5000000) return .03;
  if (amount >=  2000000) return .04;
  return amount > 0 ? .05 : 0;
}

function runCalc() {
  const birth  = parseRoc(document.getElementById('bday').value.trim());
  const sex    = document.getElementById('sex').value;
  const target = parseFloat(document.getElementById('target').value) || 0;
  const ptype  = document.getElementById('ptype').value;
  const ror    = parseFloat(document.getElementById('ror').value) / 100;
  const monthly = parseFloat(document.getElementById('monthly').value) || 0;

  // 繳費期間限制（由 ui.js getPayLimit 提供）
  const payLimit = (typeof getPayLimit === 'function') ? getPayLimit() : { mode: 'none', val: 999 };

  // Validation
  if (!birth)           return { error: '生日格式錯誤，請輸入民國生日如 690831' };
  if (monthly < 2000)   return { error: '月存金額下限 2,000 元' };
  if (Math.round(monthly) % 100 !== 0) return { error: '月存金額須為百元整數' };
  if (target < 24000)   return { error: '年繳保費下限 24,000 元' };

  for (let i = 1; i <= 4; i++) {
    const amt = parseFloat(document.getElementById(`extra_amt${i}`).value) || 0;
    if (amt > 0 && amt < 1000) return { error: '分段增額每月下限 1,000 元（或留空）' };
  }

  const singleEvents = getSingleEvents();
  for (const event of singleEvents) {
    if (!Number.isInteger(event.yr) || event.yr < 1 || !event.amt) {
      return { error: `單筆增額 ${event.slot} 請同時填寫正確的投入年度與金額` };
    }
    if (!Number.isInteger(event.amt) || event.amt < 10000) {
      return { error: `單筆增額 ${event.slot} 金額最低 10,000 元，且須為整數` };
    }
  }
  if (singleEvents.length === 2 && singleEvents[0].yr === singleEvents[1].yr) {
    return { error: '兩次單筆增額請設定在不同年度' };
  }

  const iAge = calcInsureAge(birth.year, birth.month, birth.day);
  if (iAge > 64) return { error: '投保年齡超過 64 歲（甲型上限）' };

  const years  = Math.max(1, 100 - iAge);
  let lastPayYear = years;
  if (payLimit.mode === 'age' && payLimit.val < 999) lastPayYear = Math.max(0, payLimit.val - iAge);
  if (payLimit.mode === 'yr'  && payLimit.val < 999) lastPayYear = Math.min(years, payLimit.val);
  for (const event of singleEvents) {
    if (event.yr > lastPayYear) {
      return { error: `單筆增額 ${event.slot} 的第 ${event.yr} 年已超過目前設定的繳費期間` };
    }
  }
  const minSA  = calcMinSA(target, iAge, sex);
  const maxSA  = calcMaxSA(target, iAge, sex);
  let SA       = parseFloat(document.getElementById('sa').value) || minSA;
  if (SA < minSA) SA = minSA;
  SA = Math.ceil(SA / 10000) * 10000;

  const COI      = sex === 'M' ? COI_M : COI_F;
  const highDisc = getHighFeeDiscount(target);

  let av = 0, globalMonth = 0;
  const rows = [];
  let premiumStopYear = null; // 第十一條：目標保費停止的首個年度

  // 繳費期間標籤
  let payLimitLabel = '終身繳費';
  if (payLimit.mode === 'age' && payLimit.val < 999) {
    payLimitLabel = `繳費至 ${payLimit.val} 歲`;
  } else if (payLimit.mode === 'yr' && payLimit.val < 999) {
    payLimitLabel = `繳費 ${payLimit.val} 年`;
  }

  for (let yr = 1; yr <= years; yr++) {
    if (yr > 1 && av === 0) break;
    const ageStart  = iAge + yr - 1;
    const COIrate   = COI[Math.min(ageStart, 110)] || COI[110];
    const baseFee   = yr <= 5 ? BASE_FEE[yr - 1] : 0;
    const adjFee    = yr <= 5 ? Math.max(0, baseFee - highDisc - PAYWAY_DISC) : 0;
    let yFee = 0, yMgmt = 0, yCOI = 0, ySingle = 0;
    let rejectedSingle = 0;

    // 繳費期間判斷：使用者設定的停繳條件
    const userPayStop =
      (payLimit.mode === 'age' && payLimit.val < 999 && ageStart >= payLimit.val) ||
      (payLimit.mode === 'yr'  && payLimit.val < 999 && yr > payLimit.val);

    for (let mo = 1; mo <= 12; mo++) {
      globalMonth++;

      // ── 第十一條甲型檢核（僅第1個月繳目標保費時判斷）──
      // 當次預定投資保費 = 目標保費淨額 + 超額保費淨額（含當月超額）
      let O_t = (mo === 1 && !userPayStop) ? target : 0;
      let O_e = userPayStop ? 0 : getExtraAtYear(yr);
      let O_s = (mo === 1 && !userPayStop) ? getSingleAtYear(yr, singleEvents) : 0;

      // 先前年度已觸發甲型停繳時，增額保費也不得再投入。
      if (ptype === 'A' && premiumStopYear !== null && yr >= premiumStopYear) {
        if (O_s > 0) rejectedSingle += O_s;
        O_t = 0;
        O_e = 0;
        O_s = 0;
      }

      if (ptype === 'A' && mo === 1 && premiumStopYear === null && !userPayStop) {
        // 計算「當次預定投資保費金額」= 目標保費扣費用後 + 超額扣費用後 - 管理費
        const investAmt_t = O_t * (1 - adjFee);
        const investAmt_e = O_e * (1 - 0.05);
        const baseInvest  = investAmt_t + investAmt_e - 100;
        if (globalMonth > 1 && !canPayPremium('A', SA, av, baseInvest, ageStart)) {
          // 比值低於門檻，本年度起停止目標保費與定期定額
          if (premiumStopYear === null) premiumStopYear = yr;
          if (O_s > 0) rejectedSingle += O_s;
          O_t = 0;
          O_e = 0;
          O_s = 0;
        } else if (O_s > 0) {
          // 單筆增額獨立檢核；若只因這一筆超過比例，保留原本目標／定期定額。
          const singleInvest = O_s * (1 - getSingleFeeRate(O_s));
          if (!canPayPremium('A', SA, av, baseInvest + singleInvest, ageStart)) {
            rejectedSingle += O_s;
            O_s = 0;
          }
        }
      } else if (ptype === 'A' && mo > 1) {
        // 非第1月：定期定額是否繼續，跟著第1月判斷結果走
        if (premiumStopYear !== null && yr >= premiumStopYear) {
          O_e = 0;
        }
      }

      const O   = O_t + O_e + O_s;
      const U   = Math.round(O_t * adjFee) + Math.round(O_e * .05) + Math.round(O_s * getSingleFeeRate(O_s));
      const V   = 100;
      const Y   = O - U - V;
      let AC, riskSA;
      if (ptype === 'B') {
        AC = (globalMonth === 1) ? Math.max(Y, 0) : av + Y;
        riskSA = SA;
      } else if (globalMonth === 1) {
        AC = Math.max(Y, 0);
        riskSA = SA - AC;
      } else {
        AC = av + Y;
        riskSA = Math.max(SA - AC, 0);
      }
      const AB = Math.round(riskSA * COIrate / 10000);
      av = Math.max((AC - AB) * Math.pow(1 + ror, 1 / 12), 0);
      yFee  += U;
      yMgmt += V;
      yCOI  += AB;
      ySingle += O_s;
    }
    av = Math.round(av);
    const death = ptype === 'B' ? Math.round(SA + av) : Math.round(Math.max(SA, av));
    const stopped = userPayStop || (premiumStopYear !== null && yr >= premiumStopYear);
    rows.push({
      yr, age: ageStart, feeRate: adjFee,
      yearTarget: stopped ? 0 : target,
      yearExtra:  stopped ? 0 : getExtraAtYear(yr) * 12,
      yearSingle: Math.round(ySingle),
      rejectedSingle: Math.round(rejectedSingle),
      yearFee: Math.round(yFee),
      yearMgmt: Math.round(yMgmt),
      yearCOI: Math.round(yCOI),
      av, death,
      premiumStopped: stopped,
      userPayStop   // 區分使用者設定停繳 vs 第十一條強制停繳
    });
  }

  const [lo_, hi_] = getMultTable(sex)[Math.min(iAge, 64)] || [0, 0];
  const avg_       = (lo_ + hi_) / 2;
  const stages     = [];
  for (let i = 1; i <= 4; i++) {
    const y = document.getElementById(`extra_yr${i}`).value;
    const a = document.getElementById(`extra_amt${i}`).value;
    if (y && a) stages.push(`年${y}: ${fmt(parseFloat(a))}/月`);
  }

  return { rows, iAge, minSA, maxSA, SA, target, highDisc, lo_, hi_, avg_, stages, singleEvents, premiumStopYear, payLimitLabel };
}
