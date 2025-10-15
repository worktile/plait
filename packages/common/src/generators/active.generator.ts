import {
    ACTIVE_STROKE_WIDTH,
    PlaitBoard,
    PlaitElement,
    RectangleClient,
    SELECTION_RECTANGLE_CLASS_NAME,
    createG,
    drawRectangle,
    toActiveRectangleFromViewBoxRectangle
} from '@plait/core';
import { Generator, GeneratorOptions } from './generator';
import { PRIMARY_COLOR } from '../constants/default';
import { drawHandle } from '../utils/drawing';

export interface ActiveGeneratorExtraData {
    selected: boolean;
}

export interface ActiveGeneratorOptions<T> extends GeneratorOptions {
    getRectangle: (element: T) => RectangleClient;
    getStrokeWidth: () => number;
    getStrokeOpacity: () => number;
    hasResizeHandle: () => boolean;
    active: true;
}

export const createActiveGenerator = <T extends PlaitElement = PlaitElement>(
    board: PlaitBoard,
    options: Omit<ActiveGeneratorOptions<T>, 'active'>
) => {
    return new ActiveGenerator<T>(board, { ...options, active: true });
};

export class ActiveGenerator<T extends PlaitElement = PlaitElement> extends Generator<
    T,
    ActiveGeneratorExtraData,
    ActiveGeneratorOptions<T>
> {
    static key = 'active-generator';

    hasResizeHandle = false;

    constructor(public board: PlaitBoard, public options: ActiveGeneratorOptions<T>) {
        super(board, { ...options });
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
        const activeRectangle = toActiveRectangleFromViewBoxRectangle(this.board, this.options.getRectangle(element));

        const delta = this.options.getStrokeWidth() * this.board.viewport.zoom;
        const activeRectangleWithDelta = RectangleClient.inflate(activeRectangle, delta);

        const strokeG = drawRectangle(this.board, activeRectangleWithDelta, {
            stroke: PRIMARY_COLOR,
            strokeWidth: ACTIVE_STROKE_WIDTH
        });

        activeG.append(strokeG);
        strokeG.classList.add(SELECTION_RECTANGLE_CLASS_NAME);
        strokeG.style.opacity = `${this.options.getStrokeOpacity()}`;
        if (this.options.hasResizeHandle()) {
            this.hasResizeHandle = true;
            // draw resize handle
            RectangleClient.getCornerPoints(activeRectangleWithDelta).forEach((corner) => {
                const cornerHandleG = drawHandle(this.board, corner);
                activeG.append(cornerHandleG);
            });
        } else {
            this.hasResizeHandle = false;
        }
        return activeG;
    }
}
