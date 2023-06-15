import { PlaitBoard } from '@plait/core';
import { MindElement } from '../interfaces';

export abstract class BaseDrawer<T = undefined> {
    g?: SVGGElement;

    constructor(protected board: PlaitBoard) {}

    draw(element: MindElement, parentG: SVGGElement, data?: T) {
        this.destroy();
        if (this.canDraw && this.canDraw(element, data)) {
            const g = this.baseDraw(element, data);
            if (g) {
                parentG.append(g);
            }
            if (hasAfterDraw(this)) {
                this.afterDraw(element);
            }
        }
    }

    abstract canDraw(element: MindElement, data?: T): boolean;

    abstract baseDraw(element: MindElement, data?: T): SVGGElement | undefined;

    destroy() {
        if (this.g) {
            this.g.remove();
        }
    }
}

export interface AfterDraw {
    afterDraw(element: MindElement): void;
}

export function hasAfterDraw(value: any): value is AfterDraw {
    if (value.afterDraw) {
        return true;
    }
    return false;
}
