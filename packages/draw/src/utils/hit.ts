import {
    PlaitElement,
    RectangleClient,
    Selection,
    PlaitBoard,
    isPolylineHitRectangle,
    Point,
    distanceBetweenPointAndSegments,
    distanceBetweenPointAndPoint,
    HIT_DISTANCE_BUFFER,
    rotatePointsByElement,
    rotateAntiPointsByElement
} from '@plait/core';
import { PlaitCommonGeometry, PlaitDrawElement, PlaitGeometry, PlaitLine, PlaitShapeElement } from '../interfaces';
import { getNearestPoint } from './geometry';
import { getLinePoints } from './line/line-basic';
import { getFillByElement } from './style/stroke';
import { getEngine } from '../engines';
import { getElementShape } from './shape';
import { getHitLineTextIndex } from './position/line';
import { getTextRectangle } from './common';
import { isMultipleTextGeometry } from './multi-text-geometry';
import { getElementArea, TRANSPARENT } from '@plait/common';
import { DefaultDrawStyle } from '../constants';

export const isTextExceedingBounds = (geometry: PlaitGeometry) => {
    const client = RectangleClient.getRectangleByPoints(geometry.points);
    if (geometry.textHeight && geometry.textHeight > client.height) {
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

export const isRectangleHitElementText = (element: PlaitCommonGeometry, rectangle: RectangleClient) => {
    const engine = getEngine<PlaitCommonGeometry>(element.shape);
    if (isMultipleTextGeometry(element)) {
        const texts = element.texts;
        return texts.some(item => {
            const textClient = engine.getTextRectangle!(element, { key: item.key });
            const rotatedCornerPoints =
                rotatePointsByElement(RectangleClient.getCornerPoints(textClient), element) || RectangleClient.getCornerPoints(textClient);
            return isPolylineHitRectangle(rotatedCornerPoints, rectangle);
        });
    } else {
        const textClient = engine.getTextRectangle ? engine.getTextRectangle(element) : getTextRectangle(element);
        const rotatedCornerPoints =
            rotatePointsByElement(RectangleClient.getCornerPoints(textClient), element) || RectangleClient.getCornerPoints(textClient);
        return isPolylineHitRectangle(rotatedCornerPoints, rectangle);
    }
};

export const isHitElementText = (element: PlaitCommonGeometry, point: Point) => {
    const engine = getEngine<PlaitCommonGeometry>(element.shape);
    if (isMultipleTextGeometry(element)) {
        const texts = element.texts;
        return texts.some(item => {
            const textClient = engine.getTextRectangle!(element, { key: item.key });
            return RectangleClient.isPointInRectangle(textClient, point);
        });
    } else {
        const textClient = engine.getTextRectangle ? engine.getTextRectangle(element) : getTextRectangle(element);
        return RectangleClient.isPointInRectangle(textClient, point);
    }
};

export const isRectangleHitDrawElement = (board: PlaitBoard, element: PlaitElement, selection: Selection) => {
    const rangeRectangle = RectangleClient.getRectangleByPoints([selection.anchor, selection.focus]);
    if (PlaitDrawElement.isGeometry(element)) {
        const client = RectangleClient.getRectangleByPoints(element.points);
        let rotatedCornerPoints =
            rotatePointsByElement(RectangleClient.getCornerPoints(client), element) || RectangleClient.getCornerPoints(client);
        const isHitElement = isPolylineHitRectangle(rotatedCornerPoints, rangeRectangle);
        if (isHitElement) {
            return isHitElement;
        }
        return isRectangleHitElementText(element, rangeRectangle);
    }

    if (PlaitDrawElement.isImage(element)) {
        const client = RectangleClient.getRectangleByPoints(element.points);
        const rotatedCornerPoints =
            rotatePointsByElement(RectangleClient.getCornerPoints(client), element) || RectangleClient.getCornerPoints(client);
        return isPolylineHitRectangle(rotatedCornerPoints, rangeRectangle);
    }

    if (PlaitDrawElement.isLine(element)) {
        const points = getLinePoints(board, element);
        return isPolylineHitRectangle(points, rangeRectangle);
    }
    return null;
};

export const getDrawHitElement = (board: PlaitBoard, elements: PlaitDrawElement[]) => {
    let firstFilledElement = getFirstFilledDrawElement(board, elements);
    let endIndex = elements.length;
    if (firstFilledElement) {
        endIndex = elements.indexOf(firstFilledElement) + 1;
    }
    const newElements = elements.slice(0, endIndex);
    const texts = newElements.filter(item => PlaitDrawElement.isText(item));
    if (texts.length) {
        return texts[0];
    }
    const lines = newElements.filter(item => PlaitDrawElement.isLine(item));
    if (lines.length) {
        return lines[0];
    }
    const shapeElements = newElements.filter(item => PlaitDrawElement.isShapeElement(item)) as PlaitShapeElement[];
    const sortElements = shapeElements.sort((a, b) => {
        return getElementArea(board, a) - getElementArea(board, b);
    });
    return sortElements[0];
};

export const getFirstFilledDrawElement = (board: PlaitBoard, elements: PlaitDrawElement[]) => {
    let filledElement: PlaitGeometry | null = null;
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (PlaitDrawElement.isGeometry(element) && !PlaitDrawElement.isText(element)) {
            const fill = getFillByElement(board, element);
            if (fill && fill !== DefaultDrawStyle.fill && fill !== TRANSPARENT) {
                filledElement = element as PlaitGeometry;
                break;
            }
        }
    }
    return filledElement;
};

export const isHitDrawElement = (board: PlaitBoard, element: PlaitElement, point: Point) => {
    const rectangle = board.getRectangle(element);
    point = rotateAntiPointsByElement(point, element) || point;
    if (PlaitDrawElement.isGeometry(element)) {
        if (isHitEdgeOfShape(board, element, point, HIT_DISTANCE_BUFFER)) {
            return true;
        }
        const engine = getEngine(getElementShape(element));
        if (PlaitDrawElement.isText(element)) {
            const textClient = getTextRectangle(element);
            return RectangleClient.isPointInRectangle(textClient, point);
        }
        const isHitText = isHitElementText(element, point);
        return isHitText || engine.isInsidePoint(rectangle!, point);
    }
    if (PlaitDrawElement.isImage(element)) {
        const client = RectangleClient.getRectangleByPoints(element.points);
        return RectangleClient.isPointInRectangle(client, point);
    }
    if (PlaitDrawElement.isLine(element)) {
        return isHitLine(board, element, point);
    }
    return null;
};

export const isHitEdgeOfShape = (board: PlaitBoard, element: PlaitShapeElement, point: Point, hitDistanceBuffer: number) => {
    const nearestPoint = getNearestPoint(element, point);
    const distance = distanceBetweenPointAndPoint(nearestPoint[0], nearestPoint[1], point[0], point[1]);
    return distance <= hitDistanceBuffer;
};

export const isInsideOfShape = (board: PlaitBoard, element: PlaitShapeElement, point: Point, hitDistanceBuffer: number) => {
    const client = RectangleClient.inflate(RectangleClient.getRectangleByPoints(element.points), hitDistanceBuffer);
    return getEngine(getElementShape(element)).isInsidePoint(client, point);
};

export const isHitElementInside = (board: PlaitBoard, element: PlaitElement, point: Point) => {
    const rectangle = board.getRectangle(element);
    point = rotateAntiPointsByElement(point, element) || point;
    if (PlaitDrawElement.isGeometry(element) && !PlaitDrawElement.isGeometryByTable(element)) {
        const engine = getEngine(getElementShape(element));
        const isHitInside = engine.isInsidePoint(rectangle!, point);
        if (isHitInside) {
            return isHitInside;
        }
        if (engine.getTextRectangle) {
            const isHitText = isHitElementText(element, point);
            if (isHitText) {
                return isHitText;
            }
        }
    }
    if (PlaitDrawElement.isImage(element)) {
        const client = RectangleClient.getRectangleByPoints(element.points);
        return RectangleClient.isPointInRectangle(client, point);
    }

    if (PlaitDrawElement.isLine(element)) {
        return isHitLine(board, element, point);
    }

    return null;
};
