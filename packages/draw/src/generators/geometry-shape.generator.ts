import { BasicShapes, PlaitGeometry } from '../interfaces';
import { Generator, getStrokeLineDash } from '@plait/common';
import { getFillByElement, getStrokeColorByElement, getStrokeStyleByElement } from '../utils/style/stroke';
import { drawGeometry, getStrokeWidthByElement } from '../utils';
import { RectangleClient } from '@plait/core';

export interface ShapeData {}

export class GeometryShapeGenerator extends Generator<PlaitGeometry, ShapeData> {
    canDraw(element: PlaitGeometry, data: ShapeData): boolean {
        return true;
    }

    draw(element: PlaitGeometry, data: ShapeData) {
        const rectangle = RectangleClient.getRectangleByPoints(element.points);
        const shape = element.shape;
        if (shape === BasicShapes.text) {
            return;
        }
        const fill = getFillByElement(this.board, element);
        const strokeWidth = getStrokeWidthByElement(element);
        const strokeColor = getStrokeColorByElement(this.board, element);
        const strokeStyle = getStrokeStyleByElement(this.board, element);
        const strokeLineDash = getStrokeLineDash(strokeStyle, strokeWidth);
        return drawGeometry(this.board, RectangleClient.inflate(rectangle, -strokeWidth), shape, {
            stroke: strokeColor,
            strokeWidth,
            fill,
            strokeLineDash
        });
    }
}
