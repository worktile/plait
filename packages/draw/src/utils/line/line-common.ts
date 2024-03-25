import {
    Point,
    PlaitBoard,
    getElementById,
    RectangleClient,
    PointOfRectangle,
    Direction,
    Vector,
    rotatePoints,
    hasValidAngle
} from '@plait/core';
import {
    getDirectionFactor,
    rotateVectorAnti90,
    getDirectionByVector,
    getOppositeDirection,
    getDirectionByPointOfRectangle,
    getSourceAndTargetOuterRectangle,
    getNextPoint,
    rotateVector
} from '@plait/common';
import { BasicShapes, LineHandleKey, LineHandleRef, LineHandleRefPair, LineMarkerType, PlaitGeometry, PlaitLine } from '../../interfaces';
import { getStrokeWidthByElement } from '../style/stroke';
import { getEngine } from '../../engines';
import { getShape } from '../shape';
import { getSourceAndTargetRectangle } from './elbow';

export const getLineHandleRefPair = (board: PlaitBoard, element: PlaitLine): LineHandleRefPair => {
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
        sourceHandleRef.vector = sourceVector;
        sourceHandleRef.boundElement = sourceBoundElement;
        if (hasValidAngle(sourceBoundElement)) {
            const rotatedSourceVector = rotateVector(sourceVector, sourceBoundElement.angle);
            const direction = getDirectionByVector(rotatedSourceVector);
            sourceDirection = direction ? direction : sourceDirection;
            sourceHandleRef.direction = sourceDirection;
            sourcePoint = getConnectionPoint(sourceBoundElement, element.source.connection!, sourceDirection, connectionOffset);
            sourceHandleRef.point = rotatePoints(
                sourcePoint,
                RectangleClient.getCenterPoint(board.getRectangle(sourceBoundElement!)!),
                sourceBoundElement.angle
            );
        } else {
            const direction = getDirectionByVector(sourceVector);
            sourceDirection = direction ? direction : sourceDirection;
            sourceHandleRef.direction = sourceDirection;
            sourcePoint = getConnectionPoint(sourceBoundElement, element.source.connection!, sourceDirection, connectionOffset);
            sourceHandleRef.point = sourcePoint;
        }
    }
    if (targetBoundElement) {
        const connectionOffset = PlaitLine.isSourceMarkOrTargetMark(element, LineMarkerType.none, LineHandleKey.target) ? 0 : strokeWidth;
        const targetVector = getVectorByConnection(targetBoundElement, element.target.connection!);
        targetHandleRef.vector = targetVector;
        targetHandleRef.boundElement = targetBoundElement;
        if (hasValidAngle(targetBoundElement)) {
            const rotatedTargetVector = rotateVector(targetVector, targetBoundElement.angle);
            const direction = getDirectionByVector(rotatedTargetVector);
            targetDirection = direction ? direction : targetDirection;
            targetHandleRef.direction = targetDirection;
            targetPoint = getConnectionPoint(targetBoundElement, element.target.connection!, targetDirection, connectionOffset);
            targetHandleRef.point = rotatePoints(
                targetPoint,
                RectangleClient.getCenterPoint(board.getRectangle(targetBoundElement)!),
                targetBoundElement.angle
            );
        } else {
            const direction = getDirectionByVector(targetVector);
            targetDirection = direction ? direction : targetDirection;
            targetHandleRef.direction = targetDirection;
            targetPoint = getConnectionPoint(targetBoundElement, element.target.connection!, targetDirection, connectionOffset);
            targetHandleRef.point = targetPoint;
        }
    }
    return { source: sourceHandleRef, target: targetHandleRef };
};

export const getConnectionPoint = (geometry: PlaitGeometry, connection: Point, direction?: Direction, delta?: number): Point => {
    const rectangle = RectangleClient.getRectangleByPoints(geometry.points);
    if (direction && delta) {
        const directionFactor = getDirectionFactor(direction);
        const point = RectangleClient.getConnectionPoint(rectangle, connection);
        return [point[0] + directionFactor.x * delta, point[1] + directionFactor.y * delta];
    } else {
        return RectangleClient.getConnectionPoint(rectangle, connection);
    }
};

export const getVectorByConnection = (boundElement: PlaitGeometry, connection: PointOfRectangle): Vector => {
    const rectangle = RectangleClient.getRectangleByPoints(boundElement.points);
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

export const getElbowLineRouteOptions = (board: PlaitBoard, element: PlaitLine, handleRefPair?: LineHandleRefPair) => {
    handleRefPair = handleRefPair ?? getLineHandleRefPair(board, element);
    const { sourceRectangle, targetRectangle } = getSourceAndTargetRectangle(board, element, handleRefPair);
    const { sourceOuterRectangle, targetOuterRectangle } = getSourceAndTargetOuterRectangle(sourceRectangle, targetRectangle);
    const sourcePoint = handleRefPair.source.point;
    const targetPoint = handleRefPair.target.point;
    const nextSourcePoint = getNextPoint(sourcePoint, sourceOuterRectangle, handleRefPair.source.direction);
    const nextTargetPoint = getNextPoint(targetPoint, targetOuterRectangle, handleRefPair.target.direction);
    return {
        sourcePoint,
        nextSourcePoint,
        sourceRectangle,
        sourceOuterRectangle,
        targetPoint,
        nextTargetPoint,
        targetRectangle,
        targetOuterRectangle
    };
};
