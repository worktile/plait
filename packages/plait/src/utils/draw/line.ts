import { RoughSVG } from 'roughjs/bin/svg';
import { Point } from '../../interfaces/point';
import { Options } from 'roughjs/bin/core';

export function drawLine(rs: RoughSVG, start: Point, end: Point, options: Options): SVGGElement {
    return rs.linearPath([start, end], options);
}
