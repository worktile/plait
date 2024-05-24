import {
    ResizeRef,
    ResizeState,
    WithResizeOptions,
    drawHandle,
    getFirstTextManage,
    getIndexByResizeHandle,
    getResizeHandlePointByIndex,
    getSymmetricHandleIndex,
    isCornerHandle,
    withResize,
    resetPointsAfterResize
} from '@plait/common';
import {
    PlaitBoard,
    Point,
    RectangleClient,
    Transforms,
    createG,
    getRectangleByElements,
    getSelectedElements,
    isSelectionMoving,
    getSelectionAngle,
    rotatePoints,
    rotatedDataPoints,
    createDebugGenerator,
    hasValidAngle,
    isAxisChangedByAngle,
    drawRectangle,
    ACTIVE_STROKE_WIDTH,
    SELECTION_BORDER_COLOR
} from '@plait/core';
import { PlaitDrawElement } from '../interfaces';
import { DrawTransforms } from '../transforms';
import { getHitRectangleResizeHandleRef } from '../utils/position/geometry';
import { getSnapResizingRefOptions, getSnapResizingRef } from '../utils/snap-resizing';

const debugKey = 'debug:plait:resize-for-rotation';
const debugGenerator = createDebugGenerator(debugKey);

export interface BulkRotationRef {
    angle: number;
    offsetX: number;
    offsetY: number;
    newCenterPoint: Point;
}

