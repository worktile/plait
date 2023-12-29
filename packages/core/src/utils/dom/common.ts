import { Options } from 'roughjs/bin/core';
import { POINTER_BUTTON } from '../../constants';
import { RectangleClient } from '../../interfaces';

export const NS = 'http://www.w3.org/2000/svg';

export function createG() {
    const newG = document.createElementNS(NS, 'g');
    return newG;
}

export function createPath() {
    const newG = document.createElementNS(NS, 'path');
    return newG;
}

export function createRect(rectangle: RectangleClient, options?: Options) {
    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('x', `${rectangle.x}`);
    rect.setAttribute('y', `${rectangle.y}`);
    rect.setAttribute('width', `${rectangle.width}`);
    rect.setAttribute('height', `${rectangle.height}`);
    for (let key in options) {
        const optionKey = key as keyof Options;
        rect.setAttribute(key, `${options[optionKey]}`);
    }
    return rect;
}

export const setStrokeLinecap = (g: SVGGElement, value: 'round' | 'square') => {
    g.setAttribute('stroke-linecap', value);
};

export const setPathStrokeLinecap = (g: SVGGElement, value: 'round' | 'square') => {
    g.querySelectorAll('path').forEach(path => {
        path.setAttribute('stroke-linecap', value);
    });
};

export function createMask() {
    return document.createElementNS(NS, 'mask');
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

export const isSecondaryPointer = (event: MouseEvent) => {
    return event.button === POINTER_BUTTON.SECONDARY;
};

export const isMainPointer = (event: MouseEvent) => {
    return event.button === POINTER_BUTTON.MAIN;
};
