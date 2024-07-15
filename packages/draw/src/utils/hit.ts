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
import { PlaitArrowLine, PlaitCommonGeometry, PlaitDrawElement, PlaitGeometry, PlaitShapeElement, PlaitVectorLine } from '../interfaces';
import { getNearestPoint } from './geometry';
import { getArrowLinePoints } from './arrow-line/arrow-line-basic';
import { getFillByElement } from './style/stroke';
import { getEngine } from '../engines';
import { getElementShape } from './shape';
import { getHitArrowLineTextIndex } from './position/arrow-line';
import { getTextRectangle } from './common';
import { isMultipleTextGeometry } from './multi-text-geometry';
import { isFilled, sortElementsByArea } from '@plait/common';
import { getVectorLinePoints } from './vector-line';

export const isTextExceedingBounds = (geometry: PlaitGeometry) => {
    const client = RectangleClient.getRectangleByPoints(geometry.points);
    if (geometry.textHeight && geometry.textHeight > client.height) {
        return true;
    }
    return false;
};

export const isHitArrowLineText = (board: PlaitBoard, element: PlaitArrowLine, point: Point) => {
    return getHitArrowLineTextIndex(board, element, point) !== -1;
};

export const isHitPolyLine = (pathPoints: Point[], point: Point) => {
    const distance = distanceBetweenPointAndSegments(pathPoints, point);
    return distance <= HIT_DISTANCE_BUFFER;
};

export const isHitArrowLine = (board: PlaitBoard, element: PlaitArrowLine, point: Point) => {
    const points = getArrowLinePoints(board, element);
    const isHitText = isHitArrowLineText(board, element as PlaitArrowLine, point);
    return isHitText || isHitPolyLine(points, point);
};

export const isHitVectorLine = (board: PlaitBoard, element: PlaitVectorLine, point: Point) => {
    const points = getVectorLinePoints(board, element);
    return isHitPolyLine(points!, point);
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

    if (PlaitDrawElement.isArrowLine(element)) {
        const points = getArrowLinePoints(board, element);
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
    const element = getFirstTextOrLineElement(newElements);
    if (element) {
        return element;
    }
    const sortElements = sortElementsByArea(board, newElements, 'asc');
    return sortElements[0];
};

export const getFirstFilledDrawElement = (board: PlaitBoard, elements: PlaitDrawElement[]) => {
    let filledElement: PlaitGeometry | null = null;
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (PlaitDrawElement.isGeometry(element) && !PlaitDrawElement.isText(element)) {
            const fill = getFillByElement(board, element);
            if (isFilled(fill)) {
                filledElement = element as PlaitGeometry;
                break;
            }
        }
    }
    return filledElement;
};

export const getFirstTextOrLineElement = (elements: PlaitDrawElement[]) => {
    const texts = elements.filter(item => PlaitDrawElement.isText(item));
    if (texts.length) {
        return texts[0];
    }
    const lines = elements.filter(item => PlaitDrawElement.isArrowLine(item));
    if (lines.length) {
        return lines[0];
    }
    return null;
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
    if (PlaitDrawElement.isArrowLine(element)) {
        return isHitArrowLine(board, element, point);
    }

    if (PlaitDrawElement.isVectorLine(element)) {
        return isHitVectorLine(board, element, point);
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

    if (PlaitDrawElement.isArrowLine(element)) {
        return isHitArrowLine(board, element, point);
    }

    if (PlaitDrawElement.isVectorLine(element)) {
        return isHitVectorLine(board, element, point);
    }

    return null;
};
