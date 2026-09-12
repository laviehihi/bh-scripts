// =========================================================
// XỬ LÝ noCheck — click thẳng không cần match màu
// =========================================================
if (step.noCheck === true) {
    const clicked = clickStep(step);

    if (clicked) {
        setMsg(`✓ ${step.label} (no-check)`);

        const wait = step.waitAfter || 1000;

        setTimeout(function () {
            if (!BH.AFK.running) return;

            if (BH.AFK.currentPhase === 'loop') {
                const act = getActivity();
                const maxLoop = act.loopCount;
                const lastLoopStep = stepList.length - 1;

                if (BH.AFK.currentStep === lastLoopStep) {
                    BH.AFK.currentLoopCount++;

                    if (maxLoop !== null && maxLoop !== undefined && BH.AFK.currentLoopCount >= maxLoop) {
                        nextPhase();
                    } else {
                        BH.AFK.currentStep = 0;
                    }
                } else {
                    advanceStep();
                }
            } else {
                advanceStep();
            }

            renderOverlay();
        }, wait);
    }

    return;
}

// =========================================================
// XỬ LÝ CHECK MÀU bình thường
// =========================================================
if (matchStep(step)) {
    // ... giữ nguyên code cũ
}