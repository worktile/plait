import { LineShape, PlaitLine } from '../interfaces';
import { Generator, getRectangleByPoints } from '@plait/common';
import { drawElbowLine, getElbowPoints, getLineTextRectangle } from '../utils';
import { PlaitBoard, RectangleClient, createMask, createRect } from '@plait/core';

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
                drawMask(this.board, this.g, element);
                break;
            default:
                break;
        }
        return this.g;
    }
}

function drawMask(board: PlaitBoard, g: SVGElement, element: PlaitLine) {
    const mask = createMask();
    mask.setAttribute('id', element.id);
    const points = getElbowPoints(board, element);
    let rectangle = getRectangleByPoints(points);
    rectangle = RectangleClient.getOutlineRectangle(rectangle, -3);
    const maskRect = createRect(rectangle, {
        fill: 'white'
    });
    mask.appendChild(maskRect);

    const texts = element.texts;
    texts.forEach((text, index) => {
        const textRectangle = getLineTextRectangle(board, element, index);
        const rect = createRect(textRectangle, {
            fill: 'black'
        });
        mask.appendChild(rect);
    });
    g.appendChild(mask);
}
