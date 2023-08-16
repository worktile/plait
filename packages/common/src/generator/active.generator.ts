import { PlaitBoard, PlaitElement, RectangleClient, createG } from '@plait/core';
import { Generator } from './generator';
import { PRIMARY_COLOR } from '../constants/default';
import { drawRectangle } from '../rectangle';

export interface ActiveExtraData {
    selected: boolean;
}

export interface ActiveOptions<T> {
    getRectangle: (element: T) => RectangleClient;
    activeStrokeWidth: number;
    getStrokeWidthByElement: (element: T) => number;
}

export class ActiveGenerator<T extends PlaitElement = PlaitElement> extends Generator<T, ActiveExtraData, ActiveOptions<T>> {
    constructor(public board: PlaitBoard, public options: ActiveOptions<T>) {
        super(board, options);
    }

    canDraw(element: T, data: ActiveExtraData): boolean {
        if (data.selected) {
            return true;
        } else {
            return false;
        }
    }

    baseDraw(element: T, data: ActiveExtraData): SVGGElement {
        const activeG = createG();
        this.g = activeG;

        const rectangle = this.options.getRectangle(element);
        // add 0.1 to avoid white gap
        const offset = (this.options.getStrokeWidthByElement(element) + this.options.activeStrokeWidth) / 2 - 0.1;
        const activeRectangle = RectangleClient.getOutlineRectangle(rectangle, -offset);

        const strokeG = drawRectangle(this.board, activeRectangle, {
            stroke: PRIMARY_COLOR,
            strokeWidth: this.options.activeStrokeWidth
        });
        this.g.appendChild(strokeG);
        return activeG;
    }
}
