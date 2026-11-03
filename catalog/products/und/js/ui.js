/* ══════════════════════════════════════
   ui.js — UI 更新與互動邏輯
   ══════════════════════════════════════ */

let userEditedSA = false;

/* ── 繳費期間選擇器 ───────────────────────────────── */
// payMode: 'age' | 'yr'
// payVal: number (age target or year count; 999 = 終身)
let payMode = 'age';
let payVal  = 65;

function setPayMode(mode) {
  payMode = mode;
  document.getElementById('pay-mode-age').classList.toggle('active', mode === 'age');
  document.getElementById('pay-mode-yr').classList.toggle('active', mode === 'yr');
  document.getElementById('pay-chips-age').style.display = mode === 'age' ? '' : 'none';
  document.getElementById('pay-chips-yr').style.display  = mode === 'yr'  ? '' : 'none';
  document.getElementById('pay-custom').value = '';
  // Re-activate default chip for the new mode
  const defaultVal = mode === 'age' ? 65 : 999;
  payVal = defaultVal;
  refreshPayChips();
  updatePayHint();
}

function setPayChip(el, val) {
  payVal = val;
  document.getElementById('pay-custom').value = '';
  refreshPayChips();
  updatePayHint();
}

function setPayCustom(el) {
  const v = parseInt(el.value);
  if (!isNaN(v) && v > 0) {
    payVal = v;
    // clear chip active
    document.querySelectorAll('#pay-chips-age .pay-chip, #pay-chips-yr .pay-chip')
      .forEach(c => c.classList.remove('active'));
    updatePayHint();
  }
}

function refreshPayChips() {
  const container = payMode === 'age' ? 'pay-chips-age' : 'pay-chips-yr';
  document.querySelectorAll(`#${container} .pay-chip`).forEach(c => {
    c.classList.toggle('active', parseInt(c.dataset.val) === payVal);
  });
}

function updatePayHint() {
  const el = document.getElementById('pay-hint');
  if (!el) return;
  if (payVal >= 999) {
    el.textContent = '終身繳費（至 110 歲）';
  } else if (payMode === 'age') {
    el.textContent = `繳費至 ${payVal} 歲（含 ${payVal} 歲當年）`;
  } else {
    el.textContent = `繳費 ${payVal} 年`;
  }
}

// 回傳供 calc.js 使用的物件
function getPayLimit() {
  if (payVal >= 999) return { mode: 'none', val: 999 };
  return { mode: payMode, val: payVal };
}

function getCurrentInputs() {
  const birth  = parseRoc(document.getElementById('bday').value.trim());
  const sex    = document.getElementById('sex').value;
  const target = parseFloat(document.getElementById('target').value) || 0;
  const ptype  = (document.getElementById('ptype') || { value: 'A' }).value;
  return { birth, sex, target, ptype };
}

// 依生日與月存金額決定年繳目標保費；未滿 15 足歲固定年繳 7,500 元
function syncTarget(animate) {
  const birth   = parseRoc(document.getElementById('bday').value.trim());
  const child   = isChild(birth);
  const monthlyEl = document.getElementById('monthly');
  const monthly = parseFloat(monthlyEl.value) || 0;
  const annualTarget = child ? CHILD_TARGET : Math.round(monthly * 12 / 100) * 100;
  const targetEl = document.getElementById('target');
  const changed = String(annualTarget) !== targetEl.value;
  targetEl.value = annualTarget;

  monthlyEl.disabled = child;
  document.getElementById('child-note').style.display = child ? '' : 'none';

  const valEl = document.getElementById('target-display');
  if (animate || changed) {
    valEl.classList.remove('anim-flip');
    void valEl.offsetWidth;
    valEl.classList.add('anim-flip');
  }
  valEl.textContent = fmt(annualTarget);
}

function onMonthlyChange() {
  syncTarget(true);
  onInputChange();
}

function onInputChange() {
  userEditedSA = false;
  syncTarget(false);
  updateUI();
}

function onSAInput() {
  userEditedSA = true;
  const { birth, sex, target } = getCurrentInputs();
  if (!birth || target <= 0) return;
  const age   = calcInsureAge(birth.year, birth.month, birth.day);
  const minSA = calcMinSA(target, age, sex);
  const maxSA = calcMaxSA(target, age, sex);
  const cur   = parseFloat(document.getElementById('sa').value) || 0;
  const badge = document.getElementById('sa-badge');
  let text, warn;
  if      (cur < minSA) { text = '低於建議下限'; warn = true; }
  else if (cur === minSA) { text = '建議保額下限'; warn = false; }
  else if (cur > maxSA) { text = '超過最高保額'; warn = true; }
  else                   { text = '自訂保額'; warn = false; }
  badge.textContent = text;
  badge.className   = 'sa-badge' + (warn ? ' warn' : '');
  triggerPop(badge);

  // Update bar thumb position
  updateRangeBar(cur, minSA, maxSA);
}

