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
    getDirectionByPoint,
    getPointOnPolyline,
    getDirectionFactor,
    rotateVector90,
    Vector,
    getDirectionByVector
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
    return [getSourcePoint(board, element), getTargetPoint(board, element)];
};

export const getElbowPoints = (board: PlaitBoard, element: PlaitLine) => {
    if (element.points.length === 2) {
        const sourceHandleRef = getLineHandleRef(board, element, LineHandleKey.source);
        const targetHandleRef = getLineHandleRef(board, element, LineHandleKey.target);
        const source = sourceHandleRef ? getConnectionPointByHandleRef(board, element, sourceHandleRef) : getSourcePoint(board, element);
        const target = targetHandleRef ? getConnectionPointByHandleRef(board, element, targetHandleRef) : getTargetPoint(board, element);
        let sourceDirection = source[0] < target[0] ? Direction.right : Direction.left;
        let targetDirection = source[0] < target[0] ? Direction.left : Direction.right;
        if (sourceHandleRef) {
            const direction = getDirectionByHandleRef(board, element, sourceHandleRef);
            sourceDirection = direction ? direction : sourceDirection;
        }
        if (targetHandleRef) {
            const direction = getDirectionByHandleRef(board, element, targetHandleRef);
            targetDirection = direction ? direction : targetDirection;
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

export const getSourcePoint = (board: PlaitBoard, element: PlaitLine) => {
    return getConnectionPointByHandleKey(board, element, LineHandleKey.source);
};

export const getTargetPoint = (board: PlaitBoard, element: PlaitLine) => {
    return getConnectionPointByHandleKey(board, element, LineHandleKey.target);
};

export const getDirectionByHandleRef = (board: PlaitBoard, element: PlaitLine, handleRef: LineHandleRef) => {
    const rectangle = getRectangleByPoints(handleRef.boundElement.points);
    const engine = getEngine(handleRef.boundElement.shape);
    if (engine.getEdgeByConnectionPoint) {
        const edge = engine.getEdgeByConnectionPoint(rectangle, handleRef.connection);
        if (edge) {
            const vector = [edge[1][0] - edge[0][0], edge[1][1] - edge[0][1]] as Vector;
            const vector90 = rotateVector90(vector);
            const direction = getDirectionByVector(vector90);
            return direction;
        }
    } else {
        return null;
    }
    return null;
};

export const getConnectionPointByHandleKey = (board: PlaitBoard, element: PlaitLine, key: LineHandleKey) => {
    const handleRef = getLineHandleRef(board, element, key);
    if (handleRef) {
        return getConnectionPointByHandleRef(board, element, handleRef);
    }
    {
        if (key === LineHandleKey.source) {
            return element.points[0];
        } else {
            return element.points[element.points.length - 1];
        }
    }
};

export const getConnectionPointByHandleRef = (board: PlaitBoard, element: PlaitLine, handleRef: LineHandleRef) => {
    const strokeWidth = getStrokeWidthByElement(element);
    const connectionOffset = PlaitLine.isMarkByHandleKey(element, handleRef.key, LineMarkerType.none) ? 0 : strokeWidth;
    return getConnectionPoint(handleRef.boundElement, handleRef.connection, connectionOffset);
};

export const getLineHandleRef = (board: PlaitBoard, element: PlaitLine, key: LineHandleKey): LineHandleRef | null => {
    const lineHandle = element[key] as LineHandle;
    if (lineHandle.boundId) {
        const boundElement = getElementById<PlaitGeometry>(board, lineHandle.boundId);
        if (boundElement) {
            return { key, boundElement, connection: lineHandle.connection as PointOfRectangle, marker: lineHandle.marker };
        }
    } else {
    }
    return null;
};

export const getConnectionPoint = (geometry: PlaitGeometry, connection: Point, offset: number): Point => {
    const rectangle = getRectangleByPoints(geometry.points);
    const directionFactor = getDirectionFactor(getDirectionByPoint(connection, Direction.bottom));
    const point = RectangleClient.getConnectionPoint(rectangle, connection);
    return [point[0] + directionFactor.x * offset, point[1] + directionFactor.y * offset];
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
