import { PlaitLine } from '../interfaces';
import { Generator } from '@plait/common';
import { drawLine } from '../utils';

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
