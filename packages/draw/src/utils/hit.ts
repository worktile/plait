import {
    PlaitElement,
    RectangleClient,
    Selection,
    PlaitBoard,
    isLineHitRectangle,
    Point,
    distanceBetweenPointAndSegments,
    distanceBetweenPointAndPoint,
    HIT_DISTANCE_BUFFER,
    rotateAntiPointsByElement,
    isPointInPolygon,
    rotatePointsByAngle,
    createDebugGenerator,
    getNearestPointBetweenPointAndArc,
    getEllipseArcCenter
} from '@plait/core';
import {
    BasicShapes,
    GeometryShapes,
    PlaitArrowLine,
    PlaitCommonGeometry,
    PlaitCustomGeometry,
    PlaitDrawElement,
    PlaitGeometry,
    PlaitShapeElement,
    PlaitVectorLine
} from '../interfaces';
import { getNearestPoint } from './geometry';
import { getArrowLinePoints } from './arrow-line/arrow-line-basic';
import { getFillByElement } from './style/stroke';
import { getEngine } from '../engines';
import { getElementShape } from './shape';
import { getHitArrowLineTextIndex } from './position/arrow-line';
import { getTextRectangle, isClosedCustomGeometry, isClosedDrawElement, isClosedPoints, isDrawElementIncludeText } from './common';
import { isMultipleTextGeometry } from './multi-text-geometry';
import { getFirstTextEditor, isFilled, sortElementsByArea } from '@plait/common';
import { getVectorLinePoints } from './vector-line';
import { Editor, Element } from 'slate';
import { generateCloudPath } from '../engines/basic-shapes/cloud';

export const isHitArrowLineText = (board: PlaitBoard, element: PlaitArrowLine, point: Point) => {
    return getHitArrowLineTextIndex(board, element, point) !== -1;
};

export const isHitPolyLine = (pathPoints: Point[], point: Point) => {
    const distance = distanceBetweenPointAndSegments(point, pathPoints);
    return distance <= HIT_DISTANCE_BUFFER;
};

export const isHitArrowLine = (board: PlaitBoard, element: PlaitArrowLine, point: Point) => {
    const points = getArrowLinePoints(board, element);
    const isHitText = isHitArrowLineText(board, element as PlaitArrowLine, point);
    return isHitText || isHitPolyLine(points, point);
};

export const isHitVectorLine = (board: PlaitBoard, element: PlaitVectorLine, point: Point) => {
    const points = getVectorLinePoints(board, element)!;
    if (isClosedPoints(element.points)) {
        return isPointInPolygon(point, points) || isHitPolyLine(points, point);
    } else {
        return isHitPolyLine(points, point);
    }
};

export const isRectangleHitElementText = (board: PlaitBoard, element: PlaitCommonGeometry, rectangle: RectangleClient) => {
    const engine = getEngine<PlaitCommonGeometry>(element.shape);
    if (isMultipleTextGeometry(element)) {
        const texts = element.texts;
        return texts.some((item) => {
            const textClient = engine.getTextRectangle!(board, element, { id: item.id });
            return isRectangleHitRotatedPoints(rectangle, RectangleClient.getCornerPoints(textClient), element.angle);
        });
    } else {
        const textClient = engine.getTextRectangle ? engine.getTextRectangle(board, element) : getTextRectangle(board, element);
        return isRectangleHitRotatedPoints(rectangle, RectangleClient.getCornerPoints(textClient), element.angle);
    }
};

export const isHitElementText = (board: PlaitBoard, element: PlaitCommonGeometry, point: Point) => {
    const engine = getEngine<PlaitCommonGeometry>(element.shape);
    if (isMultipleTextGeometry(element)) {
        const texts = element.texts;
        return texts.some((item) => {
            const textClient = engine.getTextRectangle!(board, element, { id: item.id });
            return RectangleClient.isPointInRectangle(textClient, point);
        });
    } else {
        const textClient = engine.getTextRectangle ? engine.getTextRectangle(board, element) : getTextRectangle(board, element);
        return RectangleClient.isPointInRectangle(textClient, point);
    }
};

export const isEmptyTextElement = (element: PlaitCommonGeometry) => {
    if (!isDrawElementIncludeText(element)) {
        return true;
    }
    const editor = getFirstTextEditor(element);
    return Editor.isEmpty(editor, editor.children[0] as Element);
};

export const isRectangleHitDrawElement = (board: PlaitBoard, element: PlaitElement, selection: Selection) => {
    const rangeRectangle = RectangleClient.getRectangleByPoints([selection.anchor, selection.focus]);
    if (PlaitDrawElement.isGeometry(element)) {
        const isHitElement = isRectangleHitRotatedElement(board, rangeRectangle, element);
        if (isHitElement) {
            return isHitElement;
        }
        return !isEmptyTextElement(element) && isRectangleHitElementText(board, element, rangeRectangle);
    }

    if (PlaitDrawElement.isImage(element)) {
        return isRectangleHitRotatedElement(board, rangeRectangle, element);
    }

    if (PlaitDrawElement.isArrowLine(element)) {
        const points = getArrowLinePoints(board, element);
        return isLineHitRectangle(points, rangeRectangle);
    }

    if (PlaitDrawElement.isVectorLine(element)) {
        const points = getVectorLinePoints(board, element)!;
        return isLineHitRectangle(points, rangeRectangle);
    }

    return null;
};

