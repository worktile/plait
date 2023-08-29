import {
    Point,
    idCreator,
    distanceBetweenPointAndSegments,
    PlaitBoard,
    createG,
    arrowPoints,
    drawLinearPath,
    getElementById,
    RectangleClient,
    getNearestPointBetweenPointAndSegments
} from '@plait/core';
import { getPoints, Direction, getRectangleByPoints, getDirectionByPoint, getOppositeDirection } from '@plait/common';
import { LineHandle, LineMarkerType, LineShape, PlaitGeometry, PlaitLine } from '../interfaces';
import { Options } from 'roughjs/bin/core';

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
        target,
        opacity: 1,
        points,
        ...options
    };
};

export const getElbowPoints = (board: PlaitBoard, element: PlaitLine) => {
    if (element.points.length === 2) {
        const source = getSourcePoint(board, element);
        const target = getTargetPoint(board, element);
        let sourceDirection = Direction.right;
        let targetDirection = Direction.left;
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

export const drawElbowLine = (board: PlaitBoard, element: PlaitLine) => {
    const options = { stroke: element.strokeColor, strokeWidth: element.strokeWidth };
    const lineG = createG();
    const points = getElbowPoints(board, element);
    const elbowLine = PlaitBoard.getRoughSVG(board).linearPath(points, options);
    lineG.appendChild(elbowLine);
    const arrow = drawLineArrow(element, points, options);
    arrow && lineG.appendChild(arrow);
    return lineG;
};

export const drawLineArrow = (element: PlaitLine, points: Point[], options: Options) => {
    const sourceMarker = element.source.marker;
    const targetMarker = element.target.marker;
    const arrowG = createG();
    if (sourceMarker === LineMarkerType.none && targetMarker === LineMarkerType.none) return null;
    if (sourceMarker === LineMarkerType.arrow) {
        const sourcePoint = points[0];
        const { pointLeft, pointRight } = arrowPoints(points[1], sourcePoint, 10, 20);
        const sourceArrow = drawLinearPath([pointLeft, sourcePoint, pointRight], options);
        arrowG.appendChild(sourceArrow);
    }
    if (targetMarker === LineMarkerType.arrow) {
        const endPoint = points[points.length - 1];
        const { pointLeft, pointRight } = arrowPoints(points[points.length - 2], endPoint, 10, 20);
        const targetArrow = drawLinearPath([pointLeft, endPoint, pointRight], options);
        arrowG.appendChild(targetArrow);
    }
    return arrowG;
};

export const getSourcePoint = (board: PlaitBoard, element: PlaitLine) => {
    if (element.source.boundId) {
        const boundElement = getElementById<PlaitGeometry>(board, element.source.boundId);
        return boundElement ? normalizeConnection(boundElement, element.source.connection!) : element.points[0];
    }
    return element.points[0];
};

export const getTargetPoint = (board: PlaitBoard, element: PlaitLine) => {
    if (element.target.boundId) {
        const boundElement = getElementById<PlaitGeometry>(board, element.target.boundId);
        return boundElement ? normalizeConnection(boundElement, element.target.connection!) : element.points[element.points.length - 1];
    }
    return element.points[element.points.length - 1];
};

export const normalizeConnection = (geometry: PlaitGeometry, connection: Point): Point => {
    const rectangle = getRectangleByPoints(geometry.points);
    return [rectangle.x + rectangle.width * connection[0], rectangle.y + rectangle.height * connection[1]];
};

export const transformPointToConnection = (point: Point, hitElement: PlaitGeometry): Point => {
    const rectangle = getRectangleByPoints(hitElement.points);
    const activeRectangleCornerPoints = RectangleClient.getCornerPoints(rectangle);
    const nearestPoint = getNearestPointBetweenPointAndSegments(point, activeRectangleCornerPoints);
    return [(nearestPoint[0] - rectangle.x) / rectangle.width, (nearestPoint[1] - rectangle.y) / rectangle.height];
};
