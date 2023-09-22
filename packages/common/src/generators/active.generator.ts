import { PlaitBoard, PlaitElement, RectangleClient, createG, drawCircle, drawRectangle } from '@plait/core';
import { Generator } from './generator';
import { PRIMARY_COLOR, RESIZE_HANDLE_DIAMETER } from '../constants/default';
import { Options } from 'roughjs/bin/core';

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
    ActiveGeneratorOptions<T>
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

    baseDraw(element: T, data: ActiveGeneratorExtraData): SVGGElement {
        const activeG = createG();
        const rectangle = this.options.getRectangle(element);

        const delta = this.options.getStrokeWidth();
        const activeRectangle = RectangleClient.inflate(rectangle, delta);

        const strokeG = drawRectangle(this.board, activeRectangle, {
            stroke: PRIMARY_COLOR,
            strokeWidth: delta
        });

        activeG.append(strokeG);
        strokeG.style.opacity = `${this.options.getStrokeOpacity()}`;
        if (this.options.hasResizeHandle()) {
            this.hasResizeHandle = true;
            // resize handle
            const options: Options = { stroke: '#999999', strokeWidth: 1, fill: '#FFF', fillStyle: 'solid' };
            const leftTopHandleG = drawCircle(
                PlaitBoard.getRoughSVG(this.board),
                [activeRectangle.x, activeRectangle.y],
                RESIZE_HANDLE_DIAMETER,
                options
            );
            const rightTopHandleG = drawCircle(
                PlaitBoard.getRoughSVG(this.board),
                [activeRectangle.x + activeRectangle.width, activeRectangle.y],
                RESIZE_HANDLE_DIAMETER,
                options
            );
            const rightBottomHandleG = drawCircle(
                PlaitBoard.getRoughSVG(this.board),
                [activeRectangle.x + activeRectangle.width, activeRectangle.y + activeRectangle.height],
                RESIZE_HANDLE_DIAMETER,
                options
            );
            const leftBottomHandleG = drawCircle(
                PlaitBoard.getRoughSVG(this.board),
                [activeRectangle.x, activeRectangle.y + activeRectangle.height],
                RESIZE_HANDLE_DIAMETER,
                options
            );
            activeG.append(...[leftTopHandleG, rightTopHandleG, rightBottomHandleG, leftBottomHandleG]);
        } else {
            this.hasResizeHandle = false;
        }
        return activeG;
    }
}
