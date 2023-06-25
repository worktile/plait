import { PlaitBoard } from '../interfaces/board';
import { Point } from '../interfaces/point';
import { distanceBetweenPointAndRectangle } from './math';

export type ViewBox = {
    minX: number;
    minY: number;
    width: number;
    height: number;
    viewportWidth: number;
    viewportHeight: number;
};

export function transformPoints(board: PlaitBoard, points: Point[]) {
    const newPoints = points.map(point => {
        return transformPoint(board, point);
    });
    return newPoints;
}

export function transformPoint(board: PlaitBoard, point: Point) {
    const { width, height } = PlaitBoard.getHost(board).getBoundingClientRect();
    const viewBox = PlaitBoard.getHost(board).viewBox.baseVal;
    const x = (point[0] / width) * viewBox.width + viewBox.x;
    const y = (point[1] / height) * viewBox.height + viewBox.y;
    const newPoint = [x, y] as Point;

    return newPoint;
}

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