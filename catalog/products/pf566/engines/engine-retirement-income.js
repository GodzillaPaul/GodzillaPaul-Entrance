// ============================================================
// engine-retirement-income.js
// 引擎類型：retirement_income（生存保險型分紅）
// 來源：PFWX main.js 既有引擎，已驗證對齊富邦原 Excel
// 依賴：window.RATES、window.PDATA（由 products/<CODE>/data.js 提供）
// ============================================================

(function (root) {
  'use strict';

  // ── 工具函式 ─────────────────────────────────────
  function tw(n) { return Math.round(n).toLocaleString('zh-TW'); }

  function calcInsAge(bday, today) {
    let b = String(bday).replace(/[\/\-]/g, '');
    let y, m, d;
    if (b.length === 6) { y = +b.slice(0, 2) + 1911; m = +b.slice(2, 4); d = +b.slice(4, 6); }
    else if (b.length === 7) { y = +b.slice(0, 3) + 1911; m = +b.slice(3, 5); d = +b.slice(5, 7); }
    else return null;
    if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) return null;
    let age = today.getFullYear() - y;
    let bd = new Date(today.getFullYear(), m - 1, d);
    let hd = new Date(today.getFullYear(), m - 1, d);
    hd.setDate(hd.getDate() + 183);
    if (today < bd) age--;
    if (today >= hd) age++;
    return age;
  }

  // ── 折扣計算（PFW 規則：保額分檔 + 1% base） ──────
  // 注意：這裡的「保額分檔」是按 amtWan(萬保額)，不是按年齡。
  function getMaxAmount(age, sumLimits) {
    for (const seg of sumLimits) {
      if (age <= seg.ageMax) return seg.max;
    }
    return sumLimits[sumLimits.length - 1].max;
  }

  function getHighAmtDisc(amtWan, highAmountRules) {
    let pct = 0;
    for (const r of highAmountRules) {
      if (amtWan >= r.minSum) pct = r.pct;
    }
    return pct;
  }

  function getDiscRate(amtWan, discountConfig) {
    const high = getHighAmtDisc(amtWan, discountConfig.highAmount);
    return Math.min(discountConfig.paymentMethod + high, discountConfig.cap);
  }

  // ── PDATA lookup ─────────────────────────────────
  function pdGet(table, key, yr) {
    const row = root.PDATA[table] && root.PDATA[table][key];
    if (!row) return 0;
    return row[yr - 1] || 0;
  }

  function pvfbGet(table, key, yr) {
    const row = root.PDATA[table] && root.PDATA[table][key];
    if (!row) return 0;
    return row[yr] || 0;
  }

  // PF65 六年期官方畫面反推校正係數。
  // 基準：男性 40 歲、11.1 萬美元；係數是「畫面值 ÷ 舊引擎值」。
  // 保額交叉驗證（5 / 11.1 / 20 萬）顯示比例可線性延伸。
  const SIX_YEAR_BASE_CALIBRATION = {
    1: {
      years: [6,7,8,9,10,11,12,13,14,15,16],
      surr: [0.99983727,0.99979952,0.99971511,0.99972996,0.99974389,0.99973728,0.99968617,0.99966985,0.99965536,0.99961525,0.99960551],
      death: [0.99987796,0.99982754,0.99975284,0.99973760,0.99972412,0.99971235,0.99965560,0.99964519,0.99963618,0.99958215,0.99955564]
    },
    2: {
      years: [6,7,8,9,10,11,12,13,14,15,16],
      surr: [0.99711393,0.99649998,0.99583333,0.99524380,0.99466826,0.99522006,0.99477124,0.99432813,0.99391780,0.99350485,0.99312707],
      death: [0.99770149,0.99716643,0.99660658,0.99609038,0.99560377,0.99512549,0.99645798,0.99593392,0.99542816,0.99495237,0.99449677]
    },
    3: {
      years: [6,7,8,9,10,11,12,13,14,15,16,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55],
      surr: [0.99722371,0.99641678,0.99560143,0.99482831,0.99412026,0.99466553,0.99410234,0.99356938,0.99304985,0.99256326,0.99210166,0.99042799,0.99005323,0.98969285,0.98934900,0.98902256,0.98917692,0.98935072,0.98951714,0.98970956,0.98991065,0.99012725,0.99036398,0.99059594,0.99085584,0.99112802,0.99142427,0.99324775,0.99370135,0.99418086,0.99469938,0.99525949,0.99585630,0.99649889,0.99720260,0.99796383,0.99877950,0.99967200,1.00061816,1.00162553,1.00270255,1.00385781,1.00509271],
      death: [0.99780064,0.99710628,0.99641945,0.99575469,0.99513368,0.99454145,0.99619205,0.99555399,0.99494873,0.99437025,0.99381944,0.99182479,0.99137861,0.99189784,0.99144875,0.99102937,0.99063307,0.99080181,0.99096912,0.99115421,0.99135684,0.99156855,0.99179347,0.99285843,0.99311449,0.99338758,0.99367921,0.99549247,0.99594056,0.99640784,0.99692411,0.99747963,0.99805929,0.99870536,0.99939790,1.00014500,1.00094333,1.00181426,1.00273539,1.00393305,1.00496976,1.00607099,1.00723658]
    },
    4: {
      years: [6,7,8,9,10,11,12,13,14,15,16],
      surr: [0.99824926,0.99748746,0.99673225,0.99602346,0.99537676,0.99574330,0.99523057,0.99474254,0.99426683,0.99381833,0.99339133],
      death: [0.99861885,0.99797795,0.99734481,0.99674415,0.99618008,0.99564662,0.99716388,0.99657653,0.99601812,0.99547928,0.99496603]
    },
    5: {
      years: [6,7,8,9,10,11,12,13,14,15,16],
      surr: [0.99941408,0.99890821,0.99841204,0.99793959,0.99751204,0.99764711,0.99731010,0.99699014,0.99668684,0.99639645,0.99611937],
      death: [0.99954039,0.99912407,0.99871202,0.99831606,0.99794886,0.99759290,0.99857764,0.99818863,0.99783505,0.99748348,0.99715107]
    }
  };

  const SIX_YEAR_SPECIAL_CALIBRATION = {
    PF65060250: {
      3: [
        {
          years: [6,7,8,9,10,11,12,13,14,15,16],
          surr: [0.99717718,0.99638960,0.99558257,0.99482735,0.99413105,0.99466613,0.99412413,0.99360176,0.99308644,0.99324945,0.99343282],
          death: [0.99629074,0.99598903,0.99563861,0.99530413,0.99499169,0.99460399,0.99438619,0.99408324,0.99379203,0.99349702,0.99374038]
        },
        {
          years: [34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49],
          surr: [0.99991030,1.00058825,1.00132248,1.00210846,1.00297692,1.00392387,1.00495656,1.00606297,1.00725906,1.00853833,1.00996372,1.01149472,1.01316497,1.01495695,1.01689507,0.91915252],
          death: [1.00104306,1.00171146,1.00240960,1.00318754,1.00401879,1.00493166,1.00592430,1.00697657,1.00840270,1.00962247,1.01096634,1.01239364,1.01393722,1.01561494,1.01740248,1.01930792]
        }
      ]
    },
    PF60060140: {
      3: [{
        years: [6,7,8,9,10,11,12,13,14,15,16],
        surr: [0.99723010,0.99645082,0.99562924,0.99486851,0.99417582,0.99472600,0.99416912,0.99363062,0.99311895,0.99262997,0.99216281],
        death: [0.99781340,0.99713333,0.99643636,0.99577480,0.99517818,0.99460733,0.99623349,0.99561094,0.99499457,0.99441102,0.99385896]
      }]
    },
    PF55060140: {
      3: [{
        years: [6,7,8,9,10,11,12,13,14,15,16],
        surr: [0.99726602,0.99649068,0.99569090,0.99493576,0.99424087,0.99476722,0.99421416,0.99367760,0.99318340,0.99327950,0.99338129],
        death: [0.99783214,0.99716770,0.99649716,0.99584776,0.99524595,0.99465459,0.99628557,0.99565287,0.99504935,0.99448083,0.99456894]
      }]
    }
  };

  function curveValue(curve, field, year) {
    if (!curve || !curve.years || !curve.years.length) return 1;
    const years = curve.years;
    const values = curve[field];
    if (year <= years[0]) return values[0];
    for (let i = 0; i < years.length; i++) {
      if (year === years[i]) return values[i];
      if (year < years[i]) {
        const span = years[i] - years[i - 1];
        const pct = (year - years[i - 1]) / span;
        return values[i - 1] + (values[i] - values[i - 1]) * pct;
      }
    }
    return values[values.length - 1];
  }

  function sixYearCalibrationFactor(key, paidYears, field, year) {
    const specialByYear = SIX_YEAR_SPECIAL_CALIBRATION[key] && SIX_YEAR_SPECIAL_CALIBRATION[key][paidYears];
    if (specialByYear) {
      for (const curve of specialByYear) {
        const first = curve.years[0];
        const last = curve.years[curve.years.length - 1];
        if (year >= first && year <= last) return curveValue(curve, field, year);
      }
    }

    const base = SIX_YEAR_BASE_CALIBRATION[paidYears];
    if (!base) return 1;
    if (paidYears === 3 || year <= 16) return curveValue(base, field, year);

    // 其他繳費年數的長期外推：依各自第 16 年偏移幅度，
    // 沿用已取得第 20–55 年畫面的繳 3 年曲線。
    const paid3 = SIX_YEAR_BASE_CALIBRATION[3];
    const anchor = curveValue(base, field, 16) - 1;
    const anchor3 = curveValue(paid3, field, 16) - 1;
    if (Math.abs(anchor3) < 1e-9) return 1;
    return 1 + (curveValue(paid3, field, year) - 1) * (anchor / anchor3);
  }

  // ── 核心：完整給付試算表 ──────────────────────────
  function computeBenefitTable(prod6, gender, age, amount, bonusType) {
    bonusType = bonusType || 2;
    const g = String(gender).padStart(2, '0');
    const a = String(age).padStart(2, '0');
    const key = prod6 + g + a;
    const bonukey = key + bonusType;

    const rate = root.PDATA.GP[key];
    if (!rate) return null;

    let cumN = 0, cumSurv = 0;
    const results = [];
    const maxYr = Math.min(99 - age, 111);

    for (let yr = 1; yr <= maxYr; yr++) {
      const idx = yr - 1;
      const ageYr = age + yr - 1;

      const diePwCheck = pdGet('DIE', key, yr);
      if (!diePwCheck && yr > 6) break;

      // 年度保單紅利 K
      const bonu = pdGet('BONU', bonukey, yr);
      const K = Math.ceil(amount * bonu) + Math.ceil((cumN / 10000) * bonu);

      // 增購保額 M
      const pvfbNext = pvfbGet('PVFB', key, yr);
      const pvfb0Next = pvfbGet('PVFB0', key, yr);
      const M = pvfbNext > 0 ? Math.round(K / (pvfbNext / 10000)) : 0;
      cumN += M;

      // 身故金
      const diePw = pdGet('DIE', key, yr);
      const die2Pw = pdGet('_DIE2', key, yr);
      const bonudiePw = pdGet('BONUDIE', bonukey, yr);
      const death = Math.ceil(diePw * amount)
        + Math.ceil(die2Pw * cumN / 10000)
        + Math.ceil(bonudiePw * amount);

      // 解約金
      const cvPw = pdGet('CV', key, yr);
      const bonucvPw = pdGet('BONUCV', bonukey, yr);
      const surr = Math.ceil(cvPw * amount)
        + Math.ceil(pvfb0Next * cumN / 10000)
        + Math.ceil(bonucvPw * amount);

      // 生存保險金（PFW 特有）
      const srvPw = pdGet('SRV', key, yr);
      const survYr = Math.ceil(srvPw * amount) + Math.ceil(srvPw * cumN / 10000);
      cumSurv += survYr;

      results.push({ yr: yr, age: ageYr, death: death, surr: surr, surv: survYr, cumSurv: cumSurv });
    }
    return results;
  }

  // ── 減額繳清情境（假設於保單週年日辦理）──────────────
  // PA 係數單位為「美元／每萬美元原始保額」。
  // 辦理當年先以原保額計算當年紅利，週年日起改用減額繳清保額。
  function computePaidUpBenefitTable(prod6, gender, age, originalAmount, paidYears, bonusType) {
    bonusType = bonusType || 2;
    const g = String(gender).padStart(2, '0');
    const a = String(age).padStart(2, '0');
    const key = prod6 + g + a;
    const bonukey = key + bonusType;
    const factors = root.PAID_UP_DATA && root.PAID_UP_DATA[key];
    const factor = factors && factors[paidYears - 1];

    if (!root.PDATA.GP[key] || !factor || paidYears < 1) return null;

    // 與 Excel 總表公式一致：ROUNDUP(PA 係數 × 萬元保額, 0)
    const paidUpUSD = Math.ceil(factor * originalAmount);
    const paidUpAmount = paidUpUSD / 10000;
    const originalUSD = originalAmount * 10000;

    // 三年期截圖反推規則（PF65；已以男女 20/30/40/50 歲、5/11.1/20 萬保額交叉驗證）：
    // 1. 辦理後的正常試算值按 PA 比例縮放。
    // 2. 第 2 年辦理時，補回縮放會扣掉、但已在辦理前形成的第 2 年紅利權益。
    // 這和把辦理前累積增額保額繼續逐年複利的舊推估不同。
    if (String(prod6).slice(-2) === '03' && paidYears <= 2) {
      const normalRows = computeBenefitTable(prod6, gender, age, originalAmount, bonusType);
      if (!normalRows) return null;

      const paidUpRatio = factor / 10000;
      let retainedSurr = 0;
      let retainedDeath = 0;

      if (paidYears === 2) {
        const bonus2 = pdGet('BONU', bonukey, 2);
        const originalBonus2 = Math.ceil(originalAmount * bonus2);
        const retainedBonusCash = originalBonus2 * (1 - paidUpRatio);
        const pvfbAtConversion = pvfbGet('PVFB', key, 2);
        const die2AtConversion = pdGet('_DIE2', key, 2);

        retainedSurr = Math.round(retainedBonusCash);
        if (pvfbAtConversion > 0) {
          const retainedAddedAmount = retainedBonusCash / (pvfbAtConversion / 10000);
          retainedDeath = Math.floor(retainedAddedAmount * die2AtConversion / 10000);
        }
      }

      let alignedCumSurv = 0;
      const alignedRows = normalRows.map(function (row) {
        if (row.yr <= paidYears) {
          alignedCumSurv += row.surv;
          return Object.assign({}, row, {
            baseAmountUSD: Math.round(originalUSD),
            isPaidUp: false,
            paidUpAt: false
          });
        }

        const survYr = Math.round(row.surv * paidUpRatio);
        alignedCumSurv += survYr;
        return {
          yr: row.yr,
          age: row.age,
          death: Math.ceil(row.death * paidUpRatio) + retainedDeath,
          surr: Math.round(row.surr * paidUpRatio) + retainedSurr,
          surv: survYr,
          cumSurv: alignedCumSurv,
          baseAmountUSD: Math.floor(originalUSD * paidUpRatio),
          isPaidUp: true,
          paidUpAt: row.yr === paidYears + 1
        };
      });

      return {
        rows: alignedRows,
        paidUpUSD: paidUpUSD,
        originalUSD: originalUSD,
        retainedPct: originalUSD > 0 ? paidUpUSD / originalUSD : 0,
        factor: factor,
        paidYears: paidYears,
        method: 'paid-up-ratio-aligned'
      };
    }

    let cumN = 0, cumSurv = 0;
    const results = [];
    const maxYr = Math.min(99 - age, 111);

    for (let yr = 1; yr <= maxYr; yr++) {
      const ageYr = age + yr - 1;
      const diePwCheck = pdGet('DIE', key, yr);
      if (!diePwCheck && yr > 6) break;

      // 當年紅利：辦理當年尚以原保額計，次年起以減額後保額計。
      const bonusBase = yr <= paidYears ? originalAmount : paidUpAmount;
      const bonu = pdGet('BONU', bonukey, yr);
      const K = Math.ceil(bonusBase * bonu) + Math.ceil((cumN / 10000) * bonu);
      const pvfbNext = pvfbGet('PVFB', key, yr);
      const pvfb0Next = pvfbGet('PVFB0', key, yr);
      const M = pvfbNext > 0 ? Math.round(K / (pvfbNext / 10000)) : 0;
      cumN += M;

      // 選定年度末先列示原契約數值；自下一保單年度起才顯示減額繳清後結果。
      // 例如「繳 2 年」：第 1、2 年仍是原契約，第 3 年起套用減額繳清保額。
      const activeAmount = yr <= paidYears ? originalAmount : paidUpAmount;
      const diePw = pdGet('DIE', key, yr);
      const die2Pw = pdGet('_DIE2', key, yr);
      const bonudiePw = pdGet('BONUDIE', bonukey, yr);
      const death = Math.ceil(diePw * activeAmount)
        + Math.ceil(die2Pw * cumN / 10000)
        + Math.ceil(bonudiePw * activeAmount);

      const cvPw = pdGet('CV', key, yr);
      const bonucvPw = pdGet('BONUCV', bonukey, yr);
      const surr = Math.ceil(cvPw * activeAmount)
        + Math.ceil(pvfb0Next * cumN / 10000)
        + Math.ceil(bonucvPw * activeAmount);

      const srvPw = pdGet('SRV', key, yr);
      const survYr = Math.ceil(srvPw * activeAmount) + Math.ceil(srvPw * cumN / 10000);
      cumSurv += survYr;

      results.push({
        yr: yr,
        age: ageYr,
        death: death,
        surr: surr,
        surv: survYr,
        cumSurv: cumSurv,
        baseAmountUSD: Math.round(activeAmount * 10000),
        isPaidUp: yr > paidYears,
        paidUpAt: yr === paidYears + 1
      });
    }

    // 六年期畫面規則：辦理年度後至第 5 年為「濃縮」區間，
    // 第 6 年起才列示減額繳清後的完整給付。解約金與身故金以
    // 已取得的官方試算畫面校正；生存金則按 PA 減額比例縮放。
    if (String(prod6).slice(-2) === '06') {
      const normalRows = computeBenefitTable(prod6, gender, age, originalAmount, bonusType);
      if (!normalRows) return null;

      const paidUpRatio = factor / 10000;
      let alignedCumSurv = 0;
      const alignedRows = results.map(function (row) {
        if (row.yr <= paidYears) {
          alignedCumSurv += row.surv;
          return Object.assign({}, row, {
            cumSurv: alignedCumSurv,
            baseAmountUSD: Math.round(originalUSD),
            isPaidUp: false,
            paidUpAt: false,
            isCompressed: false
          });
        }

        if (row.yr < 6) {
          return Object.assign({}, row, {
            death: 0,
            surr: 0,
            surv: 0,
            cumSurv: alignedCumSurv,
            baseAmountUSD: Math.round(paidUpUSD),
            isPaidUp: true,
            paidUpAt: false,
            isCompressed: true
          });
        }

        const normalRow = normalRows[row.yr - 1] || { surv: 0 };
        const survYr = Math.round(normalRow.surv * paidUpRatio);
        alignedCumSurv += survYr;
        return Object.assign({}, row, {
          death: Math.round(row.death * sixYearCalibrationFactor(key, paidYears, 'death', row.yr)),
          surr: Math.round(row.surr * sixYearCalibrationFactor(key, paidYears, 'surr', row.yr)),
          surv: survYr,
          cumSurv: alignedCumSurv,
          baseAmountUSD: Math.round(paidUpUSD),
          isPaidUp: true,
          paidUpAt: row.yr === 6,
          isCompressed: false
        });
      });

      return {
        rows: alignedRows,
        paidUpUSD: paidUpUSD,
        originalUSD: originalUSD,
        retainedPct: originalUSD > 0 ? paidUpUSD / originalUSD : 0,
        factor: factor,
        paidYears: paidYears,
        method: 'paid-up-six-year-screenshot-aligned'
      };
    }

    return {
      rows: results,
      paidUpUSD: paidUpUSD,
      originalUSD: originalUSD,
      retainedPct: originalUSD > 0 ? paidUpUSD / originalUSD : 0,
      factor: factor,
      paidYears: paidYears
    };
  }

  // ── 反推：六年總存 → 保額 ────────────────────────
  function amtWanFrom6YrTotal(sixYrTWD, gender, age, prod, exrate, discountConfig) {
    const g = gender === 1 ? 'M' : 'F';
    const ratePerWan = root.RATES[prod] && root.RATES[prod][g] && root.RATES[prod][g][age];
    if (!ratePerWan) return null;
    let amtWan = sixYrTWD / (6 * ratePerWan * 0.97 * exrate);
    for (let i = 0; i < 5; i++) {
      const disc = getDiscRate(amtWan, discountConfig);
      amtWan = sixYrTWD / (6 * ratePerWan * (1 - disc) * exrate);
    }
    return Math.round(amtWan * 10) / 10;
  }

  // ── 反推：找最接近 targetUSD 首次生存金的保額 ──
  function findAmtForSurv(prodKey, gender, age, targetUSD) {
    let lo = 0.1, hi = 600.0;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      const tbl = computeBenefitTable(prodKey, gender, age, mid, 2);
      if (!tbl) return null;
      const firstSurv = (tbl.find(function (r) { return r.surv > 0; }) || { surv: 0 }).surv;
      if (firstSurv < targetUSD) lo = mid;
      else hi = mid;
    }
    return Math.round((lo + hi) / 2 * 10) / 10;
  }

  // ── 算保費（給定保額） ─────────────────────────
  function computePremium(prod, gender, age, amtWan, exrate, discountConfig) {
    const g = gender === 1 ? 'M' : 'F';
    const ratePerWan = (root.RATES[prod] && root.RATES[prod][g] && root.RATES[prod][g][age]) || 0;
    const disc = getDiscRate(amtWan, discountConfig);
    const rawUSD = Math.round(ratePerWan * amtWan * 10) / 10;
    const annualUSD = Math.floor(rawUSD);
    const discUSD = Math.round(annualUSD * (1 - disc));
    const premTWD = Math.round(discUSD * exrate);
    return {
      ratePerWan: ratePerWan,
      discount: disc,
      rawUSD: rawUSD,
      annualUSD: annualUSD,
      discUSD: discUSD,
      premTWD: premTWD
    };
  }

  // ── 對外 API ──────────────────────────────────
  root.RetirementIncomeEngine = {
    tw: tw,
    calcInsAge: calcInsAge,
    getMaxAmount: getMaxAmount,
    getDiscRate: getDiscRate,
    computeBenefitTable: computeBenefitTable,
    computePaidUpBenefitTable: computePaidUpBenefitTable,
    amtWanFrom6YrTotal: amtWanFrom6YrTotal,
    findAmtForSurv: findAmtForSurv,
    computePremium: computePremium
  };
})(typeof window !== 'undefined' ? window : globalThis);
