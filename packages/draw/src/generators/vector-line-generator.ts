import { PlaitVectorLine } from '../interfaces';
import { Generator } from '@plait/common';
import { drawVectorLine } from '../utils';

export class VectorLineGenerator extends Generator<PlaitVectorLine> {
    canDraw(element: PlaitVectorLine): boolean {
        return true;
    }

    draw(element: PlaitVectorLine) {
        let lineG: SVGGElement | undefined;
        lineG = drawVectorLine(this.board, element);
        return lineG;
    }
}
