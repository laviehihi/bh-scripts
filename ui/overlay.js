// ui/overlay.js
// Overlay — log box (compact + expanded)

(function (global) {
    'use strict';

    const BH = global.__BH__ = global.__BH__ || {};

    // =========================================================
    // STATE
    // =========================================================

    // 'expanded' | 'compact' | 'hidden'
    BH.overlayState = 'compact';

    BH.logBox = null;
    BH.lastMsg = '';

    // =========================================================
    // HELPERS
    // =========================================================

    BH.getSpeedColor = function () {
        return BH.getSpeed && BH.getSpeed() === 1 ? '#ddd' : '#66ff66';
    };

    BH.getAutoColor = function (name) {
        return BH.activeAuto === name ? '#70e0a8' : '#ff9966';
    };

    BH.getRerunPhaseStr = function () {
        if (BH.activeAuto !== 'rerun') return '';
        return BH.rerunPhase === 'rest' ? ' [nghỉ]' : ' [hunt]';
    };

    // =========================================================
    // LOG BOX
    // =========================================================

    BH.ensureLogBox = function () {
        if (BH.logBox) return;

        BH.logBox = document.createElement('div');

        Object.assign(BH.logBox.style, {
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

        (document.documentElement || document.body).appendChild(BH.logBox);
    };

    // =========================================================
    // RENDER COMPACT
    // =========================================================

    BH.renderCompact = function () {
        BH.ensureLogBox();

        BH.logBox.style.display = 'block';
        BH.logBox.style.width = 'auto';
        BH.logBox.style.padding = '8px 12px';

        const rerunColor = BH.getAutoColor('rerun');
        const wbColor = BH.getAutoColor('wb');
        const scriptColor = BH.getAutoColor('script');
        const speed = BH.getSpeed ? BH.getSpeed() : 1;

        BH.logBox.innerHTML = `
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
                    color:${BH.getSpeedColor()};
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
    };

    // =========================================================
    // RENDER EXPANDED
    // =========================================================

    BH.renderExpanded = function () {
        BH.ensureLogBox();

        BH.logBox.style.display = 'block';
        BH.logBox.style.width = '250px';
        BH.logBox.style.padding = '10px 12px';

        const rerunColor = BH.getAutoColor('rerun');
        const wbColor = BH.getAutoColor('wb');
        const scriptColor = BH.getAutoColor('script');

        const remainStr = BH.getRemainingStr();
        const phaseStr = BH.getRerunPhaseStr();
        const speed = BH.getSpeed ? BH.getSpeed() : 1;

        const ruleLines = BH.rules.length === 0
            ? '<div style="color:#a55;font-size:10px;">(chưa có rule — bấm 6)</div>'
            : BH.rules.map((r, i) => {
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

        BH.logBox.innerHTML = `
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
                    RERUN ${BH.activeAuto === 'rerun' ? 'ON' : 'OFF'}${phaseStr}
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
                    WB SOLO ${BH.activeAuto === 'wb' ? 'ON' : 'OFF'}
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
                    SCRIPT ${BH.activeAuto === 'script' ? 'ON' : 'OFF'}
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
                    color:${BH.getSpeedColor()};
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
                    color:${BH.activeAuto ? '#ffaa33' : '#666'};
                    font-weight:600;
                    font-size:10px;
                ">
                    ${BH.activeAuto ? 'còn ' + remainStr : '---'}
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
                    SCRIPT RULES (${BH.rules.length})
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
                ${BH.lastMsg || '&nbsp;'}
            </div>
        `;
    };

    // =========================================================
    // RENDER MAIN
    // =========================================================

    BH.render = function () {
        if (BH.overlayState === 'hidden') {
            BH.ensureLogBox();
            BH.logBox.style.display = 'none';
            return;
        }

        if (BH.overlayState === 'expanded') {
            BH.renderExpanded();
        } else {
            BH.renderCompact();
        }
    };

    BH.setMsg = function (msg) {
        BH.lastMsg = msg;

        if (BH.overlayState !== 'hidden') {
            BH.render();
        }
    };

    // =========================================================
    // CYCLE
    // =========================================================

    BH.cycleOverlay = function () {
        if (BH.overlayState === 'expanded') {
            BH.overlayState = 'compact';
        } else if (BH.overlayState === 'compact') {
            BH.overlayState = 'hidden';
        } else {
            BH.overlayState = 'expanded';
        }

        BH.render();
    };

})(window);