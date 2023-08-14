import { NS } from './common';

export function createForeignObject(x: number, y: number, width: number, height: number) {
    var newForeignObject = document.createElementNS(NS, 'foreignObject');
    newForeignObject.setAttribute('x', `${x}`);
    newForeignObject.setAttribute('y', `${y}`);
    newForeignObject.setAttribute('width', `${width}`);
    newForeignObject.setAttribute('height', `${height}`);
    return newForeignObject;
}

export function updateForeignObject(g: SVGGElement, width: number, height: number, x: number, y: number) {
    const foreignObject = g.querySelector('foreignObject');
    if (foreignObject) {
        foreignObject.setAttribute('width', `${width}`);
        foreignObject.setAttribute('height', `${height}`);
        foreignObject.setAttribute('x', `${x}`);
        foreignObject.setAttribute('y', `${y}`);
    }
}
