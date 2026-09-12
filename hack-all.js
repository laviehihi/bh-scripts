// ==UserScript==
// @name         Bit Heroes - Auto Click + Speed Hack (Merged)
// @namespace    http://tampermonkey.net/
// @version      9.0
// @description  1 help, 2 overlay (mở/thu/ẩn), 3 rerun, 4 wb, 5 script, 6 add rule.
// @match        *://*.kongregate.com/*
// @match        *://*.bitheroesgame.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // =========================================================
    // FIX: ÉP TAB LUÔN "VISIBLE" & "FOCUSED"
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
    // ORIGINAL TIMING APIs
    // =========================================================

    const originalDateNow = Date.now;
    const originalPerformanceNow = window.performance.now.bind(window.performance);
    const originalSetTimeout = window.setTimeout.bind(window);
    const originalClearTimeout = window.clearTimeout.bind(window);
    const originalSetInterval = window.setInterval.bind(window);
    const originalClearInterval = window.clearInterval.bind(window);
    const originalRequestAnimationFrame = window.requestAnimationFrame.bind(window);

    // =========================================================
    // SPEED STATE
    // =========================================================

    const MIN_SPEED = 1;
    const MAX_SPEED = 10;

    let speed = 1;

    // =========================================================
    // DATE.NOW
    // =========================================================

    let virtualDate = null;
    let previousDate = null;

    Date.now = function () {
        const realNow = originalDateNow();

        if (virtualDate === null) {
            virtualDate = realNow;
            previousDate = realNow;
            return Math.floor(virtualDate);
        }

        const delta = realNow - previousDate;
        virtualDate += delta * speed;
        previousDate = realNow;

        return Math.floor(virtualDate);
    };

    // =========================================================
    // PERFORMANCE.NOW
    // =========================================================

    let virtualPerformance = null;
    let previousPerformance = null;

    window.performance.now = function () {
        const realNow = originalPerformanceNow();

        if (virtualPerformance === null) {
            virtualPerformance = realNow;
            previousPerformance = realNow;
            return virtualPerformance;
        }

        const delta = realNow - previousPerformance;
        virtualPerformance += delta * speed;
        previousPerformance = realNow;

        return virtualPerformance;
    };

    // =========================================================
    // SETTIMEOUT / SETINTERVAL
    // =========================================================

    window.setTimeout = function (handler, timeout, ...args) {
        if (!timeout) timeout = 0;
        return originalSetTimeout(handler, timeout / speed, ...args);
    };

    window.clearTimeout = function (id) {
        return originalClearTimeout(id);
    };

    window.setInterval = function (handler, timeout, ...args) {
        if (!timeout) timeout = 0;
        return originalSetInterval(handler, timeout / speed, ...args);
    };

    window.clearInterval = function (id) {
        return originalClearInterval(id);
    };

    // =========================================================
    // REQUEST ANIMATION FRAME
    // =========================================================

    const rafCallbacks = [];
    const rafTicks = [];

    let rafDisabled = false;

    window.requestAnimationFrame = function (callback) {
        if (rafDisabled) {
            return 1;
        }

        return originalRequestAnimationFrame(function () {
            let index = rafCallbacks.indexOf(callback);

            if (index === -1) {
                rafCallbacks.push(callback);
                rafTicks.push(0);
                callback(window.performance.now());
                return;
            }

            if (speed <= 1) {
                callback(window.performance.now());
                return;
            }

            let tickFrame = rafTicks[index];
            tickFrame += speed;

            if (tickFrame >= 1) {
                const startTime = originalPerformanceNow();

                while (tickFrame >= 1) {
                    try {
                        callback(window.performance.now());
                    } catch (error) {
                        console.error('[Bit Heroes RAF]', error);
                    }

                    rafDisabled = true;
                    tickFrame -= 1;

                    if (originalPerformanceNow() - startTime > 15) {
                        tickFrame = 0;
                        break;
                    }
                }

                rafDisabled = false;
            } else {
                callback(window.performance.now());
            }

            rafTicks[index] = tickFrame;
        });
    };

    // =========================================================
    // CONFIG
    // =========================================================

    const COLOR_TOLERANCE = 15;

    const RERUN_HUNT_INTERVAL = 3000;
    const RERUN_REST_INTERVAL = 20000;

    const WB_INTERVAL = 2000;
    const SCRIPT_INTERVAL = 3000;

    const AUTO_STOP_TIMEOUT = 3 * 60 * 1000;

    const RESET_POINT_X = 5;
    const RESET_POINT_Y = 5;

    // =========================================================
    // RULES CỐ ĐỊNH
    // =========================================================

    const RERUN_RULES = [
        { x: 410, y: 62, hex: '#a6d339', tol: COLOR_TOLERANCE, enabled: true },
        { x: 410, y: 62, hex: '#cbf067', tol: COLOR_TOLERANCE, enabled: true }
    ];

    const WB_RULES = [
        { x: 388, y: 66, hex: '#0a62d0', tol: COLOR_TOLERANCE, enabled: true },
        { x: 356, y: 208, hex: '#9cd01f', tol: COLOR_TOLERANCE, enabled: true },
        { x: 446, y: 58, hex: '#9cd01f', tol: COLOR_TOLERANCE, enabled: true }
    ];

    // =========================================================
    // STATE
    // =========================================================

    let rules = [];

    let activeAuto = null;
    let rerunPhase = 'hunting';

    let checkTimerId = null;
    let autoStopTimerId = null;
    let rerunPhaseTimerId = null;

    let lastActionTime = 0;

    let isAddingRule = false;

    // Overlay state: 'expanded' | 'compact' | 'hidden'
    // Mặc định: compact (thu nhỏ)
    let overlayState = 'compact';

    let helpVisible = false;

    let logBox = null;
    let helpBox = null;
    let addModeIndicator = null;

    let cachedCanvas = null;
    let cachedGL = null;

    let lastMsg = '';
    let lastMouseX = null;
    let lastMouseY = null;

    let isClicking = false;

    // =========================================================
    // OVERLAY
    // =========================================================

    function ensureLogBox() {
        if (logBox) return;

        logBox = document.createElement('div');

        Object.assign(logBox.style, {
            position: 'fixed',
            top: '12px',
            right: '12px',
            zIndex: '2147483647',
            boxSizing: 'border-box',
            background: 'rgba(12, 14, 18, 0.92)',
            color: '#ddd',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '9px',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '11px',
            lineHeight: '1.5',
            boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
            pointerEvents: 'none',
            userSelect: 'none',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            transition: 'width .15s ease, padding .15s ease'
        });

        (document.documentElement || document.body).appendChild(logBox);
    }

    function ensureHelpBox() {
        if (helpBox) return;

        helpBox = document.createElement('div');

        Object.assign(helpBox.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: '2147483647',
            width: '340px',
            boxSizing: 'border-box',
            padding: '16px 18px',
            background: 'rgba(12, 14, 18, 0.96)',
            color: '#ddd',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '10px',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '11.5px',
            lineHeight: '1.7',
            boxShadow: '0 6px 30px rgba(0,0,0,0.7)',
            pointerEvents: 'none',
            userSelect: 'none',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'none'
        });

        helpBox.innerHTML = `
            <div style="
                display:flex;
                align-items:center;
                justify-content:space-between;
                margin-bottom:10px;
                padding-bottom:8px;
                border-bottom:1px solid rgba(255,255,255,.15);
            ">
                <span style="
                    color:#fff;
                    font-size:14px;
                    font-weight:700;
                    letter-spacing:.4px;
                ">
                    📖 HELP — PHÍM TẮT
                </span>

                <span style="
                    color:#777;
                    font-size:10px;
                ">
                    Bấm 1 để đóng
                </span>
            </div>

            <div style="
                color:#8ec8ff;
                font-size:10.5px;
                font-weight:700;
                margin-top:4px;
                margin-bottom:4px;
            ">
                ▸ AUTO
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#70e0a8;font-weight:700;">3</span>
                <span style="flex:1;text-align:right;color:#ccc;">Auto Rerun (hunt 3s, nghỉ 20s)</span>
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#70e0a8;font-weight:700;">4</span>
                <span style="flex:1;text-align:right;color:#ccc;">Auto WB Solo (2s/lần)</span>
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#70e0a8;font-weight:700;">5</span>
                <span style="flex:1;text-align:right;color:#ccc;">Auto Script (3s/lần)</span>
            </div>

            <div style="
                color:#8ec8ff;
                font-size:10.5px;
                font-weight:700;
                margin-top:10px;
                margin-bottom:4px;
            ">
                ▸ RULES (chỉ dùng khi đang ở mode 6)
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#ffaa33;font-weight:700;">0</span>
                <span style="flex:1;text-align:right;color:#ccc;">Lưu vị trí tại chuột</span>
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#ffaa33;font-weight:700;">9</span>
                <span style="flex:1;text-align:right;color:#ccc;">Lưu màu rule cuối (di chuột ra xa)</span>
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#ffaa33;font-weight:700;">8</span>
                <span style="flex:1;text-align:right;color:#ccc;">Xoá rule cuối</span>
            </div>

            <div style="
                color:#8ec8ff;
                font-size:10.5px;
                font-weight:700;
                margin-top:10px;
                margin-bottom:4px;
            ">
                ▸ UI
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#8ec8ff;font-weight:700;">1</span>
                <span style="flex:1;text-align:right;color:#ccc;">Hiện/ẩn bảng help này</span>
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#8ec8ff;font-weight:700;">2</span>
                <span style="flex:1;text-align:right;color:#ccc;">Overlay: mở → thu nhỏ → ẩn</span>
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#8ec8ff;font-weight:700;">6</span>
                <span style="flex:1;text-align:right;color:#ccc;">Vào/ra add rule mode</span>
            </div>

            <div style="
                color:#8ec8ff;
                font-size:10.5px;
                font-weight:700;
                margin-top:10px;
                margin-bottom:4px;
            ">
                ▸ SPEED
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#66ff66;font-weight:700;">= / +</span>
                <span style="flex:1;text-align:right;color:#ccc;">Tăng speed (+1)</span>
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#66ff66;font-weight:700;">-</span>
                <span style="flex:1;text-align:right;color:#ccc;">Giảm speed (-1)</span>
            </div>

            <div style="
                margin-top:12px;
                padding-top:8px;
                border-top:1px solid rgba(255,255,255,.12);
                color:#888;
                font-size:10px;
                text-align:center;
            ">
                Auto-stop: 3 phút không click → tự tắt
            </div>
        `;

        (document.documentElement || document.body).appendChild(helpBox);
    }

    function ensureAddModeIndicator() {
        if (addModeIndicator) return;

        addModeIndicator = document.createElement('div');

        Object.assign(addModeIndicator.style, {
            position: 'fixed',
            top: '12px',
            left: '12px',
            zIndex: '2147483647',
            padding: '10px 14px',
            background: 'rgba(255, 100, 50, 0.92)',
            color: '#fff',
            border: '2px solid #fff',
            borderRadius: '8px',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '12px',
            fontWeight: '700',
            textAlign: 'left',
            lineHeight: '1.5',
            boxShadow: '0 0 16px rgba(255, 100, 50, 0.8)',
            pointerEvents: 'none',
            userSelect: 'none',
            display: 'none'
        });

        addModeIndicator.innerHTML = `
            <div style="font-size:13px;">🔴 ADD RULE MODE</div>
            <div style="font-size:10px;margin-top:4px;color:#ffe;font-weight:400;">
                <b>0</b> · lưu vị trí (tại nút)<br>
                <b>9</b> · lưu màu (đã di chuột ra xa)<br>
                <b>8</b> · xoá rule cuối<br>
                <b>6</b> · thoát
            </div>
        `;

        (document.documentElement || document.body).appendChild(addModeIndicator);
    }

    function getSpeedColor() {
        return speed === 1 ? '#ddd' : '#66ff66';
    }

    function getAutoColor(name) {
        return activeAuto === name ? '#70e0a8' : '#ff9966';
    }

    function getRemainingStr() {
        if (activeAuto === null) return '';

        const elapsed = originalDateNow() - lastActionTime;
        const remain = AUTO_STOP_TIMEOUT - elapsed;

        if (remain <= 0) return '';

        const sec = Math.floor(remain / 1000);
        const m = Math.floor(sec / 60);
        const s = sec % 60;

        return `${m}m${s.toString().padStart(2, '0')}s`;
    }

    function getRerunPhaseStr() {
        if (activeAuto !== 'rerun') return '';
        return rerunPhase === 'rest' ? ' [nghỉ]' : ' [hunt]';
    }

    // =========================================================
    // RENDER — COMPACT
    // =========================================================

    function renderCompact() {
        ensureLogBox();

        logBox.style.display = 'block';
        logBox.style.width = 'auto';
        logBox.style.padding = '8px 12px';

        const rerunColor = getAutoColor('rerun');
        const wbColor = getAutoColor('wb');
        const scriptColor = getAutoColor('script');

        logBox.innerHTML = `
            <div style="
                display:flex;
                align-items:center;
                gap:10px;
                font-size:11px;
                white-space:nowrap;
            ">
                <span style="
                    display:flex;
                    align-items:center;
                    gap:5px;
                    color:${rerunColor};
                    font-weight:700;
                ">
                    <span style="
                        width:6px;
                        height:6px;
                        border-radius:50%;
                        background:${rerunColor};
                        box-shadow:0 0 5px ${rerunColor};
                        flex:none;
                    "></span>
                    RERUN
                </span>

                <span style="
                    display:flex;
                    align-items:center;
                    gap:5px;
                    color:${wbColor};
                    font-weight:700;
                ">
                    <span style="
                        width:6px;
                        height:6px;
                        border-radius:50%;
                        background:${wbColor};
                        box-shadow:0 0 5px ${wbColor};
                        flex:none;
                    "></span>
                    WB
                </span>

                <span style="
                    display:flex;
                    align-items:center;
                    gap:5px;
                    color:${scriptColor};
                    font-weight:700;
                ">
                    <span style="
                        width:6px;
                        height:6px;
                        border-radius:50%;
                        background:${scriptColor};
                        box-shadow:0 0 5px ${scriptColor};
                        flex:none;
                    "></span>
                    SCRIPT
                </span>

                <span style="
                    color:${getSpeedColor()};
                    font-weight:700;
                ">
                    ${speed}×
                </span>

                <span style="
                    color:#8ec8ff;
                    font-size:10px;
                    padding-left:4px;
                    border-left:1px solid rgba(255,255,255,.15);
                ">
                    1 help · 2 ⬜
                </span>
            </div>
        `;
    }

    // =========================================================
    // RENDER — EXPANDED
    // =========================================================

    function renderExpanded() {
        ensureLogBox();

        logBox.style.display = 'block';
        logBox.style.width = '250px';
        logBox.style.padding = '10px 12px';

        const rerunColor = getAutoColor('rerun');
        const wbColor = getAutoColor('wb');
        const scriptColor = getAutoColor('script');

        const remainStr = getRemainingStr();
        const phaseStr = getRerunPhaseStr();

        const ruleLines = rules.length === 0
            ? '<div style="color:#a55;font-size:10px;">(chưa có rule — bấm 6)</div>'
            : rules.map((r, i) => {
                let statusLabel;
                let statusColor;

                if (!r.hex) {
                    statusLabel = '(chờ màu)';
                    statusColor = '#ffaa33';
                } else {
                    statusLabel = r.hex;
                    statusColor = r.enabled ? '#70e0a8' : '#666';
                }

                return `
                    <div style="
                        display:flex;
                        justify-content:space-between;
                        gap:6px;
                        font-size:10px;
                        color:${statusColor};
                    ">
                        <span>${i + 1}. ${statusLabel}</span>
                        <span style="color:#8ec8ff;">${r.x} ${r.y}</span>
                    </div>
                `;
            }).join('');

        logBox.innerHTML = `
            <div style="
                display:flex;
                align-items:center;
                justify-content:space-between;
                margin-bottom:7px;
            ">
                <span style="
                    color:#fff;
                    font-size:12px;
                    font-weight:700;
                    letter-spacing:.3px;
                ">
                    BH AUTO
                </span>

                <span style="
                    color:#777;
                    font-size:10px;
                ">
                    v9.0
                </span>
            </div>

            <div style="
                display:flex;
                align-items:center;
                gap:6px;
                margin-bottom:3px;
            ">
                <span style="
                    width:7px;
                    height:7px;
                    border-radius:50%;
                    background:${rerunColor};
                    box-shadow:0 0 6px ${rerunColor};
                    flex:none;
                "></span>

                <span style="
                    color:${rerunColor};
                    font-weight:700;
                    font-size:11.5px;
                    flex:1;
                ">
                    RERUN ${activeAuto === 'rerun' ? 'ON' : 'OFF'}${phaseStr}
                </span>

                <span style="
                    color:#666;
                    font-size:9px;
                ">
                    3
                </span>
            </div>

            <div style="
                display:flex;
                align-items:center;
                gap:6px;
                margin-bottom:3px;
            ">
                <span style="
                    width:7px;
                    height:7px;
                    border-radius:50%;
                    background:${wbColor};
                    box-shadow:0 0 6px ${wbColor};
                    flex:none;
                "></span>

                <span style="
                    color:${wbColor};
                    font-weight:700;
                    font-size:11.5px;
                    flex:1;
                ">
                    WB SOLO ${activeAuto === 'wb' ? 'ON' : 'OFF'}
                </span>

                <span style="
                    color:#666;
                    font-size:9px;
                ">
                    4
                </span>
            </div>

            <div style="
                display:flex;
                align-items:center;
                gap:6px;
                margin-bottom:3px;
            ">
                <span style="
                    width:7px;
                    height:7px;
                    border-radius:50%;
                    background:${scriptColor};
                    box-shadow:0 0 6px ${scriptColor};
                    flex:none;
                "></span>

                <span style="
                    color:${scriptColor};
                    font-weight:700;
                    font-size:11.5px;
                    flex:1;
                ">
                    SCRIPT ${activeAuto === 'script' ? 'ON' : 'OFF'}
                </span>

                <span style="
                    color:#666;
                    font-size:9px;
                ">
                    5
                </span>
            </div>

            <div style="
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:6px;
                margin-top:5px;
                padding-top:5px;
                border-top:1px solid rgba(255,255,255,.10);
            ">
                <span style="color:#777;">
                    SPEED
                </span>

                <span style="
                    color:${getSpeedColor()};
                    font-weight:700;
                    font-size:12.5px;
                ">
                    ${speed}×
                </span>
            </div>

            <div style="
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:6px;
                margin-bottom:3px;
            ">
                <span style="color:#777;">
                    AUTO-STOP
                </span>

                <span style="
                    color:${activeAuto ? '#ffaa33' : '#666'};
                    font-weight:600;
                    font-size:10px;
                ">
                    ${activeAuto ? 'còn ' + remainStr : '---'}
                </span>
            </div>

            <div style="
                margin-top:6px;
                padding-top:6px;
                border-top:1px solid rgba(255,255,255,.10);
            ">
                <div style="
                    color:#aaa;
                    font-size:10px;
                    margin-bottom:3px;
                ">
                    SCRIPT RULES (${rules.length})
                </div>
                ${ruleLines}
            </div>

            <div style="
                margin-top:6px;
                padding-top:6px;
                border-top:1px solid rgba(255,255,255,.10);

                display:flex;
                justify-content:space-between;
                color:#8ec8ff;
                font-size:10px;
            ">
                <span>1 · help</span>
                <span>2 · thu nhỏ</span>
            </div>

            <div style="
                margin-top:6px;
                padding-top:6px;
                border-top:1px solid rgba(255,255,255,.10);

                color:#9aa;
                font-size:10px;
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
            ">
                ${lastMsg || '&nbsp;'}
            </div>
        `;
    }

    function render() {
        if (overlayState === 'hidden') {
            ensureLogBox();
            logBox.style.display = 'none';
            return;
        }

        if (overlayState === 'expanded') {
            renderExpanded();
        } else {
            renderCompact();
        }
    }

    function setMsg(msg) {
        lastMsg = msg;

        // Chỉ render lại nếu overlay không ẩn
        if (overlayState !== 'hidden') {
            render();
        }
    }

    // Vòng lặp 3 trạng thái
    function cycleOverlay() {
        if (overlayState === 'expanded') {
            overlayState = 'compact';
        } else if (overlayState === 'compact') {
            overlayState = 'hidden';
        } else {
            overlayState = 'expanded';
        }

        render();
    }

    function toggleHelp() {
        helpVisible = !helpVisible;

        ensureHelpBox();

        helpBox.style.display = helpVisible ? 'block' : 'none';
    }

    // =========================================================
    // SPEED CONTROL
    // =========================================================

    function setSpeed(newSpeed) {
        newSpeed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, newSpeed));

        if (newSpeed === speed) return;

        speed = newSpeed;

        console.log(`[Bit Heroes] Speed: ${speed}x`);

        render();
    }

    // =========================================================
    // CANVAS
    // =========================================================

    function getCanvas() {
        return document.querySelector('#unity-canvas')
            || document.querySelector('canvas');
    }

    function getGL(canvas) {
        if (!canvas) return null;

        if (cachedCanvas === canvas && cachedGL) {
            return cachedGL;
        }

        let gl = null;

        try {
            gl =
                canvas.getContext('webgl2', { preserveDrawingBuffer: true }) ||
                canvas.getContext('webgl', { preserveDrawingBuffer: true }) ||
                canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true });
        } catch (e) {
            gl = null;
        }

        cachedCanvas = canvas;
        cachedGL = gl;

        return gl;
    }

    // =========================================================
    // PIXEL
    // =========================================================

    function readPixel(gl, x, y) {
        const pixel = new Uint8Array(4);

        try {
            gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        } catch (e) {
            return null;
        }

        return {
            r: pixel[0],
            g: pixel[1],
            b: pixel[2],
            a: pixel[3]
        };
    }

    function toHex(v) {
        return v.toString(16).padStart(2, '0');
    }

    function rgbToHex(p) {
        return '#' + toHex(p.r) + toHex(p.g) + toHex(p.b);
    }

    function hexToRgb(hex) {
        const h = hex.replace('#', '');

        return {
            r: parseInt(h.substring(0, 2), 16),
            g: parseInt(h.substring(2, 4), 16),
            b: parseInt(h.substring(4, 6), 16)
        };
    }

    function colorMatch(pixel, target, tolerance) {
        return (
            Math.abs(pixel.r - target.r) <= tolerance &&
            Math.abs(pixel.g - target.g) <= tolerance &&
            Math.abs(pixel.b - target.b) <= tolerance
        );
    }

    // =========================================================
    // COORDINATE CONVERSION
    // =========================================================

    function clientToBuffer(canvas, clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const bufferW = canvas.width;
        const bufferH = canvas.height;

        const relX = (clientX - rect.left) / rect.width;
        const relY = (rect.bottom - clientY) / rect.height;

        return {
            x: Math.round(relX * bufferW),
            y: Math.round(relY * bufferH)
        };
    }

    function bufferToClient(canvas, bufX, bufY) {
        const rect = canvas.getBoundingClientRect();
        const bufferW = canvas.width;
        const bufferH = canvas.height;

        return {
            clientX: rect.left + (bufX / bufferW) * rect.width,
            clientY: rect.bottom - (bufY / bufferH) * rect.height
        };
    }

    // =========================================================
    // DISPATCH EVENT
    // =========================================================

    function makePointerOpts(x, y, buttons) {
        return {
            bubbles: true,
            cancelable: true,
            composed: true,
            view: window,
            clientX: x,
            clientY: y,
            screenX: window.screenX + x,
            screenY: window.screenY + y,
            button: 0,
            buttons: buttons,
            pointerId: 1,
            pointerType: 'mouse',
            isPrimary: true,
            pressure: buttons ? 0.5 : 0,
            width: 1,
            height: 1
        };
    }

    function makeMouseOpts(x, y, buttons) {
        return {
            bubbles: true,
            cancelable: true,
            composed: true,
            view: window,
            clientX: x,
            clientY: y,
            screenX: window.screenX + x,
            screenY: window.screenY + y,
            button: 0,
            buttons: buttons,
            detail: 1
        };
    }

    function fireAll(targets, type, Ctor, opts) {
        for (let i = 0; i < targets.length; i++) {
            try {
                targets[i].dispatchEvent(new Ctor(type, opts));
            } catch (e) { }
        }
    }

    function dispatchFullClick(canvas, x, y) {
        const targets = [canvas, document, window];

        fireAll(targets, 'pointerover', PointerEvent, makePointerOpts(x, y, 0));
        fireAll(targets, 'pointerenter', PointerEvent, makePointerOpts(x, y, 0));
        fireAll(targets, 'pointermove', PointerEvent, makePointerOpts(x, y, 0));
        fireAll(targets, 'mouseover', MouseEvent, makeMouseOpts(x, y, 0));
        fireAll(targets, 'mousemove', MouseEvent, makeMouseOpts(x, y, 0));

        fireAll(targets, 'pointerdown', PointerEvent, makePointerOpts(x, y, 1));
        fireAll(targets, 'mousedown', MouseEvent, makeMouseOpts(x, y, 1));

        fireAll(targets, 'pointerup', PointerEvent, makePointerOpts(x, y, 0));
        fireAll(targets, 'mouseup', MouseEvent, makeMouseOpts(x, y, 0));
        fireAll(targets, 'click', MouseEvent, makeMouseOpts(x, y, 0));

        fireAll(targets, 'pointerout', PointerEvent, makePointerOpts(x, y, 0));
        fireAll(targets, 'pointerleave', PointerEvent, makePointerOpts(x, y, 0));
        fireAll(targets, 'mouseout', MouseEvent, makeMouseOpts(x, y, 0));
        fireAll(targets, 'mouseleave', MouseEvent, makeMouseOpts(x, y, 0));
    }

    // =========================================================
    // RESET HOVER
    // =========================================================

    function resetHover() {
        const canvas = getCanvas();
        if (!canvas) return;

        const pos = bufferToClient(canvas, RESET_POINT_X, RESET_POINT_Y);

        dispatchFullClick(canvas, pos.clientX, pos.clientY);
    }

    // =========================================================
    // CLICK EFFECT
    // =========================================================

    function showClickFlash(x, y) {
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

        requestAnimationFrame(() => {
            ripple.style.transform = 'translate(-50%, -50%) scale(1.8)';
            ripple.style.opacity = '0';
        });

        setTimeout(() => ripple.remove(), 400);

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

        requestAnimationFrame(() => {
            btn.style.transform = 'translate(-50%, -50%) scale(0.7)';
            btn.style.boxShadow =
                '0 0 4px #00d4ff, ' +
                '0 0 8px rgba(0,212,255,.5), ' +
                'inset 0 2px 5px rgba(0,0,0,.35)';
        });

        setTimeout(() => {
            btn.style.transform = 'translate(-50%, -50%) scale(1.15)';
            btn.style.opacity = '0';
            btn.style.boxShadow =
                '0 0 18px #00d4ff, ' +
                '0 0 30px rgba(0,212,255,.9)';
        }, 90);

        setTimeout(() => btn.remove(), 400);
    }

    // =========================================================
    // PENDING MARKER
    // =========================================================

    let pendingMarker = null;

    function showPendingMarker(bufX, bufY) {
        removePendingMarker();

        const canvas = getCanvas();
        if (!canvas) return;

        const pos = bufferToClient(canvas, bufX, bufY);

        pendingMarker = document.createElement('div');

        Object.assign(pendingMarker.style, {
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

        document.documentElement.appendChild(pendingMarker);
    }

    function removePendingMarker() {
        if (pendingMarker) {
            pendingMarker.remove();
            pendingMarker = null;
        }
    }

    // =========================================================
    // ADD RULE MODE (6)
    // =========================================================

    function toggleAddMode() {
        isAddingRule = !isAddingRule;

        ensureAddModeIndicator();

        addModeIndicator.style.display = isAddingRule ? 'block' : 'none';

        setMsg(isAddingRule
            ? 'ADD RULE: 0 lưu vị trí, 9 lưu màu'
            : `thoát add mode (${rules.length} rule)`
        );
    }

    function saveRulePositionAtCursor() {
        const canvas = getCanvas();
        if (!canvas) {
            setMsg('save fail: không thấy canvas');
            return;
        }

        const mouseX = lastMouseX;
        const mouseY = lastMouseY;

        if (mouseX === null || mouseY === null) {
            setMsg('save fail: chưa có vị trí chuột');
            return;
        }

        const rect = canvas.getBoundingClientRect();

        if (
            mouseX < rect.left || mouseX > rect.right ||
            mouseY < rect.top || mouseY > rect.bottom
        ) {
            setMsg('save fail: chuột ngoài canvas');
            return;
        }

        const buf = clientToBuffer(canvas, mouseX, mouseY);

        rules.push({
            x: buf.x,
            y: buf.y,
            hex: null,
            tol: COLOR_TOLERANCE,
            enabled: true
        });

        showPendingMarker(buf.x, buf.y);

        setMsg(`đã lưu vị trí #${rules.length} (${buf.x}, ${buf.y}) — di chuột ra xa rồi bấm 9`);
    }

    function saveRuleColor() {
        const canvas = getCanvas();
        if (!canvas) {
            setMsg('save color fail: không thấy canvas');
            return;
        }

        const gl = getGL(canvas);
        if (!gl) {
            setMsg('save color fail: không có WebGL');
            return;
        }

        if (rules.length === 0) {
            setMsg('save color fail: chưa có rule nào');
            return;
        }

        const lastRule = rules[rules.length - 1];

        if (lastRule.hex !== null) {
            setMsg(`rule #${rules.length} đã có màu rồi (${lastRule.hex})`);
            return;
        }

        const pixel = readPixel(gl, lastRule.x, lastRule.y);

        if (!pixel) {
            setMsg('save color fail: không đọc được pixel');
            return;
        }

        const hex = rgbToHex(pixel);

        lastRule.hex = hex;

        removePendingMarker();

        setMsg(`đã lưu màu rule #${rules.length}: ${hex}`);
    }

    function deleteLastRule() {
        if (rules.length === 0) {
            setMsg('không có rule để xoá');
            return;
        }

        const removed = rules.pop();

        if (removed.hex === null) {
            removePendingMarker();
        }

        setMsg(`đã xoá rule cuối (${removed.hex || 'chờ màu'})`);
    }

    // =========================================================
    // CLICK (auto)
    // =========================================================

    function clickAtRule(canvas, rule) {
        if (isClicking) return false;

        const rect = canvas.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;

        const pos = bufferToClient(canvas, rule.x, rule.y);

        if (pos.clientX < rect.left || pos.clientX > rect.right) return false;
        if (pos.clientY < rect.top || pos.clientY > rect.bottom) return false;

        isClicking = true;

        dispatchFullClick(canvas, pos.clientX, pos.clientY);
        showClickFlash(pos.clientX, pos.clientY);

        originalSetTimeout(function () {
            resetHover();
        }, 100);

        originalSetTimeout(function () {
            isClicking = false;
        }, 200);

        return true;
    }

    // =========================================================
    // CHECK FUNCTIONS
    // =========================================================

    function checkRerun(canvas, gl, time) {
        for (let i = 0; i < RERUN_RULES.length; i++) {
            const rule = RERUN_RULES[i];
            if (!rule.enabled) continue;

            const pixel = readPixel(gl, rule.x, rule.y);
            if (!pixel) continue;

            const target = hexToRgb(rule.hex);

            if (colorMatch(pixel, target, rule.tol)) {
                const clicked = clickAtRule(canvas, rule);

                if (clicked) {
                    lastActionTime = originalDateNow();
                    enterRerunRest();
                }

                setMsg(`${time} • RERUN → ${clicked ? 'CLICK' : 'BUSY'}`);
                return;
            }
        }

        setMsg(`${time} • rerun no match`);
    }

    function checkWB(canvas, gl, time) {
        for (let i = 0; i < WB_RULES.length; i++) {
            const rule = WB_RULES[i];
            if (!rule.enabled) continue;

            const pixel = readPixel(gl, rule.x, rule.y);
            if (!pixel) continue;

            const target = hexToRgb(rule.hex);

            if (colorMatch(pixel, target, rule.tol)) {
                const clicked = clickAtRule(canvas, rule);

                if (clicked) {
                    lastActionTime = originalDateNow();
                }

                setMsg(`${time} • WB R${i + 1} → ${clicked ? 'CLICK' : 'BUSY'}`);
                return;
            }
        }

        setMsg(`${time} • wb no match`);
    }

    function checkScript(canvas, gl, time) {
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];

            if (!rule.hex) continue;
            if (!rule.enabled) continue;

            const pixel = readPixel(gl, rule.x, rule.y);
            if (!pixel) continue;

            const target = hexToRgb(rule.hex);

            if (colorMatch(pixel, target, rule.tol)) {
                const clicked = clickAtRule(canvas, rule);

                if (clicked) {
                    lastActionTime = originalDateNow();
                }

                setMsg(`${time} • R${i + 1} → ${clicked ? 'CLICK' : 'BUSY'}`);
                return;
            }
        }

        setMsg(`${time} • script no match`);
    }

    // =========================================================
    // DO CHECK
    // =========================================================

    function doCheck() {
        if (activeAuto === null) return;

        const canvas = getCanvas();
        if (!canvas) {
            setMsg('read error: không thấy canvas');
            return;
        }

        const gl = getGL(canvas);
        if (!gl) {
            setMsg('read error: không có WebGL');
            return;
        }

        const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });

        if (activeAuto === 'rerun') {
            if (rerunPhase === 'hunting') {
                checkRerun(canvas, gl, time);
            }
        } else if (activeAuto === 'wb') {
            checkWB(canvas, gl, time);
        } else if (activeAuto === 'script') {
            checkScript(canvas, gl, time);
        }
    }

    // =========================================================
    // RERUN PHASE MANAGEMENT
    // =========================================================

    function enterRerunHunting() {
        rerunPhase = 'hunting';

        if (rerunPhaseTimerId !== null) {
            originalClearInterval(rerunPhaseTimerId);
            rerunPhaseTimerId = null;
        }

        if (checkTimerId !== null) {
            originalClearInterval(checkTimerId);
            checkTimerId = null;
        }

        checkTimerId = originalSetInterval(doCheck, RERUN_HUNT_INTERVAL);

        doCheck();

        setMsg('RERUN: hunting (3s/lần)');
        render();
    }

    function enterRerunRest() {
        rerunPhase = 'rest';

        if (checkTimerId !== null) {
            originalClearInterval(checkTimerId);
            checkTimerId = null;
        }

        if (rerunPhaseTimerId !== null) {
            originalClearInterval(rerunPhaseTimerId);
            rerunPhaseTimerId = null;
        }

        rerunPhaseTimerId = originalSetTimeout(function () {
            rerunPhaseTimerId = null;

            if (activeAuto === 'rerun') {
                enterRerunHunting();
            }
        }, RERUN_REST_INTERVAL);

        setMsg('RERUN: nghỉ 20s');
        render();
    }

    // =========================================================
    // AUTO-STOP CHECK
    // =========================================================

    function checkAutoStop() {
        if (activeAuto === null) return;

        const elapsed = originalDateNow() - lastActionTime;

        if (elapsed >= AUTO_STOP_TIMEOUT) {
            const stopped = activeAuto;
            stopAuto();
            setMsg(`⚠ ${stopped.toUpperCase()} auto-stop (3 phút không click)`);
        }
    }

    // =========================================================
    // START / STOP AUTO
    // =========================================================

    function startAuto(auto) {
        if (activeAuto !== null && activeAuto !== auto) {
            stopAuto();
        }

        if (activeAuto === auto) {
            stopAuto();
            return;
        }

        activeAuto = auto;
        lastActionTime = originalDateNow();

        autoStopTimerId = originalSetInterval(checkAutoStop, 5000);

        if (auto === 'rerun') {
            rerunPhase = 'hunting';
            enterRerunHunting();
        } else if (auto === 'wb') {
            checkTimerId = originalSetInterval(doCheck, WB_INTERVAL);
            doCheck();
            setMsg(`WB started · check ${WB_INTERVAL / 1000}s`);
            render();
        } else if (auto === 'script') {
            checkTimerId = originalSetInterval(doCheck, SCRIPT_INTERVAL);
            doCheck();
            setMsg(`SCRIPT started · check ${SCRIPT_INTERVAL / 1000}s`);
            render();
        }
    }

    function stopAuto() {
        if (activeAuto === null) return;

        const stopped = activeAuto;
        activeAuto = null;
        rerunPhase = 'hunting';

        if (checkTimerId !== null) {
            originalClearInterval(checkTimerId);
            checkTimerId = null;
        }

        if (autoStopTimerId !== null) {
            originalClearInterval(autoStopTimerId);
            autoStopTimerId = null;
        }

        if (rerunPhaseTimerId !== null) {
            originalClearTimeout(rerunPhaseTimerId);
            rerunPhaseTimerId = null;
        }

        setMsg(`${stopped.toUpperCase()} stopped`);
        render();
    }

    // =========================================================
    // TOGGLE WRAPPERS
    // =========================================================

    function toggleRerun() {
        startAuto('rerun');
    }

    function toggleWB() {
        startAuto('wb');
    }

    function toggleScript() {
        startAuto('script');
    }

    // =========================================================
    // TRACK MOUSE
    // =========================================================

    window.addEventListener('mousemove', (e) => {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }, true);

    // =========================================================
    // INIT
    // =========================================================

    function init() {
        render();

        setInterval(() => {
            render();
        }, 500);
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
        (e) => {

            // 1 = toggle help
            if (e.key === '1') {
                e.preventDefault();
                e.stopImmediatePropagation();
                toggleHelp();
                return;
            }

            // 2 = cycle overlay: expanded → compact → hidden → expanded
            if (e.key === '2') {
                e.preventDefault();
                e.stopImmediatePropagation();
                cycleOverlay();
                return;
            }

            // 3 = auto rerun
            if (e.key === '3') {
                e.preventDefault();
                e.stopImmediatePropagation();
                toggleRerun();
                return;
            }

            // 4 = auto wb solo
            if (e.key === '4') {
                e.preventDefault();
                e.stopImmediatePropagation();
                toggleWB();
                return;
            }

            // 5 = auto script
            if (e.key === '5') {
                e.preventDefault();
                e.stopImmediatePropagation();
                toggleScript();
                return;
            }

            // 6 = add rule mode
            if (e.key === '6') {
                e.preventDefault();
                e.stopImmediatePropagation();
                toggleAddMode();
                return;
            }

            // 0 = lưu vị trí (trong add mode)
            if (e.key === '0' && isAddingRule) {
                e.preventDefault();
                e.stopImmediatePropagation();
                saveRulePositionAtCursor();
                return;
            }

            // 9 = lưu màu (trong add mode)
            if (e.key === '9' && isAddingRule) {
                e.preventDefault();
                e.stopImmediatePropagation();
                saveRuleColor();
                return;
            }

            // 8 = xoá rule cuối (trong add mode)
            if (e.key === '8' && isAddingRule) {
                e.preventDefault();
                e.stopImmediatePropagation();
                deleteLastRule();
                return;
            }

            // = / + = tăng speed
            if (e.key === '=' || e.key === '+') {
                e.preventDefault();
                e.stopImmediatePropagation();
                setSpeed(speed + 1);
                return;
            }

            // - = giảm speed
            if (e.key === '-') {
                e.preventDefault();
                e.stopImmediatePropagation();
                setSpeed(speed - 1);
                return;
            }
        },
        true
    );

})();