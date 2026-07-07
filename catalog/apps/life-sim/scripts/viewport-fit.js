    (function() {
        var DESIGN_W = 1320;
        // 偵測 CSS zoom 是否可用（現代 Safari 15.4+ / Chromium / Firefox 皆支援）
        var SUPPORTS_ZOOM = (function(){
            try {
                var el = document.createElement('div');
                el.style.zoom = '0.5';
                return el.style.zoom === '0.5';
            } catch(e) { return false; }
        })();

        function fitViewport() {
            var vw = document.documentElement.clientWidth || window.innerWidth;
            var body = document.body;
            var html = document.documentElement;
            if (!body) return;

            if (vw > 0 && vw < DESIGN_W) {
                var scale = vw / DESIGN_W;
                if (SUPPORTS_ZOOM) {
                    // 只套在 body（iOS Safari 對 html zoom 有時有怪行為）
                    body.style.zoom = scale.toString();
                } else {
                    // 備援：transform scale
                    body.style.transformOrigin = 'top left';
                    body.style.transform = 'scale(' + scale + ')';
                    body.style.width = DESIGN_W + 'px';
                }
            } else {
                body.style.zoom = '';
                body.style.transform = '';
                body.style.width = '';
            }
        }
        window.addEventListener('resize', fitViewport);
        window.addEventListener('orientationchange', function(){
            setTimeout(fitViewport, 100);
        });
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fitViewport);
        } else {
            fitViewport();
        }
        // iPad 桌面模式 / 某些瀏覽器需要延遲再跑一次才正確
        setTimeout(fitViewport, 300);
        setTimeout(fitViewport, 800);
    })();
