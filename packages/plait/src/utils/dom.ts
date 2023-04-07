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

export function createSVG() {
    const svg = document.createElementNS(NS, 'svg');
    return svg;
}

export function createText(x: number, y: number, fill: string, textContent: string) {
    var text = document.createElementNS(NS, 'text');
    text.setAttribute('x', `${x}`);
    text.setAttribute('y', `${y}`);
    text.setAttribute('fill', fill);
    text.textContent = textContent;
    return text;
}
