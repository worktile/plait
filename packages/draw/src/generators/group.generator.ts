import { Generator } from '@plait/common';
import { ACTIVE_STROKE_WIDTH, PlaitGroup, drawRectangle, getRectangleByGroup } from '@plait/core';
import { Options } from 'roughjs/bin/core';

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
        if (partialSelected) {
            options.stroke = '#999';
        }
        const rectangle = getRectangleByGroup(this.board, element, true);
        return drawRectangle(this.board, rectangle, options);
    }
}
