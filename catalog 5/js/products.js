/* ══════════════════════════════════════════════
   products.js — GodzillaPaul 商品解方庫互動邏輯
   ══════════════════════════════════════════════ */

(function () {
  const cards   = [...document.querySelectorAll('.card')];
  const buttons = [...document.querySelectorAll('.seg button')];
  const input   = document.getElementById('searchInput');
  const empty   = document.getElementById('emptyState');
  let active = 'all';

  function applyFilter() {
    const q = (input.value || '').trim().toLowerCase();
    let shown = 0;

    cards.forEach(function (card) {
      const okType = active === 'all' || card.dataset.type === active;
      const okText = !q || (card.dataset.keywords || '').toLowerCase().includes(q);
      const show   = okType && okText;
      card.style.display = show ? 'flex' : 'none';
      if (show) shown++;
    });

    empty.style.display = shown ? 'none' : 'block';
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      active = btn.dataset.filter;
      applyFilter();
    });
  });

  input.addEventListener('input', applyFilter);
})();
