import { PlaitBoard, PlaitElement } from '@plait/core';

export interface GeneratorExtraData {}

export interface GeneratorOptions {}

export abstract class Generator<
    T extends PlaitElement = PlaitElement,
    K extends GeneratorExtraData = GeneratorExtraData,
    V extends GeneratorOptions = GeneratorOptions
> {
    g?: SVGGElement;

    constructor(protected board: PlaitBoard, options?: V) {}

    draw(element: T, parentG: SVGGElement, data?: K) {
        if (this.canDraw && this.canDraw(element, data)) {
            const g = this.baseDraw(element, data);
            if (g) {
                if (this.g) {
                    this.g.replaceWith(g);
                } else {
                    parentG.appendChild(g);
                }
                this.g = g;
            } else {
                this.destroy();    
            }
            if (hasAfterDraw(this)) {
                this.afterDraw(element);
            }
        } else {
            this.destroy();
        }
    }

    abstract canDraw(element: T, data?: K): boolean;

    abstract baseDraw(element: T, data?: K): SVGGElement | undefined;

    destroy() {
        if (this.g) {
            this.g.remove();
            this.g = undefined;
        }
    }
}

export interface AfterDraw<T extends PlaitElement = PlaitElement> {
    afterDraw(element: T): void;
}

export function hasAfterDraw(value: any): value is AfterDraw {
    if (value.afterDraw) {
        return true;
    }
    return false;
}
