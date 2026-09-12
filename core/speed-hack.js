// core/speed-hack.js
// Speed hack — override timing APIs

(function (global) {
    'use strict';

    const BH = global.__BH__ = global.__BH__ || {};

    // =========================================================
    // SAVE ORIGINALS (PHẢI LÀM TRƯỚC KHI OVERRIDE)
    // =========================================================

    const originalDateNow = Date.now;
    const originalPerformanceNow = window.performance.now.bind(window.performance);
    const originalSetTimeout = window.setTimeout.bind(window);
    const originalClearTimeout = window.clearTimeout.bind(window);
    const originalSetInterval = window.setInterval.bind(window);
    const originalClearInterval = window.clearInterval.bind(window);
    const originalRequestAnimationFrame = window.requestAnimationFrame.bind(window);

    BH.originalDateNow = originalDateNow;
    BH.originalPerformanceNow = originalPerformanceNow;
    BH.originalSetTimeout = originalSetTimeout;
    BH.originalClearTimeout = originalClearTimeout;
    BH.originalSetInterval = originalSetInterval;
    BH.originalClearInterval = originalClearInterval;
    BH.originalRequestAnimationFrame = originalRequestAnimationFrame;

    // =========================================================
    // SPEED STATE
    // =========================================================

    BH.MIN_SPEED = 1;
    BH.MAX_SPEED = 10;
    BH.speed = 1;

    // =========================================================
    // DATE.NOW
    // =========================================================

    let virtualDate = null;
    let previousDate = null;

    Date.now = function () {
        const realNow = originalDateNow();

        if (virtualDate === null) {
            virtualDate = realNow;
            previousDate = realNow;
            return Math.floor(virtualDate);
        }

        const delta = realNow - previousDate;
        virtualDate += delta * BH.speed;
        previousDate = realNow;

        return Math.floor(virtualDate);
    };

    // =========================================================
    // PERFORMANCE.NOW
    // =========================================================

    let virtualPerformance = null;
    let previousPerformance = null;

    window.performance.now = function () {
        const realNow = originalPerformanceNow();

        if (virtualPerformance === null) {
            virtualPerformance = realNow;
            previousPerformance = realNow;
            return virtualPerformance;
        }

        const delta = realNow - previousPerformance;
        virtualPerformance += delta * BH.speed;
        previousPerformance = realNow;

        return virtualPerformance;
    };

    // =========================================================
    // SETTIMEOUT / SETINTERVAL
    // =========================================================

    window.setTimeout = function (handler, timeout, ...args) {
        if (!timeout) timeout = 0;
        return originalSetTimeout(handler, timeout / BH.speed, ...args);
    };

    window.clearTimeout = function (id) {
        return originalClearTimeout(id);
    };

    window.setInterval = function (handler, timeout, ...args) {
        if (!timeout) timeout = 0;
        return originalSetInterval(handler, timeout / BH.speed, ...args);
    };

    window.clearInterval = function (id) {
        return originalClearInterval(id);
    };

    // =========================================================
    // REQUEST ANIMATION FRAME
    // =========================================================

    const rafCallbacks = [];
    const rafTicks = [];

    let rafDisabled = false;

    window.requestAnimationFrame = function (callback) {
        if (rafDisabled) {
            return 1;
        }

        return originalRequestAnimationFrame(function () {
            let index = rafCallbacks.indexOf(callback);

            if (index === -1) {
                rafCallbacks.push(callback);
                rafTicks.push(0);
                callback(window.performance.now());
                return;
            }

            if (BH.speed <= 1) {
                callback(window.performance.now());
                return;
            }

            let tickFrame = rafTicks[index];
            tickFrame += BH.speed;

            if (tickFrame >= 1) {
                const startTime = originalPerformanceNow();

                while (tickFrame >= 1) {
                    try {
                        callback(window.performance.now());
                    } catch (error) {
                        console.error('[Bit Heroes RAF]', error);
                    }

                    rafDisabled = true;
                    tickFrame -= 1;

                    if (originalPerformanceNow() - startTime > 15) {
                        tickFrame = 0;
                        break;
                    }
                }

                rafDisabled = false;
            } else {
                callback(window.performance.now());
            }

            rafTicks[index] = tickFrame;
        });
    };

    // =========================================================
    // SPEED CONTROL API
    // =========================================================

    BH.getSpeed = function () {
        return BH.speed;
    };

    BH.setSpeed = function (newSpeed) {
        newSpeed = Math.max(BH.MIN_SPEED, Math.min(BH.MAX_SPEED, newSpeed));

        if (newSpeed === BH.speed) return;

        BH.speed = newSpeed;

        console.log(`[Bit Heroes] Speed: ${BH.speed}x`);

        if (BH.render) BH.render();
    };

})(window);