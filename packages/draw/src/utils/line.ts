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
    PointOfRectangle,
    Direction,
    Vector,
    distanceBetweenPointAndPoint,
    catmullRomFitting,
    isPointsOnSameLine
} from '@plait/core';
import {
    getPoints,
    getRectangleByPoints,
    getPointOnPolyline,
    getDirectionFactor,
    rotateVectorAnti90,
    getDirectionByVector,
    getOppositeDirection,
    getDirectionByPointOfRectangle,
    getPointByVector,
    removeDuplicatePoints,
    generateElbowLineRoute,
    getNextPoint,
    getExtendPoint,
    getSourceAndTargetOuterRectangle,
    simplifyOrthogonalPoints,
    isSourceAndTargetIntersect
} from '@plait/common';
import {
    BasicShapes,
    LineHandle,
    LineHandleKey,
    LineHandleRef,
    LineMarkerType,
    LineShape,
    LineText,
    PlaitDrawElement,
    PlaitGeometry,
    PlaitLine,
    PlaitShape
} from '../interfaces';
import { getNearestPoint, createGeometryElement } from './geometry';
import { getLineDashByElement, getStrokeColorByElement, getStrokeWidthByElement } from './style/stroke';
import { getEngine } from '../engines';
import { drawLineArrow } from './line-arrow';
import { pointsOnBezierCurves } from 'points-on-curve';
import { getShape } from './shape';
import { DefaultLineStyle, LINE_TEXT_SPACE } from '../constants/line';
import { LineShapeGenerator } from '../generators/line.generator';
import { REACTION_MARGIN } from '../constants';
import { getHitOutlineGeometry } from './position/geometry';
import { getLineMemorizedLatest } from './memorize';
import { alignPoints } from './line-resize';

export const createLineElement = (
    shape: LineShape,
    points: [Point, Point],
    source: LineHandle,
    target: LineHandle,
    texts?: LineText[],
    options?: Pick<PlaitLine, 'strokeColor' | 'strokeWidth'>
): PlaitLine => {
    return {
        id: idCreator(),
        type: 'line',
        shape,
        source,
        texts: texts ? texts : [],
        target,
        opacity: 1,
        points,
        ...options
    };
};

export const getLinePoints = (board: PlaitBoard, element: PlaitLine) => {
    switch (element.shape) {
        case LineShape.elbow: {
            return getElbowPoints(board, element);
        }
        case LineShape.curve: {
            return getCurvePoints(board, element);
        }
        default: {
            const points = PlaitLine.getPoints(board, element);
            const handleRefPair = getLineHandleRefPair(board, element);
            points[0] = handleRefPair.source.point;
            points[points.length - 1] = handleRefPair.target.point;
            return points;
        }
    }
};

