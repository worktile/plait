export type AnimateOption = { stop: () => void; start: () => void };

export function animate(tween: (t: number) => void, duration: number, ease: Function, callback: Function): AnimateOption {
    const start = getTimestamp();
    let stopAnimation = false;

    function tick(now: number) {
        if (stopAnimation) {
            return;
        }
        const elapsed = now - start;
        const t = Math.min(elapsed / duration, 1); // 时间转换0-1
        tween(ease(t));
        if (t < 1) {
            requestAnimationFrame(tick);
        } else if (callback) {
            callback();
        }
    }

    requestAnimationFrame(tick);
    return {
        stop: () => (stopAnimation = true),
        start: () => {
            stopAnimation = false;
            requestAnimationFrame(tick);
        }
    };
}

export function getTimestamp() {
    if (window.performance && window.performance.now) {
        return window.performance.now();
    } else {
        return Date.now();
    }
}

export function linear(t: number) {
    return t;
}