function updateUI() {
  const { birth, sex, target, ptype } = getCurrentInputs();
  if (!birth || target <= 0) return;

  const age   = calcInsureAge(birth.year, birth.month, birth.day);
  const maxAge = MAX_AGE_BY_TYPE[ptype];
  if (age > maxAge) {
    document.getElementById('sa-range-vals').textContent = '—';
    document.getElementById('sa-range-note').textContent =
      `投保年齡 ${age} 歲，超過${ptype === 'A' ? '甲型上限 64 歲（乙型可至 70 歲）' : '乙型上限 70 歲'}`;
    return;
  }
  const minSA = calcMinSA(target, age, sex);
  const maxSA = calcMaxSA(target, age, sex);

  // SA range display
  document.getElementById('sa-range-vals').innerHTML = `
    <span class="info-range-val">${fmt(minSA)}</span>
    <span class="info-range-sep">～</span>
    <span class="info-range-val">${fmt(maxSA)}</span>
    <span class="info-range-sep" style="font-size:12px">元</span>`;
  document.getElementById('sa-range-note').textContent = `投保年齡 ${age} 歲`;

  if (!userEditedSA) {
    document.getElementById('sa').value = minSA;
    const badge = document.getElementById('sa-badge');
    badge.textContent = '建議保額下限';
    badge.className   = 'sa-badge';
    updateRangeBar(minSA, minSA, maxSA);
  }
}

function updateRangeBar(cur, minSA, maxSA) {
  const wrap  = document.getElementById('sa-range-bar-wrap');
  const fill  = document.getElementById('sa-range-bar-fill');
  const thumb = document.getElementById('sa-range-bar-thumb');
  if (!wrap) return;

  wrap.style.display = 'block';
  const range = maxSA - minSA;
  const ratio = range > 0 ? Math.min(Math.max((cur - minSA) / range, 0), 1) : 0;
  const pctVal = (ratio * 100).toFixed(1) + '%';

  fill.style.width  = pctVal;
  thumb.style.left  = pctVal;

  // Trigger animation once
  if (!fill.dataset.animated) {
    fill.classList.add('anim-grow');
    thumb.classList.add('anim-appear');
    fill.dataset.animated = '1';
  }
}

function triggerPop(el) {
  el.classList.remove('anim-pop');
  void el.offsetWidth;
  el.classList.add('anim-pop');
}

function calc() {
  const errEl  = document.getElementById('errmsg');
  const btn    = document.getElementById('calc-btn');
  const btnText = btn.querySelector('.btn-text');
  const btnLoad = btn.querySelector('.btn-loading');

  errEl.style.display = 'none';
  errEl.textContent = '';

  // Show loading state
  btn.classList.add('loading');
  btnText.style.display = 'none';
  btnLoad.style.display = '';

  // Small delay for visual feedback
  setTimeout(() => {
    const result = runCalc();

    // Restore button
    btn.classList.remove('loading');
    btnText.style.display = '';
    btnLoad.style.display = 'none';

    if (result.error) {
      errEl.textContent    = result.error;
      errEl.style.display  = 'block';
      return;
    }

    renderResults(result);
  }, 320);
}

function insertNotice(id, cls, html) {
  const old = document.getElementById(id);
  if (old) old.remove();
  if (!html) return;
  const notice = document.createElement('div');
  notice.id = id;
  notice.className = cls;
  notice.innerHTML = html;
  const tblCard = document.querySelector('[data-card="r2"]');
  tblCard.parentNode.insertBefore(notice, tblCard);
}

function yearRanges(list) {
  const out = [];
  for (let i = 0; i < list.length; i++) {
    let j = i;
    while (j + 1 < list.length && list[j + 1] === list[j] + 1) j++;
    out.push(i === j ? `第 ${list[i]} 年` : `第 ${list[i]}–${list[j]} 年`);
    i = j;
  }
  return out.join('、');
}

