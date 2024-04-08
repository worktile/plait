import { PlaitBoard } from '../interfaces/board';
import { Subscription, timer } from 'rxjs';

const BOARD_TO_RAF = new WeakMap<PlaitBoard, { [key: string]: number | null }>();

const getTimerId = (board: PlaitBoard, key: string) => {
    const state = getRAFState(board);
    return state[key] || null;
};

const getRAFState = (board: PlaitBoard) => {
    return BOARD_TO_RAF.get(board) || {};
};

export const throttleRAF = (board: PlaitBoard, key: string, fn: () => void) => {
    const scheduleFunc = () => {
        let timerId = requestAnimationFrame(() => {
            const value = BOARD_TO_RAF.get(board) || {};
            value[key] = null;
            BOARD_TO_RAF.set(board, value);
            PlaitBoard.isAlive(board) && fn();
        });
        const state = getRAFState(board);
        state[key] = timerId;
        BOARD_TO_RAF.set(board, state);
    };
    let timerId = getTimerId(board, key);
    if (timerId !== null) {
        cancelAnimationFrame(timerId);
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
                timer(0).subscribe(() => {
                    func();
                });
            }
            timerSubscription = timer(wait).subscribe();
        }
    };
};
