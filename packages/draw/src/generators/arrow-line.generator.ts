import { PlaitArrowLine } from '../interfaces';
import { Generator } from '@plait/common';
import { drawArrowLine } from '../utils/arrow-line/arrow-line-basic';

export class ArrowLineGenerator extends Generator<PlaitArrowLine> {
    canDraw(element: PlaitArrowLine): boolean {
        return true;
    }

    draw(element: PlaitArrowLine) {
        let lineG: SVGGElement | undefined;
        lineG = drawArrowLine(this.board, element);
        return lineG;
    }
}
