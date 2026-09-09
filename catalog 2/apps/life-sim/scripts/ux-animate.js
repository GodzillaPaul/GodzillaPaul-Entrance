(function() {
    'use strict';

    // ========= IntersectionObserver：捲動進場動畫 =========
    var revealSelector = '.u-reveal, .u-reveal-left, .u-reveal-right, .u-reveal-scale';
    var io = null;
    if ('IntersectionObserver' in window) {
        io = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // 數字 count-up 觸發
                    if (entry.target.hasAttribute('data-countup')) {
                        countUp(entry.target);
                    }
                    // 只觸發一次
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    }
    function observeReveals(root) {
        if (!io) return;
        (root || document).querySelectorAll(revealSelector).forEach(function(el) {
            if (!el.__uObserved) {
                el.__uObserved = true;
                io.observe(el);
            }
        });
    }

    // ========= 自動為常見元素上 reveal class =========
    function autoEnhance() {
        // 每個 .card 加入 fade-up
        document.querySelectorAll('.step .card, #step0 .card, #step1 .card, #step2 .card').forEach(function(el) {
            if (!el.classList.contains('u-reveal') && !el.classList.contains('u-reveal-scale')) {
                el.classList.add('u-reveal');
            }
        });
        // Welcome 主標題用 scale 進場
        document.querySelectorAll('.welcome-main, .welcome-icon').forEach(function(el) {
            if (!el.classList.contains('u-reveal-scale')) el.classList.add('u-reveal-scale');
        });
        // welcome-points 容器 stagger
        document.querySelectorAll('.welcome-points, .stage-grid, .cat-grid').forEach(function(el) {
            el.classList.add('u-stagger');
            Array.prototype.forEach.call(el.children, function(child) {
                if (!child.classList.contains('u-reveal')) child.classList.add('u-reveal');
            });
        });
        observeReveals();
    }

    // ========= 數字 count-up 動畫 =========
    function countUp(el) {
        var target = parseFloat(el.getAttribute('data-countup'));
        if (isNaN(target)) return;
        var duration = parseInt(el.getAttribute('data-countup-dur') || '1200', 10);
        var decimals = parseInt(el.getAttribute('data-countup-decimals') || '0', 10);
        var prefix = el.getAttribute('data-countup-prefix') || '';
        var suffix = el.getAttribute('data-countup-suffix') || '';
        var start = 0;
        var startTime = performance.now();
        function step(now) {
            var t = Math.min(1, (now - startTime) / duration);
            // easeOutCubic
            var eased = 1 - Math.pow(1 - t, 3);
            var val = start + (target - start) * eased;
            el.textContent = prefix + val.toLocaleString(undefined, {
                minimumFractionDigits: decimals, maximumFractionDigits: decimals
            }) + suffix;
            if (t < 1) requestAnimationFrame(step);
            else el.textContent = prefix + target.toLocaleString(undefined, {
                minimumFractionDigits: decimals, maximumFractionDigits: decimals
            }) + suffix;
        }
        requestAnimationFrame(step);
    }

    // ========= parallax blob 跟隨捲動 =========
    var blobs = [];
    function collectBlobs() {
        blobs = Array.prototype.slice.call(document.querySelectorAll('.u-parallax-blob'));
    }
    function updateParallax() {
        var y = window.scrollY || window.pageYOffset || 0;
        blobs.forEach(function(b) {
            var speed = parseFloat(b.getAttribute('data-speed') || '0.2');
            b.style.transform = 'translate3d(0,' + (y * speed) + 'px, 0)';
        });
    }
    var pRafId = null;
    function onScroll() {
        if (pRafId) return;
        pRafId = requestAnimationFrame(function() {
            updateParallax();
            pRafId = null;
        });
    }

    // ========= 按鈕 hover 位置追蹤（漸層光點） =========
    function onBtnMouseMove(e) {
        var btn = e.currentTarget;
        var rect = btn.getBoundingClientRect();
        btn.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
        btn.style.setProperty('--my', (e.clientY - rect.top) + 'px');
    }
    function bindButtonHover() {
        document.querySelectorAll('.btn-primary').forEach(function(btn) {
            if (!btn.__uHover) {
                btn.__uHover = true;
                btn.addEventListener('mousemove', onBtnMouseMove);
            }
        });
    }

    // ========= 步驟切換時重新觀察 =========
    function watchStepChanges() {
        var steps = document.querySelectorAll('.step');
        steps.forEach(function(step) {
            if (step.__uWatched) return;
            step.__uWatched = true;
            var mo = new MutationObserver(function() {
                if (step.classList.contains('active')) {
                    // 新 step 啟用，重觀察子元素
                    setTimeout(function(){ observeReveals(step); bindButtonHover(); }, 50);
                }
            });
            mo.observe(step, { attributes: true, attributeFilter: ['class'] });
        });
    }

    // ========= init =========
    function init() {
        autoEnhance();
        collectBlobs();
        window.addEventListener('scroll', onScroll, { passive: true });
        bindButtonHover();
        watchStepChanges();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 暴露給後續手動觸發用（例如動態內容）
    window.__uxModern = {
        observeReveals: observeReveals,
        countUp: countUp,
        autoEnhance: autoEnhance
    };
})();
