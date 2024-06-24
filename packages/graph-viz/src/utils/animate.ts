export function animate(tween: (t: number) => void, duration: number, ease: Function, callback: Function) {
    const start = getTimestamp();

    function tick(now: number) {
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
}

function getTimestamp() {
    if (window.performance && window.performance.now) {
        return window.performance.now();
    } else {
        return Date.now();
    }
}

export function linear(t: number) {
    return t;
}
