BH.render = function () {
    // Nếu WB Party đang chạy → render giao diện WB Party
    if (BH.WBP && BH.WBP.running) {
        renderWbParty();
        return;
    }

    // Ngược lại → overlay cũ
    if (BH.overlayState === 'hidden') {
        ensureLogBox();
        logBox.style.display = 'none';
        return;
    }

    if (BH.overlayState === 'expanded') {
        renderExpanded();
    } else {
        renderCompact();
    }
};

function renderWbParty() {
    ensureLogBox();

    logBox.style.display = 'block';
    logBox.style.width = '250px';
    logBox.style.padding = '10px 12px';
    logBox.style.border = '2px solid #a6d339';

    const wbp = BH.WBP;
    const modeNames = {
        z: 'Z (2 người)',
        x: 'X (3 người)',
        c: 'C (4 người)',
        v: 'V (5 người)'
    };

    logBox.innerHTML = `
            <div style="
                display:flex;
                align-items:center;
                justify-content:space-between;
                margin-bottom:7px;
                padding-bottom:6px;
                border-bottom:1px solid rgba(166,211,57,.3);
            ">
                <span style="color:#a6d339;font-size:12px;font-weight:700;">
                    🎮 WB TEAM
                </span>
                <span style="color:#666;font-size:9px;">7 = off</span>
            </div>

            <div style="
                color:#70e0a8;
                font-weight:700;
                font-size:11.5px;
                margin-bottom:5px;
            ">
                ● ĐANG CHẠY
            </div>

            <div style="
                display:flex;
                justify-content:space-between;
                color:#aaa;
                font-size:10px;
                margin-bottom:3px;
            ">
                <span>Tổ đội</span>
                <span style="color:#8ec8ff;font-weight:700;">
                    ${wbp.currentCount}/${wbp.modeCount}
                </span>
            </div>

            <div style="
                display:flex;
                justify-content:space-between;
                color:#aaa;
                font-size:10px;
                margin-bottom:3px;
            ">
                <span>Chế độ</span>
                <span style="color:#ffaa33;font-weight:700;">
                    ${modeNames[wbp.modeKey] || wbp.modeKey}
                </span>
            </div>

            <div style="
                display:flex;
                justify-content:space-between;
                color:#aaa;
                font-size:10px;
                margin-bottom:3px;
            ">
                <span>Vòng</span>
                <span style="color:#70e0a8;font-weight:700;">
                    ${wbp.loopCount}
                </span>
            </div>

            <div style="
                display:flex;
                justify-content:space-between;
                color:#aaa;
                font-size:10px;
                margin-bottom:3px;
            ">
                <span>Đã click</span>
                <span style="color:#ffaa33;font-weight:700;">
                    ${wbp.totalClicks}
                </span>
            </div>

            <div style="
                margin-top:6px;
                padding-top:6px;
                border-top:1px solid rgba(255,255,255,.1);
                color:#9aa;
                font-size:10px;
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
            ">
                ${wbp.lastMsg || '&nbsp;'}
            </div>
        `;
}