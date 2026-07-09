// ═══ constants.js V1.26 ═══
const COI_MALE={0:2.7e-5,1:1.6e-5,2:1.4e-5,3:1.2e-5,4:1e-5,5:1e-5,6:9e-6,7:9e-6,8:1e-5,9:1e-5,10:1e-5,11:1.1e-5,12:1.3e-5,13:1.5e-5,14:1.9e-5,15:2.5e-5,16:2.8e-5,17:3.2e-5,18:3.4e-5,19:3.6e-5,20:3.6e-5,21:3.7e-5,22:3.8e-5,23:3.9e-5,24:3.9e-5,25:4.1e-5,26:4.2e-5,27:4.3e-5,28:4.5e-5,29:4.7e-5,30:5.5e-5,31:5.8e-5,32:6.2e-5,33:6.7e-5,34:7.3e-5,35:8.1e-5,36:8.9e-5,37:9.7e-5,38:1.06e-4,39:1.16e-4,40:1.27e-4,41:1.39e-4,42:1.51e-4,43:1.64e-4,44:1.78e-4,45:2.01e-4,46:2.17e-4,47:2.34e-4,48:2.52e-4,49:2.71e-4,50:2.89e-4,51:3.1e-4,52:3.32e-4,53:3.56e-4,54:3.82e-4,55:4.22e-4,56:4.51e-4,57:4.84e-4,58:5.19e-4,59:5.57e-4,60:6.23e-4,61:6.68e-4,62:7.19e-4,63:7.74e-4,64:8.38e-4,65:9.39e-4,66:1.02e-3,67:1.112e-3,68:1.214e-3,69:1.33e-3,70:1.501e-3,71:1.604e-3,72:1.719e-3,73:1.861e-3,74:2.024e-3,75:2.257e-3,76:2.443e-3,77:2.649e-3,78:2.878e-3,79:3.133e-3,80:3.456e-3,81:3.766e-3,82:4.107e-3,83:4.486e-3,84:4.907e-3,85:5.418e-3,86:5.94e-3,87:6.518e-3,88:7.158e-3,89:7.867e-3,90:8.677e-3,91:9.565e-3,92:1.0555e-2,93:1.1651e-2,94:1.2867e-2,95:1.4214e-2,96:1.5704e-2,97:1.735e-2,98:1.917e-2,99:2.118e-2,100:2.341e-2,101:2.5885e-2,102:2.8622e-2,103:3.165e-2,104:3.5e-2,105:3.8698e-2,106:4.278e-2,107:4.729e-2,108:5.227e-2,109:5.777e-2,110:1};
const COI_FEMALE={0:1.2e-5,1:7e-6,2:7e-6,3:6e-6,4:5e-6,5:4e-6,6:4e-6,7:4e-6,8:4e-6,9:4e-6,10:4e-6,11:4e-6,12:5e-6,13:5e-6,14:6e-6,15:7e-6,16:8e-6,17:8e-6,18:8e-6,19:9e-6,20:9e-6,21:9e-6,22:1e-5,23:1e-5,24:1e-5,25:1.1e-5,26:1.1e-5,27:1.1e-5,28:1.2e-5,29:1.2e-5,30:1.4e-5,31:1.5e-5,32:1.6e-5,33:1.7e-5,34:1.8e-5,35:1.9e-5,36:4e-5,37:4.2e-5,38:4.5e-5,39:4.8e-5,40:5.1e-5,41:5.4e-5,42:5.8e-5,43:6.2e-5,44:6.7e-5,45:7.3e-5,46:7.8e-5,47:8.4e-5,48:9e-5,49:9.7e-5,50:1.05e-4,51:1.13e-4,52:1.22e-4,53:1.32e-4,54:1.43e-4,55:1.58e-4,56:1.7e-4,57:1.84e-4,58:2e-4,59:2.17e-4,60:2.41e-4,61:2.6e-4,62:2.82e-4,63:3.07e-4,64:3.35e-4,65:4.67e-4,66:5.11e-4,67:5.6e-4,68:6.14e-4,69:6.75e-4,70:7.56e-4,71:8.16e-4,72:8.82e-4,73:9.64e-4,74:1.057e-3,75:1.19e-3,76:1.3e-3,77:1.424e-3,78:1.563e-3,79:1.72e-3,80:1.92e-3,81:2.115e-3,82:2.332e-3,83:2.574e-3,84:2.843e-3,85:3.174e-3,86:3.514e-3,87:3.893e-3,88:4.317e-3,89:4.792e-3,90:5.343e-3,91:5.953e-3,92:6.636e-3,93:7.402e-3,94:8.262e-3,95:9.232e-3,96:1.0322e-2,97:1.1549e-2,98:1.2929e-2,99:1.4483e-2,100:1.6231e-2,101:1.8198e-2,102:2.0411e-2,103:2.2903e-2,104:2.571e-2,105:2.887e-2,106:3.2423e-2,107:3.6417e-2,108:4.0909e-2,109:4.5958e-2,110:1};
const FFT={1:0.60,2:0.30,3:0.30,4:0.15,5:0.15};
const FFE=0.05, ADM=100, MAX_MS=10000;
// UND-main-excel-fixed 4 / tbULMultiple-1150101：頁面下限使用低倍與高倍平均值。
const SA_M={0:[61,92],1:[61,92],2:[60,92],3:[58,92],4:[57,92],5:[57,92],6:[55,92],7:[54,92],8:[53,92],9:[52,92],10:[51,92],11:[50,92],12:[49,92],13:[48,92],14:[47,92],15:[46,92],16:[45,190],17:[44,190],18:[43,190],19:[43,190],20:[42,190],21:[41,185],22:[40,180],23:[40,175],24:[39,170],25:[38,165],26:[38,160],27:[37,155],28:[36,150],29:[35,145],30:[35,140],31:[34,135],32:[33,130],33:[33,125],34:[32,120],35:[31,115],36:[31,110],37:[30,105],38:[30,100],39:[29,95],40:[29,90],41:[28,85],42:[27,85],43:[27,80],44:[26,80],45:[26,75],46:[25,75],47:[25,70],48:[24,70],49:[24,65],50:[23,65],51:[23,60],52:[22,60],53:[22,55],54:[22,55],55:[21,50],56:[21,50],57:[20,45],58:[20,45],59:[19,40],60:[19,40],61:[18,35],62:[18,35],63:[17,30],64:[17,30]};
const SA_F={0:[69,92],1:[68,92],2:[66,92],3:[65,92],4:[65,92],5:[65,92],6:[61,92],7:[60,92],8:[59,92],9:[58,92],10:[57,92],11:[56,92],12:[55,92],13:[53,92],14:[52,92],15:[52,92],16:[50,240],17:[50,240],18:[49,240],19:[48,240],20:[47,240],21:[46,230],22:[45,225],23:[44,220],24:[43,215],25:[43,210],26:[41,200],27:[41,195],28:[40,190],29:[39,185],30:[39,180],31:[38,170],32:[37,165],33:[36,160],34:[36,155],35:[35,150],36:[34,140],37:[34,135],38:[33,130],39:[32,125],40:[32,120],41:[31,110],42:[31,105],43:[30,100],44:[29,95],45:[29,90],46:[28,90],47:[28,85],48:[27,85],49:[27,80],50:[26,80],51:[26,70],52:[25,70],53:[25,65],54:[24,65],55:[24,60],56:[23,60],57:[23,55],58:[22,55],59:[22,50],60:[21,50],61:[21,45],62:[20,45],63:[20,40],64:[19,40]};
var DEFAULT_MALE='data:image/jpeg;base64,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';
var DEFAULT_FEMALE='data:image/jpeg;base64,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';

