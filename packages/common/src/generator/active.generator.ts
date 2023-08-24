import { PlaitBoard, PlaitElement, Point, RectangleClient, createG, drawCircle } from '@plait/core';
import { Generator } from './generator';
import { PRIMARY_COLOR, RESIZE_HANDLE_DIAMETER } from '../constants/default';
import { drawRectangle } from '../utils/rectangle';
import { Options } from 'roughjs/bin/core';

export interface ActiveGeneratorExtraData {
    selected: boolean;
}

export interface ActiveGeneratorOptions<T> {
    getRectangle: (element: T) => RectangleClient;
    activeStrokeWidth: number;
    getStrokeWidthByElement: (element: T) => number;
}

export class ActiveGenerator<T extends PlaitElement = PlaitElement> extends Generator<T, ActiveGeneratorExtraData, ActiveGeneratorOptions<T>> {
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
        this.g = activeG;
        const rectangle = this.options.getRectangle(element);

        // add 0.1 to avoid white gap
        const offset = (this.options.getStrokeWidthByElement(element) + this.options.activeStrokeWidth) / 2 - 0.1;
        const activeRectangle = RectangleClient.getOutlineRectangle(rectangle, -offset);

        const strokeG = drawRectangle(this.board, activeRectangle, {
            stroke: PRIMARY_COLOR,
            strokeWidth: this.options.activeStrokeWidth
        });

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
        this.g.append(...[strokeG, leftTopHandleG, rightTopHandleG, rightBottomHandleG, leftBottomHandleG]);
        return activeG;
    }
}
