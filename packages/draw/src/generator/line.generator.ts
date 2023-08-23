import { LineShape, PlaitLine } from '../interfaces';
import { Generator } from '@plait/common';
import { drawElbowLine } from '../utils';

export interface ShapeData {}

export class LineShapeGenerator extends Generator<PlaitLine, ShapeData> {
    canDraw(element: PlaitLine, data: ShapeData): boolean {
        return true;
    }

    baseDraw(element: PlaitLine, data: ShapeData) {
        const shape = element.shape;
        switch (shape) {
            case LineShape.elbow:
                this.g = drawElbowLine(this.board, element);
                break;
            default:
                break;
        }
        return this.g;
    }
}
