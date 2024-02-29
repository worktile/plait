import {
    PlaitElement,
    RectangleClient,
    Selection,
    PlaitBoard,
    isPolylineHitRectangle,
    Point,
    distanceBetweenPointAndSegments,
    distanceBetweenPointAndPoint,
    HIT_DISTANCE_BUFFER
} from '@plait/core';
import { PlaitDrawElement, PlaitGeometry, PlaitLine } from '../interfaces';
import { TRANSPARENT } from '@plait/common';
import { getTextRectangle } from './geometry';
import { getLinePoints } from './line/line-basic';
import { getFillByElement } from './style/stroke';
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

export const isHitPolyLine = (pathPoints: Point[], point: Point) => {
    const distance = distanceBetweenPointAndSegments(pathPoints, point);
    return distance <= HIT_DISTANCE_BUFFER;
};

export const isHitLine = (board: PlaitBoard, element: PlaitLine, point: Point) => {
    const points = getLinePoints(board, element);
    const isHitText = isHitLineText(board, element, point);
    return isHitText || isHitPolyLine(points, point);
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
        return isPolylineHitRectangle(points, rangeRectangle);
    }
    return null;
};

export const isHitDrawElement = (board: PlaitBoard, element: PlaitElement, point: Point) => {
    if (PlaitDrawElement.isGeometry(element)) {
        const fill = getFillByElement(board, element);
        const engine = getEngine(getShape(element));
        const rectangle = board.getRectangle(element);
        const nearestPoint = engine.getNearestPoint(rectangle!, point);
        const distance = distanceBetweenPointAndPoint(nearestPoint[0], nearestPoint[1], point[0], point[1]);
        const isHitEdge = distance <= HIT_DISTANCE_BUFFER;
        if (isHitEdge) {
            return isHitEdge;
        }
        // when shape equals text, fill is not allowed
        if (fill !== DefaultGeometryStyle.fill && fill !== TRANSPARENT && !PlaitDrawElement.isText(element)) {
            const isHitInside = engine.isInsidePoint(rectangle!, point);
            if (isHitInside) {
                return isHitInside;
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
    if (PlaitDrawElement.isImage(element)) {
        return isRectangleHitDrawElement(board, element, { anchor: point, focus: point });
    }

    if (PlaitDrawElement.isLine(element)) {
        return isHitLine(board, element, point);
    }
    return null;
};

export const isHitElementInside = (board: PlaitBoard, element: PlaitElement, point: Point) => {
    if (PlaitDrawElement.isGeometry(element)) {
        const engine = getEngine(getShape(element));
        const rectangle = board.getRectangle(element);
        const isHitInside = engine.isInsidePoint(rectangle!, point);
        if (isHitInside) {
            return isHitInside;
        }

        if (engine.getTextRectangle) {
            const textClient = engine.getTextRectangle(element);
            const isHitTextRectangle = RectangleClient.isPointInRectangle(textClient, point);
            if (isHitTextRectangle) {
                return isHitTextRectangle;
            }
        }
    }
    if (PlaitDrawElement.isImage(element)) {
        return isRectangleHitDrawElement(board, element, { anchor: point, focus: point });
    }

    if (PlaitDrawElement.isLine(element)) {
        return isHitLine(board, element, point);
    }

    return null;
};
