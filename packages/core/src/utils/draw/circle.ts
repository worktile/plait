import { RoughSVG } from 'roughjs/bin/svg';
import { Point } from '../../interfaces/point';
import { Options } from 'roughjs/bin/core';

export function drawCircle(roughSVG: RoughSVG, point: Point, diameter: number, options: Options): SVGGElement {
    return roughSVG.circle(point[0], point[1], diameter, options);
}
