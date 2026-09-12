// core/engine.js
// Auto engine — click, check pixel, phase, start/stop, add rule

(function (global) {
    'use strict';

    const BH = global.__BH__ = global.__BH__ || {};

    // =========================================================
    // STATE
    // =========================================================

    BH.rules = [];

    BH.activeAuto = null;          // null | 'rerun' | 'wb' | 'script'
    BH.rerunPhase = 'hunting';     // 'hunting' | 'rest'

    BH.checkTimerId = null;
    BH.autoStopTimerId = null;
    BH.rerunPhaseTimerId = null;

    BH.lastActionTime = 0;

    BH.isAddingRule = false;

    BH.isClicking = false;

    BH.lastMouseX = null;
    BH.lastMouseY = null;

    // Callback cho UI (set từ main hoặc ui module)
    BH.onClickFlash = null;
    BH.onPendingMarker = null;
    BH.onRemovePendingMarker = null;

    // =========================================================
    // CLICK
    // =========================================================

    BH.clickAtRule = function (canvas, rule) {
        if (BH.isClicking) return false;

        const rect = canvas.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;

        const pos = BH.bufferToClient(canvas, rule.x, rule.y);

        if (pos.clientX < rect.left || pos.clientX > rect.right) return false;
        if (pos.clientY < rect.top || pos.clientY > rect.bottom) return false;

        BH.isClicking = true;

        BH.dispatchFullClick(canvas, pos.clientX, pos.clientY);

        if (BH.onClickFlash) {
            BH.onClickFlash(pos.clientX, pos.clientY);
        }

        // Reset hover sau 100ms
        BH.originalSetTimeout(function () {
            BH.resetHover();
        }, 100);

        // Mở lock sau 200ms
        BH.originalSetTimeout(function () {
            BH.isClicking = false;
        }, 200);

        return true;
    };

    // =========================================================
    // CHECK FUNCTIONS
    // =========================================================

    BH.checkRerun = function (canvas, gl, time) {
        for (let i = 0; i < BH.RERUN_RULES.length; i++) {
            const rule = BH.RERUN_RULES[i];
            if (!rule.enabled) continue;

            const pixel = BH.readPixel(gl, rule.x, rule.y);
            if (!pixel) continue;

            const target = BH.hexToRgb(rule.hex);

            if (BH.colorMatch(pixel, target, rule.tol)) {
                const clicked = BH.clickAtRule(canvas, rule);

                if (clicked) {
                    BH.lastActionTime = Date.now();
                    BH.enterRerunRest();
                }

                BH.setMsg(`${time} • RERUN → ${clicked ? 'CLICK' : 'BUSY'}`);
                return;
            }
        }

        BH.setMsg(`${time} • rerun no match`);
    };

    BH.checkWB = function (canvas, gl, time) {
        for (let i = 0; i < BH.WB_RULES.length; i++) {
            const rule = BH.WB_RULES[i];
            if (!rule.enabled) continue;

            const pixel = BH.readPixel(gl, rule.x, rule.y);
            if (!pixel) continue;

            const target = BH.hexToRgb(rule.hex);

            if (BH.colorMatch(pixel, target, rule.tol)) {
                const clicked = BH.clickAtRule(canvas, rule);

                if (clicked) {
                    BH.lastActionTime = Date.now();
                }

                BH.setMsg(`${time} • WB R${i + 1} → ${clicked ? 'CLICK' : 'BUSY'}`);
                return;
            }
        }

        BH.setMsg(`${time} • wb no match`);
    };

    BH.checkScript = function (canvas, gl, time) {
        for (let i = 0; i < BH.rules.length; i++) {
            const rule = BH.rules[i];

            if (!rule.hex) continue;
            if (!rule.enabled) continue;

            const pixel = BH.readPixel(gl, rule.x, rule.y);
            if (!pixel) continue;

            const target = BH.hexToRgb(rule.hex);

            if (BH.colorMatch(pixel, target, rule.tol)) {
                const clicked = BH.clickAtRule(canvas, rule);

                if (clicked) {
                    BH.lastActionTime = Date.now();
                }

                BH.setMsg(`${time} • R${i + 1} → ${clicked ? 'CLICK' : 'BUSY'}`);
                return;
            }
        }

        BH.setMsg(`${time} • script no match`);
    };

    // =========================================================
    // DO CHECK
    // =========================================================

    BH.doCheck = function () {
        if (BH.activeAuto === null) return;

        const canvas = BH.getCanvas();
        if (!canvas) {
            BH.setMsg('read error: không thấy canvas');
            return;
        }

        const gl = BH.getGL(canvas);
        if (!gl) {
            BH.setMsg('read error: không có WebGL');
            return;
        }

        const time = BH.nowTime();

        if (BH.activeAuto === 'rerun') {
            if (BH.rerunPhase === 'hunting') {
                BH.checkRerun(canvas, gl, time);
            }
        } else if (BH.activeAuto === 'wb') {
            BH.checkWB(canvas, gl, time);
        } else if (BH.activeAuto === 'script') {
            BH.checkScript(canvas, gl, time);
        }
    };

    // =========================================================
    // RERUN PHASE
    // =========================================================

    BH.enterRerunHunting = function () {
        BH.rerunPhase = 'hunting';

        if (BH.rerunPhaseTimerId !== null) {
            BH.originalClearInterval(BH.rerunPhaseTimerId);
            BH.rerunPhaseTimerId = null;
        }

        if (BH.checkTimerId !== null) {
            BH.originalClearInterval(BH.checkTimerId);
            BH.checkTimerId = null;
        }

        BH.checkTimerId = BH.originalSetInterval(BH.doCheck, BH.RERUN_HUNT_INTERVAL);

        BH.doCheck();

        BH.setMsg('RERUN: hunting (3s/lần)');
    };

    BH.enterRerunRest = function () {
        BH.rerunPhase = 'rest';

        if (BH.checkTimerId !== null) {
            BH.originalClearInterval(BH.checkTimerId);
            BH.checkTimerId = null;
        }

        if (BH.rerunPhaseTimerId !== null) {
            BH.originalClearInterval(BH.rerunPhaseTimerId);
            BH.rerunPhaseTimerId = null;
        }

        BH.rerunPhaseTimerId = BH.originalSetTimeout(function () {
            BH.rerunPhaseTimerId = null;

            if (BH.activeAuto === 'rerun') {
                BH.enterRerunHunting();
            }
        }, BH.RERUN_REST_INTERVAL);

        BH.setMsg('RERUN: nghỉ 20s');
    };

    // =========================================================
    // AUTO-STOP
    // =========================================================

    BH.checkAutoStop = function () {
        if (BH.activeAuto === null) return;

        const elapsed = Date.now() - BH.lastActionTime;

        if (elapsed >= BH.AUTO_STOP_TIMEOUT) {
            const stopped = BH.activeAuto;
            BH.stopAuto();
            BH.setMsg(`⚠ ${stopped.toUpperCase()} auto-stop (3 phút không click)`);
        }
    };

    // =========================================================
    // START / STOP
    // =========================================================

    BH.startAuto = function (auto) {
        if (BH.activeAuto !== null && BH.activeAuto !== auto) {
            BH.stopAuto();
        }

        if (BH.activeAuto === auto) {
            BH.stopAuto();
            return;
        }

        BH.activeAuto = auto;
        BH.lastActionTime = Date.now();

        BH.autoStopTimerId = BH.originalSetInterval(BH.checkAutoStop, 5000);

        if (auto === 'rerun') {
            BH.rerunPhase = 'hunting';
            BH.enterRerunHunting();
        } else if (auto === 'wb') {
            BH.checkTimerId = BH.originalSetInterval(BH.doCheck, BH.WB_INTERVAL);
            BH.doCheck();
            BH.setMsg(`WB started · check ${BH.WB_INTERVAL / 1000}s`);
        } else if (auto === 'script') {
            BH.checkTimerId = BH.originalSetInterval(BH.doCheck, BH.SCRIPT_INTERVAL);
            BH.doCheck();
            BH.setMsg(`SCRIPT started · check ${BH.SCRIPT_INTERVAL / 1000}s`);
        }
    };

    BH.stopAuto = function () {
        if (BH.activeAuto === null) return;

        const stopped = BH.activeAuto;
        BH.activeAuto = null;
        BH.rerunPhase = 'hunting';

        if (BH.checkTimerId !== null) {
            BH.originalClearInterval(BH.checkTimerId);
            BH.checkTimerId = null;
        }

        if (BH.autoStopTimerId !== null) {
            BH.originalClearInterval(BH.autoStopTimerId);
            BH.autoStopTimerId = null;
        }

        if (BH.rerunPhaseTimerId !== null) {
            BH.originalClearTimeout(BH.rerunPhaseTimerId);
            BH.rerunPhaseTimerId = null;
        }

        BH.setMsg(`${stopped.toUpperCase()} stopped`);
    };

    BH.toggleRerun = function () { BH.startAuto('rerun'); };
    BH.toggleWB = function () { BH.startAuto('wb'); };
    BH.toggleScript = function () { BH.startAuto('script'); };

    // =========================================================
    // ADD RULE
    // =========================================================

    BH.toggleAddMode = function () {
        BH.isAddingRule = !BH.isAddingRule;

        if (BH.onAddModeChange) {
            BH.onAddModeChange(BH.isAddingRule);
        }

        BH.setMsg(BH.isAddingRule
            ? 'ADD RULE: 0 lưu vị trí, 9 lưu màu'
            : `thoát add mode (${BH.rules.length} rule)`
        );
    };

    BH.saveRulePositionAtCursor = function () {
        const canvas = BH.getCanvas();
        if (!canvas) {
            BH.setMsg('save fail: không thấy canvas');
            return;
        }

        const mouseX = BH.lastMouseX;
        const mouseY = BH.lastMouseY;

        if (mouseX === null || mouseY === null) {
            BH.setMsg('save fail: chưa có vị trí chuột');
            return;
        }

        const rect = canvas.getBoundingClientRect();

        if (
            mouseX < rect.left || mouseX > rect.right ||
            mouseY < rect.top || mouseY > rect.bottom
        ) {
            BH.setMsg('save fail: chuột ngoài canvas');
            return;
        }

        const buf = BH.clientToBuffer(canvas, mouseX, mouseY);

        BH.rules.push({
            x: buf.x,
            y: buf.y,
            hex: null,
            tol: BH.COLOR_TOLERANCE,
            enabled: true
        });

        if (BH.onPendingMarker) {
            BH.onPendingMarker(buf.x, buf.y);
        }

        BH.setMsg(`đã lưu vị trí #${BH.rules.length} (${buf.x}, ${buf.y}) — di chuột ra xa rồi bấm 9`);
    };

    BH.saveRuleColor = function () {
        const canvas = BH.getCanvas();
        if (!canvas) {
            BH.setMsg('save color fail: không thấy canvas');
            return;
        }

        const gl = BH.getGL(canvas);
        if (!gl) {
            BH.setMsg('save color fail: không có WebGL');
            return;
        }

        if (BH.rules.length === 0) {
            BH.setMsg('save color fail: chưa có rule nào');
            return;
        }

        const lastRule = BH.rules[BH.rules.length - 1];

        if (lastRule.hex !== null) {
            BH.setMsg(`rule #${BH.rules.length} đã có màu rồi (${lastRule.hex})`);
            return;
        }

        const pixel = BH.readPixel(gl, lastRule.x, lastRule.y);

        if (!pixel) {
            BH.setMsg('save color fail: không đọc được pixel');
            return;
        }

        const hex = BH.rgbToHex(pixel);

        lastRule.hex = hex;

        if (BH.onRemovePendingMarker) {
            BH.onRemovePendingMarker();
        }

        BH.setMsg(`đã lưu màu rule #${BH.rules.length}: ${hex}`);
    };

    BH.deleteLastRule = function () {
        if (BH.rules.length === 0) {
            BH.setMsg('không có rule để xoá');
            return;
        }

        const removed = BH.rules.pop();

        if (removed.hex === null && BH.onRemovePendingMarker) {
            BH.onRemovePendingMarker();
        }

        BH.setMsg(`đã xoá rule cuối (${removed.hex || 'chờ màu'})`);
    };

    // =========================================================
    // TRACK MOUSE
    // =========================================================

    window.addEventListener('mousemove', function (e) {
        BH.lastMouseX = e.clientX;
        BH.lastMouseY = e.clientY;
    }, true);

})(window);