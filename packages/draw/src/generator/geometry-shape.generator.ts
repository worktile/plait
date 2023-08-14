import { GeometryShape, PlaitGeometry } from '../interfaces';
import { drawRectangle, getRectangleByPoints, Generator } from '@plait/common';
import { getStrokeColorByElement, getStrokeWidthByElement } from '../utils/geometry-style/stroke';

export interface ShapeData {}

export class GeometryShapeGenerator extends Generator<PlaitGeometry, ShapeData> {
    canDraw(element: PlaitGeometry, data: ShapeData): boolean {
        return true;
    }

    baseDraw(element: PlaitGeometry, data: ShapeData) {
        const rectangle = getRectangleByPoints(element.points);
        const shape = element.shape;
        const strokeWidth = getStrokeWidthByElement(this.board, element);
        const strokeColor = getStrokeColorByElement(this.board, element);
        switch (shape) {
            case GeometryShape.rectangle:
                this.g = drawRectangle(this.board, rectangle, { stroke: strokeColor, strokeWidth });
                break;
            default:
                break;
        }
        return this.g;
    }
}
