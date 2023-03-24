let timerId: number | null = null;

export const throttleRAF = (fn: () => void) => {
    const scheduleFunc = () => {
        timerId = requestAnimationFrame(() => {
            timerId = null;
            fn();
        });
    };
    if (timerId !== null) {
        cancelAnimationFrame(timerId);
        timerId = null;
    }
    scheduleFunc();
};
