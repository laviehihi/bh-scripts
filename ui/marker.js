// ui/marker.js
// Pending marker + click flash effect

(function (global) {
    'use strict';

    const BH = global.__BH__ = global.__BH__ || {};

    // =========================================================
    // PENDING MARKER (vòng cam nhấp nháy khi chờ lưu màu)
    // =========================================================

    BH.pendingMarker = null;

    BH.showPendingMarker = function (bufX, bufY) {
        BH.removePendingMarker();

        const canvas = BH.getCanvas();
        if (!canvas) return;

        const pos = BH.bufferToClient(canvas, bufX, bufY);

        BH.pendingMarker = document.createElement('div');

        Object.assign(BH.pendingMarker.style, {
            position: 'fixed',
            left: `${pos.clientX}px`,
            top: `${pos.clientY}px`,
            width: '24px',
            height: '24px',
            transform: 'translate(-50%, -50%)',
            border: '2px dashed #ffaa33',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(255,170,51,.8)',
            pointerEvents: 'none',
            zIndex: '2147483647',
            animation: 'bh-pending-pulse 1s ease-in-out infinite'
        });

        if (!document.getElementById('bh-pending-style')) {
            const style = document.createElement('style');
            style.id = 'bh-pending-style';
            style.textContent = `
                @keyframes bh-pending-pulse {
                    0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.3); }
                }
            `;
            document.head.appendChild(style);
        }

        document.documentElement.appendChild(BH.pendingMarker);
    };

    BH.removePendingMarker = function () {
        if (BH.pendingMarker) {
            BH.pendingMarker.remove();
            BH.pendingMarker = null;
        }
    };

    // =========================================================
    // CLICK FLASH (hiệu ứng khi click auto)
    // =========================================================

    BH.showClickFlash = function (x, y) {
        // Ripple ngoài
        const ripple = document.createElement('div');

        Object.assign(ripple.style, {
            position: 'fixed',
            left: `${x}px`,
            top: `${y}px`,
            width: '22px',
            height: '22px',
            transform: 'translate(-50%, -50%) scale(0.4)',
            border: '2px solid #00d4ff',
            borderRadius: '50%',
            boxShadow: '0 0 10px #00d4ff, 0 0 20px rgba(0,212,255,.6)',
            pointerEvents: 'none',
            zIndex: '2147483646',
            opacity: '1',
            transition: 'transform .35s cubic-bezier(.2,.8,.3,1), opacity .35s ease-out'
        });

        document.documentElement.appendChild(ripple);

        requestAnimationFrame(function () {
            ripple.style.transform = 'translate(-50%, -50%) scale(1.8)';
            ripple.style.opacity = '0';
        });

        setTimeout(function () { ripple.remove(); }, 400);

        // Nút tròn trong
        const btn = document.createElement('div');

        Object.assign(btn.style, {
            position: 'fixed',
            left: `${x}px`,
            top: `${y}px`,
            width: '16px',
            height: '16px',
            transform: 'translate(-50%, -50%) scale(1.4)',
            background: 'radial-gradient(circle at 35% 30%, #ffffff, #00d4ff 60%, #0077aa)',
            border: '1.5px solid #ffffff',
            borderRadius: '50%',
            boxShadow:
                '0 0 8px #00d4ff, ' +
                '0 0 16px rgba(0,212,255,.7), ' +
                'inset 0 -2px 4px rgba(0,0,0,.25)',
            pointerEvents: 'none',
            zIndex: '2147483647',
            opacity: '1',
            transition:
                'transform .12s ease-out, ' +
                'opacity .25s ease-out .1s, ' +
                'box-shadow .12s ease-out'
        });

        document.documentElement.appendChild(btn);

        requestAnimationFrame(function () {
            btn.style.transform = 'translate(-50%, -50%) scale(0.7)';
            btn.style.boxShadow =
                '0 0 4px #00d4ff, ' +
                '0 0 8px rgba(0,212,255,.5), ' +
                'inset 0 2px 5px rgba(0,0,0,.35)';
        });

        setTimeout(function () {
            btn.style.transform = 'translate(-50%, -50%) scale(1.15)';
            btn.style.opacity = '0';
            btn.style.boxShadow =
                '0 0 18px #00d4ff, ' +
                '0 0 30px rgba(0,212,255,.9)';
        }, 90);

        setTimeout(function () { btn.remove(); }, 400);
    };

    // =========================================================
    // WIRE VÀO ENGINE
    // =========================================================

    // Engine gọi BH.onClickFlash khi click
    BH.onClickFlash = BH.showClickFlash;

    // Engine gọi BH.onPendingMarker khi lưu vị trí
    BH.onPendingMarker = BH.showPendingMarker;

    // Engine gọi BH.onRemovePendingMarker khi lưu màu hoặc xoá rule
    BH.onRemovePendingMarker = BH.removePendingMarker;

})(window);