export function withDrawResize(board: PlaitBoard) {
    const { afterChange, drawActiveRectangle } = board;
    let snapG: SVGGElement | null;
    let handleG: SVGGElement | null;
    let needCustomActiveRectangle = false;
    let resizeActivePoints: Point[] | null = null;

    const canResize = () => {
        const elements = getSelectedElements(board);
        return elements.length > 1 && elements.every(el => PlaitDrawElement.isDrawElement(el));
    };

    const options: WithResizeOptions<PlaitDrawElement[]> = {
        key: 'draw-elements',
        canResize,
        hitTest: (point: Point) => {
            const elements = getSelectedElements(board) as PlaitDrawElement[];
            const boundingRectangle = getRectangleByElements(board, elements, false);
            const angle = getSelectionAngle(elements);
            const handleRef = getHitRectangleResizeHandleRef(board, boundingRectangle, point, angle);
            if (handleRef) {
                return {
                    element: elements,
                    rectangle: boundingRectangle,
                    handle: handleRef.handle,
                    cursorClass: handleRef.cursorClass
                };
            }
            return null;
        },
        onResize: (resizeRef: ResizeRef<PlaitDrawElement[]>, resizeState: ResizeState) => {
            snapG?.remove();
            debugGenerator.isDebug() && debugGenerator.clear();
            const isFromCorner = isCornerHandle(board, resizeRef.handle);
            const isAspectRatio = resizeState.isShift || isFromCorner;
            const centerPoint = RectangleClient.getCenterPoint(resizeRef.rectangle!);
            const handleIndex = getIndexByResizeHandle(resizeRef.handle);
            const { originPoint, handlePoint } = getResizeOriginPointAndHandlePoint(board, handleIndex, resizeRef.rectangle!);
            const angle = getSelectionAngle(resizeRef.element);
            let bulkRotationRef: BulkRotationRef | undefined;
            if (angle) {
                bulkRotationRef = {
                    angle: angle,
                    offsetX: 0,
                    offsetY: 0,
                    newCenterPoint: [0, 0]
                };
                const [rotatedStartPoint, rotateEndPoint] = rotatePoints(
                    [resizeState.startPoint, resizeState.endPoint],
                    centerPoint,
                    -bulkRotationRef.angle
                );
                resizeState.startPoint = rotatedStartPoint;
                resizeState.endPoint = rotateEndPoint;
            }
            const resizeSnapRefOptions = getSnapResizingRefOptions(
                board,
                resizeRef,
                resizeState,
                {
                    originPoint,
                    handlePoint
                },
                isAspectRatio,
                isFromCorner
            );
            const resizeSnapRef = getSnapResizingRef(board, resizeRef.element, resizeSnapRefOptions);
            resizeActivePoints = resizeSnapRef.activePoints;
            snapG = resizeSnapRef.snapG;
            PlaitBoard.getElementActiveHost(board).append(snapG);

            if (bulkRotationRef) {
                const boundingBoxCornerPoints = RectangleClient.getPoints(resizeRef.rectangle!);
                const resizedBoundingBoxCornerPoints = boundingBoxCornerPoints.map(p => {
                    return movePointByZoomAndOriginPoint(p, originPoint, resizeSnapRef.xZoom, resizeSnapRef.yZoom);
                });
                const newBoundingBox = RectangleClient.getRectangleByPoints(resizedBoundingBoxCornerPoints);

                debugGenerator.isDebug() && debugGenerator.drawRectangle(board, newBoundingBox, { stroke: 'blue' });

                const newBoundingBoxCenter = RectangleClient.getCenterPoint(newBoundingBox);
                const adjustedNewBoundingBoxPoints = resetPointsAfterResize(
                    RectangleClient.getRectangleByPoints(boundingBoxCornerPoints),
                    RectangleClient.getRectangleByPoints(resizedBoundingBoxCornerPoints),
                    centerPoint,
                    newBoundingBoxCenter,
                    bulkRotationRef.angle
                );
                const newCenter = RectangleClient.getCenterPoint(RectangleClient.getRectangleByPoints(adjustedNewBoundingBoxPoints));
                bulkRotationRef = Object.assign(bulkRotationRef, {
                    offsetX: newCenter[0] - newBoundingBoxCenter[0],
                    offsetY: newCenter[1] - newBoundingBoxCenter[1],
                    newCenterPoint: newCenter
                });

                debugGenerator.isDebug() && debugGenerator.drawRectangle(board, adjustedNewBoundingBoxPoints);
            }

            resizeRef.element.forEach(target => {
                const path = PlaitBoard.findPath(board, target);
                let points;
                if (bulkRotationRef) {
                    const reversedPoints = rotatedDataPoints(target.points, centerPoint, -bulkRotationRef.angle);
                    points = reversedPoints.map((p: Point) => {
                        return movePointByZoomAndOriginPoint(p, originPoint, resizeSnapRef.xZoom, resizeSnapRef.yZoom);
                    }) as [Point, Point];
                    const adjustTargetPoints = points.map(p => [
                        p[0] + bulkRotationRef!.offsetX,
                        p[1] + bulkRotationRef!.offsetY
                    ]) as Point[];
                    points = rotatedDataPoints(adjustTargetPoints, bulkRotationRef.newCenterPoint, bulkRotationRef.angle) as [Point, Point];
                } else {
                    if (hasValidAngle(target)) {
                        needCustomActiveRectangle = true;
                    }
                    if (hasValidAngle(target) && isAxisChangedByAngle(target.angle!)) {
                        points = getResizePointsByOtherwiseAxis(
                            board,
                            target.points,
                            originPoint,
                            resizeSnapRef.xZoom,
                            resizeSnapRef.yZoom
                        );
                    } else {
                        points = target.points.map(p => {
                            return movePointByZoomAndOriginPoint(p, originPoint, resizeSnapRef.xZoom, resizeSnapRef.yZoom);
                        });
                    }
                }

                if (PlaitDrawElement.isGeometry(target)) {
                    const { height: textHeight } = getFirstTextManage(target).getSize();
                    DrawTransforms.resizeGeometry(board, points as [Point, Point], textHeight, path);
                } else if (PlaitDrawElement.isLine(target)) {
                    Transforms.setNode(board, { points }, path);
                } else if (PlaitDrawElement.isImage(target)) {
                    if (isAspectRatio) {
                        Transforms.setNode(board, { points }, path);
                    } else {
                        // The image element does not follow the resize, but moves based on the center point.
                        const targetRectangle = RectangleClient.getRectangleByPoints(target.points);
                        const centerPoint = RectangleClient.getCenterPoint(targetRectangle);
                        const newCenterPoint = movePointByZoomAndOriginPoint(
                            centerPoint,
                            originPoint,
                            resizeSnapRef.xZoom,
                            resizeSnapRef.yZoom
                        );
                        const newTargetRectangle = RectangleClient.getRectangleByCenterPoint(
                            newCenterPoint,
                            targetRectangle.width,
                            targetRectangle.height
                        );
                        Transforms.setNode(board, { points: RectangleClient.getPoints(newTargetRectangle) }, path);
                    }
                }
            });
        },
        afterResize: (resizeRef: ResizeRef<PlaitDrawElement[]>) => {
            snapG?.remove();
            snapG = null;
            if (needCustomActiveRectangle) {
                needCustomActiveRectangle = false;
                resizeActivePoints = null;
                const selectedElements = getSelectedElements(board);
                Transforms.addSelectionWithTemporaryElements(board, selectedElements);
            }
        }
    };

    withResize<PlaitDrawElement[]>(board, options);

    board.afterChange = () => {
        afterChange();
        if (handleG) {
            handleG.remove();
            handleG = null;
        }
        if (canResize() && !isSelectionMoving(board)) {
            handleG = createG();
            const elements = getSelectedElements(board) as PlaitDrawElement[];
            const boundingRectangle = needCustomActiveRectangle
                ? RectangleClient.getRectangleByPoints(resizeActivePoints!)
                : getRectangleByElements(board, elements, false);
            let corners = RectangleClient.getCornerPoints(boundingRectangle);
            const angle = getSelectionAngle(elements);
            if (angle) {
                const centerPoint = RectangleClient.getCenterPoint(boundingRectangle);
                corners = rotatePoints(corners, centerPoint, angle) as [Point, Point, Point, Point];
            }
            corners.forEach(corner => {
                const g = drawHandle(board, corner);
                handleG && handleG.append(g);
            });
            PlaitBoard.getElementActiveHost(board).append(handleG);
        }
    };

    board.drawActiveRectangle = () => {
        if (needCustomActiveRectangle) {
            const rectangle = RectangleClient.getRectangleByPoints(resizeActivePoints!);
            return drawRectangle(board, RectangleClient.inflate(rectangle, ACTIVE_STROKE_WIDTH), {
                stroke: SELECTION_BORDER_COLOR,
                strokeWidth: ACTIVE_STROKE_WIDTH
            });
        }
        return drawActiveRectangle();
    };

    return board;
}