export const isRectangleHitRotatedElement = (
    board: PlaitBoard,
    rectangle: RectangleClient,
    element: PlaitElement & { points: Point[] }
) => {
    const client = RectangleClient.getRectangleByPoints(element.points);
    return isRectangleHitRotatedPoints(rectangle, RectangleClient.getCornerPoints(client), element.angle);
};

export const isRectangleHitRotatedPoints = (rectangle: RectangleClient, points: Point[], angle: number | undefined) => {
    let rotatedPoints = rotatePointsByAngle(points, angle) || points;
    return isLineHitRectangle(rotatedPoints, rectangle);
};

export const getHitDrawElement = (board: PlaitBoard, elements: (PlaitDrawElement | PlaitCustomGeometry)[]) => {
    let firstFilledElement = getFirstFilledDrawElement(board, elements);
    let endIndex = elements.length;
    if (firstFilledElement) {
        endIndex = elements.indexOf(firstFilledElement) + 1;
    }
    const newElements = elements.slice(0, endIndex);
    const solidElements = getSolidElements(newElements);
    if (solidElements) {
        return solidElements[0];
    }
    const sortElements = sortElementsByArea(board, newElements, 'asc');
    return sortElements[0];
};

export const getFirstFilledDrawElement = (board: PlaitBoard, elements: (PlaitDrawElement | PlaitCustomGeometry)[]) => {
    let filledElement: PlaitGeometry | PlaitCustomGeometry | null = null;
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (isClosedCustomGeometry(board, element) || isClosedDrawElement(element)) {
            const fill = getFillByElement(board, element);
            if (isFilled(fill)) {
                filledElement = element as PlaitGeometry;
                break;
            }
        }
    }
    return filledElement;
};

export const isFilledDrawElement = (board: PlaitBoard, element: PlaitDrawElement | PlaitCustomGeometry) => {
    return getFirstFilledDrawElement(board, [element]) !== null;
};

export const getSolidElements = (elements: PlaitElement[]) => {
    const solidElements = elements.filter(
        (item) => PlaitDrawElement.isText(item) || PlaitDrawElement.isLine(item) || PlaitDrawElement.isImage(item)
    );
    if (solidElements.length) {
        return solidElements;
    }
    return null;
};

const debugKey = 'debug:plait:hit:shape:edge:sample-points';
const debugGenerator = createDebugGenerator(debugKey);
const shapes: GeometryShapes[] = [BasicShapes.cloud];

export const isHitDrawElement = (board: PlaitBoard, element: PlaitElement, point: Point, isStrict: boolean = true) => {
    const rectangle = board.getRectangle(element);
    point = rotateAntiPointsByElement(board, point, element) || point;
    if (PlaitDrawElement.isGeometry(element) && rectangle) {
        if (debugGenerator.isDebug() && shapes.includes(element.shape)) {
            debugGenerator.clear();
            const { startPoint, arcCommands } = generateCloudPath(rectangle);
            const points = [startPoint, ...arcCommands.map((arc) => [arc.endX, arc.endY])] as Point[];
            debugGenerator.drawCircles(board, points, 5, false);
            let minDistance = Infinity;
            let nearestPoint = point;
            let currentStart = startPoint;
            for (const arc of arcCommands) {
                const arcNearestPoint = getNearestPointBetweenPointAndArc(point, currentStart, arc);
                const distance = distanceBetweenPointAndPoint(point[0], point[1], arcNearestPoint[0], arcNearestPoint[1]);
                const { center } = getEllipseArcCenter(currentStart, arc);
                debugGenerator.drawCircles(board, [center], 8, false, { fill: 'yellow' });
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestPoint = arcNearestPoint;
                }
                currentStart = [arc.endX, arc.endY];
            }
            debugGenerator.drawCircles(board, [point], 12, false, { fill: 'black', stroke: 'black' });
            debugGenerator.drawCircles(board, [nearestPoint], 12, false, { fill: 'green', stroke: 'green' });
        }
        if (isHitEdgeOfShape(board, element, point, HIT_DISTANCE_BUFFER)) {
            return true;
        }
        const engine = getEngine(getElementShape(element));
        if (PlaitDrawElement.isText(element)) {
            const textClient = getTextRectangle(board, element);
            return RectangleClient.isPointInRectangle(textClient, point);
        }
        if (!!isStrict && isEmptyTextElement(element) && !isFilledDrawElement(board, element)) {
            return false;
        }
        const isHitText = isHitElementText(board, element, point);
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
    point = rotateAntiPointsByElement(board, point, element) || point;
    if (PlaitDrawElement.isGeometry(element) && !PlaitDrawElement.isGeometryByTable(element)) {
        const engine = getEngine(getElementShape(element));
        const isHitInside = engine.isInsidePoint(rectangle!, point);
        if (isHitInside) {
            return isHitInside;
        }
        if (engine.getTextRectangle) {
            const isHitText = isHitElementText(board, element, point);
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
