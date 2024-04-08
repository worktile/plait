import { PlaitBoard } from '../interfaces/board';
import { createG } from './dom/common';

export interface TouchRef {
    target?: HTMLElement | SVGElement;
    state: boolean;
    host?: SVGGElement;
}

export const BOARD_TO_TOUCH_REF = new WeakMap<PlaitBoard, TouchRef>();

export const isPreventTouchMove = (board: PlaitBoard) => {
    return !!BOARD_TO_TOUCH_REF.get(board);
};

export const preventTouchMove = (board: PlaitBoard, event: PointerEvent, state: boolean) => {
    const hostElement = PlaitBoard.getElementHost(board);
    const activeHostElement = PlaitBoard.getElementActiveHost(board);
    if (state) {
        if (
            (event.target instanceof HTMLElement || event.target instanceof SVGElement) &&
            (hostElement.contains(event.target) || activeHostElement.contains(event.target))
        ) {
            BOARD_TO_TOUCH_REF.set(board, { state, target: event.target instanceof SVGElement ? event.target : undefined });
        } else {
            BOARD_TO_TOUCH_REF.set(board, { state, target: undefined });
        }
    } else {
        const ref = BOARD_TO_TOUCH_REF.get(board);
        if (ref) {
            BOARD_TO_TOUCH_REF.delete(board);
            ref.host?.remove();
        }
    }
};

/**
 * some intersection maybe cause target is removed from current browser window,
 * after it was removed touch move event will not be fired
 * so scroll behavior will can not be prevented in mobile browser device
 * this function will prevent target element being remove.
 */
export const handleTouchTarget = (board: PlaitBoard) => {
    const touchRef = BOARD_TO_TOUCH_REF.get(board);
    if (
        touchRef &&
        touchRef.target &&
        !PlaitBoard.getElementHost(board).contains(touchRef.target) &&
        !PlaitBoard.getElementActiveHost(board).contains(touchRef.target)
    ) {
        touchRef.target.style.opacity = '0';
        const host = createG();
        host.appendChild(touchRef.target);
        touchRef.host = host;
        host.classList.add('touch-target');
        PlaitBoard.getElementActiveHost(board).append(host);
    }
};
