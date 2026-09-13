// ==UserScript==
// @name         Bit Heroes - Auto Click + Speed Hack (Modular)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  1 help, 2 overlay, 3 rerun, 4 wb, 5 script, 6 add rule.
// @match        *://*.kongregate.com/*
// @match        *://*.bitheroesgame.com/*
// @run-at       document-start
// @grant        none
// @require https://cdn.jsdelivr.net/gh/laviehihi/bh-scripts@v1.0.5/core/utils.js
// @require https://cdn.jsdelivr.net/gh/laviehihi/bh-scripts@v1.0.5/core/rules.js
// @require https://cdn.jsdelivr.net/gh/laviehihi/bh-scripts@v1.0.5/core/pixel.js
// @require https://cdn.jsdelivr.net/gh/laviehihi/bh-scripts@v1.0.5/core/speed-hack.js
// @require https://cdn.jsdelivr.net/gh/laviehihi/bh-scripts@v1.0.5/core/engine.js
// @require https://cdn.jsdelivr.net/gh/laviehihi/bh-scripts@v1.0.5/ui/overlay.js
// @require https://cdn.jsdelivr.net/gh/laviehihi/bh-scripts@v1.0.5/ui/help.js
// @require https://cdn.jsdelivr.net/gh/laviehihi/bh-scripts@v1.0.5/ui/marker.js
// @require https://cdn.jsdelivr.net/gh/laviehihi/bh-scripts@v1.0.5/ui/addmode.js
// @require https://cdn.jsdelivr.net/gh/laviehihi/bh-scripts@v1.0.5/wb-party.js

// ==/UserScript==

(function () {
    'use strict';

    // =========================================================
    // WAIT FOR BH NAMESPACE
    // =========================================================

    if (typeof window.__BH__ === 'undefined') {
        console.error('[Bit Heroes] BH namespace chưa load — kiểm tra @require URLs');
        return;
    }

    const BH = window.__BH__;

    // =========================================================
    // FIX: ÉP TAB LUÔN VISIBLE + FOCUSED
    // =========================================================

    try {
        Object.defineProperty(document, 'hasFocus', {
            value: () => true,
            configurable: true,
            writable: true
        });
    } catch (e) { }

    try {
        Object.defineProperty(document, 'hidden', {
            get: () => false,
            configurable: true
        });
    } catch (e) { }

    try {
        Object.defineProperty(document, 'visibilityState', {
            get: () => 'visible',
            configurable: true
        });
    } catch (e) { }

    ['visibilitychange', 'webkitvisibilitychange', 'blur', 'focusout', 'pagehide']
        .forEach(function (t) {
            window.addEventListener(t, function (e) {
                e.stopImmediatePropagation();
                e.preventDefault();
            }, true);

            document.addEventListener(t, function (e) {
                e.stopImmediatePropagation();
                e.preventDefault();
            }, true);
        });

    // =========================================================
    // ÉP preserveDrawingBuffer
    // =========================================================

    const originalGetContext = HTMLCanvasElement.prototype.getContext;

    HTMLCanvasElement.prototype.getContext = function (type, attrs) {
        if (
            type === 'webgl' ||
            type === 'webgl2' ||
            type === 'experimental-webgl'
        ) {
            attrs = Object.assign({}, attrs || {}, {
                preserveDrawingBuffer: true
            });
        }

        return originalGetContext.call(this, type, attrs);
    };

    // =========================================================
    // INIT
    // =========================================================

    function init() {
        BH.render();

        setInterval(function () {
            BH.render();
        }, 500);

        console.log('[Bit Heroes] Auto loaded. Bấm 1 để xem help.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // =========================================================
    // HOTKEY
    // =========================================================

    document.addEventListener(
        'keydown',
        function (e) {

            if (e.key === '1') {
                e.preventDefault();
                e.stopImmediatePropagation();
                BH.toggleHelp();
                return;
            }

            if (e.key === '2') {
                e.preventDefault();
                e.stopImmediatePropagation();
                BH.cycleOverlay();
                return;
            }

            if (e.key === '3') {
                e.preventDefault();
                e.stopImmediatePropagation();
                BH.toggleRerun();
                return;
            }

            if (e.key === '4') {
                e.preventDefault();
                e.stopImmediatePropagation();
                BH.toggleWB();
                return;
            }

            if (e.key === '5') {
                e.preventDefault();
                e.stopImmediatePropagation();
                BH.toggleScript();
                return;
            }

            if (e.key === '6') {
                e.preventDefault();
                e.stopImmediatePropagation();
                BH.toggleAddMode();
                return;
            }

            if (e.key === '0' && BH.isAddingRule) {
                e.preventDefault();
                e.stopImmediatePropagation();
                BH.saveRulePositionAtCursor();
                return;
            }

            if (e.key === '9' && BH.isAddingRule) {
                e.preventDefault();
                e.stopImmediatePropagation();
                BH.saveRuleColor();
                return;
            }

            if (e.key === '8' && BH.isAddingRule) {
                e.preventDefault();
                e.stopImmediatePropagation();
                BH.deleteLastRule();
                return;
            }

            if (e.key === '=' || e.key === '+') {
                e.preventDefault();
                e.stopImmediatePropagation();
                BH.setSpeed(BH.getSpeed() + 1);
                return;
            }

            if (e.key === '-') {
                e.preventDefault();
                e.stopImmediatePropagation();
                BH.setSpeed(BH.getSpeed() - 1);
                return;
            }
        },
        true
    );

})();