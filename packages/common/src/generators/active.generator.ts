import { PlaitBoard, PlaitElement, RectangleClient, SELECTION_RECTANGLE_CLASS_NAME, createG, drawRectangle } from '@plait/core';
import { Generator, GeneratorOptions } from './generator';
import { PRIMARY_COLOR } from '../constants/default';
import { drawHandle } from '../utils/drawing';

export interface ActiveGeneratorExtraData {
    selected: boolean;
}

export interface ActiveGeneratorOptions<T> {
    getRectangle: (element: T) => RectangleClient;
    getStrokeWidth: () => number;
    getStrokeOpacity: () => number;
    hasResizeHandle: () => boolean;
}

export class ActiveGenerator<T extends PlaitElement = PlaitElement> extends Generator<
    T,
    ActiveGeneratorExtraData,
    ActiveGeneratorOptions<T> & GeneratorOptions
> {
    hasResizeHandle = false;

    constructor(public board: PlaitBoard, public options: ActiveGeneratorOptions<T>) {
        super(board, options);
    }

    canDraw(element: T, data: ActiveGeneratorExtraData): boolean {
        if (data.selected) {
            return true;
        } else {
            return false;
        }
    }

    draw(element: T, data: ActiveGeneratorExtraData): SVGGElement {
        const activeG = createG();
        const rectangle = this.options.getRectangle(element);

        const delta = this.options.getStrokeWidth();
        const activeRectangle = RectangleClient.inflate(rectangle, delta);

        const strokeG = drawRectangle(this.board, activeRectangle, {
            stroke: PRIMARY_COLOR,
            strokeWidth: delta
        });

        activeG.append(strokeG);
        strokeG.classList.add(SELECTION_RECTANGLE_CLASS_NAME);
        strokeG.style.opacity = `${this.options.getStrokeOpacity()}`;
        if (this.options.hasResizeHandle()) {
            this.hasResizeHandle = true;
            // draw resize handle
            RectangleClient.getCornerPoints(activeRectangle).forEach(corner => {
                const cornerHandleG = drawHandle(this.board, corner);
                activeG.append(cornerHandleG);
            });
        } else {
            this.hasResizeHandle = false;
        }
        return activeG;
    }
}
