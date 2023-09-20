import { Point, arrowPoints, createG, createPath, drawLinearPath } from '@plait/core';
import { LineMarkerType, PlaitLine } from '../interfaces';
import { Options } from 'roughjs/bin/core';
import { getFactorByPoints } from '@plait/common';

export const BOUNDED_HANDLE_OFFSET = 0.5;

export const drawLineArrow = (element: PlaitLine, points: Point[], options: Options) => {
    const arrowG = createG();
    if (PlaitLine.isSourceMark(element, LineMarkerType.none) && PlaitLine.isTargetMark(element, LineMarkerType.none)) {
        return null;
    }
    if (!PlaitLine.isSourceMark(element, LineMarkerType.none)) {
        const sourceArrow = getArrow(element.target.marker, points[1], points[0], options);
        sourceArrow && arrowG.appendChild(sourceArrow);
    }
    if (!PlaitLine.isTargetMark(element, LineMarkerType.none)) {
        const arrow = getArrow(element.target.marker, points[points.length - 2], points[points.length - 1], options);
        arrow && arrowG.appendChild(arrow);
    }
    return arrowG;
};

const getArrow = (marker: LineMarkerType, source: Point, target: Point, options: Options) => {
    let targetArrow;
    switch (marker) {
        case LineMarkerType.openTriangle: {
            targetArrow = drawOpenTriangle(source, target, options);
            break;
        }
        case LineMarkerType.solidTriangle: {
            targetArrow = drawSolidTriangle(source, target, options);
            break;
        }
        case LineMarkerType.arrow: {
            targetArrow = drawArrow(source, target, options);
            break;
        }
    }
    return targetArrow;
};

const drawArrow = (source: Point, target: Point, options: Options) => {
    const directionFactor = getFactorByPoints(source, target);
    const startPoint: Point = [
        target[0] + BOUNDED_HANDLE_OFFSET * directionFactor.x,
        target[1] + BOUNDED_HANDLE_OFFSET * directionFactor.y
    ];
    const { pointLeft, pointRight } = arrowPoints(source, target, 12, 20);

    const g = createG();
    const path = createPath();

    let polylinePath = `M${pointRight[0]},${pointRight[1]}A8,8,20,0,1,${pointLeft[0]},${pointLeft[1]}L${startPoint[0]},${startPoint[1]}Z`;

    path.setAttribute('d', polylinePath);
    path.setAttribute('stroke', `${options?.stroke}`);
    path.setAttribute('stroke-width', `${options?.strokeWidth}`);
    path.setAttribute('fill', `${options?.stroke}`);
    g.appendChild(path);

    return g;
};

const drawSolidTriangle = (source: Point, target: Point, options: Options) => {
    const directionFactor = getFactorByPoints(source, target);
    const startPoint: Point = [
        target[0] + BOUNDED_HANDLE_OFFSET * directionFactor.x,
        target[1] + BOUNDED_HANDLE_OFFSET * directionFactor.y
    ];
    const { pointLeft, pointRight } = arrowPoints(source, target, 12, 20);
    return drawLinearPath([pointLeft, startPoint, pointRight], { ...options, fill: options.stroke }, true);
};

const drawOpenTriangle = (source: Point, target: Point, options: Options) => {
    const directionFactor = getFactorByPoints(source, target);
    const startPoint: Point = [
        target[0] + BOUNDED_HANDLE_OFFSET * directionFactor.x,
        target[1] + BOUNDED_HANDLE_OFFSET * directionFactor.y
    ];
    const { pointLeft, pointRight } = arrowPoints(source, target, 12, 40);
    return drawLinearPath([pointLeft, startPoint, pointRight], options);
};
