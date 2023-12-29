import { PlaitBoard } from '../interfaces/board';
import { distanceBetweenPointAndRectangle } from './math';

export type ViewBox = {
    minX: number;
    minY: number;
    width: number;
    height: number;
    viewportWidth: number;
    viewportHeight: number;
};

export function isInPlaitBoard(board: PlaitBoard, x: number, y: number) {
    const plaitBoardElement = PlaitBoard.getBoardContainer(board);
    const plaitBoardRect = plaitBoardElement.getBoundingClientRect();
    const distances = distanceBetweenPointAndRectangle(x, y, plaitBoardRect);
    return distances === 0;
}

export function getRealScrollBarWidth(board: PlaitBoard) {
    const { hideScrollbar } = board.options;
    let scrollBarWidth = 0;
    if (!hideScrollbar) {
        const viewportContainer = PlaitBoard.getViewportContainer(board);
        scrollBarWidth = viewportContainer.offsetWidth - viewportContainer.clientWidth;
    }
    return scrollBarWidth;
}
