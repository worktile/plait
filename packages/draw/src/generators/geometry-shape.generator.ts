import { BasicShapes, PlaitGeometry } from '../interfaces';
import { getRectangleByPoints, Generator } from '@plait/common';
import { getFillByElement, getLineDashByElement, getStrokeColorByElement, getStrokeWidthByElement } from '../utils/style/stroke';
import { drawGeometry } from '../utils';
import { RectangleClient } from '@plait/core';

export interface ShapeData {}

export class GeometryShapeGenerator extends Generator<PlaitGeometry, ShapeData> {
    canDraw(element: PlaitGeometry, data: ShapeData): boolean {
        return true;
    }

    baseDraw(element: PlaitGeometry, data: ShapeData) {
        const rectangle = getRectangleByPoints(element.points);
        const shape = element.shape;
        if (shape === BasicShapes.text) {
            return;
        }
        const strokeWidth = getStrokeWidthByElement(element);
        const strokeColor = getStrokeColorByElement(this.board, element);
        const fill = getFillByElement(this.board, element);
        const strokeLineDash = getLineDashByElement(element);
        return drawGeometry(this.board, RectangleClient.inflate(rectangle, -strokeWidth), shape, {
            stroke: strokeColor,
            strokeWidth,
            fill,
            strokeLineDash
        });
    }
}
