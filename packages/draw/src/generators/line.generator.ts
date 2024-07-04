import { PlaitDrawElement } from '../interfaces';
import { Generator } from '@plait/common';
import { drawArrowLine } from '../utils/arrow-line/arrow-line-basic';
import { PlaitLine } from '../interfaces/line';
import { drawVectorLine } from '../utils';

export interface ShapeData {}

export class LineGenerator extends Generator<PlaitLine, ShapeData> {
    canDraw(element: PlaitLine, data: ShapeData): boolean {
        return true;
    }

    draw(element: PlaitLine, data: ShapeData) {
        let lineG: SVGGElement | undefined;
        if (PlaitDrawElement.isArrowLine(element)) {
            lineG = drawArrowLine(this.board, element);
        }
        if (PlaitDrawElement.isVectorLine(element)) {
            lineG = drawVectorLine(this.board, element);
        }
        return lineG;
    }
}
