import { RoughSVG } from 'roughjs/bin/svg';
import { Point } from '../../interfaces/point';
import { Options } from 'roughjs/bin/core';
import { createG, createPath } from '../dom/common';

const isFinitePoint = (point: unknown): point is Point => {
    return Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]);
};

export function drawLine(rs: RoughSVG, start: Point, end: Point, options: Options): SVGGElement {
    if (!isFinitePoint(start) || !isFinitePoint(end)) {
        return createG();
    }
    return rs.linearPath([start, end], options);
}

export function drawLinearPath(points: Point[], options?: Options, closePath?: boolean) {
    const g = createG();
    const path = createPath();

    let polylinePath = '';
    const safePoints = (points || []).filter(isFinitePoint);
    if (!safePoints.length) {
        return g;
    }
    safePoints.forEach((point, index) => {
        if (index === 0) {
            polylinePath += `M ${point[0]} ${point[1]} `;
        } else {
            polylinePath += `L ${point[0]} ${point[1]} `;
        }
    });

    if (closePath) {
        polylinePath += 'Z';
    }

    path.setAttribute('d', polylinePath);
    path.setAttribute('stroke', `${options?.stroke}`);
    path.setAttribute('stroke-width', `${options?.strokeWidth}`);
    path.setAttribute('fill', `${options?.fill || 'none'}`);
    options?.strokeLineDash && path.setAttribute('stroke-dasharray', `${options.strokeLineDash}`);
    g.appendChild(path);
    return g;
}

export function drawBezierPath(points: Point[], options?: Options) {
    const g = createG();
    const path = createPath();

    let polylinePath = '';
    if (points?.length && isFinitePoint(points[0])) {
        for (let i = 0; i < points.length - 3; i += 3) {
            if (i === 0) {
                polylinePath += `M ${points[0][0]} ${points[0][1]} `;
            } else if (isFinitePoint(points[i + 1]) && isFinitePoint(points[i + 2]) && isFinitePoint(points[i + 3])) {
                polylinePath += `C ${points[i + 1][0]} ${points[i + 1][1]}, ${points[i + 2][0]} ${points[i + 2][1]}, ${points[i + 3][0]} ${
                    points[i + 3][1]
                }`;
            }
        }
    }

    if (polylinePath) {
        path.setAttribute('d', polylinePath);
    }
    path.setAttribute('stroke', `${options?.stroke}`);
    path.setAttribute('stroke-width', `${options?.strokeWidth}`);
    path.setAttribute('fill', `none`);
    g.appendChild(path);

    return g;
}