export const getResizeOriginPointAndHandlePoint = (board: PlaitBoard, handleIndex: number, rectangle: RectangleClient) => {
    const symmetricHandleIndex = getSymmetricHandleIndex(board, handleIndex);
    const originPoint = getResizeHandlePointByIndex(rectangle as RectangleClient, symmetricHandleIndex);
    const handlePoint = getResizeHandlePointByIndex(rectangle as RectangleClient, handleIndex);
    return {
        originPoint,
        handlePoint
    };
};

export const getResizeZoom = (
    resizeStartAndEnd: [Point, Point],
    resizeOriginPoint: Point,
    resizeHandlePoint: Point,
    isFromCorner: boolean,
    isAspectRatio: boolean
) => {
    const [startPoint, endPoint] = resizeStartAndEnd;
    let xZoom = 0;
    let yZoom = 0;
    if (isFromCorner) {
        if (isAspectRatio) {
            let normalizedOffsetX = Point.getOffsetX(startPoint, endPoint);
            xZoom = normalizedOffsetX / (resizeHandlePoint[0] - resizeOriginPoint[0]);
            yZoom = xZoom;
        } else {
            let normalizedOffsetX = Point.getOffsetX(startPoint, endPoint);
            let normalizedOffsetY = Point.getOffsetY(startPoint, endPoint);
            xZoom = normalizedOffsetX / (resizeHandlePoint[0] - resizeOriginPoint[0]);
            yZoom = normalizedOffsetY / (resizeHandlePoint[1] - resizeOriginPoint[1]);
        }
    } else {
        const isHorizontal = Point.isHorizontal(resizeOriginPoint, resizeHandlePoint, 0.1) || false;
        let normalizedOffset = isHorizontal ? Point.getOffsetX(startPoint, endPoint) : Point.getOffsetY(startPoint, endPoint);
        let benchmarkOffset = isHorizontal ? resizeHandlePoint[0] - resizeOriginPoint[0] : resizeHandlePoint[1] - resizeOriginPoint[1];
        const zoom = normalizedOffset / benchmarkOffset;
        if (isAspectRatio) {
            xZoom = zoom;
            yZoom = zoom;
        } else {
            if (isHorizontal) {
                xZoom = zoom;
            } else {
                yZoom = zoom;
            }
        }
    }
    return { xZoom, yZoom };
};

export const movePointByZoomAndOriginPoint = (p: Point, resizeOriginPoint: Point, xZoom: number, yZoom: number) => {
    const offsetX = (p[0] - resizeOriginPoint[0]) * xZoom;
    const offsetY = (p[1] - resizeOriginPoint[1]) * yZoom;
    return [p[0] + offsetX, p[1] + offsetY] as Point;
};

/**
 * 1. Rotate 90°
 * 2. Scale based on the rotated points
 * 3. Reverse rotate the scaled points by 90°
 */
export const getResizePointsByOtherwiseAxis = (
    board: PlaitBoard,
    points: Point[],
    resizeOriginPoint: Point,
    xZoom: number,
    yZoom: number
) => {
    const currentRectangle = RectangleClient.getRectangleByPoints(points);
    debugGenerator.isDebug() && debugGenerator.drawRectangle(board, currentRectangle, { stroke: 'black' });
    let resultPoints = points;
    resultPoints = rotatePoints(resultPoints, RectangleClient.getCenterPoint(currentRectangle), (1 / 2) * Math.PI);
    debugGenerator.isDebug() && debugGenerator.drawRectangle(board, resultPoints, { stroke: 'blue' });
    resultPoints = resultPoints.map(p => {
        return movePointByZoomAndOriginPoint(p, resizeOriginPoint, xZoom, yZoom);
    });
    debugGenerator.isDebug() && debugGenerator.drawRectangle(board, resultPoints);
    const newRectangle = RectangleClient.getRectangleByPoints(resultPoints);
    return rotatePoints(resultPoints, RectangleClient.getCenterPoint(newRectangle), -(1 / 2) * Math.PI);
};
