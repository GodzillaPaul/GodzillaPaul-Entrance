(function () {
  const DEFAULTS = {
    productKind: 'life',
    vendorBase: '../assets/vendor/',
    filePrefix: 'GodzillaPaul-商品試算',
    buttonText: '⇩ 匯出PDF'
  };
  const options = Object.assign({}, DEFAULTS, window.GP_PRODUCT_PDF || {});

  function readGlobal(name, fallback) {
    try {
      if (name === 'state' && typeof state !== 'undefined') return state;
      if (name === 'CONFIG' && typeof CONFIG !== 'undefined') return CONFIG;
      if (name === 'getVariant' && typeof getVariant === 'function') return getVariant;
    } catch (err) {
      return fallback;
    }
    return fallback;
  }

  function injectPdfStyles() {
    if (document.getElementById('gp-pdf-export-style')) return;
    const style = document.createElement('style');
    style.id = 'gp-pdf-export-style';
    style.textContent = `
      .pdf-export-btn {
        border: 0;
        background: linear-gradient(135deg, var(--accent, #169873), var(--accent-2, #74c69d));
        color: #fff;
        padding: 7px 16px;
        border-radius: 999px;
        font: inherit;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
        margin-left: 8px;
        box-shadow: 0 10px 24px rgba(22, 152, 115, 0.22);
      }
      .pdf-export-btn:hover { filter: brightness(1.04); transform: translateY(-1px); }
      .pdf-export-btn:disabled { opacity: 0.56; cursor: wait; transform: none; }

      .pdf-stage {
        position: fixed;
        left: -99999px;
        top: 0;
        width: 794px;
        min-height: 1123px;
        padding: 8px 10px;
        background: #f5f5f7;
        color: #1d1d1f;
        z-index: -1;
        box-sizing: border-box;
        font-family: "Microsoft JhengHei", "PingFang TC", "Heiti TC", "Noto Sans TC", system-ui, Arial, sans-serif;
      }
      .pdf-sheet { width: 100%; min-height: 1107px; box-sizing: border-box; }
      .pdf-topbar { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
      .pdf-badge {
        display: inline-flex;
        align-items: center;
        min-height: 28px;
        border-radius: 999px;
        padding: 6px 18px;
        background: var(--accent, #2e8b7e);
        color: white;
        font-size: 15px;
        font-weight: 900;
        letter-spacing: .02em;
      }
      .pdf-date {
        color: #76777c;
        border: 1px solid #d9dde3;
        background: white;
        border-radius: 999px;
        padding: 6px 14px;
        font-size: 12px;
        white-space: nowrap;
      }

      .pdf-summary-section,
      .pdf-table-section,
      .pdf-income-compare {
        background: white;
        border: 1px solid #d9dde3;
        border-radius: 9px;
        overflow: hidden;
      }
      .pdf-summary-section { margin-bottom: 8px; }
      .pdf-summary-head {
        background: var(--accent, #2e8b7e);
        color: white;
        padding: 8px 14px;
        font-weight: 900;
        text-align: center;
        font-size: 15px;
      }
      .pdf-summary-body {
        display: grid;
        grid-template-columns: 1.15fr 1fr 1fr 1fr;
      }
      .pdf-metric {
        padding: 9px 12px;
        border-left: 1px solid #d9dde3;
        min-width: 0;
      }
      .pdf-metric:first-child { border-left: 0; background: var(--accent-row, #d8f2eb); }
      .pdf-metric span { display: block; color: #76777c; font-size: 10.5px; line-height: 1.2; }
      .pdf-metric strong {
        display: block;
        color: #1d1d1f;
        font-size: 13px;
        margin-top: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .pdf-metric:first-child strong { color: var(--accent, #2e8b7e); font-size: 18px; }

      .pdf-income-compare {
        display: grid;
        grid-template-columns: 1fr 1fr;
        margin-bottom: 10px;
      }
      .pdf-income-card { min-height: 174px; }
      .pdf-income-card:first-child { background: var(--accent-row, #dff3ee); }
      .pdf-income-title {
        background: var(--accent, #2e8b7e);
        color: white;
        text-align: center;
        font-size: 15px;
        font-weight: 900;
        padding: 9px 12px;
      }
      .pdf-income-body {
        display: grid;
        grid-template-columns: 106px 1fr;
        gap: 12px;
        padding: 11px 16px 12px;
      }
      .pdf-income-card:nth-child(2) .pdf-income-body { grid-template-columns: 1fr 106px; }
      .pdf-donut-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .pdf-donut {
        width: 70px;
        height: 70px;
        border-radius: 999px;
        display: grid;
        place-items: center;
        background: conic-gradient(var(--accent, #2e8b7e) var(--pdf-age-pct, 38%), #dedede var(--pdf-age-pct, 38%));
      }
      .pdf-donut span {
        display: grid;
        place-items: center;
        width: 52px;
        height: 52px;
        border-radius: 999px;
        background: #fff;
        color: #1d1d1f;
        font-weight: 900;
        font-size: 15px;
      }
      .pdf-donut-amount { color: var(--accent, #2e8b7e); font-size: 20px; font-weight: 900; }
      .pdf-donut-amount small { color: #76777c; font-size: 10px; font-weight: 700; }
      .pdf-donut-muted .pdf-donut { opacity: .95; }
      .pdf-donut-muted .pdf-donut-amount { color: #76777c; }
      .pdf-income-main {
        color: var(--accent, #2e8b7e);
        font-size: 30px;
        font-weight: 950;
        line-height: 1;
        margin-bottom: 6px;
      }
      .pdf-income-main small { font-size: 14px; }
      .pdf-income-line { font-size: 12.3px; line-height: 1.58; color: #1d1d1f; }
      .pdf-income-line strong { color: var(--accent, #2e8b7e); font-weight: 950; }
      .pdf-income-muted { color: #76777c; margin-top: 7px; border-top: 1px dashed #d8e2df; padding-top: 6px; }

      .pdf-table-section { margin-top: 0; }
      .pdf-table-note {
        padding: 6px 12px;
        color: #76777c;
        border-bottom: 1px solid #d9dde3;
        font-size: 10.5px;
        background: white;
      }
      .pdf-table-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 7px 10px;
        color: #76777c;
        border-bottom: 1px solid #e6e8ec;
        font-size: 10.5px;
      }
      .pdf-table-head strong { color: var(--accent, #2e8b7e); font-size: 11px; }
      .pdf-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        font-size: 9.7px;
        font-variant-numeric: tabular-nums;
      }
      .pdf-table th {
        padding: 5px 3px;
        border-bottom: 1px solid var(--accent-mint, #8fe3d0);
        background: var(--accent-light, #eaf8f4);
        color: var(--accent, #2e8b7e);
        text-align: center;
        white-space: nowrap;
        font-size: 9px;
        line-height: 1.12;
        font-weight: 800;
      }
      .pdf-table td {
        padding: 4px 4px;
        border-bottom: 1px solid #ececf0;
        text-align: right;
        white-space: nowrap;
        line-height: 1.12;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .pdf-table td.txt,
      .pdf-table td:nth-child(1),
      .pdf-table td:nth-child(2) { text-align: center; color: #76777c; }
      .pdf-table tr:nth-child(even) td { background: #fafafa; }
      .pdf-report.is-life .pdf-table tr.pdf-highlight td { background: var(--milestone, #d8f2eb) !important; }
      .pdf-report.is-income .pdf-table tr.pdf-highlight td { background: var(--accent-row, #d8f2eb) !important; }
      .pdf-report.is-life .pdf-table th:nth-child(1),
      .pdf-report.is-life .pdf-table th:nth-child(2),
      .pdf-report.is-life .pdf-table td:nth-child(1),
      .pdf-report.is-life .pdf-table td:nth-child(2) { width: 7.2%; }
      .pdf-report.is-life .pdf-table th:nth-child(3),
      .pdf-report.is-life .pdf-table th:nth-child(4),
      .pdf-report.is-life .pdf-table td:nth-child(3),
      .pdf-report.is-life .pdf-table td:nth-child(4) { width: 15.2%; }
      .pdf-report.is-life .pdf-table th:nth-child(5),
      .pdf-report.is-life .pdf-table th:nth-child(6),
      .pdf-report.is-life .pdf-table th:nth-child(7),
      .pdf-report.is-life .pdf-table td:nth-child(5),
      .pdf-report.is-life .pdf-table td:nth-child(6),
      .pdf-report.is-life .pdf-table td:nth-child(7) { width: 18.4%; }
      .pdf-report.is-income .pdf-table { font-size: 9.45px; }
      .pdf-report.is-income .pdf-table th { font-size: 8.6px; }
      .pdf-report.is-income .pdf-table td { padding: 3.8px 4px; }
      .pdf-report.is-income .pdf-table th:nth-child(1),
      .pdf-report.is-income .pdf-table th:nth-child(2),
      .pdf-report.is-income .pdf-table td:nth-child(1),
      .pdf-report.is-income .pdf-table td:nth-child(2) { width: 6.2%; }
      .pdf-note { margin-top: 6px; color: #86868b; font-size: 9.6px; line-height: 1.35; }
    `;
    document.head.appendChild(style);
  }

  function ensureButton() {
    let btn = document.getElementById('pdfExportBtn');
    if (btn) return btn;
    const fx = document.getElementById('fxRefresh');
    if (!fx) return null;
    btn = document.createElement('button');
    btn.className = 'pdf-export-btn';
    btn.id = 'pdfExportBtn';
    btn.type = 'button';
    btn.textContent = options.buttonText;
    fx.insertAdjacentElement('afterend', btn);
    return btn;
  }

  function text(selector, fallback = '—') {
    const el = document.querySelector(selector);
    const value = el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
    return value || fallback;
  }

  function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[ch]));
  }

  function parseNumber(value) {
    const n = Number(String(value || '').replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : null;
  }

  function getCssVar(name, fallback) {
    const value = getComputedStyle(document.body).getPropertyValue(name).trim()
      || getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  function getTableParts() {
    const table = document.querySelector('table.illu');
    if (!table) return null;
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => cleanText(th.textContent));
    const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => {
      const cells = Array.from(tr.children).map(td => cleanText(td.textContent));
      return {
        tr,
        cells,
        year: parseNumber(cells[0]),
        age: parseNumber(cells[1]),
        highlight: tr.classList.contains('milestone') || tr.classList.contains('surv-row')
      };
    }).filter(row => row.cells.length);
    return { headers, rows };
  }

  function selectedRowsForPdf(rows) {
    if (!rows || !rows.length) return [];
    const kind = options.productKind;
    const maxRows = kind === 'income' ? 34 : 48;
    const selected = new Set();
    const addRow = row => { if (row) selected.add(row); };
    const addYear = yr => addRow(rows.find(r => r.year === yr));
    const addAge = age => addRow(rows.find(r => r.age === age));
    const lastYear = rows[rows.length - 1].year;

    for (let yr = 1; yr <= 11; yr += 1) addYear(yr);
    for (let yr = 15; yr <= lastYear; yr += 5) addYear(yr);

    let firstMarkerAge = 64;
    if (kind === 'income') {
      const s = readGlobal('state', null);
      const getVariant = readGlobal('getVariant', null);
      try {
        const variant = getVariant && s ? getVariant(s.prod) : null;
        if (variant && variant.retireAge) firstMarkerAge = Number(variant.retireAge) - 1;
      } catch (err) {}
    }
    for (let age = firstMarkerAge; age <= 94; age += 5) addAge(age);
    addRow(rows[rows.length - 1]);

    const markerRow = rows.find(r => r.age === firstMarkerAge);
    const fillStartYear = markerRow ? markerRow.year : 12;
    for (const row of rows) {
      if (selected.size >= maxRows) break;
      if (row.year >= fillStartYear && !selected.has(row)) selected.add(row);
    }
    return rows.filter(row => selected.has(row)).slice(0, maxRows);
  }

  function findCell(row, headers, needles) {
    const idx = headers.findIndex(h => needles.some(n => h.includes(n)));
    return idx >= 0 ? row.cells[idx] : '—';
  }

  function getSummary() {
    const s = readGlobal('state', null);
    const cfg = readGlobal('CONFIG', null);
    const genderLabel = s && Number(s.gender) === 2 ? '女' : '男';
    const amount = document.getElementById('amt-display')?.value || (s && s.sumInsured) || '—';
    const productName = text('#h-title', cfg ? `${cfg.code || ''} ${cfg.name || ''}`.trim() : document.title);
    const summary = text('#summary-pill', '');
    const periodMatch = summary.match(/(?:躉繳|[0-9N]+\s*年期|[0-9]+\s*退|[0-9]+\s*年)/);
    const discountMatch = summary.match(/折扣率\s*([0-9.]+%)/);
    const conditionParts = [periodMatch && periodMatch[0], `${amount} 萬`, `${genderLabel}${text('#h-age')}歲`, discountMatch && `折扣率 ${discountMatch[1]}`].filter(Boolean);
    return {
      productName,
      genderLabel,
      age: text('#h-age'),
      amount,
      premium: text('#h-prem'),
      unit: text('#tbl-unit'),
      summary,
      badge: conditionParts.join(' · ') || summary || productName
    };
  }

  function getLifeMetrics(parts) {
    const { headers, rows } = parts;
    const summary = getSummary();
    const year6 = rows.find(row => row.year === 6) || rows[5] || rows[0] || { cells: [] };
    const last = rows[rows.length - 1] || { cells: [] };
    return [
      ['折扣後年繳保費', `${summary.premium} ${summary.unit}`],
      ['第 6 年身故金', findCell(year6, headers, ['身故'])],
      ['第 6 年解約金', findCell(year6, headers, ['解約金', '解約'])],
      ['滿期身故/解約金', findCell(last, headers, ['身故'])],
    ];
  }

  function getIncomeCompareData(parts) {
    const s = readGlobal('state', null);
    const age = text('#ig-age-left', text('#h-age'));
    const leftAge = Number.isFinite(parseNumber(age)) ? parseNumber(age) : parseNumber(text('#h-age')) || 38;
    const agePct = Math.max(0, Math.min(leftAge, 99));
    const firstSurv = parts.rows.find(row => parts.headers.some((h, i) => h.includes('生存') && row.cells[i] && row.cells[i] !== '—'));
    const firstSurvValue = firstSurv ? findCell(firstSurv, parts.headers, ['生存金', '領回']) : '—';
    const firstSurvAge = firstSurv ? firstSurv.age : '—';
    const variantYears = text('#ig-retire-years-l', '20');
    const retireAge = text('#ig-X-l', firstSurvAge);
    const highlight = id => text(id, '—');
    const hasInfographic = document.getElementById('info-section') && text('#ig-C', '') !== '';
    const left = {
      title: '富邦幫你存',
      age,
      amount: highlight('#ig-H') || '—',
      years: '6',
      lines: hasInfographic ? [
        ['一年存', `${highlight('#ig-C')} 萬，只要存 6 年`],
        ['退休時帳戶增值到', `${highlight('#ig-D')} 萬`],
        ['省下', `${highlight('#ig-E')} 萬`],
      ] : [
        ['首次領回', `${firstSurvAge}歲 / 第${firstSurv?.year || '—'}年`],
        ['年度生存金', firstSurvValue],
        ['目前保額', `${s?.sumInsured || text('#amt-display')} 萬美元`],
      ],
      retire: hasInfographic ? [
        [`退休 ${variantYears} 年 ${retireAge}～85歲`, ''],
        ['退休時每年花', `${highlight('#ig-F')} 萬`],
        ['花完了', `${highlight('#ig-G')} 萬`],
      ] : [
        [`${retireAge}歲開始領回`, ''],
        ['年度生存金', firstSurvValue],
        ['累積生存金', firstSurv ? findCell(firstSurv, parts.headers, ['累積生存', '累積領回']) : '—'],
      ]
    };
    const right = {
      title: '自己慢慢存',
      age: text('#ig-age-right', age),
      amount: highlight('#ig-P') || '—',
      years: highlight('#ig-B') || (Number(retireAge) && Number(age) ? String(Number(retireAge) - Number(age)) : '—'),
      lines: hasInfographic ? [
        ['一年存', `${highlight('#ig-I')} 萬，持續存 ${highlight('#ig-J')} 年`],
        ['退休時存款累積到', `${highlight('#ig-K')} 萬`],
        ['總存', `${highlight('#ig-L')} 萬`],
      ] : [
        ['假設自己存到退休', `${retireAge}歲前持續累積`],
        ['退休目標', firstSurvValue],
        ['對照基準', '以頁面試算結果呈現'],
      ],
      retire: hasInfographic ? [
        [`退休 ${text('#ig-retire-years-r', variantYears)} 年 ${text('#ig-X-r', retireAge)}～85歲`, ''],
        ['退休時每年花', `${highlight('#ig-M')} 萬`],
        ['花光了', `${highlight('#ig-N')} 萬`],
      ] : [
        ['同樣退休節奏', '需自行累積與控管'],
        ['參考年度領回', firstSurvValue],
        ['剩餘資產', '依實際存款利率不同'],
      ]
    };
    return { left, right, agePct };
  }

  function renderTableHtml(parts, shownRows) {
    const headerHtml = parts.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('');
    const bodyHtml = shownRows.map(row => {
      const cls = row.highlight ? ' class="pdf-highlight"' : '';
      return `<tr${cls}>${row.cells.map((cell, i) => `<td${i < 2 ? ' class="txt"' : ''}>${escapeHtml(cell)}</td>`).join('')}</tr>`;
    }).join('');
    return `<table class="pdf-table"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
  }

  function renderLifeReport(parts, shownRows, today) {
    const summary = getSummary();
    const metrics = getLifeMetrics(parts);
    return `
      <div class="pdf-report is-life">
        <div class="pdf-topbar">
          <div class="pdf-badge">${escapeHtml(summary.badge)}</div>
          <div class="pdf-date">產出日期 ${escapeHtml(today)}</div>
        </div>
        <section class="pdf-summary-section">
          <div class="pdf-summary-head">${escapeHtml(summary.productName)}</div>
          <div class="pdf-summary-body">
            ${metrics.map(([label, value]) => `<div class="pdf-metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}
          </div>
        </section>
        <section class="pdf-table-section">
          <div class="pdf-table-note">‧ 本保險為分紅保險單,保單紅利為預估值,本公司不保證其給付金額。最可能紅利‧繳清保險金額。</div>
          ${renderTableHtml(parts, shownRows)}
        </section>
      </div>
    `;
  }

  function incomeLinesHtml(lines) {
    return lines.map(([label, value]) => {
      if (!value) return `<div class="pdf-income-line pdf-income-muted">${escapeHtml(label)}</div>`;
      return `<div class="pdf-income-line">${escapeHtml(label)} <strong>${escapeHtml(value)}</strong></div>`;
    }).join('');
  }

  function renderIncomePanel(data, side) {
    const donutClass = side === 'right' ? ' pdf-donut-muted' : '';
    const donut = `
      <div class="pdf-donut-wrap${donutClass}">
        <div class="pdf-donut"><span>${escapeHtml(data.age)}歲</span></div>
        <div class="pdf-donut-amount">${escapeHtml(data.amount)}<small> 萬</small></div>
      </div>
    `;
    const textBlock = `
      <div>
        <div class="pdf-income-main">${escapeHtml(data.years)}<small>年</small></div>
        ${incomeLinesHtml(data.lines)}
        <div class="pdf-income-muted">${incomeLinesHtml(data.retire)}</div>
      </div>
    `;
    return `
      <div class="pdf-income-card">
        <div class="pdf-income-title">${escapeHtml(data.title)}</div>
        <div class="pdf-income-body">
          ${side === 'right' ? `${textBlock}${donut}` : `${donut}${textBlock}`}
        </div>
      </div>
    `;
  }

  function renderIncomeReport(parts, shownRows, today) {
    const summary = getSummary();
    const compare = getIncomeCompareData(parts);
    document.documentElement.style.setProperty('--pdf-age-pct', `${compare.agePct}%`);
    return `
      <div class="pdf-report is-income">
        <div class="pdf-topbar">
          <div class="pdf-badge">${escapeHtml(summary.badge)}</div>
          <div class="pdf-date">產出日期 ${escapeHtml(today)}</div>
        </div>
        <section class="pdf-income-compare" style="--accent:${escapeHtml(getCssVar('--accent', '#2e8b7e'))};--pdf-age-pct:${compare.agePct}%;">
          ${renderIncomePanel(compare.left, 'left')}
          ${renderIncomePanel(compare.right, 'right')}
        </section>
        <section class="pdf-table-section">
          <div class="pdf-table-note">‧ 本保險為分紅保險單,保單紅利為預估值,本公司不保證其給付金額。最可能紅利‧繳清保險金額。</div>
          ${renderTableHtml(parts, shownRows)}
        </section>
      </div>
    `;
  }

  function buildPdfReportElement() {
    const parts = getTableParts();
    if (!parts || !parts.rows.length) throw new Error('No rendered table rows.');
    const shownRows = selectedRowsForPdf(parts.rows);
    const stage = document.createElement('div');
    stage.className = 'pdf-stage';
    const today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
    stage.innerHTML = `
      <div class="pdf-sheet">
        ${options.productKind === 'income' ? renderIncomeReport(parts, shownRows, today) : renderLifeReport(parts, shownRows, today)}
      </div>
    `;
    return stage;
  }

  function loadPdfScript(src, ready) {
    if (ready()) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existed = Array.from(document.scripts).find(s => (s.getAttribute('src') || '').endsWith(src));
      if (existed) {
        if (ready()) resolve();
        existed.addEventListener('load', resolve, { once: true });
        existed.addEventListener('error', reject, { once: true });
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function buildPdfFileName() {
    const product = text('#h-title', options.filePrefix).replace(/[\\/:*?"<>|]/g, '-');
    const age = text('#h-age', 'age');
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `${product}-${age}歲-試算報告-${date}.pdf`;
  }

  async function exportPdf() {
    const parts = getTableParts();
    if (!parts || !parts.rows.length || document.getElementById('tbl-section')?.style.display === 'none') {
      alert('請先完成試算後再匯出 PDF。');
      return;
    }
    const btn = document.getElementById('pdfExportBtn');
    const originalText = btn ? btn.textContent : '';
    let stage = null;
    try {
      if (btn) {
        btn.disabled = true;
        btn.textContent = '產生中...';
      }
      await loadPdfScript(`${options.vendorBase}html2canvas.min.js`, () => !!window.html2canvas);
      await loadPdfScript(`${options.vendorBase}jspdf.umd.min.js`, () => !!window.jspdf?.jsPDF);
      stage = buildPdfReportElement();
      document.body.appendChild(stage);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const canvas = await window.html2canvas(stage, {
        scale: 2,
        backgroundColor: '#f5f5f7',
        useCORS: true,
        logging: false
      });
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
      pdf.save(buildPdfFileName());
    } catch (err) {
      console.error(err);
      alert('PDF 匯出失敗，請稍後再試。');
    } finally {
      if (stage) stage.remove();
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalText || options.buttonText;
      }
    }
  }

  function initPdfExport() {
    injectPdfStyles();
    const btn = ensureButton();
    if (btn && !btn.dataset.gpPdfBound) {
      btn.dataset.gpPdfBound = '1';
      btn.addEventListener('click', exportPdf);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPdfExport);
  } else {
    initPdfExport();
  }
})();
