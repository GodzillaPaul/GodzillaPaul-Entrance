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
        padding: 10px 12px;
        background: #f5f5f7;
        color: #1d1d1f;
        z-index: -1;
        box-sizing: border-box;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Microsoft JhengHei", sans-serif;
      }
      .pdf-sheet { width: 100%; min-height: 1103px; box-sizing: border-box; }
      .pdf-topbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 8px; }
      .pdf-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
      .pdf-logo {
        width: 36px; height: 36px; border-radius: 12px; object-fit: cover;
        box-shadow: 0 4px 14px rgba(0,0,0,.16);
      }
      .pdf-kicker { font-size: 10px; letter-spacing: .16em; color: #86868b; font-weight: 800; }
      .pdf-title { margin: 1px 0 0; font-size: 18px; line-height: 1.12; color: #1d1d1f; font-weight: 900; }
      .pdf-date { color: #6e6e73; border: 1px solid #d9dde3; background: #fff; border-radius: 999px; padding: 6px 12px; font-size: 10.5px; white-space: nowrap; }
      .pdf-summary-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        border: 1px solid #d9dde3;
        border-radius: 12px;
        overflow: hidden;
        background: #fff;
        margin-bottom: 8px;
      }
      .pdf-metric { padding: 8px 10px; border-left: 1px solid #e6e8ec; min-width: 0; }
      .pdf-metric:first-child { border-left: 0; background: #eaf8f4; }
      .pdf-metric span { display: block; color: #6e6e73; font-size: 9.8px; line-height: 1.18; }
      .pdf-metric strong { display: block; color: #1d1d1f; font-size: 12px; line-height: 1.2; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .pdf-metric:first-child strong { color: var(--accent, #0f8b6b); font-size: 14px; }
      .pdf-focus {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
        margin-bottom: 8px;
      }
      .pdf-focus-card {
        background: #fff;
        border: 1px solid #d9dde3;
        border-radius: 12px;
        padding: 8px 10px;
        min-height: 46px;
      }
      .pdf-focus-card span { display: block; color: #6e6e73; font-size: 9.8px; line-height: 1.15; }
      .pdf-focus-card strong { display: block; color: #1d1d1f; font-size: 13px; line-height: 1.2; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .pdf-table-section { background: #fff; border: 1px solid #d9dde3; border-radius: 12px; overflow: hidden; }
      .pdf-table-head { display:flex; justify-content:space-between; align-items:center; gap:12px; padding: 7px 10px; color: #6e6e73; border-bottom: 1px solid #e6e8ec; font-size: 10.5px; }
      .pdf-table-head strong { color: var(--accent, #0f8b6b); font-size: 11px; }
      .pdf-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        font-size: 9.5px;
        font-variant-numeric: tabular-nums;
      }
      .pdf-table th {
        padding: 5px 3px;
        border-bottom: 1px solid var(--accent-mint, #8fe3d0);
        background: var(--accent-light, #eaf8f4);
        color: var(--accent, #0f8b6b);
        text-align: center;
        white-space: nowrap;
        font-size: 8.8px;
        line-height: 1.12;
        font-weight: 800;
      }
      .pdf-table td {
        padding: 4px 4px;
        border-bottom: 1px solid #ececf0;
        text-align: right;
        white-space: nowrap;
        line-height: 1.1;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .pdf-table td.txt,
      .pdf-table td:nth-child(1),
      .pdf-table td:nth-child(2) { text-align: center; color: #6e6e73; }
      .pdf-table tr:nth-child(even) td { background: #fafafa; }
      .pdf-table tr.pdf-highlight td { background: #fff8df !important; }
      .pdf-note { margin-top: 7px; color: #86868b; font-size: 9.8px; line-height: 1.45; }
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

  function parseNumber(value) {
    const n = Number(String(value || '').replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : null;
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

  function buildFocusCards(parts) {
    const { headers, rows } = parts;
    const kind = options.productKind;
    const last = rows[rows.length - 1] || { cells: [] };
    if (kind === 'income') {
      const firstSurv = rows.find(row => headers.some((h, i) => h.includes('生存') && row.cells[i] && row.cells[i] !== '—'));
      return [
        ['首次領回', firstSurv ? `${firstSurv.age || '—'}歲 / 第${firstSurv.year || '—'}年` : '—'],
        ['年度生存金', firstSurv ? findCell(firstSurv, headers, ['生存金', '領回']) : '—'],
        ['累積領回', firstSurv ? findCell(firstSurv, headers, ['累積生存', '累積領回']) : '—'],
        ['滿期解約金', findCell(last, headers, ['解約金', '解約'])],
      ];
    }
    const year6 = rows.find(row => row.year === 6) || rows[5] || rows[0] || { cells: [] };
    return [
      ['年繳保費', text('#h-prem')],
      ['第6年身故金', findCell(year6, headers, ['身故'])],
      ['第6年解約金', findCell(year6, headers, ['解約金', '解約'])],
      ['滿期身故金', findCell(last, headers, ['身故'])],
    ];
  }

  function getSummaryMetrics() {
    const s = readGlobal('state', null);
    const cfg = readGlobal('CONFIG', null);
    const genderLabel = s && Number(s.gender) === 2 ? '女' : '男';
    const amount = document.getElementById('amt-display')?.value || (s && s.sumInsured) || '—';
    const currency = text('#tbl-unit', s && s.currency === 'USD' ? '美元' : '新台幣元');
    const summary = text('#summary-pill', '');
    const productName = text('#h-title', cfg ? `${cfg.code || ''} ${cfg.name || ''}`.trim() : document.title);
    const periodMatch = summary.match(/(?:躉繳|[0-9N]+\s*年期|[0-9]+\s*退)/);
    const discountMatch = summary.match(/折扣率\s*([0-9.]+%)/);
    return [
      ['商品', productName],
      ['性別 / 年齡', `${genderLabel} / ${text('#h-age')}歲`],
      ['保額', `${amount} 萬美元`],
      ['保費', `${text('#h-prem')} ${currency}`],
      ['條件', [periodMatch && periodMatch[0], discountMatch && `折扣率 ${discountMatch[1]}`].filter(Boolean).join(' · ') || summary || '—'],
    ];
  }

  function buildPdfReportElement() {
    const parts = getTableParts();
    if (!parts || !parts.rows.length) throw new Error('No rendered table rows.');
    const shownRows = selectedRowsForPdf(parts.rows);
    const metrics = getSummaryMetrics();
    const focus = buildFocusCards(parts);
    const headerHtml = parts.headers.map(h => `<th>${h}</th>`).join('');
    const bodyHtml = shownRows.map(row => {
      const cls = row.highlight ? ' class="pdf-highlight"' : '';
      return `<tr${cls}>${row.cells.map((cell, i) => `<td${i < 2 ? ' class="txt"' : ''}>${cell}</td>`).join('')}</tr>`;
    }).join('');
    const stage = document.createElement('div');
    stage.className = 'pdf-stage';
    const today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
    stage.innerHTML = `
      <div class="pdf-sheet">
        <div class="pdf-topbar">
          <div class="pdf-brand">
            <img class="pdf-logo" src="${options.logoSrc || '../../login-assets/icon-512x512.png'}" alt="">
            <div>
              <div class="pdf-kicker">GODZILLAPAUL PRODUCT REPORT</div>
              <h1 class="pdf-title">${metrics[0][1]}</h1>
            </div>
          </div>
          <div class="pdf-date">產出日期 ${today}</div>
        </div>
        <div class="pdf-summary-grid">
          ${metrics.map(([label, value]) => `<div class="pdf-metric"><span>${label}</span><strong>${value}</strong></div>`).join('')}
        </div>
        <div class="pdf-focus">
          ${focus.map(([label, value]) => `<div class="pdf-focus-card"><span>${label}</span><strong>${value}</strong></div>`).join('')}
        </div>
        <div class="pdf-table-section">
          <div class="pdf-table-head"><strong>保單年度試算表</strong><span>單位：${text('#tbl-unit')}</span></div>
          <table class="pdf-table"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>
        </div>
        <div class="pdf-note">本報表依目前頁面試算條件產生，保單紅利為預估值，本公司不保證其給付金額；實際內容仍以正式保單條款與富邦人壽核保結果為準。</div>
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
