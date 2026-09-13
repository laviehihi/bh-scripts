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
        // 5 slot đếm số người
        slots: [
            { x: 140, y: 416, label: 'Slot 1', disabled: false },
            { x: 140, y: 358, label: 'Slot 2', disabled: false },
            { x: 140, y: 292, label: 'Slot 3', disabled: false },
            { x: 140, y: 220, label: 'Slot 4', disabled: true },
            { x: 140, y: 166, label: 'Slot 5', disabled: true }
        ],

        emptyHex: '#282f37',
        disabledHex: '#384250',
        tol: 15,

        // Nút
        readyStart: { x: 390, y: 70, hex: '#1267d3', tol: 15, label: 'Ready/Start' },
        yes: { x: 362, y: 206, hex: '#9cd01f', tol: 15, label: 'Yes' },
        regroup: { x: 592, y: 54, hex: '#9cd01f', tol: 15, label: 'Regroup' },

        // 3 điểm confirm (dự phòng)
        confirmPoints: [
            { x: 324, y: 500, hex: '#333d4b', tol: 15 },
            { x: 384, y: 502, hex: '#37414d', tol: 15 },
            { x: 546, y: 502, hex: '#37414f', tol: 15 }
        ],

        // Timing
        yesCheckDelay: 2000,
        regroupTimeout: 120000,
        pollInterval: 500,
        watchdogTimeout: 3 * 60 * 1000,

        // Chế độ
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

    // =========================================================
    // UTILS
    // =========================================================

    function readPixelAt(x, y) {
        const canvas = BH.getCanvas();
        if (!canvas) return null;
        const gl = BH.getGL(canvas);
        if (!gl) return null;
        return BH.readPixel(gl, x, y);
    }

    function matchHex(pixel, hex, tol) {
        if (!pixel) return false;
        const target = BH.hexToRgb(hex);
        return BH.colorMatch(pixel, target, tol || 15);
    }

    function countSlots() {
        let count = 0;
        const cfg = BH.WBP.config;

        for (let i = 0; i < cfg.slots.length; i++) {
            const slot = cfg.slots[i];
            const pixel = readPixelAt(slot.x, slot.y);
            if (!pixel) continue;

            // Slot trống?
            if (matchHex(pixel, cfg.emptyHex, cfg.tol)) continue;

            // Slot 4/5 có thể disabled
            if (slot.disabled) {
                if (matchHex(pixel, cfg.disabledHex, cfg.tol)) continue;
            }

            count++;
        }

        return count;
    }

    function checkConfirm() {
        const cfg = BH.WBP.config;

        for (let i = 0; i < cfg.confirmPoints.length; i++) {
            const p = cfg.confirmPoints[i];
            const pixel = readPixelAt(p.x, p.y);
            if (!pixel) continue;

            if (matchHex(pixel, p.hex, p.tol)) {
                return true;   // 1 trong 3 match → OK
            }
        }

        return false;
    }

    function clickAt(step) {
        if (BH.WBP.isClicking) return false;

        const canvas = BH.getCanvas();
        if (!canvas) return false;

        const pos = BH.bufferToClient(canvas, step.x, step.y);
        const rect = canvas.getBoundingClientRect();

        if (pos.clientX < rect.left || pos.clientX > rect.right) return false;
        if (pos.clientY < rect.top || pos.clientY > rect.bottom) return false;

        BH.WBP.isClicking = true;

        BH.dispatchFullClick(canvas, pos.clientX, pos.clientY);

        BH.WBP.totalClicks++;
        BH.WBP.lastActionTime = BH.originalDateNow();

        setTimeout(function () {
            BH.WBP.isClicking = false;
        }, 200);

        return true;
    }

    function matchClick(step) {
        const pixel = readPixelAt(step.x, step.y);
        if (!matchHex(pixel, step.hex, step.tol)) return false;
        return clickAt(step);
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

        // =========================================================
        // WATCHDOG
        // =========================================================
        if (!BH.WBP.watchdogPaused) {
            if (checkConfirm()) {
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

        // =========================================================
        // ĐẾM SLOT
        // =========================================================
        const count = countSlots();
        BH.WBP.currentCount = count;

        if (count < BH.WBP.modeCount) {
            setMsg(`Chờ member (${count}/${BH.WBP.modeCount})`);
            if (BH.render) BH.render();
            return;
        }

        // =========================================================
        // ĐỦ NGƯỜI → BẤM READY/START
        // =========================================================
        setMsg(`Đủ người (${count}/${BH.WBP.modeCount}) → Start`);

        if (!matchClick(cfg.readyStart)) {
            // Nút chưa hiện → chờ tick sau
            return;
        }

        setMsg('Đã bấm Ready/Start');

        // Tạm dừng watchdog (đang vào trận)
        BH.WBP.watchdogPaused = true;

        // Chờ 2s → check Yes
        BH.originalSetTimeout(function () {
            if (!BH.WBP.running) return;

            if (matchClick(cfg.yes)) {
                setMsg('Đã bấm Yes (thiếu member)');
            }

            // Chờ Regroup
            waitForRegroup();
        }, cfg.yesCheckDelay);
    }

    function waitForRegroup() {
        if (!BH.WBP.running) return;

        const cfg = BH.WBP.config;
        const startTime = BH.originalDateNow();

        const checkRegroup = function () {
            if (!BH.WBP.running) return;

            if (matchClick(cfg.regroup)) {
                BH.WBP.loopCount++;
                setMsg(`✓ Vòng ${BH.WBP.loopCount} xong`);

                // Resume watchdog
                BH.WBP.watchdogPaused = false;
                BH.WBP.lastConfirmTime = BH.originalDateNow();

                // Chờ 1s → quay lại tick
                BH.originalSetTimeout(function () {
                    if (BH.WBP.running && BH.render) BH.render();
                }, 1000);
                return;
            }

            // Timeout?
            if (BH.originalDateNow() - startTime > cfg.regroupTimeout) {
                setMsg('⚠ Timeout chờ Regroup');
                BH.WBP.watchdogPaused = false;
                BH.WBP.lastConfirmTime = BH.originalDateNow();
                return;
            }

            // Check lại sau 1s
            BH.originalSetTimeout(checkRegroup, 1000);
        };

        checkRegroup();
    }

    // =========================================================
    // START / STOP
    // =========================================================

    function startWBP() {
        if (BH.WBP.running) return;

        // Tắt engine cũ nếu đang chạy
        if (BH.stopAuto) BH.stopAuto();

        BH.WBP.running = true;
        BH.WBP.loopCount = 0;
        BH.WBP.totalClicks = 0;
        BH.WBP.lastActionTime = BH.originalDateNow();
        BH.WBP.lastConfirmTime = BH.originalDateNow();
        BH.WBP.watchdogPaused = false;

        setMsg('WB Party started');

        BH.WBP.timerId = BH.originalSetInterval(tick, BH.WBP.config.pollInterval);

        if (BH.render) BH.render();
    }

    function stopWBP() {
        if (!BH.WBP.running) return;

        BH.WBP.running = false;

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

        // Nếu chưa chạy → chỉ bắt phím 7 để bật
        if (!BH.WBP.running) {
            if (e.key === '7') {
                e.preventDefault();
                e.stopImmediatePropagation();
                toggleWBP();
                return;
            }
            return;
        }

        // Đang chạy → bắt 7 + Z X C V
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