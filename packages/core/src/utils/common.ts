import { Subscription, timer } from 'rxjs';

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

export const debounce = (func: () => void, wait: number, options?: { leading: boolean }) => {
    let timerSubscription: Subscription | null = null;
    return () => {
        if (timerSubscription && !timerSubscription.closed) {
            timerSubscription.unsubscribe();
            timerSubscription = timer(wait).subscribe(() => {
                func();
            });
        } else {
            if (options?.leading) {
                func();
            }
            timerSubscription = timer(wait).subscribe();
        }
    };
};
