import { PlaitBoard } from '../interfaces/board';
import { Point } from '../interfaces/point';

export const getViewBox = (board: PlaitBoard) => {
    return PlaitBoard.getHost(board).viewBox.baseVal;
};

/**
 * Get the screen point starting from the upper left corner of the svg element (based on the svg screen coordinate system)
 */
export function toHostPoint(board: PlaitBoard, x: number, y: number): Point {
    const host = PlaitBoard.getHost(board);
    const rect = host.getBoundingClientRect();
    return [x - rect.x, y - rect.y];
}

/**
 * Get the point in the coordinate system of the svg viewBox
 */
export function toViewBoxPoint(board: PlaitBoard, hostPoint: Point) {
    const viewBox = getViewBox(board);
    const { zoom } = board.viewport;
    const x = hostPoint[0] / zoom + viewBox.x;
    const y = hostPoint[1] / zoom + viewBox.y;
    const newPoint = [x, y] as Point;
    return newPoint;
}

export function toViewBoxPoints(board: PlaitBoard, hostPoints: Point[]) {
    const newPoints = hostPoints.map(point => {
        return toViewBoxPoint(board, point);
    });
    return newPoints;
}

/**
 * `toHostPoint` reverse processing
 * Get the screen point starting from the upper left corner of the browser window or the viewport (based on the screen coordinate system)
 */
export function toScreenPointFromHostPoint(board: PlaitBoard, hostPoint: Point) {
    const host = PlaitBoard.getHost(board);
    const rect = host.getBoundingClientRect();
    return [hostPoint[0] + rect.x, hostPoint[1] + rect.y] as Point;
}

/**
 * `toViewBoxPoint` reverse processing
 */
export function toHostPointFromViewBoxPoint(board: PlaitBoard, viewBoxPoint: Point) {
    const { zoom } = board.viewport;
    const viewBox = getViewBox(board);
    const x = (viewBoxPoint[0] - viewBox.x) * zoom;
    const y = (viewBoxPoint[1] - viewBox.y) * zoom;
    return [x, y] as Point;
}
