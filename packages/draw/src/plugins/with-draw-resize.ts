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
    resetPointsAfterResize,
    rotatedDataPoints
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
    setAngleForG
} from '@plait/core';
import { PlaitDrawElement } from '../interfaces';
import { DrawTransforms } from '../transforms';
import { getHitRectangleResizeHandleRef } from '../utils/position/geometry';
import { getResizeAlignRef } from '../utils/resize-align';

let tempG: SVGGElement[] = [];

export function withDrawResize(board: PlaitBoard) {
    const { afterChange } = board;
    let alignG: SVGGElement | null;
    let handleG: SVGGElement | null;

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
            alignG?.remove();
            tempG.forEach(g => g.remove());
            tempG = [];
            const isFromCorner = isCornerHandle(board, resizeRef.handle);
            const isAspectRatio = resizeState.isShift || isFromCorner;
            const centerPoint = RectangleClient.getCenterPoint(resizeRef.rectangle!);
            const { originPoint, handlePoint } = getResizeOriginPointAndHandlePoint(board, resizeRef);
            const angle = getSelectionAngle(resizeRef.element);
            if (angle) {
                const [rotatedStartPoint, rotateEndPoint] = rotatePoints(
                    [resizeState.startPoint, resizeState.endPoint],
                    centerPoint,
                    -angle
                );
                resizeState.startPoint = rotatedStartPoint;
                resizeState.endPoint = rotateEndPoint;
            }
            const resizeAlignRef = getResizeAlignRef(
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
            alignG = resizeAlignRef.alignG;
            PlaitBoard.getElementActiveHost(board).append(alignG);

            const boundingPoints = RectangleClient.getPoints(resizeRef.rectangle!);
            const newBoundingPoints = boundingPoints.map(p => {
                return movePointByZoomAndOriginPoint(p, originPoint, resizeAlignRef.xZoom, resizeAlignRef.yZoom);
            });
            const newBoundingRect = RectangleClient.getRectangleByPoints(newBoundingPoints);

            const newBoundingCenter = RectangleClient.getCenterPoint(newBoundingRect);

            const adjustedNewBoundingPoints = resetPointsAfterResize(
                RectangleClient.getRectangleByPoints(boundingPoints),
                RectangleClient.getRectangleByPoints(newBoundingPoints),
                centerPoint,
                RectangleClient.getCenterPoint(RectangleClient.getRectangleByPoints(newBoundingPoints)),
                angle
            );

            const newCenter = RectangleClient.getCenterPoint(RectangleClient.getRectangleByPoints(adjustedNewBoundingPoints));
            const boundingOffsetX = newCenter[0] - newBoundingCenter[0];
            const boundingOffsetY = newCenter[1] - newBoundingCenter[1];

            resizeRef.element.forEach(target => {
                const path = PlaitBoard.findPath(board, target);
                const beforeRotatedPoints = rotatedDataPoints(
                    target.points,
                    RectangleClient.getCenterPoint(RectangleClient.getRectangleByPoints(target.points)),
                    centerPoint,
                    angle
                );

                let resizedPoints = beforeRotatedPoints.map((p: Point) => {
                    return movePointByZoomAndOriginPoint(p, originPoint, resizeAlignRef.xZoom, resizeAlignRef.yZoom);
                }) as [Point, Point];
                let points = resizedPoints;

                if (angle) {
                    const adjustTargetPoints = resizedPoints.map(p => [p[0] + boundingOffsetX, p[1] + boundingOffsetY]) as Point[];
                    const adjustTargetRectangle = RectangleClient.getRectangleByPoints(adjustTargetPoints);
                    const adjustTargetCenter = RectangleClient.getCenterPoint(adjustTargetRectangle);
                    const [adjustRotatedTargetCenter] = rotatePoints([adjustTargetCenter], newCenter, angle);
                    points = rotatedDataPoints(adjustTargetPoints, newCenter, adjustRotatedTargetCenter, angle) as [Point, Point];
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
                            resizeAlignRef.xZoom,
                            resizeAlignRef.yZoom
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
            alignG?.remove();
            alignG = null;
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
            const boundingRectangle = getRectangleByElements(board, elements, false);
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
    return board;
}

export const getResizeOriginPointAndHandlePoint = (board: PlaitBoard, resizeRef: ResizeRef<PlaitDrawElement | PlaitDrawElement[]>) => {
    const handleIndex = getIndexByResizeHandle(resizeRef.handle);
    const symmetricHandleIndex = getSymmetricHandleIndex(board, handleIndex);
    const originPoint = getResizeHandlePointByIndex(resizeRef.rectangle as RectangleClient, symmetricHandleIndex);
    const handlePoint = getResizeHandlePointByIndex(resizeRef.rectangle as RectangleClient, handleIndex);
    return {
        originPoint,
        handlePoint
    };
};

export const getResizeZoom = (
    resizeState: ResizeState,
    resizeOriginPoint: Point,
    resizeHandlePoint: Point,
    isFromCorner: boolean,
    isAspectRatio: boolean
) => {
    const startPoint = resizeState.startPoint;
    const endPoint = resizeState.endPoint;
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
