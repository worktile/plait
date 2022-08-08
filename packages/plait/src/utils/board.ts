import { PlaitBoard, Point } from '../interfaces';

export function transformPoints(board: PlaitBoard, points: Point[]) {
    const newPoints = points.map(point => {
        return transformPoint(board, point);
    });
    return newPoints;
}

export function transformPoint(board: PlaitBoard, point: Point) {
    const { width, height } = board.host.getBoundingClientRect();
    const viewBox = getViewBox(board);
    let x = (point[0] / width) * viewBox.width + viewBox.minX;
    let y = (point[1] / height) * viewBox.height + viewBox.minY;
    const newPoint = [x - board.viewport.offsetX, y - board.viewport.offsetY] as Point;
    return newPoint;
}

export function getViewBox(board: PlaitBoard): ViewBox {
    const { width, height } = board.host.getBoundingClientRect() as DOMRect;
    const scaleWidth = (board.viewport.zoom - 1) * width;
    const scaleHeight = (board.viewport.zoom - 1) * height;
    const viewBoxWidth = width - scaleWidth;
    const viewBoxHeight = height - scaleHeight;
    const minX = scaleWidth / 2;
    const minY = scaleHeight / 2;
    return { minX, minY: minY, width: viewBoxWidth, height: viewBoxHeight };
}

export type ViewBox = {
    minX: number;
    minY: number;
    width: number;
    height: number;
};
