import { PlaitBoard } from '../interfaces/board';
import { IS_PREVENT_TOUCH_MOVE } from './weak-maps';

export const isPreventTouchMove = (board: PlaitBoard) => {
    return !!IS_PREVENT_TOUCH_MOVE.get(board);
};

export const preventTouchMove = (board: PlaitBoard, event: PointerEvent, state: Boolean) => {
    IS_PREVENT_TOUCH_MOVE.set(board, state);
    if (event.target instanceof Element) {
        const hasHidden = event.target.classList.contains('hidden');
        const isInContainer = PlaitBoard.getBoardContainer(board).contains(event.target);
        if (state === true && !isInContainer && !hasHidden) {
            PlaitBoard.getElementActiveHost(board).append(event.target);
            event.target.classList.add('hidden');
        }
        if (state === false && hasHidden) {
            event.target.remove();
        }
    }
};
