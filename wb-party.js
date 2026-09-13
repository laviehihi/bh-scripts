// wb-party.js
// WB Party — auto đánh World Boss theo tổ đội

(function (global) {
    'use strict';

    const BH = global.__BH__ = global.__BH__ || {};
    BH.WBP = BH.WBP || {};

    // =========================================================
    // CONFIG
    // =========================================================

    BH.WBP.config = {
        slots: [
            { x: 516, y: 436, label: 'Slot 1', disabled: false },
            { x: 516, y: 362, label: 'Slot 2', disabled: false },
            { x: 516, y: 300, label: 'Slot 3', disabled: false },
            { x: 516, y: 228, label: 'Slot 4', disabled: true },
            { x: 516, y: 156, label: 'Slot 5', disabled: true }
        ],

        emptyHexes: ['#ffffff', '#8ea5c2'],
        disabledHex: '#384250',
        tol: 15,

        readyStart: { x: 388, y: 66, hexes: ['#0a62d0', '#1fabd0'], tol: 15, label: 'Ready/Start' },
        yes: { x: 356, y: 208, hex: '#9cd01f', tol: 15, label: 'Yes' },

        regroupPoints: [
            { x: 446, y: 58, hex: '#9cd01f', tol: 15, label: 'Regroup 1' },
            { x: 442, y: 50, hex: '#9cd01f', tol: 15, label: 'Regroup 2' },
            { x: 594, y: 40, hex: '#89b516', tol: 15, label: 'Regroup 3' }
        ],

        confirmPoints: [
            { x: 304, y: 504, hexes: ['#37414d', '#37414f'], tol: 15 },
            { x: 390, y: 510, hexes: ['#37414d', '#37414f'], tol: 15 },
            { x: 556, y: 504, hexes: ['#37414d', '#37414f'], tol: 15 }
        ],

        yesCheckDelay: 2000,
        regroupTimeout: 120000,
        pollInterval: 500,
        watchdogTimeout: 3 * 60 * 1000,

        // Delay trước khi click (ms)
        clickDelay: 1000,

        modes: {
            z: 2,
            x: 3,
            c: 4,
            v: 5
        }
    };

    // =========================================================
    // STATE
    // =========================================================

    BH.WBP.running = false;
    BH.WBP.modeKey = 'z';
    BH.WBP.modeCount = 2;
    BH.WBP.currentCount = 0;
    BH.WBP.loopCount = 0;
    BH.WBP.totalClicks = 0;
    BH.WBP.timerId = null;
    BH.WBP.lastMsg = '';
    BH.WBP.lastActionTime = 0;
    BH.WBP.lastConfirmTime = 0;
    BH.WBP.isClicking = false;
    BH.WBP.watchdogPaused = false;
    BH.WBP.slotsLocked = false;
    BH.WBP.confirmOk = false;
    BH.WBP.pendingClickStep = null;      // Step đang chờ click

    // =========================================================
    // ĐỌC PIXEL
    // =========================================================

    function readPixelBuf(bufX, bufY) {
        const canvas = BH.getCanvas();
        if (!canvas) return null;
        const gl = BH.getGL(canvas);
        if (!gl) return null;
        return BH.readPixel(gl, bufX, bufY);
    }

    function matchHex(pixel, hex, tol) {
        if (!pixel) return false;
        const target = BH.hexToRgb(hex);
        return BH.colorMatch(pixel, target, tol || 15);
    }

    function matchAnyHex(pixel, hexes, tol) {
        if (!pixel) return false;
        for (let i = 0; i < hexes.length; i++) {
            if (matchHex(pixel, hexes[i], tol)) return true;
        }
        return false;
    }

    // =========================================================
    // COUNT SLOTS
    // =========================================================

    function countSlots() {
        let count = 0;
        const cfg = BH.WBP.config;

        for (let i = 0; i < cfg.slots.length; i++) {
            const slot = cfg.slots[i];
            const pixel = readPixelBuf(slot.x, slot.y);

            if (!pixel) continue;

            if (matchAnyHex(pixel, cfg.emptyHexes, cfg.tol)) continue;

            if (slot.disabled) {
                if (matchHex(pixel, cfg.disabledHex, cfg.tol)) continue;
            }

            count++;
        }

        return count;
    }

    // =========================================================
    // CHECK CONFIRM
    // =========================================================

    function checkConfirm() {
        const cfg = BH.WBP.config;

        for (let i = 0; i < cfg.confirmPoints.length; i++) {
            const p = cfg.confirmPoints[i];
            const pixel = readPixelBuf(p.x, p.y);
            if (!pixel) continue;

            if (matchAnyHex(pixel, p.hexes, p.tol)) {
                return true;
            }
        }

        return false;
    }

    // =========================================================
    // CLICK
    // =========================================================

    function clickAtBuf(bufX, bufY) {
        if (BH.WBP.isClicking) return false;

        const canvas = BH.getCanvas();
        if (!canvas) return false;

        const rect = canvas.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;

        const pos = BH.bufferToClient(canvas, bufX, bufY);

        if (pos.clientX < rect.left || pos.clientX > rect.right) return false;
        if (pos.clientY < rect.top || pos.clientY > rect.bottom) return false;

        BH.WBP.isClicking = true;

        BH.dispatchFullClick(canvas, pos.clientX, pos.clientY);

        if (BH.showClickFlash) {
            BH.showClickFlash(pos.clientX, pos.clientY);
        }

        BH.WBP.totalClicks++;
        BH.WBP.lastActionTime = BH.originalDateNow();

        // Reset hover — click góc canvas
        BH.originalSetTimeout(function () {
            if (BH.resetHover) BH.resetHover();
        }, 100);

        BH.originalSetTimeout(function () {
            BH.WBP.isClicking = false;
        }, 200);

        return true;
    }

    // Match + delay 1s trước khi click
    function matchClick(step) {
        const pixel = readPixelBuf(step.x, step.y);
        if (!pixel) return false;

        let ok = false;

        if (step.hexes) {
            ok = matchAnyHex(pixel, step.hexes, step.tol);
        } else if (step.hex) {
            ok = matchHex(pixel, step.hex, step.tol);
        }

        if (!ok) return false;

        // Nếu step này đang chờ click → kiểm tra đã đủ delay chưa
        if (BH.WBP.pendingClickStep === step) {
            return true;   // Đã chờ đủ, tick() sẽ click
        }

        // Bắt đầu chờ delay
        BH.WBP.pendingClickStep = step;

        BH.originalSetTimeout(function () {
            if (!BH.WBP.running) return;
            if (BH.WBP.pendingClickStep !== step) return;

            // Vẫn check lại pixel trước khi click
            const p2 = readPixelBuf(step.x, step.y);
            if (!p2) {
                BH.WBP.pendingClickStep = null;
                return;
            }

            let stillOk = false;
            if (step.hexes) {
                stillOk = matchAnyHex(p2, step.hexes, step.tol);
            } else if (step.hex) {
                stillOk = matchHex(p2, step.hex, step.tol);
            }

            if (!stillOk) {
                BH.WBP.pendingClickStep = null;
                return;
            }

            clickAtBuf(step.x, step.y);
            BH.WBP.pendingClickStep = null;
        }, BH.WBP.config.clickDelay);

        return false;   // Chưa click ngay
    }

    // Regroup — match 1 trong 3 vị trí + delay
    function matchClickRegroup() {
        const cfg = BH.WBP.config;

        for (let i = 0; i < cfg.regroupPoints.length; i++) {
            const step = cfg.regroupPoints[i];
            const pixel = readPixelBuf(step.x, step.y);
            if (!pixel) continue;

            if (matchHex(pixel, step.hex, step.tol)) {
                // Dùng chung logic delay với matchClick
                return matchClick(step);
            }
        }

        return false;
    }

    function setMsg(msg) {
        BH.WBP.lastMsg = msg;
        if (BH.render) BH.render();
    }

    // =========================================================
    // LOGIC
    // =========================================================

    function tick() {
        if (!BH.WBP.running) return;
        if (BH.WBP.isClicking) return;

        const cfg = BH.WBP.config;

        const confirmed = checkConfirm();
        BH.WBP.confirmOk = confirmed;

        if (!BH.WBP.watchdogPaused) {
            if (confirmed) {
                BH.WBP.lastConfirmTime = BH.originalDateNow();
            } else {
                const idle = BH.originalDateNow() - BH.WBP.lastConfirmTime;
                if (idle >= cfg.watchdogTimeout) {
                    setMsg('⚠ Watchdog: mất màn WB — tắt WB Team');
                    stopWBP();
                    return;
                }
            }
        }

        if (!confirmed && !BH.WBP.slotsLocked) {
            setMsg('Chưa vào màn WB — chờ');
            if (BH.render) BH.render();
            return;
        }

        // Đang trong trận → chỉ check Regroup
        if (BH.WBP.slotsLocked) {
            if (matchClickRegroup()) {
                BH.WBP.loopCount++;
                setMsg(`✓ Vòng ${BH.WBP.loopCount} xong`);

                BH.WBP.watchdogPaused = false;
                BH.WBP.lastConfirmTime = BH.originalDateNow();
                BH.WBP.slotsLocked = false;

                BH.originalSetTimeout(function () {
                    if (BH.WBP.running && BH.render) BH.render();
                }, 1000);
            }
            return;
        }

        // Đếm slot
        const count = countSlots();
        BH.WBP.currentCount = count;

        if (count < BH.WBP.modeCount) {
            setMsg(`Chờ member (${count}/${BH.WBP.modeCount})`);
            if (BH.render) BH.render();
            return;
        }

        setMsg(`Đủ người (${count}/${BH.WBP.modeCount}) → Start`);

        // Match Ready/Start (có delay 1s)
        const clicked = matchClick(cfg.readyStart);
        if (!clicked) {
            // Chưa click (đang chờ delay hoặc không match)
            return;
        }

        setMsg('Đã bấm Ready/Start');
        BH.WBP.watchdogPaused = true;
        BH.WBP.slotsLocked = true;

        BH.originalSetTimeout(function () {
            if (!BH.WBP.running) return;

            if (matchClick(cfg.yes)) {
                setMsg('Đã bấm Yes (thiếu member)');
            }
        }, cfg.yesCheckDelay);
    }

    // =========================================================
    // START / STOP
    // =========================================================

    function startWBP() {
        if (BH.WBP.running) return;

        if (BH.stopAuto) BH.stopAuto();

        BH.WBP.running = true;
        BH.WBP.loopCount = 0;
        BH.WBP.totalClicks = 0;
        BH.WBP.lastActionTime = BH.originalDateNow();
        BH.WBP.lastConfirmTime = BH.originalDateNow();
        BH.WBP.watchdogPaused = false;
        BH.WBP.slotsLocked = false;
        BH.WBP.confirmOk = false;
        BH.WBP.pendingClickStep = null;

        setMsg('WB Party started — chờ vào màn WB');

        BH.WBP.timerId = BH.originalSetInterval(tick, BH.WBP.config.pollInterval);

        if (BH.render) BH.render();
    }

    function stopWBP() {
        if (!BH.WBP.running) return;

        BH.WBP.running = false;
        BH.WBP.pendingClickStep = null;

        if (BH.WBP.timerId !== null) {
            BH.originalClearInterval(BH.WBP.timerId);
            BH.WBP.timerId = null;
        }

        if (BH.render) BH.render();
    }

    function toggleWBP() {
        if (BH.WBP.running) {
            stopWBP();
        } else {
            startWBP();
        }
    }

    function setMode(key) {
        BH.WBP.modeKey = key;
        BH.WBP.modeCount = BH.WBP.config.modes[key] || 2;
        setMsg(`Chế độ: ${BH.WBP.modeCount} người`);
        if (BH.render) BH.render();
    }

    // =========================================================
    // HOTKEY
    // =========================================================

    document.addEventListener('keydown', function (e) {

        if (!BH.WBP.running) {
            if (e.key === '7') {
                e.preventDefault();
                e.stopImmediatePropagation();
                toggleWBP();
                return;
            }
            return;
        }

        if (e.key === '7') {
            e.preventDefault();
            e.stopImmediatePropagation();
            toggleWBP();
            return;
        }

        const k = e.key.toLowerCase();
        if (k === 'z' || k === 'x' || k === 'c' || k === 'v') {
            e.preventDefault();
            e.stopImmediatePropagation();
            setMode(k);
            return;
        }
    }, true);

})(window);