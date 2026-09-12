// afk/wb.js
// Flow WB (World Boss) cho Bit Heroes Auto

(function (global) {
    'use strict';

    const BH = global.__BH__ = global.__BH__ || {};
    BH.AFK = BH.AFK || {};
    BH.AFK.activities = BH.AFK.activities || {};

    BH.AFK.activities.wb = {
        name: 'WB',
        enabled: true,
        priority: 3,

        // =========================================================
        // BƯỚC 1 — MỞ WB (1 lần)
        // =========================================================
        open: [
            {
                x: 60,
                y: 430,
                hex: '#fffff3',
                tol: 15,
                waitAfter: 2000,
                label: 'Icon WB'
            }
        ],

        // =========================================================
        // BƯỚC 2-4 — SETUP (1 lần, chạy trước loop)
        // =========================================================
        setup: [
            {
                x: 708,
                y: 78,
                hex: '#0a62d0',
                tol: 15,
                waitAfter: 1000,
                label: 'Summon loại WB'
            },
            {
                x: 674,
                y: 222,
                hex: '#1167d3',
                tol: 15,
                waitAfter: 1000,
                label: 'Xác nhận loại WB'
            },
            {
                x: 596,
                y: 132,
                hex: '#0756b5',
                tol: 15,
                waitAfter: 1000,
                label: 'Chọn độ khó'
            }
        ],

        // =========================================================
        // BƯỚC 5-7 — LOOP (giống 3 nút WB Solo cũ)
        // Số lần KHÔNG CỐ ĐỊNH — chạy đến khi thấy out-of-ticket
        // =========================================================
        loop: [
            {
                x: 388,
                y: 66,
                hex: '#0a62d0',
                tol: 15,
                waitAfter: 1000,
                label: 'Nút 5'
            },
            {
                x: 356,
                y: 208,
                hex: '#9cd01f',
                tol: 15,
                waitAfter: 1000,
                label: 'Nút 6'
            },
            {
                x: 446,
                y: 58,
                hex: '#9cd01f',
                tol: 15,
                waitAfter: 30000,
                label: 'Nút 7 (bắt đầu trận)',
                waitForNext: true,
                waitForNextTimeout: 120000
            }
        ],

        loopCount: null,
        loopUntilTicket: true,

        // =========================================================
        // BƯỚC 8-9 — ĐÓNG WB (1 lần)
        // =========================================================
        close: [
            {
                x: 924,
                y: 574,
                hex: '#ffffff',
                tol: 15,
                waitAfter: 2000,
                label: 'X thoát WB'
            },
            {
                x: 464,
                y: 206,
                hex: '#9cd01f',
                tol: 15,
                waitAfter: 2000,
                label: 'Xác nhận out WB'
            }
        ]
    };

})(window);