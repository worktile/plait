import { PlaitBoard } from '@plait/core';
import { getRectangleByPoints } from './base';
import { PlaitBaseShape } from '../interfaces/shape';

export const drawRectangle = (board: PlaitBoard, element: PlaitBaseShape) => {
    const rectangle = getRectangleByPoints(element.points!);
    const roughSVG = PlaitBoard.getRoughSVG(board);
    const recG = roughSVG.rectangle(rectangle.x, rectangle.y, rectangle.width, rectangle.height, {
        stroke: element.strokeColor,
        strokeWidth: element.strokeWidth
    });

    recG.querySelector('path')!.setAttribute('stroke-linecap', 'square');
    return recG;
};
