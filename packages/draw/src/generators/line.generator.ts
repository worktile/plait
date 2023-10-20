import { LineShape, PlaitLine } from '../interfaces';
import { Generator, getRectangleByPoints } from '@plait/common';
import { drawLine, getLinePoints, getLineTextRectangle } from '../utils';
import { PlaitBoard, RectangleClient, createMask, createRect } from '@plait/core';

export interface ShapeData {}

export class LineShapeGenerator extends Generator<PlaitLine, ShapeData> {
    canDraw(element: PlaitLine, data: ShapeData): boolean {
        return true;
    }

    baseDraw(element: PlaitLine, data: ShapeData) {
        let lineG: SVGGElement | undefined;
        lineG = drawLine(this.board, element);

        return lineG;
    }
}
