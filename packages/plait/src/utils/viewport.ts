import { Point } from 'roughjs/bin/geometry';
import { PlaitBoard, PlaitElement } from '../interfaces';
import { ViewBox } from './board';

export function transform(board: PlaitBoard, element: PlaitElement): PlaitElement {
    return { ...element, points: transformToPoints(board, element.points as Point[]) };
}

/**
 * 面板坐标转换 点位坐标
 * @param board
 * @param points
 * @returns
 */
export function transformToPoints(board: PlaitBoard, points: Point[]) {
    const { width, height } = (board.host as SVGGElement).getBoundingClientRect();
    const viewBox = getViewBox(board);
    const newPoints = points.map(point => {
        let x = (point[0] / width) * viewBox.width + viewBox.minX;
        let y = (point[1] / height) * viewBox.height + viewBox.minY;
        return [x - board.viewport.offsetX, y - board.viewport.offsetY] as Point;
    });
    return newPoints;
}

export function getViewBox(board: PlaitBoard): ViewBox {
    const viewBoxValues = board?.host?.getAttribute('viewBox');
    const { width, height } = board?.host?.getBoundingClientRect() as DOMRect;
    let deltaX = 0;
    let deltaY = 0;
    if (board.host && viewBoxValues) {
        const values = viewBoxValues.split(' ');
        const scaleWidth = width - Number(values[2].trim());
        const scaleHeight = height - Number(values[3].trim());
        deltaX = scaleWidth / 2 - Number(values[0].trim());
        deltaY = scaleHeight / 2 - Number(values[1].trim());
    }
    const scaleWidth = (board.viewport.zoom - 1) * width;
    const scaleHeight = (board.viewport.zoom - 1) * height;
    const viewBoxWidth = width - scaleWidth;
    const viewBoxHeight = height - scaleHeight;
    const minX = scaleWidth / 2;
    const minY = scaleHeight / 2;
    return { minX: minX - deltaX, minY: minY - deltaY, width: viewBoxWidth, height: viewBoxHeight };
}
