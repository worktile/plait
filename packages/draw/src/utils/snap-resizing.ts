import {
    ResizeRef,
    ResizeState,
    getDirectionFactorByDirectionComponent,
    getUnitVectorByPointAndPoint,
    resetPointsAfterResize
} from '@plait/common';
import {
    DirectionFactors,
    PlaitBoard,
    PlaitElement,
    Point,
    RectangleClient,
    createDebugGenerator,
    createG,
    getSelectionAngle,
    getRectangleByAngle,
    getRectangleByElements,
    SnapDelta,
    SnapRef,
    getSnapRectangles,
    SNAP_TOLERANCE,
    drawSolidLines,
    drawDashedLines
} from '@plait/core';
import { getResizeZoom, movePointByZoomAndOriginPoint } from '../plugins/with-draw-resize';
import { PlaitDrawElement } from '../interfaces';

const debugKey = 'debug:plait:point-for-geometry';
export const debugGenerator = createDebugGenerator(debugKey);

export interface ResizeSnapRef extends SnapRef {
    xZoom: number;
    yZoom: number;
    activePoints: Point[];
}

export interface ResizeSnapOptions {
    resizePoints: Point[];
    activeRectangle: RectangleClient;
    directionFactors: DirectionFactors;
    isFromCorner: boolean;
    isAspectRatio: boolean;
    originDataPoints?: Point[];
    originPoint?: Point;
    handlePoint?: Point;
    isCreate?: boolean;
}

type TripleSnapAxis = [number, number, number];

type ResizePointSnapLineRef = {
    axis: number;
    isHorizontal: boolean;
    pointRectangles: RectangleClient[];
};

const EQUAL_SPACING = 10;

const SNAP_SPACING = 24;

export function getSnapResizingRefOptions(
    board: PlaitBoard,
    resizeRef: ResizeRef<PlaitDrawElement | PlaitDrawElement[]>,
    resizeState: ResizeState,
    resizeOriginPointAndHandlePoint: {
        originPoint: Point;
        handlePoint: Point;
    },
    isAspectRatio: boolean,
    isFromCorner: boolean
): ResizeSnapOptions {
    const { originPoint, handlePoint } = resizeOriginPointAndHandlePoint;
    const resizePoints: Point[] = [resizeState.startPoint, resizeState.endPoint];
    const { xZoom, yZoom } = getResizeZoom(resizePoints, originPoint, handlePoint, isFromCorner, isAspectRatio);

    let activeElements: PlaitElement[];
    let originDataPoints: Point[] = [];
    if (Array.isArray(resizeRef.element)) {
        activeElements = resizeRef.element;
        const rectangle = getRectangleByElements(board, resizeRef.element, false);
        originDataPoints = RectangleClient.getPoints(rectangle);
    } else {
        activeElements = [resizeRef.element];
        originDataPoints = resizeRef.element.points;
    }

    const points = originDataPoints.map(p => {
        return movePointByZoomAndOriginPoint(p, originPoint, xZoom, yZoom);
    }) as [Point, Point];
    const activeRectangle =
        getRectangleByAngle(RectangleClient.getRectangleByPoints(points), getSelectionAngle(activeElements)) ||
        RectangleClient.getRectangleByPoints(points);
    const resizeHandlePoint = movePointByZoomAndOriginPoint(handlePoint, originPoint, xZoom, yZoom);
    const [x, y] = getUnitVectorByPointAndPoint(originPoint, resizeHandlePoint);
    return {
        resizePoints,
        originDataPoints,
        activeRectangle,
        originPoint,
        handlePoint,
        directionFactors: [getDirectionFactorByDirectionComponent(x), getDirectionFactorByDirectionComponent(y)],
        isAspectRatio,
        isFromCorner
    };
}

