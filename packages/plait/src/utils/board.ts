import { PlaitBoard } from '../interfaces/board';
import { Point } from '../interfaces/point';
import { BOARD_TO_COMPONENT } from './weak-maps';

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

export function isNoSelectionElement(e: Event) {
    return (e.target as HTMLElement)?.closest('.plait-board-attached');
}

export function isInPliatBordElement(board: PlaitBoard, x: number, y: number) {
    const plaitBoardElement = BOARD_TO_COMPONENT.get(board)?.nativeElement as HTMLElement;
    const { x: boardX, y: boardY, width, height } = plaitBoardElement.getBoundingClientRect();
    return x > boardX && x < boardX + width && y > boardY && y < boardY + height;
}
