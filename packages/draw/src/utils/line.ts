import {
    Point,
    idCreator,
    distanceBetweenPointAndSegments,
    PlaitBoard,
    createG,
    getElementById,
    RectangleClient,
    findElements,
    PlaitElement,
    drawLinearPath,
    createMask,
    createRect,
    ACTIVE_STROKE_WIDTH,
    PointOfRectangle
} from '@plait/core';
import {
    getPoints,
    Direction,
    getRectangleByPoints,
    getPointOnPolyline,
    getDirectionFactor,
    rotateVector90,
    Vector,
    getDirectionByVector,
    getDirectionByPointOfRectangle
} from '@plait/common';
import {
    LineHandle,
    LineHandleKey,
    LineHandleRef,
    LineMarkerType,
    LineShape,
    PlaitDrawElement,
    PlaitGeometry,
    PlaitLine
} from '../interfaces';
import { getPointsByCenterPoint, getNearestPoint } from './geometry';
import { getLineDashByElement, getStrokeColorByElement, getStrokeWidthByElement } from './style/stroke';
import { getEngine } from './engine';
import { drawLineArrow } from './line-arrow';

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
    return getLineHandlePoints(board, element);
};

export const getLineHandlePoints = (board: PlaitBoard, element: PlaitLine) => {
    const handleRefPair = getLineHandleRefPair(board, element);
    return [handleRefPair.source.point, handleRefPair.target.point];
};

export const getLineHandleRefPair = (board: PlaitBoard, element: PlaitLine) => {
    const strokeWidth = getStrokeWidthByElement(element);
    const sourceBoundElement = element.source.boundId ? getElementById<PlaitGeometry>(board, element.source.boundId) : undefined;
    const targetBoundElement = element.target.boundId ? getElementById<PlaitGeometry>(board, element.target.boundId) : undefined;
    let sourcePoint = sourceBoundElement ? getConnectionPoint(sourceBoundElement, element.source.connection!) : element.points[0];
    let targetPoint = targetBoundElement
        ? getConnectionPoint(targetBoundElement, element.target.connection!)
        : element.points[element.points.length - 1];
    let sourceDirection = sourcePoint[0] < targetPoint[0] ? Direction.right : Direction.left;
    let targetDirection = sourcePoint[0] < targetPoint[0] ? Direction.left : Direction.right;
    const sourceHandleRef: LineHandleRef = { key: LineHandleKey.source, point: sourcePoint, direction: sourceDirection };
    const targetHandleRef: LineHandleRef = { key: LineHandleKey.target, point: targetPoint, direction: targetDirection };
    if (sourceBoundElement) {
        const connectionOffset = PlaitLine.isSourceMarkOrTargetMark(element, LineMarkerType.none, LineHandleKey.source) ? 0 : strokeWidth;
        const direction = getDirectionByBoundElementAndConnection(board, sourceBoundElement, element.source.connection!);
        sourceDirection = direction ? direction : sourceDirection;
        sourcePoint = getConnectionPoint(sourceBoundElement, element.source.connection!, sourceDirection, connectionOffset);
        sourceHandleRef.boundElement = sourceBoundElement;
        sourceHandleRef.direction = sourceDirection;
        sourceHandleRef.point = sourcePoint;
    }
    if (targetBoundElement) {
        const connectionOffset = PlaitLine.isSourceMarkOrTargetMark(element, LineMarkerType.none, LineHandleKey.target) ? 0 : strokeWidth;
        const direction = getDirectionByBoundElementAndConnection(board, targetBoundElement, element.target.connection!);
        targetDirection = direction ? direction : targetDirection;
        targetPoint = getConnectionPoint(targetBoundElement, element.target.connection!, targetDirection, connectionOffset);
        targetHandleRef.boundElement = sourceBoundElement;
        targetHandleRef.direction = targetDirection;
        targetHandleRef.point = targetPoint;
    }
    return { source: sourceHandleRef, target: targetHandleRef };
};

export const getElbowPoints = (board: PlaitBoard, element: PlaitLine) => {
    if (element.points.length === 2) {
        const handleRefPair = getLineHandleRefPair(board, element);
        const points: Point[] = getPoints(
            handleRefPair.source.point,
            handleRefPair.source.direction,
            handleRefPair.target.point,
            handleRefPair.target.direction,
            30
        );
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
    const line = drawLinearPath(points, options);
    const id = idCreator();
    line.setAttribute('mask', `url(#${id})`);
    lineG.appendChild(line);
    const { mask, maskTargetFillRect } = drawMask(board, element, id);
    lineG.appendChild(mask);
    line.appendChild(maskTargetFillRect);
    const arrow = drawLineArrow(element, points, { stroke: strokeColor, strokeWidth });
    arrow && lineG.appendChild(arrow);
    return lineG;
};

function drawMask(board: PlaitBoard, element: PlaitLine, id: string) {
    const mask = createMask();
    mask.setAttribute('id', id);
    const points = getLinePoints(board, element);
    let rectangle = getRectangleByPoints(points);
    rectangle = RectangleClient.getOutlineRectangle(rectangle, -30);
    const maskFillRect = createRect(rectangle, {
        fill: 'white'
    });
    mask.appendChild(maskFillRect);

    const texts = element.texts;
    texts.forEach((text, index) => {
        const textRectangle = getLineTextRectangle(board, element, index);
        const rect = createRect(textRectangle, {
            fill: 'black'
        });
        mask.appendChild(rect);
    });
    //撑开 line
    const maskTargetFillRect = createRect(rectangle);
    maskTargetFillRect.setAttribute('opacity', '0');
    return { mask, maskTargetFillRect };
}

export const getDirectionByBoundElementAndConnection = (board: PlaitBoard, boundElement: PlaitGeometry, connection: PointOfRectangle) => {
    const rectangle = getRectangleByPoints(boundElement.points);
    const engine = getEngine(boundElement.shape);
    const direction = getDirectionByPointOfRectangle(connection);
    if (direction) {
        return direction;
    }
    if (engine.getEdgeByConnectionPoint) {
        const edge = engine.getEdgeByConnectionPoint(rectangle, connection);
        if (edge) {
            const vector = [edge[1][0] - edge[0][0], edge[1][1] - edge[0][1]] as Vector;
            const vector90 = rotateVector90(vector);
            const direction = getDirectionByVector(vector90);
            return direction;
        }
    } else if (engine.getTangentVectorByConnectionPoint) {
        const vector = engine.getTangentVectorByConnectionPoint(rectangle, connection);
        if (vector) {
            const vector90 = rotateVector90(vector);
            const direction = getDirectionByVector(vector90);
            return direction;
        }
    } else {
        return null;
    }
    return null;
};

export const getConnectionPoint = (geometry: PlaitGeometry, connection: Point, direction?: Direction, delta?: number): Point => {
    const rectangle = getRectangleByPoints(geometry.points);
    if (direction && delta) {
        const directionFactor = getDirectionFactor(direction);
        const point = RectangleClient.getConnectionPoint(rectangle, connection);
        return [point[0] + directionFactor.x * delta, point[1] + directionFactor.y * delta];
    } else {
        return RectangleClient.getConnectionPoint(rectangle, connection);
    }
};

export const transformPointToConnection = (board: PlaitBoard, point: Point, hitElement: PlaitGeometry): Point => {
    let rectangle = getRectangleByPoints(hitElement.points);
    rectangle = RectangleClient.inflate(rectangle, ACTIVE_STROKE_WIDTH);
    let nearestPoint = getNearestPoint(hitElement, point, ACTIVE_STROKE_WIDTH);
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
