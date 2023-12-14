import { PlaitBoard } from '../interfaces/board';
import { createG } from './dom/common';

export interface TouchRef {
    target?: SVGElement;
    state: boolean;
    host?: SVGGElement;
}

export const BOARD_TO_TOUCH_REF = new WeakMap<PlaitBoard, TouchRef>();

export const isPreventTouchMove = (board: PlaitBoard) => {
    return !!BOARD_TO_TOUCH_REF.get(board);
};

export const preventTouchMove = (board: PlaitBoard, event: PointerEvent, state: boolean) => {
    if (state && (event.target instanceof HTMLElement || event.target instanceof SVGElement)) {
        BOARD_TO_TOUCH_REF.set(board, { state, target: event.target instanceof SVGElement ? event.target : undefined });
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
    if (touchRef && touchRef.target && !touchRef.target.contains(PlaitBoard.getElementActiveHost(board))) {
        touchRef.target.style.opacity = '0';
        const host = createG();
        host.appendChild(touchRef.target);
        touchRef.host = host;
        host.classList.add('touch-target');
        PlaitBoard.getElementActiveHost(board).append(host);
    }
};
