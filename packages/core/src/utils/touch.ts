import { PlaitBoard } from '../interfaces/board';
import { IS_PREVENT_TOUCH_MOVE } from './weak-maps';

export const isPreventTouchMove = (board: PlaitBoard) => {
    return !!IS_PREVENT_TOUCH_MOVE.get(board);
};

export const preventTouchMove = (board: PlaitBoard, state: Boolean) => {
    IS_PREVENT_TOUCH_MOVE.set(board, state);
};
