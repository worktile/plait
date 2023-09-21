import {
    Point,
    idCreator,
    distanceBetweenPointAndSegments,
    PlaitBoard,
    createG,
    getElementById,
    RectangleClient,
    setPathStrokeLinecap,
    findElements,
    PlaitElement,
    createRect
} from '@plait/core';
import { getPoints, Direction, getRectangleByPoints, getDirectionByPoint, getPointOnPolyline, getDirectionFactor } from '@plait/common';
import { LineHandle, LineMarkerType, LineShape, PlaitDrawElement, PlaitGeometry, PlaitLine } from '../interfaces';
import { getPointsByCenterPoint, getNearestPoint } from './geometry';
import { getLineDashByElement, getStrokeColorByElement, getStrokeWidthByElement } from './style/stroke';
import { getEngine } from './engine';
import { BOUNDED_HANDLE_OFFSET, drawLineArrow } from './line-arrow';

export const createLineElement = (
    shape: LineShape,
    points: [Point, Point],
    source: LineHandle,
    target: LineHandle,
    options?: Pick<PlaitLine, 'strokeColor' | 'strokeWidth'>
): PlaitLine => {
    return {
        id: idCreator(),
        type: 'line',
        shape,
        source,
        texts: [],
        target,
        opacity: 1,
        points,
        ...options
    };
};

export const getLinePoints = (board: PlaitBoard, element: PlaitLine) => {
    return element.shape === LineShape.elbow ? getElbowPoints(board, element) : getStraightPoints(board, element);
};

export const getStraightPoints = (board: PlaitBoard, element: PlaitLine) => {
    return [getSourcePoint(board, element), getTargetPoint(board, element)];
};

export const getElbowPoints = (board: PlaitBoard, element: PlaitLine) => {
    if (element.points.length === 2) {
        const source = getSourcePoint(board, element);
        const target = getTargetPoint(board, element);
        let sourceDirection = source[0] < target[0] ? Direction.right : Direction.left;
        let targetDirection = source[0] < target[0] ? Direction.left : Direction.right;
        if (element.source.connection) {
            sourceDirection = getDirectionByPoint(element.source.connection, sourceDirection);
        }
        if (element.target.connection) {
            targetDirection = getDirectionByPoint(element.target.connection, targetDirection);
        }
        const points: Point[] = getPoints(source, sourceDirection, target, targetDirection, 30);
        return points;
    }
    return element.points;
};

export const isHitPolyLine = (pathPoints: Point[], point: Point, strokeWidth: number, expand: number = 0) => {
    const distance = distanceBetweenPointAndSegments(pathPoints, point);
    return distance <= strokeWidth + expand;
};

export const getHitLineTextIndex = (board: PlaitBoard, element: PlaitLine, point: Point) => {
    const texts = element.texts;
    if (!texts.length) return -1;

    const points = getElbowPoints(board, element);
    return texts.findIndex(text => {
        const center = getPointOnPolyline(points, text.position);
        const rectangle = {
            x: center[0] - text.width! / 2,
            y: center[1] - text.height! / 2,
            width: text.width!,
            height: text.height!
        };
        return RectangleClient.isHit(rectangle, RectangleClient.toRectangleClient([point, point]));
    });
};

export const isHitLineText = (board: PlaitBoard, element: PlaitLine, point: Point) => {
    return getHitLineTextIndex(board, element, point) !== -1;
};

export const drawLine = (board: PlaitBoard, element: PlaitLine) => {
    const strokeWidth = getStrokeWidthByElement(element);
    const strokeColor = getStrokeColorByElement(element);
    const strokeLineDash = getLineDashByElement(element);
    const options = { stroke: strokeColor, strokeWidth, strokeLineDash };
    const lineG = createG();
    const points = getLinePoints(board, element);
    const line = PlaitBoard.getRoughSVG(board).linearPath(points, options);
    addMask(board, line, element);
    setPathStrokeLinecap(line, 'square');
    lineG.appendChild(line);
    const arrow = drawLineArrow(element, points, options);
    arrow && lineG.appendChild(arrow);
    return lineG;
};

