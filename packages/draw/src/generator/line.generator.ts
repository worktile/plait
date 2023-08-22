import { LineShape, PlaitLine } from '../interfaces';
import { Generator } from '@plait/common';
import { PlaitBoard } from '@plait/core';
import { getElbowPoints } from '../utils';

export interface ShapeData {}

export class LineShapeGenerator extends Generator<PlaitLine, ShapeData> {
    canDraw(element: PlaitLine, data: ShapeData): boolean {
        return true;
    }

    baseDraw(element: PlaitLine, data: ShapeData) {
        const shape = element.shape;
        const strokeWidth = element.strokeWidth;
        const strokeColor = element.strokeColor;
        switch (shape) {
            case LineShape.elbow:
                const points = getElbowPoints(element);
                this.g = PlaitBoard.getRoughSVG(this.board).linearPath(points, { stroke: strokeColor, strokeWidth });
                break;
            default:
                break;
        }
        return this.g;
    }
}
