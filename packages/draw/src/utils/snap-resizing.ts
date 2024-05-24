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
    drawPointSnapLines,
    getTripleAxis,
    getMinPointDelta
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
    resizeOriginPoint?: Point[];
    originPoint?: Point;
    handlePoint?: Point;
    isCreate?: boolean;
}

const EQUAL_SPACING = 10;

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
    const resizePoints: [Point, Point] = [resizeState.startPoint, resizeState.endPoint];
    const { xZoom, yZoom } = getResizeZoom(resizePoints, originPoint, handlePoint, isFromCorner, isAspectRatio);

    let activeElements: PlaitElement[];
    let resizeOriginPoint: Point[] = [];
    if (Array.isArray(resizeRef.element)) {
        activeElements = resizeRef.element;
        const rectangle = getRectangleByElements(board, resizeRef.element, false);
        resizeOriginPoint = RectangleClient.getPoints(rectangle);
    } else {
        activeElements = [resizeRef.element];
        resizeOriginPoint = resizeRef.element.points;
    }

    const points = resizeOriginPoint.map(p => {
        return movePointByZoomAndOriginPoint(p, originPoint, xZoom, yZoom);
    }) as [Point, Point];
    const rectangle = RectangleClient.getRectangleByPoints(points);
    const activeRectangle = getRectangleByAngle(rectangle, getSelectionAngle(activeElements));
    const resizeHandlePoint = movePointByZoomAndOriginPoint(handlePoint, originPoint, xZoom, yZoom);
    const [x, y] = getUnitVectorByPointAndPoint(originPoint, resizeHandlePoint);
    return {
        resizePoints,
        resizeOriginPoint,
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
    let snapLineDelta = getIsometricLineDelta(snapRectangles, resizeSnapOptions);
    if (snapLineDelta.deltaX === 0 && snapLineDelta.deltaY === 0) {
        snapLineDelta = getSnapPointDelta(snapRectangles, resizeSnapOptions);
    }
    const angle = getSelectionAngle(activeElements);
    const activePointAndZoom = getActivePointAndZoom(snapLineDelta, resizeSnapOptions, angle);
    const isometricLinesG = drawIsometricSnapLines(board, activePointAndZoom.activePoints, snapRectangles, resizeSnapOptions, angle);
    const pointLinesG = drawResizingPointSnapLines(board, activePointAndZoom.activePoints, snapRectangles, resizeSnapOptions, angle);
    snapG.append(isometricLinesG, pointLinesG);
    return { ...activePointAndZoom, ...snapLineDelta, snapG };
}