const addMask = (board: PlaitBoard, g: SVGGElement, element: PlaitLine) => {
    const points = getLinePoints(board, element);
    let rectangle = getRectangleByPoints(points);
    rectangle = RectangleClient.getOutlineRectangle(rectangle, -30);
    const maskRect = createRect(rectangle);
    maskRect.setAttribute('opacity', '0');
    g.appendChild(maskRect);
};

export const getSourcePoint = (board: PlaitBoard, element: PlaitLine) => {
    if (element.source.boundId) {
        const connectionOffset = PlaitLine.isSourceMark(element, LineMarkerType.none) ? 0 : BOUNDED_HANDLE_OFFSET;
        const boundElement = getElementById<PlaitGeometry>(board, element.source.boundId);
        return boundElement ? getConnectionPoint(boundElement, element.source.connection!, connectionOffset) : element.points[0];
    }
    return element.points[0];
};

export const getTargetPoint = (board: PlaitBoard, element: PlaitLine) => {
    if (element.target.boundId) {
        const connectionOffset = PlaitLine.isTargetMark(element, LineMarkerType.none) ? 0 : BOUNDED_HANDLE_OFFSET;
        const boundElement = getElementById<PlaitGeometry>(board, element.target.boundId);
        return boundElement
            ? getConnectionPoint(boundElement, element.target.connection!, connectionOffset)
            : element.points[element.points.length - 1];
    }
    return element.points[element.points.length - 1];
};

export const getConnectionPoint = (geometry: PlaitGeometry, connection: Point, offset: number): Point => {
    const rectangle = getRectangleByPoints(geometry.points);
    const strokeWidth = getStrokeWidthByElement(geometry);
    const directionFactor = getDirectionFactor(getDirectionByPoint(connection, Direction.bottom));
    return [
        rectangle.x + rectangle.width * connection[0] + strokeWidth * directionFactor.x + offset * directionFactor.x,
        rectangle.y + rectangle.height * connection[1] + strokeWidth * directionFactor.y + offset * directionFactor.y
    ];
};

export const transformPointToConnection = (board: PlaitBoard, point: Point, hitElement: PlaitGeometry): Point => {
    const offset = (getStrokeWidthByElement(hitElement) + 1) / 2;
    let rectangle = getRectangleByPoints(hitElement.points);
    rectangle = RectangleClient.getOutlineRectangle(rectangle, -offset);
    let nearestPoint = getNearestPoint(hitElement, point, offset);
    const hitConnector = getHitConnectorPoint(nearestPoint, hitElement, rectangle);
    nearestPoint = hitConnector ? hitConnector : nearestPoint;
    return [(nearestPoint[0] - rectangle.x) / rectangle.width, (nearestPoint[1] - rectangle.y) / rectangle.height];
};

export const getHitConnectorPoint = (movingPoint: Point, hitElement: PlaitGeometry, rectangle: RectangleClient) => {
    const connector = getEngine(hitElement.shape).getConnectorPoints(rectangle);
    const points = getPointsByCenterPoint(movingPoint, 5, 5);
    const pointRectangle = getRectangleByPoints(points);
    return connector.find(point => {
        return RectangleClient.isHit(pointRectangle, RectangleClient.toRectangleClient([point, point]));
    });
};

export const getLineTextRectangle = (board: PlaitBoard, element: PlaitLine, index: number): RectangleClient => {
    const text = element.texts[index];
    const elbowPoints = getLinePoints(board, element);
    const point = getPointOnPolyline(elbowPoints, text.position);
    return {
        x: point[0] - text.width! / 2,
        y: point[1] - text.height! / 2,
        width: text.width!,
        height: text.height!
    };
};

export const getBoardLines = (board: PlaitBoard) => {
    return findElements(board, {
        match: (element: PlaitElement) => PlaitDrawElement.isLine(element),
        recursion: (element: PlaitElement) => PlaitDrawElement.isDrawElement(element)
    }) as PlaitLine[];
};
