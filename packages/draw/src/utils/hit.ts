import { PlaitElement, RectangleClient, Selection, PlaitBoard, isPolylineHitRectangle, Point } from '@plait/core';
import { PlaitDrawElement } from '../interfaces';
import { TRANSPARENT, getRectangleByPoints } from '@plait/common';
import { getTextRectangle } from './geometry';
import { getLinePoints, isHitLineText, isHitPolyLine } from './line';
import { getFillByElement, getStrokeWidthByElement } from './style/stroke';
import { DefaultGeometryStyle } from '../constants/geometry';
import { getEngine } from '../engines';
import { getShape } from './shape';

export const isRectangleHitDrawElement = (board: PlaitBoard, element: PlaitElement, selection: Selection) => {
    if (PlaitDrawElement.isGeometry(element)) {
        const client = getRectangleByPoints(element.points);
        const rangeRectangle = RectangleClient.toRectangleClient([selection.anchor, selection.focus]);
        if (element.textHeight > client.height) {
            const textClient = getTextRectangle(element);
            return RectangleClient.isHit(rangeRectangle, client) || RectangleClient.isHit(rangeRectangle, textClient);
        }
        return RectangleClient.isHit(rangeRectangle, client);
    }
    if (PlaitDrawElement.isImage(element)) {
        const client = getRectangleByPoints(element.points);
        const rangeRectangle = RectangleClient.toRectangleClient([selection.anchor, selection.focus]);
        return RectangleClient.isHit(rangeRectangle, client);
    }
    if (PlaitDrawElement.isLine(element)) {
        const points = getLinePoints(board, element);
        const strokeWidth = getStrokeWidthByElement(element);
        const isHitText = isHitLineText(board, element, selection.focus);
        const isHit = isHitPolyLine(points, selection.focus, strokeWidth, 3) || isHitText;
        const rangeRectangle = RectangleClient.toRectangleClient([selection.anchor, selection.focus]);
        const isContainPolyLinePoint = points.some(point => {
            return RectangleClient.isHit(rangeRectangle, RectangleClient.toRectangleClient([point, point]));
        });
        const isIntersect = Point.isEquals(selection.anchor, selection.focus) ? isHit : isPolylineHitRectangle(points, rangeRectangle);
        return isContainPolyLinePoint || isIntersect;
    }
    return null;
};

export const isHitDrawElement = (board: PlaitBoard, element: PlaitElement, point: Point) => {
    if (PlaitDrawElement.isGeometry(element)) {
        const fill = getFillByElement(element);
        if (fill !== DefaultGeometryStyle.fill && fill !== TRANSPARENT) {
            return isRectangleHitDrawElement(board, element, { anchor: point, focus: point });
        } else {
            const strokeWidth = getStrokeWidthByElement(element);
            const engine = getEngine(getShape(element));
            const corners = engine.getCornerPoints(getRectangleByPoints(element.points));
            const isHit = isHitPolyLine(corners, point, strokeWidth, 3);
            return isHit;
        }
    }
    if (PlaitDrawElement.isImage(element) || PlaitDrawElement.isLine(element)) {
        return isRectangleHitDrawElement(board, element, { anchor: point, focus: point });
    }
    return null;
};