function getSnapPointDelta(snapRectangles: RectangleClient[], resizeSnapOptions: ResizeSnapOptions) {
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
        const deltaX = getMinPointDelta(snapRectangles, pointX, true);
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
        const deltaY = getMinPointDelta(snapRectangles, pointY, false);
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
    const newResizePoints: [Point, Point] = [resizePoints[0], [resizePoints[1][0] + deltaX, resizePoints[1][1] + deltaY]];
    let activePoints = newResizePoints;
    let xZoom = 0;
    let yZoom = 0;
    if (!isCreate) {
        const { originPoint, handlePoint, isFromCorner, isAspectRatio, resizeOriginPoint } = resizeSnapOptions;
        const resizeZoom = getResizeZoom(newResizePoints, originPoint!, handlePoint!, isFromCorner, isAspectRatio);
        xZoom = resizeZoom.xZoom;
        yZoom = resizeZoom.yZoom;
        activePoints = resizeOriginPoint!.map(p => {
            return movePointByZoomAndOriginPoint(p, originPoint!, xZoom, yZoom);
        }) as [Point, Point];
        if (angle) {
            activePoints = resetPointsAfterResize(
                RectangleClient.getRectangleByPoints(resizeOriginPoint!),
                RectangleClient.getRectangleByPoints(activePoints),
                RectangleClient.getCenterPoint(RectangleClient.getRectangleByPoints(resizeOriginPoint!)),
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

function getIsometricLineDelta(snapRectangles: RectangleClient[], resizeSnapOptions: ResizeSnapOptions) {
    let isometricLineDelta: SnapDelta = {
        deltaX: 0,
        deltaY: 0
    };
    const { isAspectRatio, activeRectangle } = resizeSnapOptions;
    const widthSnapRectangle = snapRectangles.find(item => Math.abs(item.width - activeRectangle.width) < SNAP_TOLERANCE);
    if (widthSnapRectangle) {
        const deltaWidth = widthSnapRectangle.width - activeRectangle.width;
        isometricLineDelta.deltaX = deltaWidth * resizeSnapOptions.directionFactors[0];
        if (isAspectRatio) {
            const deltaHeight = deltaWidth / (activeRectangle.width / activeRectangle.height);
            isometricLineDelta.deltaY = deltaHeight * resizeSnapOptions.directionFactors[1];
            return isometricLineDelta;
        }
    }
    const heightSnapRectangle = snapRectangles.find(item => Math.abs(item.height - activeRectangle.height) < SNAP_TOLERANCE);
    if (heightSnapRectangle) {
        const deltaHeight = heightSnapRectangle.height - activeRectangle.height;
        isometricLineDelta.deltaY = deltaHeight * resizeSnapOptions.directionFactors[1];
        if (isAspectRatio) {
            const deltaWidth = deltaHeight * (activeRectangle.width / activeRectangle.height);
            isometricLineDelta.deltaX = deltaWidth * resizeSnapOptions.directionFactors[0];
            return isometricLineDelta;
        }
    }
    return isometricLineDelta;
}

function getIsometricLinePoints(rectangle: RectangleClient, isHorizontal: boolean): Point[] {
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

function drawResizingPointSnapLines(
    board: PlaitBoard,
    activePoints: Point[],
    snapRectangles: RectangleClient[],
    resizeSnapOptions: ResizeSnapOptions,
    angle: number
) {
    debugGenerator.isDebug() && debugGenerator.clear();
    const rectangle = RectangleClient.getRectangleByPoints(activePoints);
    const activeRectangle = getRectangleByAngle(rectangle, angle);
    const { isAspectRatio, directionFactors } = resizeSnapOptions;
    const drawHorizontal = directionFactors[0] !== 0 || isAspectRatio;
    const drawVertical = directionFactors[1] !== 0 || isAspectRatio;
    return drawPointSnapLines(board, activeRectangle, snapRectangles, drawHorizontal, drawVertical);
}

function drawIsometricSnapLines(
    board: PlaitBoard,
    activePoints: Point[],
    snapRectangles: RectangleClient[],
    resizeSnapOptions: ResizeSnapOptions,
    angle: number
) {
    let widthIsometricPoints = [];
    let heightIsometricPoints = [];

    const drawHorizontalLine = resizeSnapOptions.directionFactors[0] !== 0 || resizeSnapOptions.isAspectRatio;
    const drawVerticalLine = resizeSnapOptions.directionFactors[1] !== 0 || resizeSnapOptions.isAspectRatio;
    const rectangle = RectangleClient.getRectangleByPoints(activePoints);
    const activeRectangle = getRectangleByAngle(rectangle, angle);
    for (let snapRectangle of snapRectangles) {
        if (activeRectangle.width === snapRectangle.width && drawHorizontalLine) {
            widthIsometricPoints.push(getIsometricLinePoints(snapRectangle, true));
        }
        if (activeRectangle.height === snapRectangle.height && drawVerticalLine) {
            heightIsometricPoints.push(getIsometricLinePoints(snapRectangle, false));
        }
    }
    if (widthIsometricPoints.length && drawHorizontalLine) {
        widthIsometricPoints.push(getIsometricLinePoints(activeRectangle, true));
    }
    if (heightIsometricPoints.length && drawVerticalLine) {
        heightIsometricPoints.push(getIsometricLinePoints(activeRectangle, false));
    }

    const isometricLines = [...widthIsometricPoints, ...heightIsometricPoints];
    return drawSolidLines(board, isometricLines);
}