export function getSnapResizingRef(board: PlaitBoard, activeElements: PlaitElement[], resizeSnapOptions: ResizeSnapOptions): ResizeSnapRef {
    const snapG = createG();
    const snapRectangles = getSnapRectangles(board, activeElements);
    let snapLineDelta = getEqualLineDelta(snapRectangles, resizeSnapOptions);
    if (snapLineDelta.deltaX === 0 && snapLineDelta.deltaY === 0) {
        snapLineDelta = getSnapPointDelta(snapRectangles, resizeSnapOptions);
    }
    const angle = getSelectionAngle(activeElements);
    const activePointAndZoom = getActivePointAndZoom(snapLineDelta, resizeSnapOptions, angle);
    const equalLinesG = drawEqualSnapLines(board, activePointAndZoom.activePoints, snapRectangles, resizeSnapOptions, angle);
    const pointLinesG = drawPointSnapLines(board, activePointAndZoom.activePoints, snapRectangles, resizeSnapOptions, angle);
    snapG.append(equalLinesG, pointLinesG);
    return { ...activePointAndZoom, ...snapLineDelta, snapG };
}

function getSnapPointDelta(pointRectangles: RectangleClient[], resizeSnapOptions: ResizeSnapOptions) {
    let pointLineDelta: SnapDelta = {
        deltaX: 0,
        deltaY: 0
    };
    const { isAspectRatio, activeRectangle, directionFactors } = resizeSnapOptions;
    const drawHorizontal = directionFactors[0] !== 0 || isAspectRatio;
    const drawVertical = directionFactors[1] !== 0 || isAspectRatio;

    if (drawHorizontal) {
        const xSnapAxis = getTripleAxis(activeRectangle, true);
        const pointX = directionFactors[0] === -1 ? xSnapAxis[0] : xSnapAxis[2];
        const deltaX = getMinPointDelta(pointRectangles, pointX, true);
        if (Math.abs(deltaX) < SNAP_TOLERANCE) {
            pointLineDelta.deltaX = deltaX;
            if (pointLineDelta.deltaX !== 0 && isAspectRatio) {
                pointLineDelta.deltaY = pointLineDelta.deltaX / (activeRectangle.width / activeRectangle.height);
                return pointLineDelta;
            }
        }
    }

    if (drawVertical) {
        const ySnapAxis = getTripleAxis(activeRectangle, false);
        const pointY = directionFactors[1] === -1 ? ySnapAxis[0] : ySnapAxis[2];
        const deltaY = getMinPointDelta(pointRectangles, pointY, false);
        if (Math.abs(deltaY) < SNAP_TOLERANCE) {
            pointLineDelta.deltaY = deltaY;
            if (pointLineDelta.deltaY !== 0 && isAspectRatio) {
                pointLineDelta.deltaX = pointLineDelta.deltaY * (activeRectangle.width / activeRectangle.height);
                return pointLineDelta;
            }
        }
    }

    return pointLineDelta;
}

function getActivePointAndZoom(resizeSnapDelta: SnapDelta, resizeSnapOptions: ResizeSnapOptions, angle: number) {
    const { deltaX, deltaY } = resizeSnapDelta;
    const { resizePoints, isCreate } = resizeSnapOptions;
    const newResizePoints: Point[] = [resizePoints[0], [resizePoints[1][0] + deltaX, resizePoints[1][1] + deltaY]];
    let activePoints = newResizePoints;
    let xZoom = 0;
    let yZoom = 0;
    if (!isCreate) {
        const { originPoint, handlePoint, isFromCorner, isAspectRatio, originDataPoints } = resizeSnapOptions;
        const resizeZoom = getResizeZoom(newResizePoints, originPoint!, handlePoint!, isFromCorner, isAspectRatio);
        xZoom = resizeZoom.xZoom;
        yZoom = resizeZoom.yZoom;
        activePoints = originDataPoints!.map(p => {
            return movePointByZoomAndOriginPoint(p, originPoint!, xZoom, yZoom);
        }) as [Point, Point];
        if (angle) {
            activePoints = resetPointsAfterResize(
                RectangleClient.getRectangleByPoints(originDataPoints!),
                RectangleClient.getRectangleByPoints(activePoints),
                RectangleClient.getCenterPoint(RectangleClient.getRectangleByPoints(originDataPoints!)),
                RectangleClient.getCenterPoint(RectangleClient.getRectangleByPoints(activePoints)),
                angle
            );
        }
    }

    return {
        xZoom,
        yZoom,
        activePoints
    };
}

