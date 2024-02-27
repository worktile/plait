import {
    PlaitElement,
    RectangleClient,
    Selection,
    PlaitBoard,
    isPolylineHitRectangle,
    Point,
    distanceBetweenPointAndSegments,
    rotate
} from '@plait/core';
import { PlaitDrawElement, PlaitGeometry, PlaitLine } from '../interfaces';
import { TRANSPARENT } from '@plait/common';
import { getTextRectangle } from './geometry';
import { getLinePoints } from './line/line-basic';
import { getFillByElement, getStrokeWidthByElement } from './style/stroke';
import { DefaultGeometryStyle } from '../constants/geometry';
import { getEngine } from '../engines';
import { getShape } from './shape';
import { getHitLineTextIndex } from './position/line';

export const isTextExceedingBounds = (geometry: PlaitGeometry) => {
    const client = RectangleClient.getRectangleByPoints(geometry.points);
    if (geometry.textHeight > client.height) {
        return true;
    }
    return false;
};

export const isHitLineText = (board: PlaitBoard, element: PlaitLine, point: Point) => {
    return getHitLineTextIndex(board, element, point) !== -1;
};

export const isHitPolyLine = (pathPoints: Point[], point: Point, strokeWidth: number, expand: number = 0) => {
    const distance = distanceBetweenPointAndSegments(pathPoints, point);
    return distance <= strokeWidth + expand;
};

export const isRectangleHitDrawElement = (board: PlaitBoard, element: PlaitElement, selection: Selection) => {
    const rangeRectangle = RectangleClient.getRectangleByPoints([selection.anchor, selection.focus]);
    if (PlaitDrawElement.isGeometry(element) || PlaitDrawElement.isImage(element)) {
        const client = RectangleClient.getRectangleByPoints(element.points);
        if (Point.isEquals(selection.anchor, selection.focus)) {
            const centerPoint = RectangleClient.getCenterPoint(client);
            const rotateFocusPoint = rotate(
                selection.focus[0],
                selection.focus[1],
                centerPoint[0],
                centerPoint[1],
                -element.angle || 0
            ) as Point;
            const shape = getShape(element);
            const isFocusHitRectangle = getEngine(shape).isHit(client, rotateFocusPoint);
            if (isFocusHitRectangle) {
                return isFocusHitRectangle;
            }
        }

        const localCornerPoints = RectangleClient.getLocalCornerPoints(client, { angle: element.angle });
        let isPolylineEdgeHitRectangle: boolean = false;
        let isTextEdgeHitRectangle: boolean = false;

        for (let i = 0; i < localCornerPoints.length; i++) {
            const A = localCornerPoints[i];
            const B = localCornerPoints[(i + 1) % localCornerPoints.length];
            isPolylineEdgeHitRectangle = isPolylineHitRectangle([A, B] as Point[], rangeRectangle);
            if (isPolylineEdgeHitRectangle) {
                return isPolylineEdgeHitRectangle;
            }
        }

        if (PlaitDrawElement.isGeometry(element) && isTextExceedingBounds(element)) {
            const textClient = getTextRectangle(element);
            const localTextCornerPoints = RectangleClient.getLocalCornerPoints(textClient, { angle: element.angle });
            for (let i = 0; i < localTextCornerPoints.length; i++) {
                const A = localTextCornerPoints[i];
                const B = localTextCornerPoints[(i + 1) % localTextCornerPoints.length];
                isTextEdgeHitRectangle = isPolylineHitRectangle([A, B] as Point[], rangeRectangle);
                if (isTextEdgeHitRectangle) {
                    return isTextEdgeHitRectangle;
                }
            }
        }
    }

    if (PlaitDrawElement.isLine(element)) {
        const points = getLinePoints(board, element);
        const strokeWidth = getStrokeWidthByElement(element);
        const isHitText = isHitLineText(board, element, selection.focus);
        const isHit = isHitPolyLine(points, selection.focus, strokeWidth, 3) || isHitText;
        const isContainPolyLinePoint = points.some(point => {
            return RectangleClient.isHit(rangeRectangle, RectangleClient.getRectangleByPoints([point, point]));
        });
        const isIntersect = Point.isEquals(selection.anchor, selection.focus) ? isHit : isPolylineHitRectangle(points, rangeRectangle);
        return isContainPolyLinePoint || isIntersect;
    }
    return null;
};

export const isHitDrawElement = (board: PlaitBoard, element: PlaitElement, point: Point) => {
    if (PlaitDrawElement.isGeometry(element)) {
        const fill = getFillByElement(board, element);
        // when shape equals text, fill is not allowed
        if (fill !== DefaultGeometryStyle.fill && fill !== TRANSPARENT && !PlaitDrawElement.isText(element)) {
            return isRectangleHitDrawElement(board, element, { anchor: point, focus: point });
        } else {
            // if shape equals text, only check text rectangle
            if (PlaitDrawElement.isText(element)) {
                const textClient = getTextRectangle(element);
                let isHitText = RectangleClient.isPointInRectangle(textClient, point);
                return isHitText;
            }
            const strokeWidth = getStrokeWidthByElement(element);
            const engine = getEngine(getShape(element));
            const rectangle = board.getRectangle(element);
            const corners = engine.getCornerPoints(RectangleClient.getRectangleByPoints(element.points));
            const centerPoint = RectangleClient.getCenterPoint(rectangle!);
            const rotatedPoint = rotate(point[0], point[1], centerPoint[0], centerPoint[1], -element.angle) as Point;
            const isHit = isHitPolyLine(corners, rotatedPoint, strokeWidth, 3);
            const textClient = getTextRectangle(element);
            let isHitText = RectangleClient.isPointInRectangle(textClient, rotatedPoint);
            return isHit || isHitText;
        }
    }
    if (PlaitDrawElement.isImage(element) || PlaitDrawElement.isLine(element)) {
        return isRectangleHitDrawElement(board, element, { anchor: point, focus: point });
    }
    return null;
};