// ═══ engine.js V1.26 — 純運算邏輯 ═══

// 保額自動計算（U系列正確倍數，回傳萬元，無條件進位到萬）
function calcSA(g, age, ap) {
  const t = g === "M" ? SA_M : SA_F;
  const [lo, hi] = t[Math.max(0, Math.min(64, age))] || [10, 10];
  const avg = (lo + hi) / 2;
  const raw = Math.min(60000000, avg * ap);
  return Math.ceil(raw / 10000); // 回傳萬元單位
}

// 保單帳戶逐月模擬（甲型 UNDA）
function simulate(p) {
  const coi = p.gender === "M" ? COI_MALE : COI_FEMALE;
  const months = Math.min(p.paymentYears * 12, (110 - p.currentAge) * 12);
  const res = [];
  let av = 0, cum = 0;
  const mr = Math.pow(1 + p.assumedReturn, 1 / 12) - 1;

  for (let m = 0; m < months; m++) {
    const yr = Math.floor(m / 12) + 1, mo = (m % 12) + 1, age = p.currentAge + yr - 1;
    const tp = mo === 1 ? p.annualTarget : 0, ep = p.monthlyExtra;
    const fr = FFT[Math.min(yr, 6)] || 0;
    const fee = Math.round(tp * fr) + Math.round(ep * FFE);
    cum += tp + ep;
    const adm = av > 0 || (tp + ep - fee) > 0 ? ADM : 0;

    // Step 1: avMid = 期初AV + 投入 - 前置費用 - 管理費
    const avMid = av + tp + ep - fee - adm;

    // Step 2: COI 用 avMid 計算危險保額（不是期初 AV）
    const coiRate = coi[Math.min(age, 110)] || 1;
    const coiCost = Math.round(Math.max(p.sumInsured - avMid, 0) * coiRate);

    // Step 3: 期末AV = MAX(avMid - COI, 0) × (1 + 月報酬率)
    av = Math.max(avMid - coiCost, 0) * (1 + mr);

    if (mo === 12 || m === months - 1) {
      const avRound = Math.round(av);
      // 甲型（UNDA）：身故保障 = MAX(保額, 帳戶價值)
      const db = Math.max(p.sumInsured, avRound);
      res.push({ year: yr, age, av: avRound, db, sv: avRound, cum: Math.round(cum) });
    }
  }
  return res;
}

// 數字格式化
const fmt = n => n == null ? "-" : Math.round(n).toLocaleString("zh-TW");

