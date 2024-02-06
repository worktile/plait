import { rotate } from '../math';
import { RoughSVG } from 'roughjs/bin/svg';
import { Options } from 'roughjs/bin/core';
import { Point } from '../../interfaces';

export function arrowPoints(start: Point, end: Point, degree = 40) {
    const width = Math.abs(start[0] - end[0]);
    const height = Math.abs(start[1] - end[1]);
    let hypotenuse = Math.hypot(width, height); // 斜边
    const realRotateLine = hypotenuse / 2;
    const rotateWidth = (realRotateLine / hypotenuse) * width;
    const rotateHeight = (realRotateLine / hypotenuse) * height;
    const rotatePoint = [
        end[0] > start[0] ? end[0] - rotateWidth : end[0] + rotateWidth,
        end[1] > start[1] ? end[1] - rotateHeight : end[1] + rotateHeight
    ];
    const pointRight = rotate(rotatePoint[0], rotatePoint[1], end[0], end[1], (degree * Math.PI) / 180) as Point;
    const pointLeft = rotate(rotatePoint[0], rotatePoint[1], end[0], end[1], (-degree * Math.PI) / 180) as Point;
    return { pointLeft, pointRight };
}

export function drawArrow(rs: RoughSVG, start: Point, end: Point, options: Options, maxHypotenuseLength = 10, degree = 40): SVGGElement[] {
    const { pointLeft, pointRight } = arrowPoints(start, end, degree);
    const arrowLineLeft = rs.linearPath([pointLeft, end], options);
    const arrowLineRight = rs.linearPath([pointRight, end], options);
    return [arrowLineLeft, arrowLineRight];
}