function renderResults({ rows, iAge, child, minSA, maxSA, SA, target, highDisc, firstDisc, renewDisc, rorPct, lo_, hi_, avg_, stages, singleEvents, skippedYears, payLimitLabel, lapsed }) {
  const singleSummary = singleEvents.map(e => `第${e.yr}年 ${fmt(e.amt)}（${pct(getSingleFeeRate(e.amt))}）`);
  const lastRow = rows[rows.length - 1];
  document.getElementById('info-cards').innerHTML = `
    <div class="metric"><div class="metric-label">投保年齡</div><div class="metric-val">${iAge} 歲</div></div>
    <div class="metric"><div class="metric-label">低/建議/高倍</div><div class="metric-val sm">${lo_}x / ${avg_}x / ${hi_}x</div></div>
    <div class="metric"><div class="metric-label">保額下限</div><div class="metric-val sm">${fmt(minSA)}</div></div>
    <div class="metric"><div class="metric-label">最高保額</div><div class="metric-val sm">${fmt(maxSA)}</div></div>
    <div class="metric"><div class="metric-label">實際保額</div><div class="metric-val sm">${fmt(SA)}</div></div>
    <div class="metric"><div class="metric-label">目標保費（年）</div><div class="metric-val sm">${fmt(target)}${child ? '（未滿15足歲）' : ''}</div></div>
    <div class="metric"><div class="metric-label">預估年投報率</div><div class="metric-val">${rorPct}%</div></div>
    <div class="metric"><div class="metric-label">高保費折扣</div><div class="metric-val">${pct(highDisc)}</div></div>
    <div class="metric"><div class="metric-label">繳費方式折扣（首期／續期）</div><div class="metric-val sm">${pct(firstDisc)} ／ ${pct(renewDisc)}</div></div>
    <div class="metric"><div class="metric-label">分段增額</div><div class="metric-val sm">${stages.length ? stages.join(' → ') : '—'}</div></div>
    <div class="metric"><div class="metric-label">單筆增額</div><div class="metric-val sm">${singleSummary.length ? singleSummary.join(' → ') : '—'}</div></div>
    <div class="metric metric-warn pay-limit-metric"><div class="metric-label">繳費期間</div><div class="metric-val sm" style="color:#4338ca">${payLimitLabel}</div></div>
    ${lapsed ? `<div class="metric metric-warn"><div class="metric-label">帳戶價值歸零</div><div class="metric-val" style="color:var(--red,#e05)">${lastRow.age} 歲（第 ${lastRow.yr} 年）</div></div>` : ''}`;

  // 第十一條：目標保費暫停年度（門檻調降後會自動恢復）
  insertNotice('premium-stop-notice', 'premium-stop-notice', skippedYears.length
    ? `<strong>保額比例限制（條款第十一條）</strong><br>${yearRanges(skippedYears)}因帳戶價值相對保額過高，當年度目標保費暫停繳入；門檻隨年齡調降（61、71、91 歲）後符合規定即恢復繳費。`
    : '');

  const rejectedRows = rows.filter(r => r.rejectedSingle > 0 || r.rejectedExtra > 0);
  insertNotice('single-premium-notice', 'single-premium-notice', rejectedRows.length
    ? `<strong>增額保費未投入</strong><br>${rejectedRows.map(r => `第 <strong>${r.yr}</strong> 年 ${fmt(r.rejectedSingle + r.rejectedExtra)} 元`).join('、')} 因保額比例限制或累計 6,000 萬上限未投入。`
    : '');

  insertNotice('child-notice', 'single-premium-notice', child
    ? '<strong>未滿 15 足歲被保險人</strong><br>滿 15 足歲前身故，身故保險金依法改為喪葬費用保險金（喪葬費用不含帳戶價值，帳戶價值另返還），表中標示「未滿15」之年度身故保障僅供參考。'
    : '');

  const firstUserStop = rows.find(x => x.userPayStop);
  document.getElementById('tbl-body').innerHTML = rows.map(r => {
    const trClass = (r.userPayStop || r.targetSkipped) ? ' class="row-stopped"' : '';
    let stopMark = '';
    if (firstUserStop && r.yr === firstUserStop.yr) {
      stopMark = ' <span class="stop-chip" style="background:rgba(79,70,229,.12);color:#4338ca;border-color:rgba(99,102,241,.30)" title="使用者設定繳費期間已到">目標停繳</span>';
    } else if (r.targetSkipped) {
      stopMark = ' <span class="stop-chip" title="條款第十一條保額比例限制：本年度目標保費暫停">比例暫停</span>';
    }
    const extraCell = r.yearExtra > 0
      ? fmt(r.yearExtra) + (r.rejectedExtra > 0 ? ` <span class="stop-chip" title="部分月份未投入">部分未投入</span>` : '')
      : (r.rejectedExtra > 0 ? `<span class="muted">${fmt(r.rejectedExtra)}</span> <span class="stop-chip">未投入</span>` : '<span class="muted">—</span>');
    const deathCell = fmt(r.death) + (r.before15 ? ' <span class="stop-chip" title="未滿15足歲身故改給付喪葬費用保險金">未滿15</span>' : '');
    return `
    <tr${trClass}>
      <td>${r.yr}${stopMark}</td>
      <td>${r.age}</td>
      <td>${r.yearTarget > 0 ? fmt(r.yearTarget) : '<span class="muted">—</span>'}</td>
      <td>${extraCell}</td>
      <td>${r.yearSingle > 0 ? fmt(r.yearSingle) : (r.rejectedSingle > 0 ? `<span class="muted">${fmt(r.rejectedSingle)}</span> <span class="stop-chip" title="未通過檢核">未投入</span>` : '<span class="muted">—</span>')}</td>
      <td class="neg">${fmt(r.yearFee)}</td>
      <td class="neg">${fmt(r.yearMgmt)}</td>
      <td class="neg">${fmt(r.yearCOI)}</td>
      <td class="pos">${fmt(r.av)}</td>
      <td>${deathCell}</td>
    </tr>`;
  }).join('');

  // Show summary
  const summary = document.getElementById('summary');
  summary.style.display = 'block';
  summary.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Trigger animations (handled by animate.js)
  animateResults();
}

// Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { onMonthlyChange(); });
} else {
  onMonthlyChange();
}
