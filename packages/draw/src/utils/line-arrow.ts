import { Point, arrowPoints, createG, createPath, distanceBetweenPointAndPoint, drawLinearPath, rotate } from '@plait/core';
import { LineMarkerType, PlaitLine } from '../interfaces';
import { Options } from 'roughjs/bin/core';
import { getFactorByPoints, getExtendPoint } from '@plait/common';
import { getStrokeWidthByElement } from './style';

interface ArrowOptions {
    marker: LineMarkerType;
    source: Point;
    target: Point;
    isSource: boolean;
}

const MAX_LENGTH = 100;

export const drawLineArrow = (element: PlaitLine, points: Point[], options: Options) => {
    const arrowG = createG();
    if (PlaitLine.isSourceMark(element, LineMarkerType.none) && PlaitLine.isTargetMark(element, LineMarkerType.none)) {
        return null;
    }
    const strokeWidth = getStrokeWidthByElement(element);
    const offset = (strokeWidth * strokeWidth) / 3;

    if (!PlaitLine.isSourceMark(element, LineMarkerType.none)) {
        const source = getExtendPoint(points[0], points[1], 24 + offset);
        const sourceArrow = getArrow(element, { marker: element.source.marker, source, target: points[0], isSource: true }, options);
        sourceArrow && arrowG.appendChild(sourceArrow);
    }
    if (!PlaitLine.isTargetMark(element, LineMarkerType.none)) {
        const source = getExtendPoint(points[points.length - 1], points[points.length - 2], 24 + offset);
        const arrow = getArrow(
            element,
            { marker: element.target.marker, source, target: points[points.length - 1], isSource: false },
            options
        );

        arrow && arrowG.appendChild(arrow);
    }
    return arrowG;
};

const getArrow = (element: PlaitLine, arrowOptions: ArrowOptions, options: Options) => {
    const { marker, target, source, isSource } = arrowOptions;
    let targetArrow;
    switch (marker) {
        case LineMarkerType.openTriangle: {
            targetArrow = drawOpenTriangle(element, source, target, options);
            break;
        }
        case LineMarkerType.solidTriangle: {
            targetArrow = drawSolidTriangle(source, target, options);
            break;
        }
        case LineMarkerType.arrow: {
            targetArrow = drawArrow(element, source, target, options);
            break;
        }
        case LineMarkerType.sharpArrow: {
            targetArrow = drawSharpArrow(source, target, options);
            break;
        }
        case LineMarkerType.oneSideUp: {
            targetArrow = drawOneSideArrow(source, target, isSource ? 'down' : 'up', options);
            break;
        }
        case LineMarkerType.oneSideDown: {
            targetArrow = drawOneSideArrow(source, target, isSource ? 'up' : 'down', options);
            break;
        }
        case LineMarkerType.hollowTriangle: {
            targetArrow = drawHollowTriangleArrow(source, target, options);
            break;
        }
        case LineMarkerType.singleSlash: {
            targetArrow = drawSingleSlash(source, target, isSource, options);
            break;
        }
    }
    return targetArrow;
};

const drawSharpArrow = (source: Point, target: Point, options: Options) => {
    const startPoint: Point = target;
    const { pointLeft, pointRight } = arrowPoints(source, target, 20);
    const g = createG();
    const path = createPath();
    let polylinePath = `M${pointRight[0]},${pointRight[1]}A25,25,20,0,1,${pointLeft[0]},${pointLeft[1]}L${startPoint[0]},${startPoint[1]}Z`;
    path.setAttribute('d', polylinePath);
    path.setAttribute('stroke', `${options?.stroke}`);
    path.setAttribute('stroke-width', `${options?.strokeWidth}`);
    path.setAttribute('fill', `${options?.stroke}`);
    g.appendChild(path);
    return g;
};

const drawArrow = (element: PlaitLine, source: Point, target: Point, options: Options) => {
    const directionFactor = getFactorByPoints(source, target);
    const strokeWidth = getStrokeWidthByElement(element);
    const endPoint: Point = [target[0] + (strokeWidth * directionFactor.x) / 2, target[1] + (strokeWidth * directionFactor.y) / 2];
    const middlePoint: Point = [
        endPoint[0] - (8 + strokeWidth / 2) * directionFactor.x,
        endPoint[1] - (8 + strokeWidth / 2) * directionFactor.y
    ];
    const { pointLeft, pointRight } = arrowPoints(source, endPoint, 30);
    const arrowG = drawLinearPath([pointLeft, endPoint, pointRight, middlePoint], { ...options, fill: options.stroke }, true);
    const path = arrowG.querySelector('path');
    path!.setAttribute('stroke-linejoin', 'round');
    return arrowG;
};

const drawSolidTriangle = (source: Point, target: Point, options: Options) => {
    const endPoint: Point = target;
    const { pointLeft, pointRight } = arrowPoints(source, endPoint, 30);
    return drawLinearPath([pointLeft, endPoint, pointRight], { ...options, fill: options.stroke }, true);
};

const drawOpenTriangle = (element: PlaitLine, source: Point, target: Point, options: Options) => {
    const directionFactor = getFactorByPoints(source, target);
    const strokeWidth = getStrokeWidthByElement(element);
    const endPoint: Point = [target[0] + (strokeWidth * directionFactor.x) / 2, target[1] + (strokeWidth * directionFactor.y) / 2];
    const { pointLeft, pointRight } = arrowPoints(source, endPoint, 40);
    return drawLinearPath([pointLeft, endPoint, pointRight], options);
};

const drawOneSideArrow = (source: Point, target: Point, side: string, options: Options) => {
    const { pointLeft, pointRight } = arrowPoints(source, target, 40);
    return drawLinearPath([side === 'up' ? pointRight : pointLeft, target], options);
};

const drawSingleSlash = (source: Point, target: Point, isSource: boolean, options: Options) => {
    const length = distanceBetweenPointAndPoint(...source, ...target);
    const middlePoint = getExtendPoint(target, source, length / 2);
    const angle = isSource ? 120 : 60;
    const start = rotate(...source, ...middlePoint, (angle * Math.PI) / 180) as Point;
    const end = rotate(...target, ...middlePoint, (angle * Math.PI) / 180) as Point;
    return drawLinearPath([start, end], options);
};

const drawHollowTriangleArrow = (source: Point, target: Point, options: Options) => {
    const { pointLeft, pointRight } = arrowPoints(source, target, 30);
    return drawLinearPath([pointLeft, pointRight, target], { ...options, fill: 'white' }, true);
};
