import { getCrossingPointsBetweenPointAndSegment, isPointOnSegment } from '@plait/common';
import { Point } from '@plait/core';

export const getCenterPointsOnPolygon = (points: Point[]) => {
    const centerPoints: Point[] = [];
    for (let i = 0; i < points.length; i++) {
        let j = i == points.length - 1 ? 0 : i + 1;
        centerPoints.push([(points[i][0] + points[j][0]) / 2, (points[i][1] + points[j][1]) / 2]);
    }
    return centerPoints;
};

export const getCrossingPointBetweenPointAndPolygon = (corners: Point[], point: Point) => {
    const result: Point[] = [];
    for (let index = 1; index <= corners.length; index++) {
        let start = corners[index - 1];
        let end = index === corners.length ? corners[0] : corners[index];
        const crossingPoint = getCrossingPointsBetweenPointAndSegment(point, start, end);
        result.push(...crossingPoint);
    }
    return result;
};

export const getPolygonEdgeByConnectionPoint = (corners: Point[], point: Point) => {
    for (let index = 1; index <= corners.length; index++) {
        let start = corners[index - 1];
        let end = index === corners.length ? corners[0] : corners[index];
        if (isPointOnSegment(point, start, end)) {
            return [start, end] as [Point, Point];
        }
    }
    return null;
};
