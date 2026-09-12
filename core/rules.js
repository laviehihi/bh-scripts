// core/rules.js
// Rules cố định + config

(function (global) {
    'use strict';

    const BH = global.__BH__ = global.__BH__ || {};

    // =========================================================
    // CONFIG
    // =========================================================

    BH.COLOR_TOLERANCE = 15;

    BH.RERUN_HUNT_INTERVAL = 3000;   // 3s thực
    BH.RERUN_REST_INTERVAL = 20000;  // 20s thực
    BH.WB_INTERVAL = 2000;           // 2s thực
    BH.SCRIPT_INTERVAL = 3000;       // 3s thực

    BH.AUTO_STOP_TIMEOUT = 3 * 60 * 1000;  // 3 phút

    BH.RESET_POINT_X = 5;
    BH.RESET_POINT_Y = 5;

    // =========================================================
    // RULES CỐ ĐỊNH
    // =========================================================

    // Rerun (phím 3)
    BH.RERUN_RULES = [
        { x: 410, y: 62, hex: '#a6d339', tol: BH.COLOR_TOLERANCE, enabled: true },
        { x: 410, y: 62, hex: '#cbf067', tol: BH.COLOR_TOLERANCE, enabled: true }
    ];

    // WB Solo (phím 4)
    BH.WB_RULES = [
        { x: 388, y: 66, hex: '#0a62d0', tol: BH.COLOR_TOLERANCE, enabled: true },
        { x: 356, y: 208, hex: '#9cd01f', tol: BH.COLOR_TOLERANCE, enabled: true },
        { x: 446, y: 58, hex: '#9cd01f', tol: BH.COLOR_TOLERANCE, enabled: true }
    ];

})(window);