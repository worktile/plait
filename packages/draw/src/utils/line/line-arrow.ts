import { Point, arrowPoints, createG, createPath, distanceBetweenPointAndPoint, drawLinearPath, rotate } from '@plait/core';
import { LineMarkerType, PlaitArrowLine, PlaitLine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getExtendPoint, getUnitVectorByPointAndPoint } from '@plait/common';
import { getStrokeWidthByElement } from '../common';

interface ArrowOptions {
    marker: LineMarkerType;
    source: Point;
    target: Point;
    isSource: boolean;
}
const ARROW_LENGTH = 20;

export const drawLineArrow = (element: PlaitArrowLine, points: Point[], options: Options) => {
    const arrowG = createG();
    if (PlaitLine.isSourceMark(element, LineMarkerType.none) && PlaitLine.isTargetMark(element, LineMarkerType.none)) {
        return null;
    }
    const strokeWidth = getStrokeWidthByElement(element);
    const offset = (strokeWidth * strokeWidth) / 3;
    if (points.length === 1) {
        points = [points[0], [points[0][0] + 0.1, points[0][1]]];
    }

    if (!PlaitLine.isSourceMark(element, LineMarkerType.none)) {
        const source = getExtendPoint(points[0], points[1], ARROW_LENGTH + offset);
        const sourceArrow = getArrow(element, { marker: element.source.marker, source, target: points[0], isSource: true }, options);
        sourceArrow && arrowG.appendChild(sourceArrow);
    }
    if (!PlaitLine.isTargetMark(element, LineMarkerType.none)) {
        const source = getExtendPoint(points[points.length - 1], points[points.length - 2], ARROW_LENGTH + offset);
        const arrow = getArrow(
            element,
            { marker: element.target.marker, source, target: points[points.length - 1], isSource: false },
            options
        );

        arrow && arrowG.appendChild(arrow);
    }
    return arrowG;
};

const getArrow = (element: PlaitArrowLine, arrowOptions: ArrowOptions, options: Options) => {
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

const drawArrow = (element: PlaitArrowLine, source: Point, target: Point, options: Options) => {
    const unitVector = getUnitVectorByPointAndPoint(source, target);
    const strokeWidth = getStrokeWidthByElement(element);
    const endPoint: Point = [target[0] + (strokeWidth * unitVector[0]) / 2, target[1] + (strokeWidth * unitVector[1]) / 2];
    const distance = distanceBetweenPointAndPoint(...source, ...endPoint);
    const middlePoint: Point = [
        endPoint[0] - (((distance * 3) / 5 + strokeWidth) / 2) * unitVector[0],
        endPoint[1] - (((distance * 3) / 5 + strokeWidth) / 2) * unitVector[1]
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

const drawOpenTriangle = (element: PlaitArrowLine, source: Point, target: Point, options: Options) => {
    const unitVector = getUnitVectorByPointAndPoint(source, target);
    const strokeWidth = getStrokeWidthByElement(element);
    const endPoint: Point = [target[0] + (strokeWidth * unitVector[0]) / 2, target[1] + (strokeWidth * unitVector[1]) / 2];
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
