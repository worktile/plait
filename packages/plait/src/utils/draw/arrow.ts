import { rotate } from '../math';
import { RoughSVG } from 'roughjs/bin/svg';
import { Options } from 'roughjs/bin/core';
import { Point } from '../../interfaces';

const degree = 20;
const rotateLine = 20;

export function arrowPoints(start: Point, end: Point) {
    const width = Math.abs(start[0] - end[0]);
    const height = Math.abs(start[1] - end[1]);
    let line = Math.hypot(width, height);
    const realRotateLine = line > rotateLine * 2 ? rotateLine : line / 2;
    const rotateWidth = (realRotateLine / line) * width;
    const rotateHeight = (realRotateLine / line) * height;
    const rotatePoint = [
        end[0] > start[0] ? end[0] - rotateWidth : end[0] + rotateWidth,
        end[1] > start[1] ? end[1] - rotateHeight : end[1] + rotateHeight
    ];
    const pointRight = rotate(rotatePoint[0], rotatePoint[1], end[0], end[1], (degree * Math.PI) / 180) as Point;
    const pointLeft = rotate(rotatePoint[0], rotatePoint[1], end[0], end[1], (-degree * Math.PI) / 180) as Point;
    return { pointLeft, pointRight };
}

/**
 *
 * @param rs RoughSVG
 * @param start Point
 * @param end Point
 * @param options Options
 * @returns SVGGElement[]
 */
export function drawArrow(rs: RoughSVG, start: Point, end: Point, options: Options): SVGGElement[] {
    const { pointLeft, pointRight } = arrowPoints(start, end);
    const arrowLineLeft = rs.linearPath([pointLeft, end], options);
    const arrowLineRight = rs.linearPath([pointRight, end], options);
    return [arrowLineLeft, arrowLineRight];
}
