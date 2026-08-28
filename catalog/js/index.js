/* ══════════════════════════════════════
   index.js — GodzillaPaul 首頁互動邏輯
   ══════════════════════════════════════ */

// ── Portrait orientation lock (mobile browsers) ──
(function () {
  try {
    if (screen.orientation && typeof screen.orientation.lock === 'function') {
      screen.orientation.lock('portrait-primary').catch(function () {});
    }
  } catch (e) {}
})();

// ── Tool card filter tabs ──
(function () {
  const cards   = [...document.querySelectorAll('.tool-card')];
  const buttons = [...document.querySelectorAll('.seg button')];
  let active = 'all';

  function applyFilter() {
    cards.forEach(function (card) {
      const show = active === 'all' || card.dataset.type === active;
      card.classList.toggle('hidden', !show);
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      active = btn.dataset.filter;
      applyFilter();
    });
  });
})();
