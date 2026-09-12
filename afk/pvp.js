// afk/pvp.js
(function (global) {
    'use strict';

    const BH = global.__BH__ = global.__BH__ || {};
    BH.AFK = BH.AFK || {};
    BH.AFK.activities = BH.AFK.activities || {};

    BH.AFK.activities.pvp = {
        name: 'PvP',
        enabled: true,
        priority: 1,

        // =========================================================
        // BƯỚC 1 — MỞ PVP (noCheck)
        // =========================================================
        open: [
            {
                x: 70,
                y: 524,
                hex: '#ffe954',
                noCheck: true,           // ← CLICK THẲNG
                waitAfter: 2000,
                label: 'Icon PvP'
            }
        ],

        // =========================================================
        // BƯỚC 2-5 — LOOP (3 lần)
        // =========================================================
        loop: [
            {
                x: 682,
                y: 352,
                hex: '#34b4d3',
                tol: 15,
                waitAfter: 1000,
                label: 'Stat'
            },
            {
                x: 808,
                y: 266,
                hex: '#1fabd0',
                tol: 15,
                waitAfter: 1000,
                label: 'Chọn đối thủ'
            },
            {
                x: 734,
                y: 68,
                hex: '#9cd01f',
                tol: 15,
                waitAfter: 30000,
                label: 'Bắt đầu trận'
            },
            {
                x: 672,
                y: 64,
                hex: '#f06269',
                tol: 15,
                waitAfter: 2000,
                label: 'Quay về PvP'
            }
        ],

        loopCount: 3,

        // =========================================================
        // BƯỚC 6 — ĐÓNG PVP
        // =========================================================
        close: [
            {
                x: 820,
                y: 528,
                hex: '#ffffff',
                tol: 15,
                waitAfter: 2000,
                label: 'Đóng PvP'
            }
        ]
    };

})(window);