/* ══════════════════════════════════════════════════════════════
   und-engine.js — 富邦人壽年年吉祥變額萬能壽險（UND）共用試算引擎
   依保單條款（UNDX1151012）、投保規則與公司 Excel 建議書 V1.8 對齊。
   UND 試算頁、退休規劃表、現實人生共用，修改費率或規則只需改這裡。
   ══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* ── 費率表（條款附表五，每月每萬元淨危險保額）與保額倍數表（投保規則附表）── */
  const COI_M = {
    0:0.27,1:0.16,2:0.14,3:0.12,4:0.1,5:0.1,6:0.09,7:0.09,8:0.1,9:0.1,
    10:0.1,11:0.11,12:0.13,13:0.15,14:0.19,15:0.25,16:0.28,17:0.32,18:0.34,19:0.36,
    20:0.36,21:0.37,22:0.38,23:0.39,24:0.39,25:0.41,26:0.42,27:0.43,28:0.45,29:0.47,
    30:0.55,31:0.58,32:0.62,33:0.67,34:0.73,35:0.81,36:0.89,37:0.97,38:1.06,39:1.16,
    40:1.27,41:1.39,42:1.51,43:1.64,44:1.78,45:2.01,46:2.17,47:2.34,48:2.52,49:2.71,
    50:2.89,51:3.1,52:3.32,53:3.56,54:3.82,55:4.22,56:4.51,57:4.84,58:5.19,59:5.57,
    60:6.22,61:6.67,62:7.18,63:7.74,64:8.37,65:9.39,66:10.19,67:11.12,68:12.18,69:13.36,
    70:15.42,71:16.86,72:18.43,73:20.14,74:22.02,75:23.9,76:26.17,77:28.66,78:31.41,79:34.4,
    80:37.65,81:41.15,82:44.93,83:49.04,84:53.53,85:58.46,86:63.9,87:69.89,88:76.25,89:82.96,
    90:90.68,91:99.6,92:108.45,93:118.1,94:128.61,95:140.07,96:152.57,97:166.19,98:181.04,99:197.23,
    100:214.87,101:233.56,102:252.82,103:273.28,104:294.95,105:317.8,106:352.52,107:390.26,
    108:427.12,109:465.49,110:833.33
  };

  const COI_F = {
    0:0.21,1:0.12,2:0.1,3:0.09,4:0.08,5:0.07,6:0.07,7:0.07,8:0.06,9:0.06,
    10:0.06,11:0.06,12:0.06,13:0.07,14:0.08,15:0.11,16:0.12,17:0.13,18:0.14,19:0.15,
    20:0.15,21:0.16,22:0.16,23:0.17,24:0.17,25:0.2,26:0.21,27:0.22,28:0.23,29:0.24,
    30:0.26,31:0.28,32:0.3,33:0.32,34:0.34,35:0.37,36:0.4,37:0.43,38:0.46,39:0.5,
    40:0.55,41:0.59,42:0.64,43:0.69,44:0.74,45:0.85,46:0.91,47:0.98,48:1.05,49:1.13,
    50:1.19,51:1.27,52:1.37,53:1.46,54:1.56,55:1.8,56:1.92,57:2.06,58:2.22,59:2.41,
    60:2.77,61:3.0,62:3.27,63:3.57,64:3.91,65:4.67,66:5.12,67:5.66,68:6.27,69:6.97,
    70:8.1,71:9.0,72:10.04,73:11.21,74:12.54,75:13.61,76:15.26,77:17.12,78:19.18,79:21.47,
    80:23.99,81:26.76,82:29.82,83:33.22,84:37.01,85:41.28,86:46.09,87:51.51,88:57.6,89:64.4,
    90:71.99,91:80.42,92:89.76,93:100.11,94:111.53,95:124.14,96:138.04,97:153.31,98:170.05,99:188.36,
    100:208.32,101:229.99,102:253.43,103:278.66,104:305.67,105:334.39,106:374.03,
    107:415.61,108:463.77,109:516.22,110:833.33
  };

  const MULT_M = {
    0:[61,92],1:[61,92],2:[60,92],3:[58,92],4:[57,92],5:[57,92],6:[55,92],7:[54,92],8:[53,92],9:[52,92],
    10:[51,92],11:[50,92],12:[49,92],13:[48,92],14:[47,92],15:[46,92],16:[45,190],17:[44,190],18:[43,190],19:[43,190],
    20:[42,190],21:[41,185],22:[40,180],23:[40,175],24:[39,170],25:[38,165],26:[38,160],27:[37,155],28:[36,150],29:[35,145],
    30:[35,140],31:[34,135],32:[33,130],33:[33,125],34:[32,120],35:[31,115],36:[31,110],37:[30,105],38:[30,100],39:[29,95],
    40:[29,90],41:[28,85],42:[27,85],43:[27,80],44:[26,80],45:[26,75],46:[25,75],47:[25,70],48:[24,70],49:[24,65],
    50:[23,65],51:[23,60],52:[22,60],53:[22,55],54:[22,55],55:[21,50],56:[21,50],57:[20,45],58:[20,45],59:[19,40],
    60:[19,40],61:[18,35],62:[18,35],63:[17,30],64:[17,30],
    // 65–70 歲僅乙型（UNDB）可投保
    65:[16,25],66:[16,25],67:[16,25],68:[15,20],69:[15,20],70:[14,16]
  };

  const MULT_F = {
    0:[69,92],1:[68,92],2:[66,92],3:[65,92],4:[65,92],5:[65,92],6:[61,92],7:[60,92],8:[59,92],9:[58,92],
    10:[57,92],11:[56,92],12:[55,92],13:[53,92],14:[52,92],15:[52,92],16:[50,240],17:[50,240],18:[49,240],19:[48,240],
    20:[47,240],21:[46,230],22:[45,225],23:[44,220],24:[43,215],25:[43,210],26:[41,200],27:[41,195],28:[40,190],29:[39,185],
    30:[39,180],31:[38,170],32:[37,165],33:[36,160],34:[36,155],35:[35,150],36:[34,140],37:[34,135],38:[33,130],39:[32,125],
    40:[32,120],41:[31,110],42:[31,105],43:[30,100],44:[29,95],45:[29,90],46:[28,90],47:[28,85],48:[27,85],49:[27,80],
    50:[26,80],51:[26,70],52:[25,70],53:[25,65],54:[24,65],55:[24,60],56:[23,60],57:[23,55],58:[22,55],59:[22,50],
    60:[21,50],61:[21,45],62:[20,45],63:[20,40],64:[19,40],
    65:[19,35],66:[18,35],67:[18,30],68:[17,30],69:[17,25],70:[16,25]
  };

  const BASE_FEE   = [.60, .35, .25, .15, .15];   // 保險費年度 1–5，第 6 年起 0%
  const PAYWAY_DISC = .01;                          // 繳費方式折扣（第 1–5 保險費年度）

  // 繳費方式折扣適用範圍（依公司 Excel：首期限轉帳／富邦信用卡，續期另含自行繳費）
  const PAYWAY_FIRST_DISC = { transfer: true, card: true, remit: false };
  const PAYWAY_RENEW_DISC = { transfer: true, card: true, self: true, remit: false };

  const MAX_AGE_BY_TYPE   = { A: 64, B: 70 };
  const LAST_INSURE_AGE   = 110;        // 保險年齡 110 歲為最後一個保單年度
  const SA_HARD_MIN       = 100000;     // 最低基本保額 10 萬
  const SA_HARD_MAX       = 60000000;   // 最高基本保額 6,000 萬
  const PREMIUM_CUM_MAX   = 60000000;   // 累計目標＋超額保費上限 6,000 萬
  const CHILD_TARGET      = 7500;       // 未滿 15 足歲：限年繳 7,500 元
  const EXCESS_TARGET_MULT = 100;       // 同一保單年度超額保費 ≤ 目標保費 100 倍
  const ROR_MIN = -20, ROR_MAX = 20;    // 預估年投報率範圍（%）

  /* ── 保額倍數與費用 ───────────────────────────── */
  function getMult(age, sex) { return (sex === 'M' ? MULT_M : MULT_F)[age] || null; }

  // 投保規則：下限取「最低與最高倍數的平均值」，無條件進位至千元，且不低於 10 萬
  function calcMinSA(target, age, sex) {
    const mult = getMult(age, sex);
    if (!mult) return 0;
    const [lo, hi] = mult;
    const v = Math.ceil(target * (lo + hi) / 2 / 1000) * 1000;
    return Math.min(SA_HARD_MAX, Math.max(SA_HARD_MIN, v));
  }

  // 投保規則：上限無條件捨去至千元（單一倍數時進位），且不超過 6,000 萬
  function calcMaxSA(target, age, sex) {
    const mult = getMult(age, sex);
    if (!mult) return 0;
    const [lo, hi] = mult;
    const raw = target * hi / 1000;
    const v = (lo === hi ? Math.ceil(raw) : Math.floor(raw)) * 1000;
    return Math.min(SA_HARD_MAX, v);
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

  // 超額保險費前置費用級距
  function getExcessFeeRate(amount) {
    if (amount >= 10000000) return .025;
    if (amount >=  5000000) return .03;
    if (amount >=  2000000) return .04;
    return amount > 0 ? .05 : 0;
  }

  /* ── 第十一條：保額比例門檻（甲型、乙型皆適用）──────────────
     比例 = 分子 ÷（帳戶價值 + 當次預定投資保費）≥ 門檻，始得繳交該次保費
     甲型分子 = MAX(基本保額, 帳戶價值 + 當次預定投資保費)
     乙型分子 = 基本保額 + 帳戶價值 + 當次預定投資保費
     未滿 15 足歲：甲型分子 = MAX(基本保額 − (帳戶價值 + 預定投資), 0)；乙型分子 = 基本保額
     ──────────────────────────────────────────────────────── */
  function getSAThreshold(age) {
    if (age <= 30) return 1.90;
    if (age <= 40) return 1.60;
    if (age <= 50) return 1.40;
    if (age <= 60) return 1.20;
    if (age <= 70) return 1.10;
    if (age <= 90) return 1.02;
    return 1.00;
  }

  function round8(n) { return Math.round(n * 1e8) / 1e8; }

  // denom = 帳戶價值 + 當次預定投資保費（依 Excel：保費扣「未折扣」保費費用）
  function canPayPremium(ptype, SA, denom, age, before15) {
    if (denom <= 0) return true;
    let numer;
    if (ptype === 'A') numer = before15 ? Math.max(SA - denom, 0) : Math.max(SA, denom);
    else               numer = before15 ? SA : SA + denom;
    return round8(denom * getSAThreshold(age)) <= round8(numer);
  }

  /* ── 逐月模擬（對齊公司 Excel 建議書 V1.8「計算內容」）────────
     opts:
       iAge          投保年齡（保險年齡）
       sex           'M' | 'F'
       ptype         'A' 甲型 | 'B' 乙型
       target        年繳目標保費（每年第 1 個月繳入）
       SA            基本保額
       ror           預估年投報率（小數，例如 0.06）
       lastPayYear   最後一個繳費保單年度（含）
       extraAtYear   (yr) => 當年度每月定期定額超額保費
       singleAtYear  (yr) => 當年度第 1 個月單筆超額保費
       firstDisc     首期繳費方式折扣（0 或 0.01）
       renewDisc     續期繳費方式折扣（0 或 0.01）
       monthsBefore15  第幾個保單月（含）以前未滿 15 足歲（成人為 0）
     回傳每保單年度一列，直到保險年齡 110 歲或帳戶價值歸零
     ──────────────────────────────────────────────────────── */
  function simulate(opts) {
    const {
      iAge, sex, ptype, target, SA, ror,
      lastPayYear = LAST_INSURE_AGE + 1 - iAge,
      extraAtYear = () => 0,
      singleAtYear = () => 0,
      firstDisc = PAYWAY_DISC, renewDisc = PAYWAY_DISC,
      monthsBefore15 = 0
    } = opts;
    const years    = LAST_INSURE_AGE + 1 - iAge;
    const COI      = sex === 'M' ? COI_M : COI_F;
    const highDisc = getHighFeeDiscount(target);

    let av = 0, globalMonth = 0, cumPaid = 0, targetPaidCount = 0;
    const rows = [];

    for (let yr = 1; yr <= years; yr++) {
      const ageStart    = iAge + yr - 1;
      const COIrate     = COI[Math.min(ageStart, 110)];
      const userPayStop = yr > lastPayYear;
      const extraAmt    = userPayStop ? 0 : (extraAtYear(yr) || 0);
      const singleAmt   = userPayStop ? 0 : (singleAtYear(yr) || 0);
      let yFee = 0, yMgmt = 0, yCOI = 0;
      let yTarget = 0, yExtra = 0, ySingle = 0;
      let targetSkipped = false, rejectedSingle = 0, rejectedExtra = 0, capHit = false;
      let feeRate = 0, before15Any = false;

      for (let mo = 1; mo <= 12; mo++) {
        globalMonth++;
        const before15 = globalMonth <= monthsBefore15;
        if (before15) before15Any = true;
        const avPrev = av;

        // 本期預定繳費
        let O_t = (mo === 1 && !userPayStop) ? target : 0;
        let O_s = (mo === 1) ? singleAmt : 0;
        let O_e = extraAmt;

        // 保險費年度（依已繳目標保費次數）決定保費費用率
        const premYear = targetPaidCount + 1;
        const baseFee  = premYear <= 5 ? BASE_FEE[premYear - 1] : 0;
        const F = O_t - Math.round(O_t * baseFee);         // 第十一條用：預定投資（未折扣費率）

        if (globalMonth > 1) {
          // 第十一條逐期判斷（不永久停繳，門檻調降後可恢復）
          if (O_t > 0 && !canPayPremium(ptype, SA, avPrev + F, ageStart, before15)) {
            O_t = 0; targetSkipped = true;
          }
          const G = O_s - Math.round(O_s * getExcessFeeRate(O_s));
          if (O_s > 0 && !canPayPremium(ptype, SA, avPrev + F + G, ageStart, before15)) {
            rejectedSingle += O_s; O_s = 0;
          }
          const Gact = O_s - Math.round(O_s * getExcessFeeRate(O_s));
          const H = O_e - Math.round(O_e * getExcessFeeRate(O_e));
          if (O_e > 0 && !canPayPremium(ptype, SA, avPrev + F + Gact + H, ageStart, before15)) {
            rejectedExtra += O_e; O_e = 0;
          }
        }

        // 累計保費 6,000 萬上限
        if (O_t > 0 && cumPaid + O_t > PREMIUM_CUM_MAX) { O_t = 0; capHit = true; }
        if (O_s > 0 && cumPaid + O_t + O_s > PREMIUM_CUM_MAX) { rejectedSingle += O_s; O_s = 0; capHit = true; }
        if (O_e > 0 && cumPaid + O_t + O_s + O_e > PREMIUM_CUM_MAX) { rejectedExtra += O_e; O_e = 0; capHit = true; }

        let adjFee = 0;
        if (O_t > 0) {
          const payDisc = targetPaidCount === 0 ? firstDisc : renewDisc;
          adjFee = premYear <= 5 ? Math.max(0, baseFee - highDisc - payDisc) : 0;
          feeRate = adjFee;
          targetPaidCount++;
        }

        const O = O_t + O_e + O_s;
        cumPaid += O;
        const U = Math.round(O_t * adjFee) + Math.round(O_e * getExcessFeeRate(O_e)) + Math.round(O_s * getExcessFeeRate(O_s));
        const V = (globalMonth === 1 || avPrev > 0) ? 100 : 0;
        const Y = O - U - V;
        const AC = globalMonth === 1 ? Math.max(Y, 0) : Math.max(avPrev + Y, 0);
        let riskSA;
        if (ptype === 'B')          riskSA = SA;
        else if (globalMonth === 1) riskSA = SA - (O - U);
        else                        riskSA = Math.max(SA - AC, 0);
        const AB = (globalMonth > 1 && AC === 0) ? 0 : Math.round(riskSA * COIrate / 10000);
        av = Math.max((AC - AB) * Math.pow(1 + ror, 1 / 12), 0);

        yFee += U; yMgmt += V; yCOI += AB;
        yTarget += O_t; yExtra += O_e; ySingle += O_s;
      }

      const avR = Math.round(av);
      const death = avR === 0 ? 0 : (ptype === 'B' ? Math.round(SA + av) : Math.round(Math.max(SA, av)));
      rows.push({
        yr, age: ageStart, feeRate,
        yearTarget: yTarget,
        yearExtra:  yExtra,
        yearSingle: ySingle,
        rejectedSingle, rejectedExtra,
        yearFee: Math.round(yFee),
        yearMgmt: Math.round(yMgmt),
        yearCOI: Math.round(yCOI),
        av: avR, death,
        cumPaid: Math.round(cumPaid),
        targetSkipped,          // 第十一條：本年度目標保費暫停
        capHit,                 // 累計 6,000 萬上限
        userPayStop,            // 使用者設定的繳費期間已到
        before15: before15Any   // 未滿 15 足歲期間
      });
      if (av <= 0) break;       // 帳戶價值歸零，契約停效
    }
    return rows;
  }

  /* ── 退休規劃：找出「退休當年帳戶價值 ≥ 目標本金」的最低月存 ──────
     退休規劃表與現實人生共用。月存先放目標保費（每月上限 1 萬），
     超過部分以 500 元為級距轉為定期定額超額保費（每月至少 1,000 元）。
     繳費至退休年齡（含退休當年）；64 歲以下用甲型，65–70 歲改用乙型。
     保額取投保規則下限；若下限會因第十一條擋下保費，自動調高到
     「繳費期間保費都能繳入」的最低保額（不超過最高保額）。
     ──────────────────────────────────────────────────────── */
  const RETIRE_MAX_MONTHLY_TARGET = 10000;
  const RETIRE_STEP = 500;
  const RETIRE_MIN_MONTHLY = 2000;
  const RETIRE_MAX_MONTHLY = 200000;

  function retirementTrial(S, totalMonthly) {
    const iAge = Math.round(S.currentAge);
    const sex = S.gender === 'F' ? 'F' : 'M';
    const ptype = iAge <= MAX_AGE_BY_TYPE.A ? 'A' : 'B';
    const workYears = S.retirementAge - iAge;
    const payYears = workYears + 1;
    const ms = Math.max(RETIRE_MIN_MONTHLY, Math.min(RETIRE_MAX_MONTHLY_TARGET, totalMonthly));
    let me = Math.max(0, Math.round((totalMonthly - ms) / RETIRE_STEP) * RETIRE_STEP);
    if (me > 0 && me < 1000) me = 1000;
    const at = ms * 12;
    const ror = S.assumedReturn / 100;

    const run = SA => simulate({
      iAge, sex, ptype, target: at, SA, ror, lastPayYear: payYears, extraAtYear: () => me
    });
    const blocked = rows => rows.slice(0, payYears).some(r => r.targetSkipped || r.rejectedExtra > 0);

    let si = calcMinSA(at, iAge, sex);
    let rows = iAge > MAX_AGE_BY_TYPE.B ? [] : run(si);
    let saRaised = false;
    if (rows.length && blocked(rows)) {
      const maxSA = calcMaxSA(at, iAge, sex);
      const maxRows = run(maxSA);
      if (blocked(maxRows)) {
        si = maxSA; rows = maxRows;
      } else {
        let lo = si, hi = maxSA;                 // 以千元為單位二分搜尋
        while (hi - lo > 1000) {
          const mid = Math.round((lo + hi) / 2 / 1000) * 1000;
          if (blocked(run(mid))) lo = mid; else hi = mid;
        }
        si = hi; rows = run(hi);
      }
      saRaised = true;
    }
    const sw = Math.round(si / 1000) / 10;   // 萬元（保額以千元為單位，顯示到小數 1 位）

    // 與原畫面相容的欄位：year / age / av / db / sv / cum（只列到繳費期滿）
    const res = rows.slice(0, payYears).map(r => ({
      year: r.yr, age: r.age, av: r.av, db: r.death, sv: r.av, cum: r.cumPaid
    }));
    const idx = Math.min(workYears, res.length - 1);
    return { sv: idx >= 0 ? res[idx].sv : 0, ms, me, at, sw, si, res, ptype, saRaised };
  }

  function retirementGoalSeek(S, capDist) {
    let lo = RETIRE_MIN_MONTHLY, hi = RETIRE_MAX_MONTHLY;
    const first = retirementTrial(S, lo);
    if (first.sv >= capDist) return Object.assign(first, { reached: true });
    const top = retirementTrial(S, hi);
    if (top.sv < capDist) return Object.assign(top, { reached: false });   // 上限月存仍不足
    for (let i = 0; i < 40; i++) {
      const mid = Math.round((lo + hi) / 2 / RETIRE_STEP) * RETIRE_STEP;
      if (mid <= lo || mid >= hi) break;
      if (retirementTrial(S, mid).sv >= capDist) hi = mid; else lo = mid;
    }
    let best = hi;
    // 微調：往下找仍達標的最低月存
    while (best - RETIRE_STEP >= RETIRE_MIN_MONTHLY && retirementTrial(S, best - RETIRE_STEP).sv >= capDist) best -= RETIRE_STEP;
    return Object.assign(retirementTrial(S, best), { reached: true });
  }

  global.UNDEngine = Object.freeze({
    version: '2026-11-03',
    COI_M, COI_F, MULT_M, MULT_F, BASE_FEE, PAYWAY_DISC,
    PAYWAY_FIRST_DISC, PAYWAY_RENEW_DISC, MAX_AGE_BY_TYPE, LAST_INSURE_AGE,
    SA_HARD_MIN, SA_HARD_MAX, PREMIUM_CUM_MAX, CHILD_TARGET, EXCESS_TARGET_MULT, ROR_MIN, ROR_MAX,
    getMult, calcMinSA, calcMaxSA, getHighFeeDiscount, getExcessFeeRate,
    getSAThreshold, canPayPremium, simulate,
    retirementTrial, retirementGoalSeek
  });
})(window);