// 目標搜尋：找出最低每月存入金額使退休解約金 >= capDist
function goalSeek(S, capDist) {
  const workYears = S.retirementAge - S.currentAge;
  const payYears = workYears + 1;
  const ar = S.assumedReturn / 100;

  function trySV(totalMonthly) {
    const ms = Math.min(MAX_MS, totalMonthly);
    const me = Math.max(0, Math.round((totalMonthly - ms) / 500) * 500);
    const at = ms * 12;
    const sw = calcSA(S.gender, S.currentAge, at);
    const si = sw * 10000;
    const res = simulate({
      currentAge: S.currentAge, retirementAge: S.retirementAge, gender: S.gender,
      annualTarget: at, monthlyExtra: me, assumedReturn: ar, paymentYears: payYears, sumInsured: si
    });
    const idx = Math.min(workYears, (res?.length || 1) - 1);
    return { sv: res[idx]?.sv || 0, ms, me, at, sw, si, res };
  }

  // 二分搜尋
  let lo = 500, hi = 200000, best = hi;
  for (let i = 0; i < 30; i++) {
    const mid = Math.round((lo + hi) / 2 / 500) * 500;
    if (mid <= lo) break;
    if (trySV(mid).sv >= capDist) { best = mid; hi = mid; }
    else lo = mid;
  }
  // 微調
  while (best > 500) {
    if (trySV(best - 500).sv >= capDist) best -= 500;
    else break;
  }

  return trySV(best);
}

// 完整計算：整合所有衍生值
function compute(S) {
  const workYears = S.retirementAge - S.currentAge;
  const retireYears = S.lifeExpectancy - S.retirementAge;
  const payYears = workYears + 1;
  const totalNeed = S.monthlyExpense * retireYears * 12;

  // ── 方案一：銀行零存整付＋年度整存整付複利模型 ──
  // 規則：當年每月存入採月複利，年末累積本利和再以年利率複利滾存至退休
  // 使用二分法逼近「每月需存多少錢才能達到 totalNeed」
  const bankAnnualRate = (S.bankRate ?? 1.2) / 100;
  const bankMonthlyRate = Math.pow(1 + bankAnnualRate, 1 / 12) - 1;

  // 逐年累積：當年月存採月複利，年末加入前期累積後以年利率複利滾存
  function calcFVCorrect(monthlyDeposit) {
    if (workYears <= 0) return 0;
    let accumulated = 0;
    for (let y = 0; y < workYears; y++) {
      // 本年 12 個月月存，月複利，年末本利和
      const yearlyContrib = monthlyDeposit *
        ((Math.pow(1 + bankMonthlyRate, 12) - 1) / bankMonthlyRate) *
        (1 + bankMonthlyRate);
      // 前期累積再滾一年，加上本年貢獻
      accumulated = accumulated * (1 + bankAnnualRate) + yearlyContrib;
    }
    return accumulated;
  }

  // 二分法：找最小月存使 FV >= totalNeed
  let lo = 0, hi = totalNeed; // hi 上界足夠大
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (calcFVCorrect(mid) >= totalNeed) hi = mid;
    else lo = mid;
    if (hi - lo < 1) break;
  }
  const selfMonthly = workYears > 0 ? Math.ceil(hi) : 0;
  const selfAnnual = selfMonthly * 12;
  const distRate = 0.0468, distNav = 7.83;
  const preparedMonthly = S.preparedAmount * 0.07 / 12;
  const netMonthlyExpense = Math.max(0, S.monthlyExpense - preparedMonthly);
  const capDist = netMonthlyExpense * 12 / 0.07;

  const ac = goalSeek(S, capDist);
  const ri = Math.min(workYears, (ac.res?.length || 1) - 1);
  const svR = ac.res[ri]?.sv || 0;
  const units = svR / distNav;
  const monthDist = svR * 0.07 / 12;
  const policyAnnual = ac.at + ac.me * 12;
  const policyMonthly = policyAnnual / 12;
  const expW = S.monthlyExpense / 10000;
  const needW = Math.round(totalNeed / 10000);
  const capW = Math.round(capDist / 10000);

  return {
    workYears, retireYears, payYears, totalNeed, selfAnnual, selfMonthly,
    capDist, preparedMonthly, netMonthlyExpense,
    monthlySaving: ac.ms, monthlyExtra: ac.me, annualTarget: ac.at,
    saWan: ac.sw, sa: ac.si, opt: ac.res, ri, svR, units, monthDist,
    policyAnnual, policyMonthly, expW, needW, capW, distRate, distNav
  };
}