export const getLineHandleRefPair = (board: PlaitBoard, element: PlaitLine) => {
    const strokeWidth = getStrokeWidthByElement(element);
    const sourceBoundElement = element.source.boundId ? getElementById<PlaitGeometry>(board, element.source.boundId) : undefined;
    const targetBoundElement = element.target.boundId ? getElementById<PlaitGeometry>(board, element.target.boundId) : undefined;
    let sourcePoint = sourceBoundElement ? getConnectionPoint(sourceBoundElement, element.source.connection!) : element.points[0];
    let targetPoint = targetBoundElement
        ? getConnectionPoint(targetBoundElement, element.target.connection!)
        : element.points[element.points.length - 1];
    let sourceDirection = getDirectionByVector([targetPoint[0] - sourcePoint[0], targetPoint[1] - sourcePoint[1]]) || Direction.right;
    let targetDirection = getOppositeDirection(sourceDirection);
    const sourceFactor = getDirectionFactor(sourceDirection);
    const targetFactor = getDirectionFactor(targetDirection);
    const sourceHandleRef: LineHandleRef = {
        key: LineHandleKey.source,
        point: sourcePoint,
        direction: sourceDirection,
        vector: [sourceFactor.x, sourceFactor.y]
    };
    const targetHandleRef: LineHandleRef = {
        key: LineHandleKey.target,
        point: targetPoint,
        direction: targetDirection,
        vector: [targetFactor.x, targetFactor.y]
    };
    if (sourceBoundElement) {
        const connectionOffset = PlaitLine.isSourceMarkOrTargetMark(element, LineMarkerType.none, LineHandleKey.source) ? 0 : strokeWidth;
        const sourceVector = getVectorByConnection(sourceBoundElement, element.source.connection!);
        const direction = getDirectionByVector(sourceVector);
        sourceDirection = direction ? direction : sourceDirection;
        sourcePoint = getConnectionPoint(sourceBoundElement, element.source.connection!, sourceDirection, connectionOffset);
        sourceHandleRef.boundElement = sourceBoundElement;
        sourceHandleRef.direction = sourceDirection;
        sourceHandleRef.point = sourcePoint;
        sourceHandleRef.vector = sourceVector;
    }
    if (targetBoundElement) {
        const connectionOffset = PlaitLine.isSourceMarkOrTargetMark(element, LineMarkerType.none, LineHandleKey.target) ? 0 : strokeWidth;
        const targetVector = getVectorByConnection(targetBoundElement, element.target.connection!);
        const direction = getDirectionByVector(targetVector);
        targetDirection = direction ? direction : targetDirection;
        targetPoint = getConnectionPoint(targetBoundElement, element.target.connection!, targetDirection, connectionOffset);
        targetHandleRef.boundElement = targetBoundElement;
        targetHandleRef.direction = targetDirection;
        targetHandleRef.point = targetPoint;
        targetHandleRef.vector = targetVector;
    }
    return { source: sourceHandleRef, target: targetHandleRef };
};

const createFakeElement = (startPoint: Point, vector: Vector) => {
    const point = getPointByVector(startPoint, vector, -25);
    const points = RectangleClient.getPoints(RectangleClient.createRectangleByCenterPoint(point, 50, 50));
    return createGeometryElement(BasicShapes.rectangle, points, '');
};

export const getNextSourceAndTargetPoints = (board: PlaitBoard, element: PlaitLine) => {
    const { sourceRectangle, targetRectangle } = getSourceAndTargetRectangle(board, element);
    const { sourceOuterRectangle, targetOuterRectangle } = getSourceAndTargetOuterRectangle(sourceRectangle, targetRectangle);
    const handleRefPair = getLineHandleRefPair(board, element);
    const sourcePoint = handleRefPair.source.point;
    const targetPoint = handleRefPair.target.point;
    const nextSourcePoint = getNextPoint(sourcePoint, sourceOuterRectangle, handleRefPair.source.direction);
    const nextTargetPoint = getNextPoint(targetPoint, targetOuterRectangle, handleRefPair.target.direction);
    return [nextSourcePoint, nextTargetPoint];
};

export const getSourceAndTargetRectangle = (board: PlaitBoard, element: PlaitLine) => {
    const handleRefPair = getLineHandleRefPair(board, element);
    let sourceElement = element.source.boundId ? getElementById<PlaitGeometry>(board, element.source.boundId) : undefined;
    let targetElement = element.target.boundId ? getElementById<PlaitGeometry>(board, element.target.boundId) : undefined;
    if (!sourceElement) {
        const source = handleRefPair.source;
        sourceElement = createFakeElement(source.point, source.vector);
    }
    if (!targetElement) {
        const target = handleRefPair.target;
        targetElement = createFakeElement(target.point, target.vector);
    }
    const sourceRectangle = RectangleClient.inflate(getRectangleByPoints(sourceElement.points), getStrokeWidthByElement(sourceElement) * 2);
    const targetRectangle = RectangleClient.inflate(getRectangleByPoints(targetElement.points), getStrokeWidthByElement(targetElement) * 2);
    return {
        sourceRectangle,
        targetRectangle
    };
};

