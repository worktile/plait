import { RoughSVG } from 'roughjs/bin/svg';
import { Point } from '../../interfaces/point';
import { Options } from 'roughjs/bin/core';
import { createG, createPath } from '../dom/common';

export function drawLine(rs: RoughSVG, start: Point, end: Point, options: Options): SVGGElement {
    return rs.linearPath([start, end], options);
}

export function drawLinearPath(points: Point[], options?: Options) {
    const g = createG();
    const path = createPath();

    let polylinePath = '';
    points.forEach((point, index) => {
        if (index === 0) {
            polylinePath += `M ${point[0]} ${point[1]} `;
        } else {
            polylinePath += `L ${point[0]} ${point[1]} `;
        }
    });

    path.setAttribute('d', polylinePath);
    path.setAttribute('stroke', `${options?.stroke}`);
    path.setAttribute('stroke-width', `${options?.strokeWidth}`);
    path.setAttribute('fill', `none`);
    g.appendChild(path);

    return g;
}
