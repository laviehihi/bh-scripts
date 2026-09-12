// afk/afk.js
// Framework AFK — chạy tuần tự PvP → TG → WB → Raid → tắt

(function (global) {
    'use strict';

    const BH = global.__BH__ = global.__BH__ || {};
    BH.AFK = BH.AFK || {};
    BH.AFK.activities = BH.AFK.activities || {};

    // =========================================================
    // CẤU HÌNH CHUNG
    // =========================================================

    // Thứ tự chạy
    BH.AFK.ORDER = ['pvp', 'tg', 'wb', 'raid'];

    // Nút out-of-ticket — xuất hiện ở mọi activity
    BH.AFK.OUT_OF_TICKET = {
        x: 636,
        y: 214,
        hex: '#35b3d3',
        tol: 15,
        waitAfter: 2000,
        label: 'Hết vé'
    };

    // Thời gian tối đa cho 1 bước (ms)
    BH.AFK.STEP_TIMEOUT = 30000;

    // Thời gian chờ giữa các bước nếu không match (ms)
    BH.AFK.POLL_INTERVAL = 500;

    // Auto-stop: nếu không click gì trong X ms → tắt AFK
    BH.AFK.AUTO_STOP_TIMEOUT = 10 * 60 * 1000;  // 10 phút

    // =========================================================
    // STATE
    // =========================================================

    BH.AFK.running = false;
    BH.AFK.currentActivityIndex = 0;
    BH.AFK.currentStep = 0;           // index trong open/setup/loop/close
    BH.AFK.currentPhase = 'open';     // 'open' | 'setup' | 'loop' | 'close'
    BH.AFK.currentLoopCount = 0;
    BH.AFK.totalClicks = 0;
    BH.AFK.lastActionTime = 0;
    BH.AFK.lastMsg = '';
    BH.AFK.timerId = null;
    BH.AFK.autoStopTimerId = null;
    BH.AFK.stepStartTime = 0;
    BH.AFK.isClicking = false;

    // =========================================================
    // UTILS
    // =========================================================

    function getActivity() {
        const name = BH.AFK.ORDER[BH.AFK.currentActivityIndex];
        return BH.AFK.activities[name] || null;
    }

    function getCurrentStepList() {
        const act = getActivity();
        if (!act) return [];

        if (BH.AFK.currentPhase === 'open') {
            return Array.isArray(act.open) ? act.open : (act.open ? [act.open] : []);
        }
        if (BH.AFK.currentPhase === 'setup') {
            return Array.isArray(act.setup) ? act.setup : (act.setup ? [act.setup] : []);
        }
        if (BH.AFK.currentPhase === 'loop') {
            return Array.isArray(act.loop) ? act.loop : [];
        }
        if (BH.AFK.currentPhase === 'close') {
            return Array.isArray(act.close) ? act.close : (act.close ? [act.close] : []);
        }
        return [];
    }

    function getCurrentStep() {
        const list = getCurrentStepList();
        return list[BH.AFK.currentStep] || null;
    }

    function matchStep(step) {
        if (!step) return false;

        const canvas = BH.getCanvas();
        if (!canvas) return false;

        const gl = BH.getGL(canvas);
        if (!gl) return false;

        const pixel = BH.readPixel(gl, step.x, step.y);
        if (!pixel) return false;

        const tol = step.tol || 15;

        // Check màu chính
        const target1 = BH.hexToRgb(step.hex);
        if (BH.colorMatch(pixel, target1, tol)) return true;

        // Check màu phụ (nếu có)
        if (step.hexAlt) {
            const target2 = BH.hexToRgb(step.hexAlt);
            if (BH.colorMatch(pixel, target2, tol)) return true;
        }

        return false;
    }

    function matchOutOfTicket() {
        return matchStep(BH.AFK.OUT_OF_TICKET);
    }

    function clickStep(step) {
        if (!step) return false;
        if (BH.AFK.isClicking) return false;

        const canvas = BH.getCanvas();
        if (!canvas) return false;

        const pos = BH.bufferToClient(canvas, step.x, step.y);
        const rect = canvas.getBoundingClientRect();

        if (pos.clientX < rect.left || pos.clientX > rect.right) return false;
        if (pos.clientY < rect.top || pos.clientY > rect.bottom) return false;

        BH.AFK.isClicking = true;

        BH.dispatchFullClick(canvas, pos.clientX, pos.clientY);

        BH.AFK.totalClicks++;
        BH.AFK.lastActionTime = BH.originalDateNow();

        setTimeout(function () {
            BH.AFK.isClicking = false;
        }, 200);

        return true;
    }

    function clickOutOfTicket() {
        return clickStep(BH.AFK.OUT_OF_TICKET);
    }

    function setMsg(msg) {
        BH.AFK.lastMsg = msg;
        renderOverlay();
    }

    // =========================================================
    // OVERLAY
    // =========================================================

    let afkBox = null;

    function ensureOverlay() {
        if (afkBox) return;

        afkBox = document.createElement('div');

        Object.assign(afkBox.style, {
            position: 'fixed',
            top: '12px',
            left: '12px',
            zIndex: '2147483647',
            boxSizing: 'border-box',
            width: '250px',
            padding: '10px 12px',
            background: 'rgba(12, 14, 18, 0.95)',
            color: '#ddd',
            border: '2px solid #70e0a8',
            borderRadius: '9px',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '11px',
            lineHeight: '1.5',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5), 0 0 20px rgba(112,224,168,0.3)',
            pointerEvents: 'none',
            userSelect: 'none',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'none'
        });

        (document.documentElement || document.body).appendChild(afkBox);
    }

    function getRemainingStr() {
        if (!BH.AFK.running) return '';

        const elapsed = BH.originalDateNow() - BH.AFK.lastActionTime;
        const remain = BH.AFK.AUTO_STOP_TIMEOUT - elapsed;

        if (remain <= 0) return '0s';

        const sec = Math.floor(remain / 1000);
        const m = Math.floor(sec / 60);
        const s = sec % 60;

        return `${m}m${s.toString().padStart(2, '0')}s`;
    }

    function renderOverlay() {
        ensureOverlay();

        if (!BH.AFK.running) {
            afkBox.style.display = 'none';
            return;
        }

        afkBox.style.display = 'block';

        const act = getActivity();
        const actName = act ? act.name : '---';
        const totalActs = BH.AFK.ORDER.length;
        const actIndex = BH.AFK.currentActivityIndex + 1;

        const stepList = getCurrentStepList();
        const stepTotal = stepList.length;
        const stepNow = BH.AFK.currentStep + 1;
        const step = getCurrentStep();
        const stepLabel = step ? step.label : '---';

        const phaseNames = {
            open: 'Mở',
            setup: 'Setup',
            loop: 'Loop',
            close: 'Đóng'
        };

        let loopInfo = '';
        if (BH.AFK.currentPhase === 'loop') {
            const maxLoop = act && act.loopCount ? act.loopCount : '?';
            loopInfo = ` · Lần ${BH.AFK.currentLoopCount + 1}/${maxLoop}`;
        }

        afkBox.innerHTML = `
            <div style="
                display:flex;
                align-items:center;
                justify-content:space-between;
                margin-bottom:7px;
                padding-bottom:6px;
                border-bottom:1px solid rgba(112,224,168,.3);
            ">
                <span style="
                    color:#70e0a8;
                    font-size:12px;
                    font-weight:700;
                    letter-spacing:.4px;
                ">
                    🤖 AFK MODE
                </span>

                <span style="
                    color:#666;
                    font-size:9px;
                ">
                    7 = off
                </span>
            </div>

            <div style="
                color:#fff;
                font-size:12px;
                font-weight:700;
                margin-bottom:5px;
            ">
                ▶ ${actName} (${actIndex}/${totalActs})
            </div>

            <div style="
                color:#aaa;
                font-size:10px;
                margin-bottom:2px;
            ">
                ${phaseNames[BH.AFK.currentPhase] || BH.AFK.currentPhase} · Bước ${stepNow}/${stepTotal}${loopInfo}
            </div>

            <div style="
                color:#8ec8ff;
                font-size:10px;
                margin-bottom:8px;
            ">
                ${stepLabel}
            </div>

            <div style="
                display:flex;
                justify-content:space-between;
                padding-top:6px;
                border-top:1px solid rgba(255,255,255,.1);
                color:#888;
                font-size:10px;
                margin-bottom:3px;
            ">
                <span>Đã click</span>
                <span style="color:#ffaa33;font-weight:700;">${BH.AFK.totalClicks}</span>
            </div>

            <div style="
                display:flex;
                justify-content:space-between;
                color:#888;
                font-size:10px;
                margin-bottom:3px;
            ">
                <span>Auto-stop</span>
                <span style="color:#ffaa33;font-weight:700;">còn ${getRemainingStr()}</span>
            </div>

            <div style="
                margin-top:6px;
                padding-top:6px;
                border-top:1px solid rgba(255,255,255,.1);
                color:#9aa;
                font-size:10px;
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
            ">
                ${BH.AFK.lastMsg || '&nbsp;'}
            </div>
        `;
    }

    // =========================================================
    // LOGIC CHÍNH
    // =========================================================

    function advanceStep() {
        BH.AFK.currentStep++;
        BH.AFK.stepStartTime = BH.originalDateNow();
    }

    function nextPhase() {
        const act = getActivity();
        if (!act) return finishActivity();

        BH.AFK.currentStep = 0;
        BH.AFK.stepStartTime = BH.originalDateNow();

        if (BH.AFK.currentPhase === 'open') {
            // Sau open → nếu có setup thì sang setup, không thì loop
            const setupList = Array.isArray(act.setup) ? act.setup : (act.setup ? [act.setup] : []);
            if (setupList.length > 0) {
                BH.AFK.currentPhase = 'setup';
            } else {
                BH.AFK.currentPhase = 'loop';
                BH.AFK.currentLoopCount = 0;
            }
            return;
        }

        if (BH.AFK.currentPhase === 'setup') {
            BH.AFK.currentPhase = 'loop';
            BH.AFK.currentLoopCount = 0;
            return;
        }

        if (BH.AFK.currentPhase === 'loop') {
            // Hết loop → sang close
            BH.AFK.currentPhase = 'close';
            return;
        }

        if (BH.AFK.currentPhase === 'close') {
            finishActivity();
            return;
        }
    }

    function finishActivity() {
        const act = getActivity();
        const actName = act ? act.name : '?';

        setMsg(`✓ ${actName} xong`);

        BH.AFK.currentActivityIndex++;

        if (BH.AFK.currentActivityIndex >= BH.AFK.ORDER.length) {
            // Hết activities → tắt AFK
            stopAFK();
            setMsg('✓ Tất cả hoàn tất — AFK tắt');
            return;
        }

        const nextAct = getActivity();
        BH.AFK.currentPhase = 'open';
        BH.AFK.currentStep = 0;
        BH.AFK.currentLoopCount = 0;
        BH.AFK.stepStartTime = BH.originalDateNow();

        setMsg(`→ Chuyển sang ${nextAct.name}`);
    }

    function handleOutOfTicket() {
        const act = getActivity();
        const actName = act ? act.name : '?';

        setMsg(`⚠ ${actName} hết vé — click nút 7`);

        clickOutOfTicket();

        // Nếu activity có noCloseOnTicket → nhảy thẳng finish
        if (act && act.noCloseOnTicket) {
            setTimeout(function () {
                finishActivity();
            }, BH.AFK.OUT_OF_TICKET.waitAfter);
            return;
        }

        // Ngược lại → chạy phase close (nếu có)
        const closeList = Array.isArray(act.close) ? act.close : (act.close ? [act.close] : []);
        if (closeList.length > 0) {
            BH.AFK.currentPhase = 'close';
            BH.AFK.currentStep = 0;
            BH.AFK.stepStartTime = BH.originalDateNow();
        } else {
            setTimeout(function () {
                finishActivity();
            }, BH.AFK.OUT_OF_TICKET.waitAfter);
        }
    }

    function tick() {
        if (!BH.AFK.running) return;

        // Nếu đang click → chờ
        if (BH.AFK.isClicking) return;

        // Check auto-stop
        const idle = BH.originalDateNow() - BH.AFK.lastActionTime;
        if (idle >= BH.AFK.AUTO_STOP_TIMEOUT) {
            setMsg('⚠ AFK auto-stop (idle)');
            stopAFK();
            return;
        }

        // Check out-of-ticket TRƯỚC mỗi bước
        if (matchOutOfTicket()) {
            handleOutOfTicket();
            return;
        }

        // Lấy bước hiện tại
        const stepList = getCurrentStepList();
        const step = getCurrentStep();

        // Nếu phase rỗng → nhảy phase
        if (!step) {
            nextPhase();
            renderOverlay();
            return;
        }

        // Check bước hiện tại match
        if (matchStep(step)) {
            // Click
            const clicked = clickStep(step);

            if (clicked) {
                setMsg(`✓ ${step.label}`);

                // Chờ waitAfter
                const wait = step.waitAfter || 1000;

                setTimeout(function () {
                    if (!BH.AFK.running) return;

                    // Nếu là bước cuối của loop → tăng loopCount
                    if (BH.AFK.currentPhase === 'loop') {
                        const act = getActivity();
                        const maxLoop = act.loopCount;
                        const lastLoopStep = stepList.length - 1;

                        if (BH.AFK.currentStep === lastLoopStep) {
                            BH.AFK.currentLoopCount++;

                            // Check điều kiện dừng loop
                            if (maxLoop !== null && maxLoop !== undefined && BH.AFK.currentLoopCount >= maxLoop) {
                                nextPhase();
                            } else {
                                BH.AFK.currentStep = 0;
                            }
                        } else {
                            advanceStep();
                        }
                    } else {
                        advanceStep();
                    }

                    renderOverlay();
                }, wait);
            } else {
                setMsg(`✗ Click fail: ${step.label}`);
            }

            return;
        }

        // Không match → check timeout
        const elapsedStep = BH.originalDateNow() - BH.AFK.stepStartTime;
        if (elapsedStep >= BH.AFK.STEP_TIMEOUT) {
            setMsg(`⚠ Timeout bước: ${step.label}`);
            advanceStep();
            renderOverlay();
        }
    }

    // =========================================================
    // START / STOP
    // =========================================================

    function startAFK() {
        if (BH.AFK.running) return;

        // Tắt engine nếu đang chạy
        if (BH.stopAuto) {
            BH.stopAuto();
        }

        BH.AFK.running = true;
        BH.AFK.currentActivityIndex = 0;
        BH.AFK.currentPhase = 'open';
        BH.AFK.currentStep = 0;
        BH.AFK.currentLoopCount = 0;
        BH.AFK.totalClicks = 0;
        BH.AFK.lastActionTime = BH.originalDateNow();
        BH.AFK.stepStartTime = BH.originalDateNow();

        ensureOverlay();
        setMsg('AFK started');

        // Loop chính
        BH.AFK.timerId = BH.originalSetInterval(tick, BH.AFK.POLL_INTERVAL);

        renderOverlay();
    }

    function stopAFK() {
        if (!BH.AFK.running) return;

        BH.AFK.running = false;

        if (BH.AFK.timerId !== null) {
            BH.originalClearInterval(BH.AFK.timerId);
            BH.AFK.timerId = null;
        }

        renderOverlay();
    }

    function toggleAFK() {
        if (BH.AFK.running) {
            stopAFK();
        } else {
            startAFK();
        }
    }

    // =========================================================
    // HOTKEY
    // =========================================================

    document.addEventListener(
        'keydown',
        function (e) {
            if (e.key === '7') {
                e.preventDefault();
                e.stopImmediatePropagation();
                toggleAFK();
                return;
            }
        },
        true
    );

})(window);