import {
    Point,
    PlaitBoard,
    getElementById,
    RectangleClient,
    PointOfRectangle,
    Direction,
    Vector,
    hasValidAngle,
    rotatePointsByElement,
    findElements,
    PlaitElement,
    Path
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
import {
    BasicShapes,
    ArrowLineHandleKey,
    ArrowLineHandleRef,
    ArrowLineHandleRefPair,
    ArrowLineMarkerType,
    PlaitArrowLine,
    PlaitGeometry,
    PlaitShapeElement,
    PlaitDrawElement
} from '../../interfaces';
import { getEngine } from '../../engines';
import { getElementShape } from '../shape';
import { getSourceAndTargetRectangle } from './elbow';
import { getStrokeWidthByElement } from '../common';
import { getArrowLinePoints, getHitConnection } from './arrow-line-basic';

export const getArrowLineHandleRefPair = (board: PlaitBoard, element: PlaitArrowLine): ArrowLineHandleRefPair => {
    const strokeWidth = getStrokeWidthByElement(element);
    const sourceBoundElement = element.source.boundId ? getElementById<PlaitShapeElement>(board, element.source.boundId) : undefined;
    const targetBoundElement = element.target.boundId ? getElementById<PlaitShapeElement>(board, element.target.boundId) : undefined;
    let sourcePoint = sourceBoundElement ? getConnectionPoint(sourceBoundElement, element.source.connection!) : element.points[0];
    let targetPoint = targetBoundElement
        ? getConnectionPoint(targetBoundElement, element.target.connection!)
        : element.points[element.points.length - 1];
    let sourceDirection = getDirectionByVector([targetPoint[0] - sourcePoint[0], targetPoint[1] - sourcePoint[1]]) || Direction.right;
    let targetDirection = getOppositeDirection(sourceDirection);
    const sourceFactor = getDirectionFactor(sourceDirection);
    const targetFactor = getDirectionFactor(targetDirection);
    const sourceHandleRef: ArrowLineHandleRef = {
        key: ArrowLineHandleKey.source,
        point: sourcePoint,
        direction: sourceDirection,
        vector: [sourceFactor.x, sourceFactor.y]
    };
    const targetHandleRef: ArrowLineHandleRef = {
        key: ArrowLineHandleKey.target,
        point: targetPoint,
        direction: targetDirection,
        vector: [targetFactor.x, targetFactor.y]
    };
    if (sourceBoundElement) {
        const connectionOffset = PlaitArrowLine.isSourceMarkOrTargetMark(
            element as PlaitArrowLine,
            ArrowLineMarkerType.none,
            ArrowLineHandleKey.source
        )
            ? 0
            : strokeWidth;
        const sourceVector = getVectorByConnection(sourceBoundElement, element.source.connection!);
        sourceHandleRef.vector = sourceVector;
        sourceHandleRef.boundElement = sourceBoundElement;
        if (hasValidAngle(sourceBoundElement)) {
            const direction = getDirectionByVector(rotateVector(sourceVector, sourceBoundElement.angle!));
            sourceDirection = direction ? direction : sourceDirection;
        } else {
            const direction = getDirectionByVector(sourceVector);
            sourceDirection = direction ? direction : sourceDirection;
        }
        sourceHandleRef.direction = sourceDirection;
        sourcePoint = getConnectionPoint(sourceBoundElement, element.source.connection!, sourceDirection, connectionOffset);
        sourceHandleRef.point = rotatePointsByElement(sourcePoint, sourceBoundElement) || sourcePoint;
    }
    if (targetBoundElement) {
        const connectionOffset = PlaitArrowLine.isSourceMarkOrTargetMark(
            element as PlaitArrowLine,
            ArrowLineMarkerType.none,
            ArrowLineHandleKey.target
        )
            ? 0
            : strokeWidth;
        const targetVector = getVectorByConnection(targetBoundElement, element.target.connection!);
        targetHandleRef.vector = targetVector;
        targetHandleRef.boundElement = targetBoundElement;
        if (hasValidAngle(targetBoundElement)) {
            const direction = getDirectionByVector(rotateVector(targetVector, targetBoundElement.angle!));
            targetDirection = direction ? direction : targetDirection;
        } else {
            const direction = getDirectionByVector(targetVector);
            targetDirection = direction ? direction : targetDirection;
        }
        targetHandleRef.direction = targetDirection;
        targetPoint = getConnectionPoint(targetBoundElement, element.target.connection!, targetDirection, connectionOffset);
        targetHandleRef.point = rotatePointsByElement(targetPoint, targetBoundElement) || targetPoint;
    }
    return { source: sourceHandleRef, target: targetHandleRef };
};

export const getConnectionPoint = (geometry: PlaitShapeElement, connection: Point, direction?: Direction, delta?: number): Point => {
    const rectangle = RectangleClient.getRectangleByPoints(geometry.points);
    if (direction && delta) {
        const directionFactor = getDirectionFactor(direction);
        const point = RectangleClient.getConnectionPoint(rectangle, connection);
        return [point[0] + directionFactor.x * delta, point[1] + directionFactor.y * delta];
    } else {
        return RectangleClient.getConnectionPoint(rectangle, connection);
    }
};

export const getVectorByConnection = (boundElement: PlaitShapeElement, connection: PointOfRectangle): Vector => {
    const rectangle = RectangleClient.getRectangleByPoints(boundElement.points);
    const shape = getElementShape(boundElement);
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

export const getElbowLineRouteOptions = (board: PlaitBoard, element: PlaitArrowLine, handleRefPair?: ArrowLineHandleRefPair) => {
    handleRefPair = handleRefPair ?? getArrowLineHandleRefPair(board, element);
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

export const collectArrowLineUpdatedRefsByGeometry = (
    board: PlaitBoard,
    element: PlaitShapeElement,
    refs: { property: Partial<PlaitArrowLine>; path: Path }[]
) => {
    const lines = findElements(board, {
        match: (element: PlaitElement) => {
            if (PlaitDrawElement.isArrowLine(element)) {
                return element.source.boundId === element.id || element.target.boundId === element.id;
            }
            return false;
        },
        recursion: element => true
    }) as PlaitArrowLine[];
    if (lines.length) {
        lines.forEach(line => {
            const isSourceBound = line.source.boundId === element.id;
            const handle = isSourceBound ? 'source' : 'target';
            const object = { ...line[handle] };
            const linePoints = getArrowLinePoints(board, line);
            const point = isSourceBound ? linePoints[0] : linePoints[linePoints.length - 1];
            object.connection = getHitConnection(board, point, element);
            const path = PlaitBoard.findPath(board, line);
            const index = refs.findIndex(obj => Path.equals(obj.path, path));
            if (index === -1) {
                refs.push({
                    property: {
                        [handle]: object
                    },
                    path
                });
            } else {
                refs[index].property = { ...refs[index].property, [handle]: object };
            }
        });
    }
};