export const getElbowPoints = (board: PlaitBoard, element: PlaitLine) => {
    const { sourceRectangle, targetRectangle } = getSourceAndTargetRectangle(board, element);
    const { sourceOuterRectangle, targetOuterRectangle } = getSourceAndTargetOuterRectangle(sourceRectangle, targetRectangle);
    const handleRefPair = getLineHandleRefPair(board, element);
    const sourcePoint = handleRefPair.source.point;
    const targetPoint = handleRefPair.target.point;
    const nextSourcePoint = getNextPoint(sourcePoint, sourceOuterRectangle, handleRefPair.source.direction);
    const nextTargetPoint = getNextPoint(targetPoint, targetOuterRectangle, handleRefPair.target.direction);
    const params = {
        sourcePoint,
        nextSourcePoint,
        sourceRectangle,
        sourceOuterRectangle,
        targetPoint,
        nextTargetPoint,
        targetRectangle,
        targetOuterRectangle
    };
    const isIntersect = isSourceAndTargetIntersect(params);
    if (isIntersect) {
        return getPoints(
            handleRefPair.source.point,
            handleRefPair.source.direction,
            handleRefPair.target.point,
            handleRefPair.target.direction,
            0
        );
    }
    const keyPoints = removeDuplicatePoints(generateElbowLineRoute(params));
    if (element.points.length === 2) {
        return simplifyOrthogonalPoints(keyPoints);
    } else {
        const normalizedKeyPoints = simplifyOrthogonalPoints(keyPoints.slice(1, keyPoints.length - 1));
        const dataPoints = removeDuplicatePoints(PlaitLine.getPoints(board, element));
        dataPoints.splice(0, 1, normalizedKeyPoints[0]);
        dataPoints.splice(-1, 1, normalizedKeyPoints[normalizedKeyPoints.length - 1]);
        const renderPoints: Point[] = [keyPoints[0]];
        for (let i = 0; i < dataPoints.length - 1; i++) {
            const startPoint = dataPoints[i];
            const endPoint = dataPoints[i + 1];
            renderPoints.push(startPoint);
            if (!isPointsOnSameLine([startPoint, endPoint], 0.01)) {
                const midElbowPoints = getMidElbowPoints(normalizedKeyPoints, startPoint, endPoint);
                if (midElbowPoints.length) {
                    renderPoints.push(...midElbowPoints);
                } else {
                    const previousStartPoint = dataPoints[i - 1];
                    if (previousStartPoint && isPointsOnSameLine([previousStartPoint, startPoint])) {
                        let newStartPoint: Point = [startPoint[0], endPoint[1]];
                        if (Point.isHorizontalAlign(previousStartPoint, startPoint)) {
                            newStartPoint = [endPoint[0], startPoint[1]];
                        }
                        renderPoints.splice(-1, 1, newStartPoint);
                    } else {
                        const nextEndPoint = dataPoints[i + 2];
                        if (nextEndPoint && isPointsOnSameLine([endPoint, nextEndPoint])) {
                            let newEndPoint: Point = [endPoint[0], startPoint[1]];
                            if (Point.isHorizontalAlign(endPoint, nextEndPoint)) {
                                newEndPoint = [startPoint[0], endPoint[1]] as Point;
                            }
                            dataPoints.splice(i + 1, 1, newEndPoint);
                        }
                    }
                }
            }
        }
        renderPoints.push(keyPoints[keyPoints.length - 2], keyPoints[keyPoints.length - 1]);
        // Remove the middle point to avoid the situation where the starting and ending positions are drawn back, such as when sourcePoint is between nextSourcePoint and the first key point.
        // Issue
        //                           keyPoint2
        //                                |
        //                                |
        // nextPoint---sourcePoint---keyPoint1
        // The correct rendering should be (nextPoint should be filtered out):
        //                           keyPoint2
        //                                |
        //                                |
        //             sourcePoint---keyPoint1
        return simplifyOrthogonalPoints(renderPoints);
    }
};

