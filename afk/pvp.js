// afk/pvp.js
// Flow PvP cho Bit Heroes Auto

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
        // BƯỚC 1 — MỞ (1 lần)
        // =========================================================
        open: {
            x: 70,
            y: 524,
            hex: '#ffe954',
            tol: 15,
            waitAfter: 2000,
            label: 'Icon PvP'
        },

        // =========================================================
        // BƯỚC 2-5 — LOOP (3 lần)
        // =========================================================
        // Mỗi vòng là 1 trận. Trước mỗi bước đều check nút 7 (out of ticket).
        // Nếu thấy nút 7 → thoát loop → chạy close.
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
                label: 'Bắt đầu trận',
                waitForNext: true,
                waitForNextTimeout: 60000
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
        // BƯỚC 6 — ĐÓNG (1 lần, chạy sau loop)
        // =========================================================
        close: {
            x: 820,
            y: 528,
            hex: '#ffffff',
            tol: 15,
            waitAfter: 2000,
            label: 'Đóng PvP'
        }
    };

})(window);