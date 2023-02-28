import { PlaitPointerType, PlaitBoard, Point } from '../interfaces';

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
    const { width, height } = board.host.getBoundingClientRect();
    const viewBox = (board.host as SVGSVGElement).viewBox.baseVal;
    const x = (point[0] / width) * viewBox.width + viewBox.x;
    const y = (point[1] / height) * viewBox.height + viewBox.y;
    const newPoint = [x, y] as Point;

    return newPoint;
}

export function calculateZoom(zoom: number, minZoom = 0.2, maxZoom = 4) {
    return zoom < minZoom ? minZoom : zoom > maxZoom ? maxZoom : zoom;
}

export function isNoSelectionElement(e: Event) {
    return (e.target as HTMLElement)?.closest('.plait-board-attached');
}

export const updatePointerType = (board: PlaitBoard, pointer: PlaitPointerType) => {
    if (pointer) {
        board.pointer = pointer;
    }
};
