// ==UserScript==
// @name         Bit Heroes - Auto Click + Speed Hack (Merged)
// @namespace    http://tampermonkey.net/
// @version      10.2
// @description  1 help, 2 overlay, 3 rerun, 4 wb, 5 script, 6 add rule, 7 WB Team.
// @match        *://*.kongregate.com/*
// @match        *://*.bitheroesgame.com/*
// @run-at       document-start
// @grant        none
// @require      https://cdn.jsdelivr.net/gh/laviehihi/bh-scripts@v1.0.19/core/utils.js
// @require      https://cdn.jsdelivr.net/gh/laviehihi/bh-scripts@v1.0.19/core/rules.js
// @require      https://cdn.jsdelivr.net/gh/laviehihi/bh-scripts@v1.0.19/core/pixel.js
// @require      https://cdn.jsdelivr.net/gh/laviehihi/bh-scripts@v1.0.19/core/speed-hack.js
// @require      https://cdn.jsdelivr.net/gh/laviehihi/bh-scripts@v1.0.19/core/engine.js
// @require      https://cdn.jsdelivr.net/gh/laviehihi/bh-scripts@v1.0.19/ui/overlay.js
// @require      https://cdn.jsdelivr.net/gh/laviehihi/bh-scripts@v1.0.19/ui/help.js
// @require      https://cdn.jsdelivr.net/gh/laviehihi/bh-scripts@v1.0.19/ui/marker.js
// @require      https://cdn.jsdelivr.net/gh/laviehihi/bh-scripts@v1.0.19/ui/addmode.js
// @require      https://cdn.jsdelivr.net/gh/laviehihi/bh-scripts@v1.0.19/wb-party.js
// ==/UserScript==

(function () {
    'use strict';

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
        // Load rules đã lưu từ localStorage
        if (window.__BH__ && window.__BH__.loadRules) {
            window.__BH__.loadRules();
        }

        if (window.__BH__ && window.__BH__.render) {
            window.__BH__.render();
        }

        setInterval(function () {
            if (window.__BH__ && window.__BH__.render) {
                window.__BH__.render();
            }
        }, 500);

        console.log('[Bit Heroes] Auto loaded.');
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
                if (window.__BH__.toggleHelp) window.__BH__.toggleHelp();
                return;
            }

            // 2 = cycle overlay
            // - Nếu WB Party đang chạy → cycle WB Party overlay
            // - Ngược lại → cycle overlay thường
            if (e.key === '2') {
                e.preventDefault();
                e.stopImmediatePropagation();

                if (window.__BH__.WBP && window.__BH__.WBP.running) {
                    if (window.__BH__.WBP.cycleOverlay) {
                        window.__BH__.WBP.cycleOverlay();
                    }
                } else {
                    if (window.__BH__.cycleOverlay) {
                        window.__BH__.cycleOverlay();
                    }
                }
                return;
            }

            if (e.key === '3') {
                e.preventDefault();
                e.stopImmediatePropagation();
                if (window.__BH__.toggleRerun) window.__BH__.toggleRerun();
                return;
            }

            if (e.key === '4') {
                e.preventDefault();
                e.stopImmediatePropagation();
                if (window.__BH__.toggleWB) window.__BH__.toggleWB();
                return;
            }

            if (e.key === '5') {
                e.preventDefault();
                e.stopImmediatePropagation();
                if (window.__BH__.toggleScript) window.__BH__.toggleScript();
                return;
            }

            if (e.key === '6') {
                e.preventDefault();
                e.stopImmediatePropagation();
                if (window.__BH__.toggleAddMode) window.__BH__.toggleAddMode();
                return;
            }

            if (e.key === '0' && window.__BH__.isAddingRule) {
                e.preventDefault();
                e.stopImmediatePropagation();
                if (window.__BH__.saveRulePositionAtCursor) window.__BH__.saveRulePositionAtCursor();
                return;
            }

            if (e.key === '9' && window.__BH__.isAddingRule) {
                e.preventDefault();
                e.stopImmediatePropagation();
                if (window.__BH__.saveRuleColor) window.__BH__.saveRuleColor();
                return;
            }

            if (e.key === '8' && window.__BH__.isAddingRule) {
                e.preventDefault();
                e.stopImmediatePropagation();
                if (window.__BH__.deleteLastRule) window.__BH__.deleteLastRule();
                return;
            }

            if (e.key === '=' || e.key === '+') {
                e.preventDefault();
                e.stopImmediatePropagation();
                if (window.__BH__.setSpeed) {
                    window.__BH__.setSpeed(window.__BH__.getSpeed() + 1);
                }
                return;
            }

            if (e.key === '-') {
                e.preventDefault();
                e.stopImmediatePropagation();
                if (window.__BH__.setSpeed) {
                    window.__BH__.setSpeed(window.__BH__.getSpeed() - 1);
                }
                return;
            }
        },
        true
    );

})();