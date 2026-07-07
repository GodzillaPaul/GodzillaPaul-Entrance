/* ============================================================
   A4 客戶試算摘要 v2
   業務 KYC 追蹤用：理想 vs 調整後 兩版本 + 收入結構 + 手寫備註區
   依賴：html2canvas + jsPDF（CDN 已載入）
   ============================================================ */
(function() {
    'use strict';

    const CAT_NAMES = {
        living:    '生活費',
        house:     '房貸 / 房租',
        car:       '車',
        wedding:   '家庭開銷',
        children:  '子女',
        parents:   '父母',
        emergency: '緊急預備金',
        medical:   '醫療',
        retirement:'退休',
        other:     '其他'
    };
    const FIXED_ORDER = ['living','house','car','wedding','children','parents','emergency','medical','retirement','other'];

    // ── helpers ─────────────────────────────────────────────
    const fmt = (n) => Math.round(Number(n) || 0).toLocaleString('zh-TW');
    const wanToYuan = (n) => Math.round((Number(n) || 0) * 10000);
    const fmtYuan = (n) => fmt(n) + ' 元';
    const fmtYuanFromWan = (n) => fmt(wanToYuan(n)) + ' 元';

    function todayString() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }
    function safeFilename(s) {
        return String(s || '客戶').replace(/[\\/:*?"<>|]/g, '').trim() || '客戶';
    }

    // ── 注入 A4 sheet 模板 ──────────────────────────────────
    function ensureSheet() {
        if (document.getElementById('a4-summary-sheet')) return;
        const sheet = document.createElement('div');
        sheet.id = 'a4-summary-sheet';
        sheet.setAttribute('aria-hidden', 'true');
        sheet.innerHTML = `
            <div class="a4-page">
                <!-- Header -->
                <div class="a4-header">
                    <div>
                        <div class="a4-title">現實人生計算機 · 客戶試算摘要</div>
                        <div class="a4-subtitle">理想生活現金流規劃　·　業務追蹤紀錄</div>
                    </div>
                    <div class="a4-date">產出日期<strong id="a4-date">—</strong></div>
                </div>

                <!-- Profile -->
                <div class="a4-profile">
                    <div class="a4-profile-item"><div class="a4-profile-label">姓名</div><div class="a4-profile-value" id="a4-name">—</div></div>
                    <div class="a4-profile-item"><div class="a4-profile-label">年齡</div><div class="a4-profile-value" id="a4-age">—</div></div>
                    <div class="a4-profile-item"><div class="a4-profile-label">性別</div><div class="a4-profile-value" id="a4-gender">—</div></div>
                    <div class="a4-profile-item"><div class="a4-profile-label">預計退休</div><div class="a4-profile-value" id="a4-retire">—</div></div>
                </div>

                <!-- 收入結構 -->
                <div class="a4-section">
                    <div class="a4-section-title">收入結構</div>
                    <div class="a4-income">
                        <div class="a4-income-card"><div class="a4-inc-label">工作收入</div><div class="a4-inc-value" id="a4-inc-work">—</div></div>
                        <div class="a4-inc-divider">+</div>
                        <div class="a4-income-card"><div class="a4-inc-label">斜槓收入</div><div class="a4-inc-value" id="a4-inc-slash">—</div></div>
                        <div class="a4-inc-divider">+</div>
                        <div class="a4-income-card"><div class="a4-inc-label">投資收入</div><div class="a4-inc-value" id="a4-inc-invest">—</div></div>
                    </div>
                    <div class="a4-income" style="grid-template-columns:repeat(3,1fr); margin-top:6px;">
                        <div class="a4-income-card total"><div class="a4-inc-label">每月總收入</div><div class="a4-inc-value" id="a4-inc-total">—</div></div>
                        <div class="a4-income-card"><div class="a4-inc-label">距理想生活</div><div class="a4-inc-value" id="a4-gap-ideal" style="color:#e84b1c;">—</div></div>
                        <div class="a4-income-card"><div class="a4-inc-label">距調整後生活</div><div class="a4-inc-value" id="a4-gap-adjust" style="color:#e84b1c;">—</div></div>
                    </div>
                </div>

                <!-- 兩種情境並列 -->
                <div class="a4-section">
                    <div class="a4-section-title">兩種生活情境對比（KYC 追蹤重點）</div>
                    <div class="a4-scenario">
                        <div class="a4-scn-card ideal">
                            <span class="a4-scn-tag">理想生活</span>
                            <div class="a4-scn-rows">
                                <span class="a4-scn-key">月支出</span><span class="a4-scn-val" id="a4-ideal-exp">—</span>
                                <span class="a4-scn-key">月差距</span><span class="a4-scn-val gap-bad" id="a4-ideal-gap">—</span>
                                <span class="a4-scn-key">年差距</span><span class="a4-scn-val gap-bad" id="a4-ideal-gap-year">—</span>
                                <span class="a4-scn-key">退休前需補</span><span class="a4-scn-val gap-bad" id="a4-ideal-gap-life">—</span>
                            </div>
                        </div>
                        <div class="a4-scn-card adjust">
                            <span class="a4-scn-tag">調整後生活</span>
                            <div class="a4-scn-rows">
                                <span class="a4-scn-key">月支出</span><span class="a4-scn-val" id="a4-adj-exp">—</span>
                                <span class="a4-scn-key">月差距</span><span class="a4-scn-val gap-bad" id="a4-adj-gap">—</span>
                                <span class="a4-scn-key">年差距</span><span class="a4-scn-val gap-bad" id="a4-adj-gap-year">—</span>
                                <span class="a4-scn-key">退休前需補</span><span class="a4-scn-val gap-bad" id="a4-adj-gap-life">—</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 支出明細：理想 vs 調整後 兩版本並列細節（業務日後談話用） -->
                <div class="a4-section">
                    <div class="a4-section-title">客戶選擇明細：理想 vs 調整後（業務記憶用）</div>
                    <table class="a4-exp-table">
                        <colgroup>
                            <col style="width:13%">
                            <col style="width:43.5%">
                            <col style="width:43.5%">
                        </colgroup>
                        <thead>
                            <tr>
                                <th>類別</th>
                                <th class="th-ideal">理想生活（客戶想要的畫面）</th>
                                <th class="th-adjust">調整後生活（實際規劃）</th>
                            </tr>
                        </thead>
                        <tbody id="a4-exp-tbody"></tbody>
                        <tfoot>
                            <tr>
                                <td>總支出</td>
                                <td class="ideal" id="a4-exp-total-ideal">—</td>
                                <td class="adjust" id="a4-exp-total-adjust">—</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <!-- 退休準備規劃 -->
                <div class="a4-section">
                    <div class="a4-section-title">退休準備規劃</div>
                    <div class="a4-retire">
                        <div class="a4-profile-item"><div class="a4-profile-label">退休總準備金</div><div class="a4-profile-value" id="a4-ret-total">—</div></div>
                        <div class="a4-profile-item"><div class="a4-profile-label">退休後月支出</div><div class="a4-profile-value" id="a4-ret-monthly">—</div></div>
                        <div class="a4-profile-item"><div class="a4-profile-label">距離退休</div><div class="a4-profile-value" id="a4-ret-years">—</div></div>
                    </div>
                </div>

                <!-- KYC 業務追蹤備註區 -->
                <div class="a4-section">
                    <div class="a4-section-title">業務追蹤備註（KYC / FYC 紀錄）</div>
                    <div class="a4-kyc">
                        <div class="a4-kyc-head">
                            <div class="a4-kyc-title">下次追蹤前先回顧 ↓</div>
                            <div class="a4-kyc-hint">手寫填入</div>
                        </div>
                        <div class="a4-kyc-grid">
                            <div class="a4-kyc-row">
                                <span class="a4-kyc-key">介紹人</span>
                                <span class="a4-kyc-line"></span>
                            </div>
                            <div class="a4-kyc-row">
                                <span class="a4-kyc-key">下次追蹤</span>
                                <span class="a4-kyc-line"></span>
                            </div>
                            <div class="a4-kyc-row">
                                <span class="a4-kyc-key">客戶痛點</span>
                                <span class="a4-kyc-line"></span>
                            </div>
                            <div class="a4-kyc-row">
                                <span class="a4-kyc-key">優先級</span>
                                <span class="a4-kyc-line"></span>
                            </div>
                            <div class="a4-kyc-row tall">
                                <span class="a4-kyc-key">客戶想法 / 收入結構討論</span>
                                <span class="a4-kyc-line"></span>
                            </div>
                            <div class="a4-kyc-row tall">
                                <span class="a4-kyc-key">下一步行動 / 推薦商品</span>
                                <span class="a4-kyc-line"></span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="a4-footer">
                    <span>現實人生計算機　|　業務員：____________</span>
                    <span>本試算僅供參考，正確規劃請諮詢壽險顧問</span>
                </div>
            </div>
        `;
        document.body.appendChild(sheet);
    }

    // ── 讀 app.js 全域 state（u / exp / baselineSummary / currentSummary / slashItems）──
    function readState() {
        const out = { u: {}, exp: {}, baseline: null, current: null, slashItems: [] };
        try { out.u        = (typeof u !== 'undefined') ? u : (window.u || {}); } catch (e) {}
        try { out.exp      = (typeof exp !== 'undefined') ? exp : (window.exp || {}); } catch (e) {}
        try { out.baseline = (typeof baselineSummary !== 'undefined') ? baselineSummary : (window.baselineSummary || null); } catch (e) {}
        try { out.current  = (typeof currentSummary  !== 'undefined') ? currentSummary  : (window.currentSummary || null); } catch (e) {}
        try { out.slashItems = (typeof slashItems !== 'undefined') ? slashItems : (window.slashItems || []); } catch (e) {}
        return out;
    }

    // ── 讀收入結構（從 DOM 表單） ──
    function readIncome(state) {
        const $ = (id) => document.getElementById(id);
        const workOverride  = parseFloat($('inc-work-input')?.value) || 0;
        const workFromStep1 = Math.round((state.u.income || 0) * 10000);
        const work          = workOverride > 0 ? workOverride : workFromStep1;

        const slash = (state.slashItems || []).reduce((s, it) => s + (it.amount || 0), 0);

        const principal     = parseFloat($('inc-invest-principal')?.value) || 0;
        const principalMon  = Math.round(principal * 0.07 / 12);
        const manualInvest  = parseFloat($('inc-invest-input')?.value) || 0;
        const invest        = principalMon + manualInvest;

        return { work, slash, invest, total: work + slash + invest };
    }

    // ── 構建明細：理想 + 調整後 兩版本並列 ──
    function buildExpRows(baseline, current) {
        const a = baseline?.items || [];
        const b = current?.items  || [];
        const mapA = Object.fromEntries(a.map(i => [i.key, i]));
        const mapB = Object.fromEntries(b.map(i => [i.key, i]));
        // 凡是出現在任一版本（金額 > 0）的類別都列出來
        const keys = FIXED_ORDER.filter(k =>
            (mapA[k] && mapA[k].amount > 0) ||
            (mapB[k] && mapB[k].amount > 0)
        );
        return keys.map(k => {
            const ia = mapA[k];
            const ib = mapB[k];
            return {
                key: k,
                name: CAT_NAMES[k],
                ideal: {
                    choice: (ia?.choice || '').toString(),
                    label:  (ia?.label  || '').toString(),
                    amountWan: ia?.amount || 0,
                },
                adjust: {
                    choice: (ib?.choice || '').toString(),
                    label:  (ib?.label  || '').toString(),
                    amountWan: ib?.amount || 0,
                },
            };
        });
    }

    // ── 計算所有顯示數值 ──
    function gather() {
        const state = readState();
        const { u, exp, baseline, current } = state;

        const inc = readIncome(state);

        const idealTotalWan  = baseline ? (baseline.total || 0) : 0;
        const adjustTotalWan = current  ? (current.total || 0)  : 0;
        const idealTotalYuan  = wanToYuan(idealTotalWan);
        const adjustTotalYuan = wanToYuan(adjustTotalWan);

        const gapIdeal  = Math.max(idealTotalYuan  - inc.total, 0);
        const gapAdjust = Math.max(adjustTotalYuan - inc.total, 0);

        const yearsToRetire = Math.max(0, (Number(u.retire) || 0) - (Number(u.age) || 0));

        return {
            nickname: u.nickname || '—',
            age:      Number(u.age) || 0,
            gender:   u.gender === 'F' ? '女' : '男',
            retire:   Number(u.retire) || 0,
            yearsToRetire,
            inc,
            idealTotalYuan, adjustTotalYuan,
            gapIdeal, gapAdjust,
            rows: buildExpRows(baseline, current),
            retTargetTotal: (exp.retirement?.targetTotal)   || 0,
            retMonthly:     (exp.retirement?.targetMonthly) || 0,
        };
    }

    // ── 填入版面 ──
    function populate(d) {
        const $ = (id) => document.getElementById(id);

        $('a4-date').textContent   = todayString();
        $('a4-name').textContent   = d.nickname;
        $('a4-age').textContent    = d.age > 0 ? d.age + ' 歲' : '—';
        $('a4-gender').textContent = d.gender;
        $('a4-retire').textContent = d.retire > 0 ? d.retire + ' 歲' : '—';

        // 收入結構
        $('a4-inc-work').textContent   = fmtYuan(d.inc.work);
        $('a4-inc-slash').textContent  = fmtYuan(d.inc.slash);
        $('a4-inc-invest').textContent = fmtYuan(d.inc.invest);
        $('a4-inc-total').textContent  = fmtYuan(d.inc.total);
        $('a4-gap-ideal').textContent  = d.idealTotalYuan  > 0 ? '還差 ' + fmtYuan(d.gapIdeal)  : '—';
        $('a4-gap-adjust').textContent = d.adjustTotalYuan > 0 ? '還差 ' + fmtYuan(d.gapAdjust) : '—';

        // 兩種情境
        $('a4-ideal-exp').textContent      = d.idealTotalYuan  > 0 ? fmtYuan(d.idealTotalYuan)         : '—';
        $('a4-adj-exp').textContent        = d.adjustTotalYuan > 0 ? fmtYuan(d.adjustTotalYuan)        : '—';
        $('a4-ideal-gap').textContent      = d.idealTotalYuan  > 0 ? fmtYuan(d.gapIdeal) + ' / 月'      : '—';
        $('a4-adj-gap').textContent        = d.adjustTotalYuan > 0 ? fmtYuan(d.gapAdjust) + ' / 月'     : '—';
        $('a4-ideal-gap-year').textContent = d.idealTotalYuan  > 0 ? fmtYuan(d.gapIdeal * 12) + ' / 年'  : '—';
        $('a4-adj-gap-year').textContent   = d.adjustTotalYuan > 0 ? fmtYuan(d.gapAdjust * 12) + ' / 年' : '—';
        $('a4-ideal-gap-life').textContent = d.idealTotalYuan  > 0 && d.yearsToRetire > 0 ? fmtYuan(d.gapIdeal  * 12 * d.yearsToRetire) : '—';
        $('a4-adj-gap-life').textContent   = d.adjustTotalYuan > 0 && d.yearsToRetire > 0 ? fmtYuan(d.gapAdjust * 12 * d.yearsToRetire) : '—';

        // 支出明細表 — 雙欄並列（理想 vs 調整後）
        const tbody = $('a4-exp-tbody');
        if (d.rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="a4-empty">尚未填入任何支出項目</td></tr>';
        } else {
            // 渲染單側 cell（理想或調整）的 inner HTML
            const renderSide = (side, kind) => {
                const yuan = wanToYuan(side.amountWan);
                if (yuan === 0) {
                    // 該版本未保留此項目
                    return `
                        <div class="dual-cell removed">
                            <div class="dual-text">⊘ 未保留</div>
                            <div class="dual-amount">—</div>
                        </div>
                    `;
                }
                const labelHtml = (side.label && side.label !== side.choice)
                    ? `<div class="a4-label-detail">${side.label}</div>` : '';
                return `
                    <div class="dual-cell">
                        <div class="dual-text">
                            <div class="a4-choice-main">${side.choice || '—'}</div>
                            ${labelHtml}
                        </div>
                        <div class="dual-amount ${kind}">${fmtYuan(yuan)}</div>
                    </div>
                `;
            };
            tbody.innerHTML = d.rows.map(r => `
                <tr>
                    <td class="a4-cat-name">${r.name}</td>
                    <td class="dual-side ideal-side">${renderSide(r.ideal, 'ideal')}</td>
                    <td class="dual-side adjust-side">${renderSide(r.adjust, 'adjust')}</td>
                </tr>
            `).join('');
        }
        $('a4-exp-total-ideal').textContent  = d.idealTotalYuan  > 0 ? fmtYuan(d.idealTotalYuan)  : '—';
        $('a4-exp-total-adjust').textContent = d.adjustTotalYuan > 0 ? fmtYuan(d.adjustTotalYuan) : '—';

        // 退休
        $('a4-ret-total').textContent   = d.retTargetTotal > 0 ? fmtYuanFromWan(d.retTargetTotal) : '未設定';
        $('a4-ret-monthly').textContent = d.retMonthly     > 0 ? fmtYuanFromWan(d.retMonthly)     : '未設定';
        $('a4-ret-years').textContent   = d.yearsToRetire  > 0 ? d.yearsToRetire + ' 年' : '已退休';
    }

    // ── CDN libs ─────────────────────────────────────────────
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src; s.onload = () => resolve(); s.onerror = () => reject(new Error('load fail: ' + src));
            document.head.appendChild(s);
        });
    }
    async function ensureLibs() {
        if (typeof html2canvas === 'undefined') {
            await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
        }
        if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
            await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
        }
        if (typeof html2canvas === 'undefined') throw new Error('html2canvas 無法載入');
        if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) throw new Error('jsPDF 無法載入');
    }

    // ── 主匯出函式 ───────────────────────────────────────────
    async function exportA4() {
        const btn   = document.getElementById('a4-export-btn');
        const label = document.getElementById('a4-export-label');
        const orig  = label ? label.textContent : '客戶摘要 (A4)';

        if (btn) btn.disabled = true;
        if (label) label.textContent = '產生中…';

        try {
            await ensureLibs();
            ensureSheet();
            const data = gather();
            populate(data);

            // 把 sheet 移到可視位置（透明），讓 html2canvas 拍得到
            const sheet  = document.getElementById('a4-summary-sheet');
            const target = sheet.querySelector('.a4-page');
            sheet.style.left    = '0';
            sheet.style.top     = '0';
            sheet.style.zIndex  = '99999';
            sheet.style.opacity = '0';

            // 等字型載入
            if (document.fonts && document.fonts.ready) {
                try { await document.fonts.ready; } catch (e) {}
            }
            await new Promise(r => setTimeout(r, 150));

            // scale=3 → retina 等級的字體解析度
            let canvas;
            try {
                canvas = await html2canvas(target, {
                    scale: 3,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    windowWidth:  794,
                    windowHeight: target.scrollHeight,
                    letterRendering: true,
                    foreignObjectRendering: false
                });
            } catch (inner) {
                console.warn('[A4 PDF] scale=3 失敗，降為 2:', inner);
                canvas = await html2canvas(target, {
                    scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false
                });
            }

            // 還原隱藏
            sheet.style.left    = '-9999px';
            sheet.style.top     = '';
            sheet.style.zIndex  = '';
            sheet.style.opacity = '';

            if (!canvas || !canvas.width || !canvas.height) throw new Error('html2canvas 回傳空白畫布');

            // PDF：A4 portrait，PNG 嵌入（保字體銳利度）
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
            const PDF_W = 210, PDF_H = 297;
            const ratio = canvas.height / canvas.width;
            let iW = PDF_W;
            let iH = ratio * PDF_W;
            if (iH > PDF_H) {
                iH = PDF_H;
                iW = (canvas.width / canvas.height) * PDF_H;
            }
            const x = (PDF_W - iW) / 2;
            const y = (PDF_H - iH) / 2;
            // 用 PNG 而不是 JPEG，避免文字壓縮糊掉
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, iW, iH, undefined, 'FAST');

            const fname = `客戶試算摘要_${safeFilename(data.nickname)}_${todayString()}.pdf`;
            pdf.save(fname);

            if (label) label.textContent = '✓ 已儲存';
            setTimeout(() => { if (label) label.textContent = orig; }, 1600);
        } catch (e) {
            console.error('[A4 PDF export] 失敗：', e);
            try { alert('PDF 匯出失敗：\n' + (e.message || e) + '\n\n請確認網路連線，或按 F12 查看 Console。'); } catch (_) {}
            if (label) label.textContent = '失敗：請重試';
            setTimeout(() => { if (label) label.textContent = orig; }, 2500);
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    // ── 注入按鈕到 .ret-back-row ─────────────────────────────
    function tryInjectButton() {
        const row = document.querySelector('.ret-back-row');
        if (!row || document.getElementById('a4-export-btn')) return false;
        const btn = document.createElement('button');
        btn.id = 'a4-export-btn';
        btn.className = 'a4-export-btn';
        btn.type = 'button';
        btn.innerHTML = `
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span id="a4-export-label">客戶摘要 (A4)</span>
        `;
        btn.onclick = exportA4;
        row.appendChild(btn);
        return true;
    }

    function watch() {
        const obs = new MutationObserver(() => { tryInjectButton(); });
        obs.observe(document.body, { childList: true, subtree: true });
        tryInjectButton();
    }

    function init() {
        ensureSheet();
        watch();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // debug
    window.__a4Summary = { gather, populate, exportA4 };
})();
