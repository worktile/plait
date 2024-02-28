import { Generator } from '@plait/common';
import { drawRectangle } from '@plait/core';
import { PlaitGroup } from '../interfaces/group';
import { getRectangleByGroup } from '../utils/group';

export interface ShapeData {}

export class GroupGenerator extends Generator<PlaitGroup, ShapeData> {
    canDraw(element: PlaitGroup, data: ShapeData): boolean {
        return true;
    }

    draw(element: PlaitGroup, data: ShapeData) {
        const rectangle = getRectangleByGroup(this.board, element);
        return drawRectangle(this.board, rectangle, { stroke: '', strokeWidth: 0, fill: '' });
    }
}
