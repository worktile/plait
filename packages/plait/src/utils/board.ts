import { PlaitBoard, Point } from "../interfaces";

export function transformPoints(board: PlaitBoard, points: Point[]) {
    const newPoints = points.map(point => {
        return transformPoint(board, point);
    });
    return newPoints;
}

export function transformPoint(board: PlaitBoard, point: Point) {
    const newPoint = [point[0] - board.viewport.offsetX, point[1] - board.viewport.offsetY] as Point;
    return newPoint;
}