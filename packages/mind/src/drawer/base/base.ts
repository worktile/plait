import { PlaitBoard } from '@plait/core';
import { MindElement } from '../../interfaces';

export abstract class BaseDrawer {
    g?: SVGGElement;

    constructor(protected board: PlaitBoard) {}

    abstract canDraw(element: MindElement): boolean;

    abstract draw(element: MindElement): SVGGElement | undefined;

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
