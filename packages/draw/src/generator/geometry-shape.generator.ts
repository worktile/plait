import { GeometryShape, PlaitGeometry } from '../interfaces';
import { drawRectangle, getRectangleByPoints, Generator } from '@plait/common';
import { getStrokeColorByElement, getStrokeWidthByElement } from '../utils/geometry-style/stroke';
import { PlaitBoard, drawRoundRectangle } from '@plait/core';
import { drawDiamond, drawEllipse } from '../utils';

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
        switch (shape) {
            case GeometryShape.rectangle:
                this.g = drawRectangle(this.board, outerRectangle, { stroke: strokeColor, strokeWidth });
                break;
            case GeometryShape.roundRectangle:
                this.g = drawRoundRectangle(
                    PlaitBoard.getRoughSVG(this.board),
                    outerRectangle.x,
                    outerRectangle.y,
                    outerRectangle.x + outerRectangle.width,
                    outerRectangle.y + outerRectangle.height,
                    { stroke: strokeColor, strokeWidth },
                    false,
                    Math.min(outerRectangle.width * 0.1, outerRectangle.height * 0.1)
                );
                break;
            case GeometryShape.diamond:
                this.g = drawDiamond(this.board, outerRectangle, { stroke: strokeColor, strokeWidth });
                break;
            case GeometryShape.ellipse:
                this.g = drawEllipse(this.board, outerRectangle, { stroke: strokeColor, strokeWidth });
                break;
            default:
                break;
        }
        return this.g;
    }
}
