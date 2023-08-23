import { Point, idCreator, distanceBetweenPointAndSegments, PlaitBoard, createG, arrowPoints, drawLinearPath } from '@plait/core';
import { getPoints, Direction } from '@plait/common';
import { LineHandle, LineMarkerType, LineShape, PlaitLine } from '../interfaces';
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

export const getElbowPoints = (element: PlaitLine) => {
    if (element.points.length === 2) {
        const source = element.points[0];
        const target = element.points[1];
        const points: Point[] = getPoints(source, Direction.right, target, Direction.left, 0);
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
    const points = getElbowPoints(element);
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
        const endPoint = points[0];
        const { pointLeft, pointRight } = arrowPoints(points[1], endPoint, 10, 20);
        const sourceArrow = drawLinearPath([pointLeft, endPoint, pointRight], options);
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