export const getCurvePoints = (board: PlaitBoard, element: PlaitLine) => {
    if (element.points.length === 2) {
        const handleRefPair = getLineHandleRefPair(board, element);
        const { source, target } = handleRefPair;
        const sourceBoundElement = handleRefPair.source.boundElement;
        const targetBoundElement = handleRefPair.target.boundElement;
        let curvePoints: Point[] = [source.point];
        const sumDistance = distanceBetweenPointAndPoint(...source.point, ...target.point);
        const offset = 12 + sumDistance / 3;
        if (sourceBoundElement) {
            curvePoints.push(getPointByVector(source.point, source.vector, offset));
        }
        if (targetBoundElement) {
            curvePoints.push(getPointByVector(target.point, target.vector, offset));
        }
        const isSingleBound = (sourceBoundElement && !targetBoundElement) || (!sourceBoundElement && targetBoundElement);
        if (isSingleBound) {
            curvePoints.push(target.point);
            const points = Q2C(curvePoints);
            return pointsOnBezierCurves(points) as Point[];
        }
        if (!sourceBoundElement && !targetBoundElement) {
            curvePoints.push(getPointByVector(source.point, source.vector, offset));
            curvePoints.push(getPointByVector(target.point, target.vector, offset));
        }
        curvePoints.push(target.point);
        return pointsOnBezierCurves(curvePoints) as Point[];
    } else {
        let dataPoints = PlaitLine.getPoints(board, element);
        dataPoints = removeDuplicatePoints(dataPoints);
        const points = catmullRomFitting(dataPoints);
        return pointsOnBezierCurves(points) as Point[];
    }
};

export const isHitPolyLine = (pathPoints: Point[], point: Point, strokeWidth: number, expand: number = 0) => {
    const distance = distanceBetweenPointAndSegments(pathPoints, point);
    return distance <= strokeWidth + expand;
};

export const getHitLineTextIndex = (board: PlaitBoard, element: PlaitLine, point: Point) => {
    const texts = element.texts;
    if (!texts.length) return -1;

    const points = getLinePoints(board, element);
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
    const strokeColor = getStrokeColorByElement(board, element);
    const strokeLineDash = getLineDashByElement(element);
    const options = { stroke: strokeColor, strokeWidth, strokeLineDash };
    const lineG = createG();
    let points = getLinePoints(board, element);
    let line;
    if (element.shape === LineShape.curve) {
        line = PlaitBoard.getRoughSVG(board).curve(points, options);
    } else {
        line = drawLinearPath(points, options);
    }
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
        let textRectangle = getLineTextRectangle(board, element, index);
        textRectangle = RectangleClient.inflate(textRectangle, LINE_TEXT_SPACE * 2);
        const rect = createRect(textRectangle, {
            fill: 'black'
        });
        mask.appendChild(rect);
    });
    // open line
    const maskTargetFillRect = createRect(rectangle);
    maskTargetFillRect.setAttribute('opacity', '0');
    maskTargetFillRect.setAttribute('fill', 'none');
    return { mask, maskTargetFillRect };
}

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

export const getConnectionByNearestPoint = (board: PlaitBoard, point: Point, hitElement: PlaitShape): Point => {
    let rectangle = getRectangleByPoints(hitElement.points);
    let nearestPoint = getNearestPoint(hitElement, point);
    const hitConnector = getHitConnectorPoint(nearestPoint, hitElement, rectangle);
    nearestPoint = hitConnector ? hitConnector : nearestPoint;
    return [(nearestPoint[0] - rectangle.x) / rectangle.width, (nearestPoint[1] - rectangle.y) / rectangle.height];
};

