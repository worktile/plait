
import { GeometryShape, PlaitGeometry } from '../interfaces';
import { drawRectangle, getRectangleByPoints, Generator } from '@plait/common';

export interface ShapeData {}

export class GeometryShapeDrawer  extends Generator<PlaitGeometry, ShapeData> {
    canDraw(element: PlaitGeometry, data: ShapeData): boolean {
        return true;
    }

    baseDraw(element: PlaitGeometry, data: ShapeData) {
        const rectangle = getRectangleByPoints(element.points);
        const shape = element.shape;
        switch (shape) {
            case GeometryShape.rectangle:
                this.g = drawRectangle(this.board, rectangle, { stroke: element.strokeColor, strokeWidth: element.strokeWidth });
                break;
            default:
                break;
        }
        return this.g;
    }
}
