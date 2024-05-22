import { PlaitBoard, PlaitElement, Point, RectangleClient, SELECTION_BORDER_COLOR } from '../../interfaces';
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

type PointSnapLineRef = {
    axis: number;
    isHorizontal: boolean;
    pointRectangles: RectangleClient[];
};

type TripleSnapAxis = [number, number, number];

export const SNAP_TOLERANCE = 2;

const SNAP_SPACING = 24;

export function getSnapRectangles(board: PlaitBoard, activeElements: PlaitElement[]) {
    const elements = findElements(board, {
        match: element => board.isAlign(element) && !activeElements.some(item => item.id === element.id),
        recursion: () => true,
        isReverse: false
    });
    return elements.map(item => {
        const rectangle = board.getRectangle(item)!;
        return getRectangleByAngle(rectangle, item.angle || 0);
    });
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

export function getMinPointDelta(pointRectangles: RectangleClient[], axis: number, isHorizontal: boolean) {
    let delta = SNAP_TOLERANCE;
    pointRectangles.forEach(item => {
        const distance = getNearestDelta(axis, item, isHorizontal);
        if (Math.abs(distance) < Math.abs(delta)) {
            delta = distance;
        }
    });
    return delta;
}

export const getNearestDelta = (axis: number, rectangle: RectangleClient, isHorizontal: boolean) => {
    const pointAxis = getTripleAxis(rectangle, isHorizontal);
    const deltas = pointAxis.map(item => item - axis);
    const absDeltas = deltas.map(item => Math.abs(item));
    const index = absDeltas.indexOf(Math.min(...absDeltas));
    return deltas[index];
};

export const getTripleAxis = (rectangle: RectangleClient, isHorizontal: boolean): TripleSnapAxis => {
    const axis = isHorizontal ? 'x' : 'y';
    const side = isHorizontal ? 'width' : 'height';
    return [rectangle[axis], rectangle[axis] + rectangle[side] / 2, rectangle[axis] + rectangle[side]];
};

export function getNearestPointRectangle(snapRectangles: RectangleClient[], activeRectangle: RectangleClient) {
    let minDistance = Infinity;
    let nearestRectangle = snapRectangles[0];

    snapRectangles.forEach(item => {
        const distance = Math.sqrt(Math.pow(activeRectangle.x - item.x, 2) + Math.pow(activeRectangle.y - item.y, 2));
        if (distance < minDistance) {
            minDistance = distance;
            nearestRectangle = item;
        }
    });
    return nearestRectangle;
}

export const isSnapPoint = (axis: number, rectangle: RectangleClient, isHorizontal: boolean) => {
    const pointAxis = getTripleAxis(rectangle, isHorizontal);
    return pointAxis.includes(axis);
};

export function drawPointSnapLines(
    board: PlaitBoard,
    activeRectangle: RectangleClient,
    snapRectangles: RectangleClient[],
    drawHorizontal = true,
    drawVertical = true,
    snapMiddle = false
) {
    let pointLinePoints: [Point, Point][] = [];
    const pointAxisX = getTripleAxis(activeRectangle, true);
    const pointAxisY = getTripleAxis(activeRectangle, false);
    const pointLineRefs: PointSnapLineRef[] = [
        {
            axis: pointAxisX[0],
            isHorizontal: true,
            pointRectangles: []
        },
        {
            axis: pointAxisX[1],
            isHorizontal: true,
            pointRectangles: []
        },
        {
            axis: pointAxisX[2],
            isHorizontal: true,
            pointRectangles: []
        },
        {
            axis: pointAxisY[0],
            isHorizontal: false,
            pointRectangles: []
        },
        {
            axis: pointAxisY[1],
            isHorizontal: false,
            pointRectangles: []
        },
        {
            axis: pointAxisY[2],
            isHorizontal: false,
            pointRectangles: []
        }
    ];
    for (let index = 0; index < snapRectangles.length; index++) {
        const element = snapRectangles[index];
        if (isSnapPoint(pointLineRefs[0].axis, element, pointLineRefs[0].isHorizontal)) {
            pointLineRefs[0].pointRectangles.push(element);
        }
        if (isSnapPoint(pointLineRefs[1].axis, element, pointLineRefs[1].isHorizontal)) {
            pointLineRefs[1].pointRectangles.push(element);
        }
        if (isSnapPoint(pointLineRefs[2].axis, element, pointLineRefs[2].isHorizontal)) {
            pointLineRefs[2].pointRectangles.push(element);
        }
        if (isSnapPoint(pointLineRefs[3].axis, element, pointLineRefs[3].isHorizontal)) {
            pointLineRefs[3].pointRectangles.push(element);
        }
        if (isSnapPoint(pointLineRefs[4].axis, element, pointLineRefs[4].isHorizontal)) {
            pointLineRefs[4].pointRectangles.push(element);
        }
        if (isSnapPoint(pointLineRefs[5].axis, element, pointLineRefs[5].isHorizontal)) {
            pointLineRefs[5].pointRectangles.push(element);
        }
    }

    const setResizePointSnapLine = (axis: number, pointRectangle: RectangleClient, isHorizontal: boolean) => {
        const boundingRectangle = RectangleClient.inflate(
            RectangleClient.getBoundingRectangle([activeRectangle, pointRectangle]),
            SNAP_SPACING
        );
        if (isHorizontal) {
            const pointStart = [axis, boundingRectangle.y] as Point;
            const pointEnd = [axis, boundingRectangle.y + boundingRectangle.height] as Point;
            pointLinePoints.push([pointStart, pointEnd]);
        } else {
            const pointStart = [boundingRectangle.x, axis] as Point;
            const pointEnd = [boundingRectangle.x + boundingRectangle.width, axis] as Point;
            pointLinePoints.push([pointStart, pointEnd]);
        }
    };
    if (drawHorizontal && pointLineRefs[0].pointRectangles.length) {
        const leftRectangle =
            pointLineRefs[0].pointRectangles.length === 1
                ? pointLineRefs[0].pointRectangles[0]
                : getNearestPointRectangle(pointLineRefs[0].pointRectangles, activeRectangle);
        setResizePointSnapLine(pointLineRefs[0].axis, leftRectangle, pointLineRefs[0].isHorizontal);
    }
    if (drawHorizontal && snapMiddle && pointLineRefs[1].pointRectangles.length) {
        const middleRectangle =
            pointLineRefs[1].pointRectangles.length === 1
                ? pointLineRefs[1].pointRectangles[0]
                : getNearestPointRectangle(pointLineRefs[1].pointRectangles, activeRectangle);
        setResizePointSnapLine(pointLineRefs[1].axis, middleRectangle, pointLineRefs[1].isHorizontal);
    }

    if (drawHorizontal && pointLineRefs[2].pointRectangles.length) {
        const rightRectangle =
            pointLineRefs[2].pointRectangles.length === 1
                ? pointLineRefs[2].pointRectangles[0]
                : getNearestPointRectangle(pointLineRefs[2].pointRectangles, activeRectangle);
        setResizePointSnapLine(pointLineRefs[2].axis, rightRectangle, pointLineRefs[2].isHorizontal);
    }

    if (drawVertical && pointLineRefs[3].pointRectangles.length) {
        const topRectangle =
            pointLineRefs[3].pointRectangles.length === 1
                ? pointLineRefs[3].pointRectangles[0]
                : getNearestPointRectangle(pointLineRefs[3].pointRectangles, activeRectangle);
        setResizePointSnapLine(pointLineRefs[3].axis, topRectangle, pointLineRefs[3].isHorizontal);
    }

    if (drawVertical && snapMiddle && pointLineRefs[4].pointRectangles.length) {
        const middleRectangle =
            pointLineRefs[4].pointRectangles.length === 1
                ? pointLineRefs[4].pointRectangles[0]
                : getNearestPointRectangle(pointLineRefs[4].pointRectangles, activeRectangle);
        setResizePointSnapLine(pointLineRefs[4].axis, middleRectangle, pointLineRefs[4].isHorizontal);
    }

    if (drawVertical && pointLineRefs[5].pointRectangles.length) {
        const rightRectangle =
            pointLineRefs[5].pointRectangles.length === 1
                ? pointLineRefs[5].pointRectangles[0]
                : getNearestPointRectangle(pointLineRefs[5].pointRectangles, activeRectangle);
        setResizePointSnapLine(pointLineRefs[5].axis, rightRectangle, pointLineRefs[5].isHorizontal);
    }

    return drawDashedLines(board, pointLinePoints);
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
