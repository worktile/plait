import { Point } from 'roughjs/bin/geometry';
import { PlaitBoard } from '../interfaces/board';
import { PlaitElement } from '../interfaces/element';
import { getRectangleByElements } from './element';
import { SELECTION_BORDER_COLOR } from '../interfaces/selection';

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

export function createSelectionOuterG(board: PlaitBoard, selectElements: PlaitElement[]) {
    const { x, y, width, height } = getRectangleByElements(board, selectElements, false);
    const rough = PlaitBoard.getRoughSVG(board);
    return rough.rectangle(x - 2, y - 2, width + 4, height + 4, {
        stroke: SELECTION_BORDER_COLOR,
        strokeWidth: 1,
        fillStyle: 'solid'
    });
}
