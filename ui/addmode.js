// ui/addmode.js
// Add mode indicator (bảng đỏ góc trái)

(function (global) {
    'use strict';

    const BH = global.__BH__ = global.__BH__ || {};

    BH.addModeIndicator = null;

    BH.ensureAddModeIndicator = function () {
        if (BH.addModeIndicator) return;

        BH.addModeIndicator = document.createElement('div');

        Object.assign(BH.addModeIndicator.style, {
            position: 'fixed',
            top: '12px',
            left: '12px',
            zIndex: '2147483647',
            padding: '10px 14px',
            background: 'rgba(255, 100, 50, 0.92)',
            color: '#fff',
            border: '2px solid #fff',
            borderRadius: '8px',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '12px',
            fontWeight: '700',
            textAlign: 'left',
            lineHeight: '1.5',
            boxShadow: '0 0 16px rgba(255, 100, 50, 0.8)',
            pointerEvents: 'none',
            userSelect: 'none',
            display: 'none'
        });

        BH.addModeIndicator.innerHTML = `
            <div style="font-size:13px;">🔴 ADD RULE MODE</div>
            <div style="font-size:10px;margin-top:4px;color:#ffe;font-weight:400;">
                <b>0</b> · lưu vị trí (tại nút)<br>
                <b>9</b> · lưu màu (đã di chuột ra xa)<br>
                <b>8</b> · xoá rule cuối<br>
                <b>6</b> · thoát
            </div>
        `;

        (document.documentElement || document.body).appendChild(BH.addModeIndicator);
    };

    BH.setAddModeVisible = function (visible) {
        BH.ensureAddModeIndicator();

        BH.addModeIndicator.style.display = visible ? 'block' : 'none';
    };

    BH.onAddModeChange = function (isAdding) {
        BH.setAddModeVisible(isAdding);
    };

})(window);