import { ACTIVE_STROKE_WIDTH, PlaitGroup, RectangleClient, drawRectangle, getRectangleByGroup } from '@plait/core';
import { Options } from 'roughjs/bin/core';
import { Generator } from './generator';

export class GroupGenerator extends Generator<PlaitGroup> {
    canDraw(element: PlaitGroup): boolean {
        return true;
    }

    draw(element: PlaitGroup, partialSelected: boolean) {
        const options: Options = {
            stroke: '',
            strokeWidth: ACTIVE_STROKE_WIDTH,
            strokeLineDash: [5]
        };
        let rectangle: RectangleClient = { x: 0, y: 0, width: 0, height: 0 };
        if (partialSelected) {
            options.stroke = '#999';
            rectangle = getRectangleByGroup(this.board, element, true);
        }
        return drawRectangle(this.board, rectangle, options);
    }
}
