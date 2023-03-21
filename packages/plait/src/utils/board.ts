import { PlaitBoard } from '../interfaces/board';
import { Point } from '../interfaces/point';

export type ViewBox = {
    minX: number;
    minY: number;
    width: number;
    height: number;
    viewportWidth?: number;
    viewportHeight?: number;
};

export function transformPoints(board: PlaitBoard, points: Point[]) {
    const newPoints = points.map(point => {
        return transformPoint(board, point);
    });
    return newPoints;
}

export function transformPoint(board: PlaitBoard, point: Point) {
    const { width, height } = board.host.getBoundingClientRect();
    const viewBox = (board.host as SVGSVGElement).viewBox.baseVal;
    const x = (point[0] / width) * viewBox.width + viewBox.x;
    const y = (point[1] / height) * viewBox.height + viewBox.y;
    const newPoint = [x, y] as Point;

    return newPoint;
}

/**
 * 反转 Point
 * @param board PlaitBoard
 * @param point Point
 * @returns Point
 */
export function invertTransformPoint(board: PlaitBoard, point: Point) {
    const { width, height } = board.host.getBoundingClientRect();
    const viewBox = (board.host as SVGSVGElement).viewBox.baseVal;
    const x = (width * (point[0] - viewBox.x)) / viewBox.width;
    const y = (height * (point[1] - viewBox.y)) / viewBox.height;
    const newPoint = [x, y] as Point;
    return newPoint;
}

export function isNoSelectionElement(e: Event) {
    return (e.target as HTMLElement)?.closest('.plait-board-attached');
}

export function getBoardClientRect(board: PlaitBoard) {
    return (board.host.closest('.plait-board-container') as HTMLElement).getBoundingClientRect();
}
