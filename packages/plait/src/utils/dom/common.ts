import { Point } from '../../interfaces/point';

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

/**
 * Check if a DOM node is an element node.
 */
export const isDOMElement = (value: any): value is Element => {
    return isDOMNode(value) && value.nodeType === 1;
};

/**
 * Check if a value is a DOM node.
 */
export const isDOMNode = (value: any): value is Node => {
    return value instanceof window.Node;
};

export const hasInputOrTextareaTarget = (target: EventTarget | null) => {
    if (isDOMElement(target)) {
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            return true;
        }
    }
    return false;
};
