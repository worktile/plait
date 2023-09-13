import { NS } from './common';

export function createForeignObject(x: number, y: number, width: number, height: number) {
    var newForeignObject = document.createElementNS(NS, 'foreignObject');
    newForeignObject.setAttribute('x', `${x}`);
    newForeignObject.setAttribute('y', `${y}`);
    newForeignObject.setAttribute('width', `${width}`);
    newForeignObject.setAttribute('height', `${height}`);
    return newForeignObject;
}

export function updateForeignObject(target: SVGForeignObjectElement | SVGGElement, width: number, height: number, x: number, y: number) {
    const foreignObject = target instanceof SVGForeignObjectElement ? target : target.querySelector('foreignObject');
    if (foreignObject) {
        foreignObject.setAttribute('width', `${width}`);
        foreignObject.setAttribute('height', `${height}`);
        foreignObject.setAttribute('x', `${x}`);
        foreignObject.setAttribute('y', `${y}`);
    }
}

export function updateForeignObjectWidth(target: SVGForeignObjectElement | SVGGElement, width: number) {
    const foreignObject = target instanceof SVGForeignObjectElement ? target : target.querySelector('foreignObject');
    if (foreignObject) {
        foreignObject.setAttribute('width', `${width}`);
    }
}
