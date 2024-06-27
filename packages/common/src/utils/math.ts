import { PlaitBoard, PlaitElement, Point, distanceBetweenPointAndPoint } from '@plait/core';
import { getPointByVectorDirectionComponent, getUnitVectorByPointAndPoint } from './vector';

export function isPointOnSegment(point: Point, startPoint: Point, endPoint: Point) {
    const distanceToStart = distanceBetweenPointAndPoint(point[0], point[1], startPoint[0], startPoint[1]);
    const distanceToEnd = distanceBetweenPointAndPoint(point[0], point[1], endPoint[0], endPoint[1]);
    const segmentLength = distanceBetweenPointAndPoint(startPoint[0], startPoint[1], endPoint[0], endPoint[1]);
    return Math.abs(distanceToStart + distanceToEnd - segmentLength) < 0.1;
}

export const getCrossingPointsBetweenPointAndSegment = (point: Point, startPoint: Point, endPoint: Point) => {
    const result: Point[] = [];
    const xRange = [Math.min(startPoint[0], endPoint[0]), Math.max(startPoint[0], endPoint[0])];
    const yRange = [Math.min(startPoint[1], endPoint[1]), Math.max(startPoint[1], endPoint[1])];
    const unitVector = getUnitVectorByPointAndPoint(startPoint, endPoint);
    if (point[0] >= xRange[0] && point[0] <= xRange[1]) {
        const crossingPoint = getPointByVectorDirectionComponent(startPoint, unitVector, point[0] - startPoint[0], true) as Point;
        result.push(crossingPoint);
    } else if (point[1] >= yRange[0] && point[1] <= yRange[1]) {
        const crossingPoint = getPointByVectorDirectionComponent(startPoint, unitVector, point[1] - startPoint[1], false) as Point;
        result.push(crossingPoint);
    }
    return result;
};

export const getElementArea = (board: PlaitBoard, element: PlaitElement) => {
    const rectangle = board.getRectangle(element);
    if (rectangle) {
        return rectangle.width * rectangle.height;
    }
    return 0;
};
