import { PlaitArrowLine } from '../interfaces';
import { Generator } from '@plait/common';
import { drawArrowLine } from '../utils/arrow-line/arrow-line-basic';

export interface ShapeData {}

export class ArrowLineShapeGenerator extends Generator<PlaitArrowLine, ShapeData> {
    canDraw(element: PlaitArrowLine, data: ShapeData): boolean {
        return true;
    }

    draw(element: PlaitArrowLine, data: ShapeData) {
        let lineG: SVGGElement | undefined;
        lineG = drawArrowLine(this.board, element);
        return lineG;
    }
}
