// afk/tg.js
// Flow TG (Trial/Gauntlet) cho Bit Heroes Auto

(function (global) {
    'use strict';

    const BH = global.__BH__ = global.__BH__ || {};
    BH.AFK = BH.AFK || {};
    BH.AFK.activities = BH.AFK.activities || {};

    BH.AFK.activities.tg = {
        name: 'TG',
        enabled: true,
        priority: 2,

        // =========================================================
        // BƯỚC 1 — MỞ TG (1 lần)
        // =========================================================
        // ⚠️ Tọa độ + màu này có thể thay đổi mỗi tuần:
        //   - Tuần Trial: (934, 258) #f5b58a  ← hiện tại
        //   - Tuần Gauntlet: cập nhật sau
        open: {
            x: 934,
            y: 258,
            hex: '#f5b58a',
            tol: 15,
            waitAfter: 2000,
            label: 'Mở TG'
        },

        // =========================================================
        // BƯỚC 2-4 — LOOP (3 lần)
        // =========================================================
        loop: [
            {
                // Giống PvP nút 2
                x: 682,
                y: 352,
                hex: '#34b4d3',
                tol: 15,
                waitAfter: 1000,
                label: 'Start TG'
            },
            {
                x: 568,
                y: 74,
                hex: '#a6d339',
                tol: 15,
                waitAfter: 30000,
                label: 'Bắt đầu trận',
                waitForNext: true,
                waitForNextTimeout: 60000
            },
            {
                x: 462,
                y: 68,
                hex: '#f06169',
                tol: 15,
                waitAfter: 2000,
                label: 'Về TG'
            }
        ],

        loopCount: 3,

        // =========================================================
        // BƯỚC 5 — ĐÓNG TG (1 lần)
        // =========================================================
        // Giống PvP close
        close: {
            x: 820,
            y: 528,
            hex: '#ffffff',
            tol: 15,
            waitAfter: 2000,
            label: 'Đóng TG'
        }
    };

})(window);