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
    rotatePoints,
    withResize
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
    rotate
} from '@plait/core';
import { PlaitDrawElement } from '../interfaces';
import { DrawTransforms } from '../transforms';
import { getHitRectangleResizeHandleRef } from '../utils/position/geometry';
import { getResizeAlignRef } from '../utils/resize-align';

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
            const isFromCorner = isCornerHandle(board, resizeRef.handle);
            const isAspectRatio = resizeState.isShift || isFromCorner;
            const { originPoint, handlePoint } = getResizeOriginPointAndHandlePoint(board, resizeRef);
            const angle = getSelectionAngle(resizeRef.element);
            const centerPoint = RectangleClient.getCenterPoint(resizeRef.rectangle!);
            const [rotatedStartPoint, rotateEndPoint] = rotatePoints([resizeState.startPoint, resizeState.endPoint], centerPoint, -angle);
            resizeState.startPoint = rotatedStartPoint;
            resizeState.endPoint = rotateEndPoint;
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
            resizeRef.element.forEach(target => {
                const path = PlaitBoard.findPath(board, target);
                let points = target.points.map(p => {
                    return movePointByZoomAndOriginPoint(p, originPoint, resizeAlignRef.xZoom, resizeAlignRef.yZoom);
                });
                // 处理旋转后resize导致的中心点偏移
                if (angle) {
                    const newCenter: Point = RectangleClient.getCenterPoint(
                        RectangleClient.getRectangleByPoints(resizeAlignRef.activePoints)
                    );
                    // 选框的新中心点
                    const rotatedRectangleCenter = rotate(newCenter[0], newCenter[1], centerPoint[0], centerPoint[1], angle);
                    const rotatedTopLeft = rotate(points[0][0], points[0][1], centerPoint[0], centerPoint[1], angle);
                    const rotatedBottomRight = rotate(points[1][0], points[1][1], centerPoint[0], centerPoint[1], angle);
                    points[0] = rotate(
                        rotatedTopLeft[0],
                        rotatedTopLeft[1],
                        rotatedRectangleCenter[0],
                        rotatedRectangleCenter[1],
                        -angle
                    ) as Point;
                    points[1] = rotate(
                        rotatedBottomRight[0],
                        rotatedBottomRight[1],
                        rotatedRectangleCenter[0],
                        rotatedRectangleCenter[1],
                        -angle
                    ) as Point;
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
