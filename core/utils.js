// core/utils.js
// Helper functions cho Bit Heroes Auto

(function (global) {
    'use strict';

    const BH = global.__BH__ = global.__BH__ || {};

    // =========================================================
    // HEX / RGB
    // =========================================================

    BH.toHex = function (v) {
        return v.toString(16).padStart(2, '0');
    };

    BH.rgbToHex = function (p) {
        return '#' + BH.toHex(p.r) + BH.toHex(p.g) + BH.toHex(p.b);
    };

    BH.hexToRgb = function (hex) {
        const h = hex.replace('#', '');

        return {
            r: parseInt(h.substring(0, 2), 16),
            g: parseInt(h.substring(2, 4), 16),
            b: parseInt(h.substring(4, 6), 16)
        };
    };

    BH.colorMatch = function (pixel, target, tolerance) {
        return (
            Math.abs(pixel.r - target.r) <= tolerance &&
            Math.abs(pixel.g - target.g) <= tolerance &&
            Math.abs(pixel.b - target.b) <= tolerance
        );
    };

    // =========================================================
    // FORMAT
    // =========================================================

    BH.getRemainingStr = function () {
        if (BH.activeAuto === null || !BH.activeAuto) return '';

        const elapsed = BH.originalDateNow() - BH.lastActionTime;
        const remain = BH.AUTO_STOP_TIMEOUT - elapsed;

        if (remain <= 0) return '';

        const sec = Math.floor(remain / 1000);
        const m = Math.floor(sec / 60);
        const s = sec % 60;

        return `${m}m${s.toString().padStart(2, '0')}s`;
    };

    BH.nowTime = function () {
        return new Date().toLocaleTimeString('vi-VN', { hour12: false });
    };

})(window);