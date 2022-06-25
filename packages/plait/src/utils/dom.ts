import { Point } from 'roughjs/bin/geometry';

export const NS = 'http://www.w3.org/2000/svg';

export function toPoint(x: number, y: number, container: SVGElement): Point {
    const rect = container.getBoundingClientRect();
    return [x - rect.x, y - rect.y];
}

export function createG() {
    const newG = document.createElementNS(NS, 'g');
    return newG;
}
