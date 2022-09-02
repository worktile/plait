import { ComponentRef, ViewContainerRef } from '@angular/core';
import { PlaitRichtextComponent } from '../richtext/richtext.component';
import { Element as SlateElement } from 'slate';

export const NS = 'http://www.w3.org/2000/svg';

export function createG() {
    const newG = document.createElementNS(NS, 'g');
    return newG;
}

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

export function createRichtext(element: SlateElement, viewContainerRef: ViewContainerRef, edit: boolean) {
    const componentRef = viewContainerRef.createComponent(PlaitRichtextComponent);
    componentRef.instance.plaitValue = element;
    componentRef.instance.plaitReadonly = edit ? false : true;
    return componentRef;
}

export function drawRichtext(
    x: number,
    y: number,
    width: number,
    height: number,
    value: SlateElement,
    viewContainerRef: ViewContainerRef,
    classList: string[] = [],
    edit = false
) {
    const richtextG = createG();
    const foreignObject = createForeignObject(x, y, width, height);
    richtextG.append(foreignObject);
    const richtextComponentRef = createRichtext(value, viewContainerRef, edit);
    foreignObject.append(richtextComponentRef.instance.editable);
    classList.forEach(name => {
        richtextComponentRef.instance.editable.classList.add(name);
    });
    return { richtextComponentRef, richtextG, foreignObject };
}

export function updateEditStatus(richtextComponentRef: ComponentRef<PlaitRichtextComponent>, edit: boolean) {
    richtextComponentRef.instance.plaitReadonly = edit ? false : true;
    richtextComponentRef.changeDetectorRef.markForCheck();
}

export function updateRichText(element: SlateElement, richtextComponentRef: ComponentRef<PlaitRichtextComponent>) {
    richtextComponentRef.instance.plaitValue = element;
    return richtextComponentRef;
}
