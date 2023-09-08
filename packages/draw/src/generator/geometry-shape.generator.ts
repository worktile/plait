import { PlaitGeometry } from '../interfaces';
import { getRectangleByPoints, Generator } from '@plait/common';
import { getStrokeColorByElement, getStrokeWidthByElement } from '../utils/geometry-style/stroke';
import { drawGeometry } from '../utils';

export interface ShapeData {}

export class GeometryShapeGenerator extends Generator<PlaitGeometry, ShapeData> {
    canDraw(element: PlaitGeometry, data: ShapeData): boolean {
        return true;
    }

    baseDraw(element: PlaitGeometry, data: ShapeData) {
        const outerRectangle = getRectangleByPoints(element.points);
        const shape = element.shape;
        const strokeWidth = getStrokeWidthByElement(this.board, element);
        const strokeColor = getStrokeColorByElement(this.board, element);
        this.g = drawGeometry(this.board, outerRectangle, shape, { stroke: strokeColor, strokeWidth });
        return this.g;
    }
}
