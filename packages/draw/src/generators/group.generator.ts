import { BasicShapes, PlaitGeometry } from '../interfaces';
import { Generator } from '@plait/common';
import { getFillByElement, getLineDashByElement, getStrokeColorByElement, getStrokeWidthByElement } from '../utils/style/stroke';
import { drawGeometry } from '../utils';
import { RectangleClient, drawRectangle } from '@plait/core';
import { PlaitGroup } from '../interfaces/group';
import { getGroupRectangle } from '../utils/group';

export interface ShapeData {}

export class GroupGenerator extends Generator<PlaitGroup, ShapeData> {
    canDraw(element: PlaitGroup, data: ShapeData): boolean {
        return true;
    }

    draw(element: PlaitGroup, data: ShapeData) {
        const rectangle = getGroupRectangle(this.board, element);
        return drawRectangle(this.board, rectangle, { stroke: '', strokeWidth: 0, fill: '' });
    }
}