export const getHitConnectorPoint = (point: Point, hitElement: PlaitShape, rectangle: RectangleClient) => {
    const shape = getShape(hitElement);
    const connector = getEngine(shape).getConnectorPoints(rectangle);
    const points = RectangleClient.getPoints(RectangleClient.createRectangleByCenterPoint(point, 10, 10));
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

// quadratic Bezier to cubic Bezier
export const Q2C = (points: Point[]) => {
    const result = [];
    const numSegments = points.length / 3;
    for (let i = 0; i < numSegments; i++) {
        const start = points[i];
        const qControl = points[i + 1];
        const end = points[i + 2];
        const startDistance = distanceBetweenPointAndPoint(...start, ...qControl);
        const endDistance = distanceBetweenPointAndPoint(...end, ...qControl);
        const cControl1 = getExtendPoint(start, qControl, (startDistance * 2) / 3);
        const cControl2 = getExtendPoint(end, qControl, (endDistance * 2) / 3);
        result.push(start, cControl1, cControl2, end);
    }
    return result;
};

export const getVectorByConnection = (boundElement: PlaitGeometry, connection: PointOfRectangle): Vector => {
    const rectangle = getRectangleByPoints(boundElement.points);
    const shape = getShape(boundElement);
    const engine = getEngine(shape);
    let vector: Vector = [0, 0];
    const direction = getDirectionByPointOfRectangle(connection);
    if (direction && boundElement.shape !== BasicShapes.ellipse) {
        const factor = getDirectionFactor(direction);
        return [factor.x, factor.y];
    }
    if (engine.getEdgeByConnectionPoint) {
        const edge = engine.getEdgeByConnectionPoint(rectangle, connection);
        if (edge) {
            const lineVector = [edge[1][0] - edge[0][0], edge[1][1] - edge[0][1]] as Vector;
            return rotateVectorAnti90(lineVector);
        }
    }
    if (engine.getTangentVectorByConnectionPoint) {
        const lineVector = engine.getTangentVectorByConnectionPoint(rectangle, connection);
        if (lineVector) {
            return rotateVectorAnti90(lineVector);
        }
    }
    return vector;
};

export const handleLineCreating = (
    board: PlaitBoard,
    lineShape: LineShape,
    sourcePoint: Point,
    movingPoint: Point,
    sourceElement: PlaitShape | null,
    lineShapeG: SVGGElement
) => {
    const hitElement = getHitOutlineGeometry(board, movingPoint, REACTION_MARGIN);
    const targetConnection = hitElement ? getConnectionByNearestPoint(board, movingPoint, hitElement) : undefined;
    const connection = sourceElement ? getConnectionByNearestPoint(board, sourcePoint, sourceElement) : undefined;
    const targetBoundId = hitElement ? hitElement.id : undefined;
    const lineGenerator = new LineShapeGenerator(board);
    const memorizedLatest = getLineMemorizedLatest();
    let sourceMarker, targetMarker;
    sourceMarker = memorizedLatest.source;
    targetMarker = memorizedLatest.target;
    sourceMarker && delete memorizedLatest.source;
    targetMarker && delete memorizedLatest.target;
    const temporaryLineElement = createLineElement(
        lineShape,
        [sourcePoint, movingPoint],
        { marker: sourceMarker || LineMarkerType.none, connection: connection, boundId: sourceElement?.id },
        { marker: targetMarker || LineMarkerType.arrow, connection: targetConnection, boundId: targetBoundId },
        [],
        {
            strokeWidth: DefaultLineStyle.strokeWidth,
            ...memorizedLatest
        }
    );
    const linePoints = getLinePoints(board, temporaryLineElement);
    const otherPoint = linePoints[0];
    temporaryLineElement.points[1] = alignPoints(otherPoint, movingPoint);
    lineGenerator.processDrawing(temporaryLineElement, lineShapeG);
    PlaitBoard.getElementActiveHost(board).append(lineShapeG);
    return temporaryLineElement;
};

export function getMidElbowPoints(normalizedKeyPoints: Point[], startPoint: Point, endPoint: Point) {
    let midElbowPoints: Point[] = [];
    let startPointIndex = -1;
    let endPointIndex = -1;
    for (let i = 0; i < normalizedKeyPoints.length; i++) {
        if (isPointsOnSameLine([normalizedKeyPoints[i], startPoint])) {
            startPointIndex = i;
        }
        if (startPointIndex > -1 && isPointsOnSameLine([normalizedKeyPoints[i], endPoint])) {
            endPointIndex = i;
            break;
        }
    }
    if (startPointIndex > -1 && endPointIndex > -1) {
        midElbowPoints = normalizedKeyPoints.slice(startPointIndex, endPointIndex + 1);
    }
    return midElbowPoints;
}
