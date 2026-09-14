// core/rules.js
// Rules cố định + config

(function (global) {
    'use strict';

    const BH = global.__BH__ = global.__BH__ || {};

    // =========================================================
    // CONFIG
    // =========================================================

    BH.COLOR_TOLERANCE = 15;

    BH.RERUN_HUNT_INTERVAL = 3000;
    BH.RERUN_REST_INTERVAL = 20000;
    BH.WB_INTERVAL = 2000;
    BH.SCRIPT_INTERVAL = 3000;

    BH.AUTO_STOP_TIMEOUT = 3 * 60 * 1000;

    BH.RESET_POINT_X = 5;
    BH.RESET_POINT_Y = 5;

    // =========================================================
    // RERUN RULES (giữ nguyên)
    // =========================================================

    BH.RERUN_RULES = [
        { x: 410, y: 62, hex: '#a6d339', tol: BH.COLOR_TOLERANCE, enabled: true },
        { x: 410, y: 62, hex: '#cbf067', tol: BH.COLOR_TOLERANCE, enabled: true }
    ];

    // =========================================================
    // WB RULES — hỗ trợ nhiều điểm cho 1 rule
    // =========================================================

    BH.WB_RULES = [
        {
            points: [{ x: 388, y: 66 }],
            hex: '#0a62d0',
            tol: BH.COLOR_TOLERANCE,
            enabled: true,
            label: 'Ready/Start'
        },
        {
            points: [{ x: 356, y: 208 }],
            hex: '#9cd01f',
            tol: BH.COLOR_TOLERANCE,
            enabled: true,
            label: 'Yes'
        },
        {
            points: [
                { x: 446, y: 58 },
                { x: 442, y: 50 },
                { x: 594, y: 40, hex: '#89b516' },
                { x: 492, y: 56 }
            ],
            hex: '#9cd01f',
            tol: BH.COLOR_TOLERANCE,
            enabled: true,
            label: 'Regroup'
        }
    ];

})(window);