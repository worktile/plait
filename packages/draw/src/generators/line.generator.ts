import { LineShape, PlaitLine } from '../interfaces';
import { Generator, getRectangleByPoints } from '@plait/common';
import { drawLine, getLinePoints, getLineTextRectangle } from '../utils';
import { PlaitBoard, RectangleClient, createMask, createRect } from '@plait/core';

export interface ShapeData {}

export class LineShapeGenerator extends Generator<PlaitLine, ShapeData> {
    canDraw(element: PlaitLine, data: ShapeData): boolean {
        return true;
    }

    baseDraw(element: PlaitLine, data: ShapeData) {
        const shape = element.shape;
        let lineG: SVGGElement | undefined;
        switch (shape) {
            case LineShape.elbow:
            case LineShape.straight:
                lineG = drawLine(this.board, element);
                drawMask(this.board, lineG, element);
                break;
            default:
                break;
        }
        return lineG;
    }
}

function drawMask(board: PlaitBoard, g: SVGElement, element: PlaitLine) {
    const mask = createMask();
    mask.setAttribute('id', element.id);
    g.setAttribute('mask', `url(#${element.id})`);
    const points = getLinePoints(board, element);
    let rectangle = getRectangleByPoints(points);
    rectangle = RectangleClient.getOutlineRectangle(rectangle, -30);
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
