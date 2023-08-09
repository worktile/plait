import { PlaitBoard } from '@plait/core';
import { getRectangleByPoints } from './base';
import { PlaitBaseGeometry } from '../interfaces/geometry';

export const drawRectangle = (board: PlaitBoard, element: PlaitBaseGeometry) => {
    const rectangle = getRectangleByPoints(element.points!);
    const roughSVG = PlaitBoard.getRoughSVG(board);
    const rectangleG = roughSVG.rectangle(rectangle.x, rectangle.y, rectangle.width, rectangle.height, {
        stroke: element.strokeColor,
        strokeWidth: element.strokeWidth
    });

    rectangleG.querySelector('path')!.setAttribute('stroke-linecap', 'square');
    return rectangleG;
};