function getEqualLineDelta(pointRectangles: RectangleClient[], resizeSnapOptions: ResizeSnapOptions) {
    let equalLineDelta: SnapDelta = {
        deltaX: 0,
        deltaY: 0
    };
    const { isAspectRatio, activeRectangle } = resizeSnapOptions;
    const widthSnapRectangle = pointRectangles.find(item => Math.abs(item.width - activeRectangle.width) < SNAP_TOLERANCE);
    if (widthSnapRectangle) {
        const deltaWidth = widthSnapRectangle.width - activeRectangle.width;
        equalLineDelta.deltaX = deltaWidth * resizeSnapOptions.directionFactors[0];
        if (isAspectRatio) {
            const deltaHeight = deltaWidth / (activeRectangle.width / activeRectangle.height);
            equalLineDelta.deltaY = deltaHeight * resizeSnapOptions.directionFactors[1];
            return equalLineDelta;
        }
    }
    const heightSnapRectangle = pointRectangles.find(item => Math.abs(item.height - activeRectangle.height) < SNAP_TOLERANCE);
    if (heightSnapRectangle) {
        const deltaHeight = heightSnapRectangle.height - activeRectangle.height;
        equalLineDelta.deltaY = deltaHeight * resizeSnapOptions.directionFactors[1];
        if (isAspectRatio) {
            const deltaWidth = deltaHeight * (activeRectangle.width / activeRectangle.height);
            equalLineDelta.deltaX = deltaWidth * resizeSnapOptions.directionFactors[0];
            return equalLineDelta;
        }
    }
    return equalLineDelta;
}

function getEqualLinePoints(rectangle: RectangleClient, isHorizontal: boolean): Point[] {
    return isHorizontal
        ? [
              [rectangle.x, rectangle.y - EQUAL_SPACING],
              [rectangle.x + rectangle.width, rectangle.y - EQUAL_SPACING]
          ]
        : [
              [rectangle.x - EQUAL_SPACING, rectangle.y],
              [rectangle.x - EQUAL_SPACING, rectangle.y + rectangle.height]
          ];
}

function drawPointSnapLines(
    board: PlaitBoard,
    activePoints: Point[],
    pointRectangles: RectangleClient[],
    resizeSnapOptions: ResizeSnapOptions,
    angle: number
) {
    debugGenerator.isDebug() && debugGenerator.clear();
    let pointLinePoints: [Point, Point][] = [];
    const activeRectangle =
        getRectangleByAngle(RectangleClient.getRectangleByPoints(activePoints), angle) ||
        RectangleClient.getRectangleByPoints(activePoints);
    debugGenerator.isDebug() && debugGenerator.drawRectangle(board, activeRectangle, { stroke: 'green' });
    const pointAxisX = getTripleAxis(activeRectangle, true);
    const pointAxisY = getTripleAxis(activeRectangle, false);
    const pointLineRefs: ResizePointSnapLineRef[] = [
        {
            axis: pointAxisX[0],
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
            axis: pointAxisY[2],
            isHorizontal: false,
            pointRectangles: []
        }
    ];
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

    const { isAspectRatio, directionFactors } = resizeSnapOptions;
    const drawHorizontal = directionFactors[0] !== 0 || isAspectRatio;
    const drawVertical = directionFactors[1] !== 0 || isAspectRatio;

    for (let index = 0; index < pointRectangles.length; index++) {
        const element = pointRectangles[index];
        debugGenerator.isDebug() && debugGenerator.drawRectangle(board, element);

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
    }

    if (drawHorizontal && pointLineRefs[0].pointRectangles.length) {
        const leftRectangle =
            pointLineRefs[0].pointRectangles.length === 1
                ? pointLineRefs[0].pointRectangles[0]
                : getNearestPointRectangle(pointLineRefs[0].pointRectangles, activeRectangle);
        setResizePointSnapLine(pointLineRefs[0].axis, leftRectangle, pointLineRefs[0].isHorizontal);
    }

    if (drawHorizontal && pointLineRefs[1].pointRectangles.length) {
        const rightRectangle =
            pointLineRefs[1].pointRectangles.length === 1
                ? pointLineRefs[1].pointRectangles[0]
                : getNearestPointRectangle(pointLineRefs[1].pointRectangles, activeRectangle);
        setResizePointSnapLine(pointLineRefs[1].axis, rightRectangle, pointLineRefs[1].isHorizontal);
    }

    if (drawVertical && pointLineRefs[2].pointRectangles.length) {
        const topRectangle =
            pointLineRefs[2].pointRectangles.length === 1
                ? pointLineRefs[2].pointRectangles[0]
                : getNearestPointRectangle(pointLineRefs[2].pointRectangles, activeRectangle);
        setResizePointSnapLine(pointLineRefs[2].axis, topRectangle, pointLineRefs[2].isHorizontal);
    }

    if (drawVertical && pointLineRefs[3].pointRectangles.length) {
        const bottomRectangle =
            pointLineRefs[3].pointRectangles.length === 1
                ? pointLineRefs[3].pointRectangles[0]
                : getNearestPointRectangle(pointLineRefs[3].pointRectangles, activeRectangle);
        setResizePointSnapLine(pointLineRefs[3].axis, bottomRectangle, pointLineRefs[3].isHorizontal);
    }

    return drawDashedLines(board, pointLinePoints);
}

