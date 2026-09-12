// core/pixel.js
// Đọc pixel từ WebGL + convert tọa độ + dispatch event

(function (global) {
    'use strict';

    const BH = global.__BH__ = global.__BH__ || {};

    BH.cachedCanvas = null;
    BH.cachedGL = null;

    // =========================================================
    // CANVAS + GL
    // =========================================================

    BH.getCanvas = function () {
        return document.querySelector('#unity-canvas')
            || document.querySelector('canvas');
    };

    BH.getGL = function (canvas) {
        if (!canvas) return null;

        if (BH.cachedCanvas === canvas && BH.cachedGL) {
            return BH.cachedGL;
        }

        let gl = null;

        try {
            gl =
                canvas.getContext('webgl2', { preserveDrawingBuffer: true }) ||
                canvas.getContext('webgl', { preserveDrawingBuffer: true }) ||
                canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true });
        } catch (e) {
            gl = null;
        }

        BH.cachedCanvas = canvas;
        BH.cachedGL = gl;

        return gl;
    };

    // =========================================================
    // READ PIXEL
    // =========================================================

    BH.readPixel = function (gl, x, y) {
        const pixel = new Uint8Array(4);

        try {
            gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        } catch (e) {
            return null;
        }

        return {
            r: pixel[0],
            g: pixel[1],
            b: pixel[2],
            a: pixel[3]
        };
    };

    // =========================================================
    // COORDINATE CONVERSION
    // =========================================================

    BH.clientToBuffer = function (canvas, clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const bufferW = canvas.width;
        const bufferH = canvas.height;

        const relX = (clientX - rect.left) / rect.width;
        const relY = (rect.bottom - clientY) / rect.height;

        return {
            x: Math.round(relX * bufferW),
            y: Math.round(relY * bufferH)
        };
    };

    BH.bufferToClient = function (canvas, bufX, bufY) {
        const rect = canvas.getBoundingClientRect();
        const bufferW = canvas.width;
        const bufferH = canvas.height;

        return {
            clientX: rect.left + (bufX / bufferW) * rect.width,
            clientY: rect.bottom - (bufY / bufferH) * rect.height
        };
    };

    // =========================================================
    // DISPATCH EVENT
    // =========================================================

    BH.makePointerOpts = function (x, y, buttons) {
        return {
            bubbles: true,
            cancelable: true,
            composed: true,
            view: window,
            clientX: x,
            clientY: y,
            screenX: window.screenX + x,
            screenY: window.screenY + y,
            button: 0,
            buttons: buttons,
            pointerId: 1,
            pointerType: 'mouse',
            isPrimary: true,
            pressure: buttons ? 0.5 : 0,
            width: 1,
            height: 1
        };
    };

    BH.makeMouseOpts = function (x, y, buttons) {
        return {
            bubbles: true,
            cancelable: true,
            composed: true,
            view: window,
            clientX: x,
            clientY: y,
            screenX: window.screenX + x,
            screenY: window.screenY + y,
            button: 0,
            buttons: buttons,
            detail: 1
        };
    };

    BH.fireAll = function (targets, type, Ctor, opts) {
        for (let i = 0; i < targets.length; i++) {
            try {
                targets[i].dispatchEvent(new Ctor(type, opts));
            } catch (e) { }
        }
    };

    BH.dispatchFullClick = function (canvas, x, y) {
        const targets = [canvas, document, window];

        BH.fireAll(targets, 'pointerover', PointerEvent, BH.makePointerOpts(x, y, 0));
        BH.fireAll(targets, 'pointerenter', PointerEvent, BH.makePointerOpts(x, y, 0));
        BH.fireAll(targets, 'pointermove', PointerEvent, BH.makePointerOpts(x, y, 0));
        BH.fireAll(targets, 'mouseover', MouseEvent, BH.makeMouseOpts(x, y, 0));
        BH.fireAll(targets, 'mousemove', MouseEvent, BH.makeMouseOpts(x, y, 0));

        BH.fireAll(targets, 'pointerdown', PointerEvent, BH.makePointerOpts(x, y, 1));
        BH.fireAll(targets, 'mousedown', MouseEvent, BH.makeMouseOpts(x, y, 1));

        BH.fireAll(targets, 'pointerup', PointerEvent, BH.makePointerOpts(x, y, 0));
        BH.fireAll(targets, 'mouseup', MouseEvent, BH.makeMouseOpts(x, y, 0));
        BH.fireAll(targets, 'click', MouseEvent, BH.makeMouseOpts(x, y, 0));

        BH.fireAll(targets, 'pointerout', PointerEvent, BH.makePointerOpts(x, y, 0));
        BH.fireAll(targets, 'pointerleave', PointerEvent, BH.makePointerOpts(x, y, 0));
        BH.fireAll(targets, 'mouseout', MouseEvent, BH.makeMouseOpts(x, y, 0));
        BH.fireAll(targets, 'mouseleave', MouseEvent, BH.makeMouseOpts(x, y, 0));
    };

    // =========================================================
    // RESET HOVER
    // =========================================================

    BH.resetHover = function () {
        const canvas = BH.getCanvas();
        if (!canvas) return;

        const pos = BH.bufferToClient(canvas, BH.RESET_POINT_X, BH.RESET_POINT_Y);

        BH.dispatchFullClick(canvas, pos.clientX, pos.clientY);
    };

})(window);