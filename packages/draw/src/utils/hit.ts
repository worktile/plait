import {
    PlaitElement,
    RectangleClient,
    Selection,
    PlaitBoard,
    isPolylineHitRectangle,
    Point,
    distanceBetweenPointAndSegments,
    distanceBetweenPointAndPoint,
    PRESS_AND_MOVE_BUFFER
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
    if (PlaitDrawElement.isGeometry(element)) {
        const client = RectangleClient.getRectangleByPoints(element.points);
        if (isTextExceedingBounds(element)) {
            const textClient = getTextRectangle(element);
            return RectangleClient.isHit(rangeRectangle, client) || RectangleClient.isHit(rangeRectangle, textClient);
        }
        return RectangleClient.isHit(rangeRectangle, client);
    }
    if (PlaitDrawElement.isImage(element)) {
        const client = RectangleClient.getRectangleByPoints(element.points);
        return RectangleClient.isHit(rangeRectangle, client);
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
        const engine = getEngine(getShape(element));
        const rectangle = board.getRectangle(element);
        const strokeWidth = getStrokeWidthByElement(element);
        const nearestPoint = engine.getNearestPoint(rectangle!, point);
        const distance = distanceBetweenPointAndPoint(nearestPoint[0], nearestPoint[1], point[0], point[1]);
        const isHitEdge = distance <= strokeWidth + PRESS_AND_MOVE_BUFFER;
        if (isHitEdge) {
            return isHitEdge;
        }
        // when shape equals text, fill is not allowed
        if (fill !== DefaultGeometryStyle.fill && fill !== TRANSPARENT && !PlaitDrawElement.isText(element)) {
            const isHitFillElementInside = engine.isHit(rectangle!, point);
            if (isHitFillElementInside) {
                return isHitFillElementInside;
            }
        } else {
            // if shape equals text, only check text rectangle
            if (PlaitDrawElement.isText(element)) {
                const textClient = getTextRectangle(element);
                let isHitText = RectangleClient.isPointInRectangle(textClient, point);
                return isHitText;
            }

            // check textRectangle of element
            if (engine.getTextRectangle) {
                const textClient = engine.getTextRectangle(element);
                const isHitTextRectangle = RectangleClient.isPointInRectangle(textClient, point);
                if (isHitTextRectangle) {
                    return isHitTextRectangle;
                }
            }
        }
    }
    if (PlaitDrawElement.isImage(element) || PlaitDrawElement.isLine(element)) {
        return isRectangleHitDrawElement(board, element, { anchor: point, focus: point });
    }
    return null;
};
