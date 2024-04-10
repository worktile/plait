import { PlaitBoard, PlaitElement, Point, SELECTION_BORDER_COLOR } from '../../interfaces';
import { getRectangleByAngle } from '../angle';
import { createG } from '../dom';
import { findElements } from '../element';

export interface SnapDelta {
    deltaX: number;
    deltaY: number;
}

export interface SnapRef extends SnapDelta {
    snapG: SVGGElement;
}

export interface GapSnapRef {
    before: { distance: number; index: number }[];
    after: { distance: number; index: number }[];
}

export const SNAP_TOLERANCE = 2;

export function getSnapRectangles(board: PlaitBoard, activeElements: PlaitElement[]) {
    const elements = findElements(board, {
        match: element => board.isAlign(element) && !activeElements.some(item => item.id === element.id),
        recursion: () => true,
        isReverse: false
    });
    return elements.map(item => getRectangleByAngle(board.getRectangle(item)!, item.angle) || board.getRectangle(item)!);
}

export function getBarPoint(point: Point, isHorizontal: boolean) {
    return isHorizontal
        ? [
              [point[0], point[1] - 4],
              [point[0], point[1] + 4]
          ]
        : [
              [point[0] - 4, point[1]],
              [point[0] + 4, point[1]]
          ];
}

export function drawDashedLines(board: PlaitBoard, lines: [Point, Point][]) {
    const g = createG();
    lines.forEach(points => {
        if (!points.length) return;
        const line = PlaitBoard.getRoughSVG(board).line(points[0][0], points[0][1], points[1][0], points[1][1], {
            stroke: SELECTION_BORDER_COLOR,
            strokeWidth: 1,
            strokeLineDash: [4, 4]
        });
        g.appendChild(line);
    });
    return g;
}

export function drawSolidLines(board: PlaitBoard, lines: Point[][]) {
    const g = createG();
    lines.forEach(points => {
        if (!points.length) return;
        let isHorizontal = points[0][1] === points[1][1];
        const line = PlaitBoard.getRoughSVG(board).line(points[0][0], points[0][1], points[1][0], points[1][1], {
            stroke: SELECTION_BORDER_COLOR,
            strokeWidth: 1
        });
        g.appendChild(line);

        points.forEach(point => {
            const barPoint = getBarPoint(point, isHorizontal);
            const bar = PlaitBoard.getRoughSVG(board).line(barPoint[0][0], barPoint[0][1], barPoint[1][0], barPoint[1][1], {
                stroke: SELECTION_BORDER_COLOR,
                strokeWidth: 1
            });
            g.appendChild(bar);
        });
    });
    return g;
}