// ── 成長曲線 SVG 產生器 ──
function renderGrowthChart(D) {
  const pts = D.opt.filter(r => r.year === 1 || r.year % 5 === 0 || r.year === D.workYears + 1);
  if (!pts.length) return '';
  const W=520, H=175, PL=52, PR=36, PT=24, PB=36;
  const cW=W-PL-PR, cH=H-PT-PB;
  const maxV = Math.max(...pts.map(r => r.sv), ...pts.map(r => r.cum));
  const xs = i => PL + (i/(pts.length-1))*cW;
  const ys = v => PT + cH - (v/maxV)*cH;
  const cumP = pts.map((r,i)=>`${i?'L':'M'}${xs(i).toFixed(1)},${ys(r.cum).toFixed(1)}`).join('');
  const svP  = pts.map((r,i)=>`${i?'L':'M'}${xs(i).toFixed(1)},${ys(r.sv).toFixed(1)}`).join('');
  const svFill = svP + ` L${xs(pts.length-1).toFixed(1)},${(PT+cH).toFixed(1)} L${PL},${(PT+cH).toFixed(1)} Z`;
  const retIdx = pts.findIndex(r=>r.year===D.workYears+1);
  const retX = retIdx>=0 ? xs(retIdx).toFixed(1) : null;
  const fmtM = n => n>=10000 ? (n/10000).toFixed(0)+'萬' : n.toLocaleString('zh-TW');
  // Y axis labels
  const ticks = [0,.5,1].map(t=>{
    const v=maxV*t, y=ys(v).toFixed(1);
    return `<text x="${(PL-6).toFixed(1)}" y="${y}" text-anchor="end" dominant-baseline="middle" fill="#8A7D6E" font-size="9">${fmtM(Math.round(v))}</text>`;
  }).join('');
  // X labels (every 5 years, retirement)
  const xlabels = pts.filter((_,i)=>i===0||i===pts.length-1||pts[i].year%10===0).map((r,_,arr)=>{
    const idx=pts.indexOf(r);
    return `<text x="${xs(idx).toFixed(1)}" y="${(PT+cH+14).toFixed(1)}" text-anchor="middle" fill="#8A7D6E" font-size="9">${r.age}歲</text>`;
  }).join('');
  // Retirement vertical line — 退休 label at bottom, value label to left of dot
  const retLine = retX ? `<line x1="${retX}" y1="${PT}" x2="${retX}" y2="${PT+cH}" stroke="#1A3054" stroke-width="1.2" stroke-dasharray="3,2" opacity=".6"/>
  <text x="${(parseFloat(retX)).toFixed(1)}" y="${(PT+cH-4).toFixed(1)}" text-anchor="middle" fill="#1A3054" font-size="8.5" font-weight="900" opacity=".7">退休</text>` : '';
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;margin-top:10px">
  <defs>
    <linearGradient id="svGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1A3054" stop-opacity=".18"/>
      <stop offset="100%" stop-color="#1A3054" stop-opacity=".02"/>
    </linearGradient>
  </defs>
  <line x1="${PL}" y1="${PT}" x2="${PL}" y2="${PT+cH}" stroke="#D4CFC9" stroke-width=".8"/>
  <line x1="${PL}" y1="${PT+cH}" x2="${W-PR}" y2="${PT+cH}" stroke="#D4CFC9" stroke-width=".8"/>
  ${[.25,.5,.75].map(t=>`<line x1="${PL}" y1="${ys(maxV*t).toFixed(1)}" x2="${W-PR}" y2="${ys(maxV*t).toFixed(1)}" stroke="#E8E5DE" stroke-width=".6"/>`).join('')}
  ${ticks}${xlabels}${retLine}
  <path d="${svFill}" fill="url(#svGrad)"/>
  <path d="${cumP}" stroke="#B8B0A4" stroke-width="1.6" fill="none" stroke-dasharray="4,3"/>
  <path d="${svP}"  stroke="#1A3054" stroke-width="2.2" fill="none" stroke-linejoin="round"/>
  <circle cx="${xs(pts.length-1).toFixed(1)}" cy="${ys(pts[pts.length-1].sv).toFixed(1)}" r="4" fill="#1A3054"/>
  <text x="${(xs(pts.length-1)-8).toFixed(1)}" y="${(ys(pts[pts.length-1].sv)-6).toFixed(1)}" text-anchor="end" fill="#1A3054" font-size="9.5" font-weight="900">${fmtM(pts[pts.length-1].sv)}</text>
  <g transform="translate(${PL+4},${PT-1})">
    <line x1="0" y1="5" x2="14" y2="5" stroke="#1A3054" stroke-width="2"/>
    <text x="16" y="9" fill="#1A3054" font-size="8.5">帳戶價值</text>
  </g>
  <g transform="translate(${PL+76},${PT-1})">
    <line x1="0" y1="5" x2="14" y2="5" stroke="#B8B0A4" stroke-width="1.6" stroke-dasharray="4,3"/>
    <text x="16" y="9" fill="#8A7D6E" font-size="8.5">累計投入</text>
  </g>
</svg>`;
}

// ═══ export-service.js V1.26 — PDF + 圖片匯出 ═══

// 共用：截圖前還原 transform，截完恢復
async function captureReport() {
  const wrapEl = document.getElementById("report-wrap");
  const noPrint = document.querySelectorAll(".no-print");
  noPrint.forEach(el => el.style.display = "none");

  const prev = {
    transform:    wrapEl.style.transform,
    marginBottom: wrapEl.style.marginBottom,
    boxShadow:    wrapEl.style.boxShadow,
    border:       wrapEl.style.border,
    borderRadius: wrapEl.style.borderRadius,
    minHeight:    wrapEl.style.minHeight,
    height:       wrapEl.style.height,
  };

  wrapEl.style.transform    = "none";
  wrapEl.style.marginBottom = "0";
  wrapEl.style.boxShadow    = "none";
  wrapEl.style.border       = "none";
  wrapEl.style.borderRadius = "0";

  const captureW = Math.ceil(wrapEl.scrollWidth || wrapEl.getBoundingClientRect().width);
  const a4MinH   = Math.ceil(captureW * 297 / 210);
  const contentH = Math.ceil(wrapEl.scrollHeight || wrapEl.getBoundingClientRect().height);
  const captureH = Math.max(contentH, a4MinH);
  wrapEl.style.height    = captureH + "px";  // 精確鎖定 A4 高度，讓 flex 撐滿

  await new Promise(r => setTimeout(r, 120));

  const canvas = await html2canvas(wrapEl, {
    scale: 2, useCORS: true, allowTaint: true,
    backgroundColor: "#ffffff", logging: false,
    windowWidth: captureW, width: captureW, height: captureH,
    scrollX: 0, scrollY: -wrapEl.getBoundingClientRect().top
  });

  Object.assign(wrapEl.style, prev);
  noPrint.forEach(el => el.style.display = "");
  return canvas;
}

function getFileName(S, ext) {
  const name = (S.clientName || "客戶").replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "");
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  return `退休財務計畫書_${name}_${date}.${ext}`;
}

function setLoading(btnId, labelId, iconId, loading, defaultLabel) {
  const btn = document.getElementById(btnId);
  const label = document.getElementById(labelId);
  const icon = document.getElementById(iconId);
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    if (label) label.textContent = "產生中…";
    if (icon) icon.innerHTML = '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.4" stroke-dashoffset="10" style="animation:spin 1s linear infinite"/>';
  } else {
    btn.disabled = false;
    if (label) label.textContent = defaultLabel;
  }
}

const PDF_ICON = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>';
const IMG_ICON = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>';

async function exportPDF(S) {
  setLoading("btnPDF", "pdfLabel", "pdfIcon", true);
  try {
    const canvas = await captureReport();
    if (!window.jspdf || !window.html2canvas) { window.print(); return; }
    const { jsPDF } = window.jspdf;
    const isLandscape = false; // portrait only
    const PDF_W = 210, PDF_H = 297, MARGIN = 4;
    const contentW = PDF_W - MARGIN * 2, contentH = PDF_H - MARGIN * 2;
    const ratio = canvas.width / canvas.height;
    // 填滿寬度，從頂對齊，超出就截
    const imgW = contentW, imgH = imgW / ratio;
    const x = MARGIN, y = MARGIN;
    const pdf = new jsPDF({ orientation: isLandscape ? "landscape" : "portrait", unit: "mm", format: "a4" });
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.93), "JPEG", x, y, imgW, imgH);
    pdf.save(getFileName(S, "pdf"));
    document.getElementById("pdfIcon").innerHTML = PDF_ICON;
  } catch (e) {
    console.error(e);
  }
  setLoading("btnPDF", "pdfLabel", "pdfIcon", false, "儲存為 PDF");
}

async function exportImage(S) {
  setLoading("btnIMG", "imgLabel", "imgIcon", true);
  try {
    if (!window.html2canvas) { window.print(); return; }
    const canvas = await captureReport();
    const dataUrl = canvas.toDataURL("image/png", 1.0);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = getFileName(S, "png");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    document.getElementById("imgIcon").innerHTML = IMG_ICON;
  } catch (e) {
    console.error(e);
  }
  setLoading("btnIMG", "imgLabel", "imgIcon", false, "另存為圖片");
}

// GodzillaPaul Retirement Planner — upgraded UI

function getAvatar(S) {
  return S.clientPhoto || (S.gender === 'M' ? DEFAULT_MALE : DEFAULT_FEMALE);
}

function scaleWrap() { return; }

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const pct = (n) => `${clamp(n, 0, 100)}%`;
const inputNum = (id, label, value, opts = {}) => `
  <div class="gp-field ${opts.full ? 'full' : ''}">
    <label class="gp-label" for="${id}">${label}</label>
    <input class="gp-input" id="${id}" type="number" value="${value}" ${opts.min != null ? `min="${opts.min}"` : ''} ${opts.max != null ? `max="${opts.max}"` : ''} ${opts.step != null ? `step="${opts.step}"` : ''} inputmode="numeric">
  </div>`;

function renderInputPage(S, onStateChange, onGenerate) {
  const D = compute(S);
  return {
    html: `
    <div class="gp-app safe-pad">
      <div class="orb one"></div><div class="orb two"></div>
      <header class="gp-shell gp-topbar">
        <div class="gp-brand"><div class="gp-mark"><img src="./assets_logo.jpg" alt="GodzillaPaul Logo" style="width:100%;height:100%;object-fit:contain;border-radius:12px;display:block"></div><div><small>GodzillaPaul</small><strong>退休規劃表</strong></div></div>
        <div style="display:flex;align-items:center;gap:10px;">
          <a href="https://godzillapaul-entrance.netlify.app/catalog/" style="display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.30);color:rgba(255,255,255,.88);font-size:13px;font-weight:700;text-decoration:none;transition:background .2s;" onmouseover="this.style.background='rgba(255,255,255,.22)'" onmouseout="this.style.background='rgba(255,255,255,.12)'">← <span>返回</span></a>
          <span class="gp-pill"><span class="gp-pulse"></span>退休試算</span>
        </div>
      </header>

      <main class="gp-shell gp-hero">
        <section class="gp-copy">
          <div class="gp-eyebrow">退休缺口試算</div>
          <h1 class="gp-title"><span>退休不是年紀，</span><span>是現金流夠不夠。</span></h1>
          <p class="gp-sub">您的退休生活，每月需要多少？現在就算清楚缺口。</p>
          <div class="gp-points">
            <span class="gp-point">清楚算出退休缺口</span>
            <span class="gp-point">看懂兩種方法差異</span>
            <span class="gp-point">找到每月最佳存法</span>
          </div>

          <div class="gp-mini-result" aria-label="即時摘要">
            <div class="gp-result-card"><small>退休總需求</small><strong>${fmt(D.totalNeed)}</strong></div>
            <div class="gp-result-card"><small>目標資金缺口</small><strong>${fmt(Math.round(D.capDist))}</strong></div>
            <div class="gp-result-card"><small>銀行方案月存</small><strong>${fmt(Math.round(D.selfMonthly))}</strong></div>
            <div class="gp-result-card"><small>方案月存</small><strong>${fmt(Math.round(D.policyMonthly))}</strong></div>
          </div>
        </section>

        <section class="gp-panel" id="input-wrap">
          <div class="gp-section-title"><h2>退休目標設定</h2><span>即時試算</span></div>
          <div class="gp-photo-row">
            <div id="photoBox" class="gp-photo"><img src="${getAvatar(S)}" alt="客戶照片"></div>
            <input type="file" id="photoInput" accept="image/*" hidden>
            <div class="gp-photo-actions">
              <span class="gp-link" id="changePhoto">更換照片</span>
              ${S.clientPhoto ? `<span class="gp-link danger" id="removePhoto">移除照片</span>` : `<span style="color:rgba(255,255,255,.48);font-size:12px">可上傳照片</span>`}
            </div>
          </div>

          <div class="gp-form-grid">
            <div class="gp-field full"><label class="gp-label" for="iName">客戶姓名</label><input class="gp-input" id="iName" type="text" value="${S.clientName || ''}" placeholder="請輸入客戶姓名"></div>
            <div class="gp-field"><label class="gp-label" for="iGender">性別</label><select class="gp-select" id="iGender"><option value="M" ${S.gender === 'M' ? 'selected' : ''}>男</option><option value="F" ${S.gender === 'F' ? 'selected' : ''}>女</option></select></div>
            ${inputNum('iAge','目前年齡',S.currentAge,{min:16,max:64})}
            ${inputNum('iRetire','預計退休年齡',S.retirementAge,{min:40,max:80})}
            ${inputNum('iLife','平均餘命',S.lifeExpectancy,{min:60,max:110})}
            ${inputNum('iExpense','退休每月花費',S.monthlyExpense,{step:5000})}
            ${inputNum('iPrepared','已準備退休金',S.preparedAmount,{step:100000})}
            ${inputNum('iBankRate','銀行存款年利率 %',S.bankRate ?? 1.2,{min:0,max:10,step:.1})}
            ${inputNum('iReturn','方案假設投報率 %',S.assumedReturn,{min:0,max:12,step:.5})}
          </div>

          <div class="gp-mini-result">
            <div class="gp-result-card"><small>需準備退休資金</small><strong>${fmt(Math.round(D.capDist))}</strong></div>
            <div class="gp-result-card"><small>月存金額</small><strong>${fmt(D.monthlySaving)}${D.monthlySaving >= MAX_MS ? '<span style="font-size:11px;color:#fbbf24;margin-left:5px">上限</span>' : ''}</strong></div>
            <div class="gp-result-card"><small>月超額保費</small><strong>${fmt(D.monthlyExtra)}</strong></div>
            <div class="gp-result-card"><small>壽險保額</small><strong>${D.saWan}萬</strong></div>
          </div>

          <div class="gp-action">
            <button id="btnGenerate" class="gp-btn primary" type="button">產生報告 →</button>
          </div>

          <div class="gp-stack" style="margin-top:16px">
            <div class="gp-step"><div class="gp-step-no">1</div><div><strong>建立退休目標</strong><span>算出退休缺口。</span></div></div>
            <div class="gp-step"><div class="gp-step-no">2</div><div><strong>比較兩種方法</strong><span>銀行存款 vs 現金流方案。</span></div></div>
            <div class="gp-step"><div class="gp-step-no">3</div><div><strong>輸出報告</strong><span>可列印、存 PDF 或截圖。</span></div></div>
          </div>
        </section>
      </main>
    </div>`,
    bind() {
      const update = (key, value) => { S[key] = value; onStateChange(); };
      document.getElementById('photoBox').onclick = () => document.getElementById('photoInput').click();
      document.getElementById('changePhoto').onclick = () => document.getElementById('photoInput').click();
      const rm = document.getElementById('removePhoto');
      if (rm) rm.onclick = () => { S.clientPhoto = null; onStateChange(); };
      document.getElementById('photoInput').onchange = e => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = ev => { S.clientPhoto = ev.target.result; onStateChange(); };
        reader.readAsDataURL(f);
      };
      document.getElementById('iName').onchange = e => update('clientName', e.target.value);
      document.getElementById('iGender').onchange = e => update('gender', e.target.value);
      document.getElementById('iAge').onchange = e => update('currentAge', +e.target.value);
      document.getElementById('iRetire').onchange = e => update('retirementAge', +e.target.value);
      document.getElementById('iLife').onchange = e => update('lifeExpectancy', +e.target.value);
      document.getElementById('iExpense').onchange = e => update('monthlyExpense', +e.target.value);
      document.getElementById('iPrepared').onchange = e => update('preparedAmount', +e.target.value);
      document.getElementById('iReturn').onchange = e => update('assumedReturn', +e.target.value);
      document.getElementById('iBankRate').onchange = e => update('bankRate', +e.target.value);
      document.getElementById('btnGenerate').onclick = onGenerate;
    }
  };
}

function renderReportPage(S, onBack, onPdfClick, onImgClick) {
  const D = compute(S);
  const currentPct = S.currentAge;
  const workPct = S.retirementAge - S.currentAge;
  const retirePct = S.lifeExpectancy - S.retirementAge;
  const beyondPct = 100 - S.lifeExpectancy;
  const tableRows = D.opt.filter(r => r.year <= 5 || r.year % 5 === 0 || r.year === D.workYears + 1).map(r => `
    <tr class="${r.year === D.workYears + 1 ? 'milestone-row' : ''}">
      <td>${r.year}</td><td>${r.age}</td><td>${fmt(r.cum)}</td><td>${fmt(r.av)}</td><td>${fmt(r.sv)}</td><td>${fmt(r.db)}</td>
    </tr>`).join('');

  return {
    html: `
    <div class="white-report-page is-${S.paper || 'landscape'}" id="report-outer">
      <div class="print-sheet" id="report-wrap">
        <header class="sheet-head">
          <div class="sheet-title">
            <div class="sheet-avatar"><img src="${getAvatar(S)}" alt="客戶照片"></div>
            <div><h1>退休財務計畫書</h1><p>${S.clientName || '客戶名稱'}｜${S.currentAge}歲 → ${S.retirementAge}歲退休</p></div>
          </div>
          <div class="sheet-brand"><strong>GodzillaPaul</strong><span>退休現金流試算</span></div>
        </header>

        <main class="sheet-body">
          <section class="summary-grid">
            <div class="summary-card"><small>目前年齡</small><strong>${S.currentAge}歲</strong></div>
            <div class="summary-card"><small>退休年齡</small><strong>${S.retirementAge}歲</strong></div>
            <div class="summary-card"><small>退休每月花費</small><strong>${D.expW}萬</strong></div>
            <div class="summary-card highlight"><small>需準備退休資金</small><strong>${fmt(Math.round(D.capDist))}</strong></div>
          </section>

          <section class="timeline">
            <div class="timeline-labels"><div style="width:${pct(currentPct)};text-align:center">目前年紀</div><div style="width:${pct(workPct)};text-align:center">剩餘工作</div><div style="width:${pct(retirePct)};text-align:center">退休生活</div><div style="width:${pct(beyondPct)};text-align:center">百歲準備</div></div>
            <div class="timeline-bar">
              <div style="width:${pct(currentPct)};background:#8A7D6E">${S.currentAge}年</div>
              <div style="width:${pct(workPct)};background:#1A3054">${D.workYears}年</div>
              <div style="width:${pct(retirePct)};background:#3D5A7A">${D.retireYears}年</div>
              <div style="width:${pct(beyondPct)};background:#C8C3BA;color:#3D3830">${Math.max(0, 100 - S.lifeExpectancy)}年</div>
            </div>
          </section>

          <section class="compare">
            <div class="compare-card">
              <h2 style="background:linear-gradient(90deg,#E8E5DE,#F0EEE9)!important;color:#5C6B82!important">方案一｜一般銀行存款</h2>
              <div class="inner">
                <div class="metric"><span>退休總需求</span><strong class="big-red">${D.needW}萬</strong></div>
                <div class="metric"><span>銀行存款年利率</span><strong>${S.bankRate ?? 1.2}%</strong></div>
                <div class="metric"><span>每年需存</span><strong>${fmt(Math.round(D.selfAnnual))}</strong></div>
                <div class="metric" style="border-bottom:0"><span>每月需存</span><strong class="big-red">${fmt(Math.round(D.selfMonthly))}</strong></div>
                <div style="margin-top:12px;padding:10px;background:#F5F0EB;border-radius:12px;font-size:11.5px;color:#7A6A5A;line-height:1.6">
                  ⚠ 需持續自律存入 <strong style="color:#8B3A3A">${D.workYears} 年</strong>，
                  期間無複利增值效果，退休後本金逐步耗盡。
                </div>
              </div>
            </div>
            <div class="compare-card compare-card--recommended">
              <h2 style="background:linear-gradient(135deg,#1A3054,#254070)!important;color:#F0EEE9!important;display:flex;justify-content:space-between;align-items:center">方案二｜退休現金流方案<span style="font-size:11px;padding:4px 9px;border-radius:999px;background:rgba(240,238,233,.18);border:1px solid rgba(240,238,233,.35);letter-spacing:.05em">✦ 建議方案</span></h2>
              <div class="inner">
                <div class="metric"><span>目標資金</span><strong class="big-blue">約 ${D.capW}萬</strong></div>
                <div class="metric"><span>假設投報率</span><strong>${S.assumedReturn}%</strong></div>
                <div class="metric"><span>每年需存</span><strong>${fmt(D.policyAnnual)}</strong></div>
                <div class="metric" style="border-bottom:0"><span style="font-weight:900">每月只需存</span><strong class="big-blue" style="font-size:22px!important">${fmt(Math.round(D.policyMonthly))}</strong></div>
                <div style="margin-top:12px;padding:10px;background:linear-gradient(135deg,#EEF2F9,#E8EFF7);border-radius:12px;border:1px solid rgba(26,48,84,.12)">
                  <div style="display:flex;flex-wrap:wrap;gap:6px">
                    <span style="font-size:10.5px;padding:3px 9px;border-radius:999px;background:rgba(26,48,84,.10);color:#1A3054;font-weight:950">✓ 複利自動滾存</span>
                    <span style="font-size:10.5px;padding:3px 9px;border-radius:999px;background:rgba(26,48,84,.10);color:#1A3054;font-weight:950">✓ 退休自動配息</span>
                    <span style="font-size:10.5px;padding:3px 9px;border-radius:999px;background:rgba(26,48,84,.10);color:#1A3054;font-weight:950">✓ 壽險保障同步</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="detail-grid">
            <div class="detail-box">
              <h2>退休財務累積明細</h2>
              <div class="content">
                <div class="disclaimer" style="margin-top:0;margin-bottom:10px">年目標保費 ${fmt(D.annualTarget)}｜月超額保費 ${fmt(D.monthlyExtra)}｜壽險保額 ${D.saWan}萬｜假設投報率 ${S.assumedReturn}%</div>
                <div class="table-wrap"><table class="clean-table"><thead><tr><th>年度</th><th>年齡</th><th>累計投入</th><th>帳戶價值</th><th>解約金</th><th>身故保障</th></tr></thead><tbody>${tableRows}</tbody></table></div>
              </div>
            </div>
            <div class="detail-box">
              <h2>退休現金流摘要</h2>
              <div class="content cash-cards">
                <div class="cash-card" style="text-align:center;padding:14px 12px">
                  <small style="font-size:11px;letter-spacing:.06em">退休時解約金</small>
                  <strong style="font-size:19px;display:block;margin-top:5px">${fmt(D.svR)}</strong>
                </div>
                <div class="cash-card main" style="text-align:center;padding:18px 12px;position:relative;overflow:hidden">
                  <div style="position:absolute;inset:0;background:linear-gradient(135deg,#1A3054,#254070);opacity:.06;pointer-events:none"></div>
                  <small style="font-size:11px;font-weight:950;color:#1A3054;letter-spacing:.08em;text-transform:uppercase">每月可領配息</small>
                  <strong style="font-size:32px;display:block;margin:6px 0 4px;color:#1A3054;letter-spacing:-.04em;line-height:1">${fmt(Math.round(D.monthDist))}</strong>
                  <span style="font-size:11px;color:#5C6B82;font-weight:850">元／月 ✦ 相當於月薪 ${Math.round(D.monthDist/22000*100)}% 替代率</span>
                </div>
                <div class="cash-card" style="text-align:center;padding:14px 12px">
                  <small style="font-size:11px;letter-spacing:.06em">年度總配息</small>
                  <strong style="font-size:19px;display:block;margin-top:5px">${fmt(Math.round(D.monthDist * 12))}</strong>
                </div>
                <div class="cash-card" style="text-align:center;padding:13px 12px;background:linear-gradient(135deg,#FFF7ED,#FFFBF5);border:1.5px solid #FED7AA;">
                  <small style="font-size:10.5px;letter-spacing:.05em;color:#92400E;font-weight:950">比銀行方案 每月少存</small>
                  <strong style="font-size:22px;display:block;margin-top:4px;color:#C2410C;letter-spacing:-.04em">${fmt(Math.round(D.selfMonthly - D.policyMonthly))}<span style="font-size:13px;font-weight:700;margin-left:3px">元／月</span></strong>
                </div>
                ${renderGrowthChart(D)}
              </div>
            </div>
          </section>
          <div class="report-footer-safe"><span>退休現金流試算</span><span>GodzillaPaul</span></div>
        </main>
      </div>

      <div class="report-actions no-print">
        <button id="btnBack" class="gp-btn ghost" type="button">← 返回修改</button>
        <button id="btnPDF" class="gp-btn primary" type="button">⬇ 儲存為 PDF</button>
        <button id="btnIMG" class="gp-btn ghost" type="button">另存為圖片</button>
      </div>
    </div>`,
    bind() {
      document.getElementById('btnBack').onclick = onBack;
      document.getElementById('btnPDF').onclick = () => onPdfClick(S);
      document.getElementById('btnIMG').onclick = () => onImgClick(S);
    }
  };
}

const S = {
  page: "input", clientName: "", clientPhoto: null,
  gender: "M", currentAge: 22, retirementAge: 65,
  monthlyExpense: 30000, lifeExpectancy: 85,
  assumedReturn: 6, preparedAmount: 0, bankRate: 1.2, paper: "portrait"
};

function render() {
  const app = document.getElementById("app");
  if (S.page === "input") {
    const p = renderInputPage(S, render, () => { S.page = "report"; render(); });
    app.innerHTML = p.html;
    p.bind();
  } else {
    const p = renderReportPage(S, () => { S.page = "input"; render(); }, exportPDF, exportImage);
    app.innerHTML = p.html;
    p.bind();
  }
}

render();
window.addEventListener("resize", () => {
  if (S.page === "input") scaleWrap("input-wrap", 480);
  else scaleWrap("report-wrap", (S.paper === "portrait" ? 794 : 1123));
});