function drawEqualSnapLines(
    board: PlaitBoard,
    activePoints: Point[],
    pointRectangles: RectangleClient[],
    resizeSnapOptions: ResizeSnapOptions,
    angle: number
) {
    let widthEqualPoints = [];
    let heightEqualPoints = [];

    const drawHorizontalLine = resizeSnapOptions.directionFactors[0] !== 0 || resizeSnapOptions.isAspectRatio;
    const drawVerticalLine = resizeSnapOptions.directionFactors[1] !== 0 || resizeSnapOptions.isAspectRatio;
    const activeRectangle =
        getRectangleByAngle(RectangleClient.getRectangleByPoints(activePoints), angle) ||
        RectangleClient.getRectangleByPoints(activePoints);
    for (let pointRectangle of pointRectangles) {
        if (activeRectangle.width === pointRectangle.width && drawHorizontalLine) {
            widthEqualPoints.push(getEqualLinePoints(pointRectangle, true));
        }
        if (activeRectangle.height === pointRectangle.height && drawVerticalLine) {
            heightEqualPoints.push(getEqualLinePoints(pointRectangle, false));
        }
    }
    if (widthEqualPoints.length && drawHorizontalLine) {
        widthEqualPoints.push(getEqualLinePoints(activeRectangle, true));
    }
    if (heightEqualPoints.length && drawVerticalLine) {
        heightEqualPoints.push(getEqualLinePoints(activeRectangle, false));
    }

    const equalLines = [...widthEqualPoints, ...heightEqualPoints];
    return drawSolidLines(board, equalLines);
}

const getTripleAxis = (rectangle: RectangleClient, isHorizontal: boolean): TripleSnapAxis => {
    const axis = isHorizontal ? 'x' : 'y';
    const side = isHorizontal ? 'width' : 'height';
    return [rectangle[axis], rectangle[axis] + rectangle[side] / 2, rectangle[axis] + rectangle[side]];
};

const isSnapPoint = (axis: number, rectangle: RectangleClient, isHorizontal: boolean) => {
    const pointAxis = getTripleAxis(rectangle, isHorizontal);
    return pointAxis.includes(axis);
};

const getNearestDelta = (axis: number, rectangle: RectangleClient, isHorizontal: boolean) => {
    const pointAxis = getTripleAxis(rectangle, isHorizontal);
    const deltas = pointAxis.map(item => item - axis);
    const absDeltas = deltas.map(item => Math.abs(item));
    const index = absDeltas.indexOf(Math.min(...absDeltas));
    return deltas[index];
};

function getMinPointDelta(pointRectangles: RectangleClient[], axis: number, isHorizontal: boolean) {
    let delta = SNAP_TOLERANCE;

    pointRectangles.forEach(item => {
        const distance = getNearestDelta(axis, item, isHorizontal);
        if (Math.abs(distance) < Math.abs(delta)) {
            delta = distance;
        }
    });
    return delta;
}

function getNearestPointRectangle(pointRectangles: RectangleClient[], activeRectangle: RectangleClient) {
    let minDistance = Infinity;
    let nearestRectangle = pointRectangles[0];

    pointRectangles.forEach(item => {
        const distance = Math.sqrt(Math.pow(activeRectangle.x - item.x, 2) + Math.pow(activeRectangle.y - item.y, 2));
        if (distance < minDistance) {
            minDistance = distance;
            nearestRectangle = item;
        }
    });
    return nearestRectangle;
}
