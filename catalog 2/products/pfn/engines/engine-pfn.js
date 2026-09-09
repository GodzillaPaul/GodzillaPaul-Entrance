(function(root){
  'use strict';
  const round0 = n => Math.round(Number(n) || 0);
  const ceil0 = n => Math.ceil(Number(n) || 0);
  function variantParts(prodKey){
    const m = String(prodKey||'').match(/^(PFN[ABC])(10|20)$/);
    return m ? {prod:m[1], period:Number(m[2])} : null;
  }
  function dataKey(prodKey, gender, age){
    const p = variantParts(prodKey); if (!p) return null;
    return p.prod + String(p.period).padStart(2,'0') + String(gender).padStart(2,'0') + String(age).padStart(2,'0');
  }
  function rowFor(prodKey, gender, age){
    const k = dataKey(prodKey, gender, age);
    return k && root.PDATA ? root.PDATA[k] : null;
  }
  function arrGet(a, idx){ return (a && idx >= 0 && idx < a.length) ? (Number(a[idx])||0) : 0; }
  function bonusKey(prodKey, gender, age, bonusType){ return dataKey(prodKey, gender, age) + String(bonusType || 2); }
  function discountFor(amountWan, cfg){
    if (!cfg) return 0;
    let high = 0;
    const tiers = (cfg.highAmount || []).slice().sort((a,b)=>a.minSum-b.minSum);
    for (const t of tiers) if (amountWan >= t.minSum) high = Number(t.pct)||0;
    const total = high + (Number(cfg.paymentMethod)||0);
    const cap = cfg.cap == null ? total : Number(cfg.cap);
    return Math.min(total, cap);
  }
  function rateFor(prodKey, gender, age){
    const p = variantParts(prodKey); if (!p || !root.RATES) return 0;
    return (((root.RATES[p.prod]||{})[String(p.period)]||{})[String(gender)]||{})[String(age)] || 0;
  }
  function computePremium(prodKey, gender, age, amountWan, fxRate, discCfg){
    const rate = rateFor(prodKey, gender, age);
    if (!rate) return null;
    const grossUSD = round0(rate * amountWan);
    const discount = discountFor(amountWan, discCfg);
    const discUSD = round0(grossUSD * (1 - discount));
    const premTWD = round0(discUSD * (Number(fxRate)||1));
    return { rate, grossUSD, discUSD, premTWD, discount };
  }
  function maxYears(d){
    return Math.max(
      d && d.DIE ? d.DIE.length : 0,
      d && d.CV ? d.CV.length : 0,
      d && d.SRV ? d.SRV.length : 0,
      d && d.PVFB ? d.PVFB.length : 0
    );
  }
  function computeBenefitTable(prodKey, gender, age, amountWan, bonusType){
    bonusType = bonusType || 2; // 紅運優網頁固定使用「最有可能紅利」
    const d = rowFor(prodKey, gender, age);
    if (!d) return [];
    const bk = bonusKey(prodKey, gender, age, bonusType);
    const bonu = root.BONU && root.BONU[bk] || [];
    const bonudie = root.BONUDIE && root.BONUDIE[bk] || [];
    const bonucv = root.BONUCV && root.BONUCV[bk] || [];
    const years = Math.min(maxYears(d), 111);
    let cumN = 0;
    let cumSurv = 0;
    const out = [];
    for (let yr=1; yr<=years; yr++){
      const i = yr - 1;
      // 年度紅利購買增額繳清：本年度紅利先計入，再用下一年度的躉繳純保費換算保額
      const b = arrGet(bonu, i);
      const K = ceil0(amountWan * b) + ceil0((cumN / 10000) * b);
      const pvNext = arrGet(d.PVFB, yr); // Excel/PF566 對位：yr1 用第 2 欄，yr2 用第 3 欄…
      const M = pvNext > 0 ? round0(K / (pvNext / 10000)) : 0;
      cumN += M;

      const baseDeath = ceil0(arrGet(d.DIE, i) * amountWan);
      const addDeath = ceil0(arrGet(d.DIE2, i) * cumN / 10000);
      const termDeath = ceil0(arrGet(bonudie, i) * amountWan);
      const death = baseDeath + addDeath + termDeath;

      const baseSurr = ceil0(arrGet(d.CV, i) * amountWan);
      const srvPw = arrGet(d.SRV, i);
      // 追加繳清保額的解約價值：退休生存金開始後採領後保價（CV），之前採下一年度 PVFB。
      const addSurrFactor = srvPw > 0 ? arrGet(d.CV, i) : pvNext;
      const addSurr = ceil0(addSurrFactor * cumN / 10000);
      const termSurr = ceil0(arrGet(bonucv, i) * amountWan);
      const surr = baseSurr + addSurr + termSurr;

      const baseSurv = ceil0(srvPw * amountWan);
      const addSurv = ceil0(srvPw * cumN / 10000);
      const surv = baseSurv + addSurv;
      cumSurv += surv;

      out.push({ yr, age: Number(age)+yr-1, paidUp: M, cumPaidUp: cumN, bonus: K, death, surr, surv, cumSurv });
    }
    return out;
  }
  function amtWanFromNyrTotal(totalTWD, gender, age, prodKey, fxRate, discCfg){
    const p = variantParts(prodKey); if (!p) return 0;
    const rate = rateFor(prodKey, gender, age); if (!rate) return 0;
    const annualUSD = (Number(totalTWD)||0) / ((Number(fxRate)||1) * p.period);
    let amt = annualUSD / rate;
    for (let i=0;i<8;i++){
      const disc = discountFor(amt, discCfg);
      amt = annualUSD / (rate * (1 - disc));
    }
    return Math.round(amt * 10) / 10;
  }
  function findAmtForSurv(prodKey, gender, age, targetUSD){
    let best = null, bestDiff = Infinity;
    for (let a=0.5; a<=200.0001; a+=0.1){
      const amt = Math.round(a*10)/10;
      const tbl = computeBenefitTable(prodKey, gender, age, amt, 2);
      const first = tbl.find(r => r.surv > 0);
      if (!first) continue;
      const diff = Math.abs(first.surv - targetUSD);
      if (diff < bestDiff){ bestDiff = diff; best = amt; }
    }
    return best;
  }
  root.PFNEngine = { computePremium, computeBenefitTable, amtWanFromNyrTotal, findAmtForSurv, _dataKey:dataKey, _discountFor:discountFor };
})(window);
