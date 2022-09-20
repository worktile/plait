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

export function isNoSelectionElement(e: Event) {
    return (e.target as HTMLElement)?.closest('.plait-board-attached');
}

/**
 * viewZoom 转 zoom
 * @param viewZoom 视图上显示的 zoom 缩放级别 %
 * @returns zoom 真实的 zoom
 */
export const transformViewZoom = (viewZoom: number): number => (2 * viewZoom - 100) / viewZoom;

/**
 * zoom 转 viewZoom
 * @param zoom this.board.viewport.zoom
 * @returns 视图上显示的 zoom 缩放级别 %
 */
export const transformZoom =  (zoom: number): number => Number((100 / (2 - zoom)).toFixed(0));

export type ViewBox = {
    minX: number;
    minY: number;
    width: number;
    height: number;
};
