// ui/help.js
// Bảng help phím tắt

(function (global) {
    'use strict';

    const BH = global.__BH__ = global.__BH__ || {};

    BH.helpVisible = false;
    BH.helpBox = null;

    BH.ensureHelpBox = function () {
        if (BH.helpBox) return;

        BH.helpBox = document.createElement('div');

        Object.assign(BH.helpBox.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: '2147483647',
            width: '340px',
            boxSizing: 'border-box',
            padding: '16px 18px',
            background: 'rgba(12, 14, 18, 0.96)',
            color: '#ddd',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '10px',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '11.5px',
            lineHeight: '1.7',
            boxShadow: '0 6px 30px rgba(0,0,0,0.7)',
            pointerEvents: 'none',
            userSelect: 'none',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'none'
        });

        BH.helpBox.innerHTML = `
            <div style="
                display:flex;
                align-items:center;
                justify-content:space-between;
                margin-bottom:10px;
                padding-bottom:8px;
                border-bottom:1px solid rgba(255,255,255,.15);
            ">
                <span style="
                    color:#fff;
                    font-size:14px;
                    font-weight:700;
                    letter-spacing:.4px;
                ">
                    📖 HELP — PHÍM TẮT
                </span>

                <span style="
                    color:#777;
                    font-size:10px;
                ">
                    Bấm 1 để đóng
                </span>
            </div>

            <div style="
                color:#8ec8ff;
                font-size:10.5px;
                font-weight:700;
                margin-top:4px;
                margin-bottom:4px;
            ">
                ▸ AUTO
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#70e0a8;font-weight:700;">3</span>
                <span style="flex:1;text-align:right;color:#ccc;">Auto Rerun (hunt 3s, nghỉ 20s)</span>
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#70e0a8;font-weight:700;">4</span>
                <span style="flex:1;text-align:right;color:#ccc;">Auto WB Solo (2s/lần)</span>
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#70e0a8;font-weight:700;">5</span>
                <span style="flex:1;text-align:right;color:#ccc;">Auto Script (3s/lần)</span>
            </div>

            <div style="
                color:#8ec8ff;
                font-size:10.5px;
                font-weight:700;
                margin-top:10px;
                margin-bottom:4px;
            ">
                ▸ RULES (chỉ dùng khi đang ở mode 6)
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#ffaa33;font-weight:700;">0</span>
                <span style="flex:1;text-align:right;color:#ccc;">Lưu vị trí tại chuột</span>
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#ffaa33;font-weight:700;">9</span>
                <span style="flex:1;text-align:right;color:#ccc;">Lưu màu rule cuối (di chuột ra xa)</span>
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#ffaa33;font-weight:700;">8</span>
                <span style="flex:1;text-align:right;color:#ccc;">Xoá rule cuối</span>
            </div>

            <div style="
                color:#8ec8ff;
                font-size:10.5px;
                font-weight:700;
                margin-top:10px;
                margin-bottom:4px;
            ">
                ▸ UI
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#8ec8ff;font-weight:700;">1</span>
                <span style="flex:1;text-align:right;color:#ccc;">Hiện/ẩn bảng help này</span>
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#8ec8ff;font-weight:700;">2</span>
                <span style="flex:1;text-align:right;color:#ccc;">Overlay: mở → thu nhỏ → ẩn</span>
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#8ec8ff;font-weight:700;">6</span>
                <span style="flex:1;text-align:right;color:#ccc;">Vào/ra add rule mode</span>
            </div>

            <div style="
                color:#8ec8ff;
                font-size:10.5px;
                font-weight:700;
                margin-top:10px;
                margin-bottom:4px;
            ">
                ▸ SPEED
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#66ff66;font-weight:700;">= / +</span>
                <span style="flex:1;text-align:right;color:#ccc;">Tăng speed (+1)</span>
            </div>

            <div style="display:flex;justify-content:space-between;gap:10px;">
                <span style="color:#66ff66;font-weight:700;">-</span>
                <span style="flex:1;text-align:right;color:#ccc;">Giảm speed (-1)</span>
            </div>

            <div style="
                margin-top:12px;
                padding-top:8px;
                border-top:1px solid rgba(255,255,255,.12);
                color:#888;
                font-size:10px;
                text-align:center;
            ">
                Auto-stop: 3 phút không click → tự tắt
            </div>
        `;

        (document.documentElement || document.body).appendChild(BH.helpBox);
    };

    BH.toggleHelp = function () {
        BH.helpVisible = !BH.helpVisible;

        BH.ensureHelpBox();

        BH.helpBox.style.display = BH.helpVisible ? 'block' : 'none';
    };

})(window);