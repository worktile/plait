import { PlaitBoard } from '@plait/core';
import { PlaitBaseGeometry } from '../interfaces/geometry';
import { Point } from '@plait/core';

export const getRectangleByPoints = (points: Point[]) => {
    return {
        x: points[0][0],
        y: points[0][1],
        width: points[1][0] - points[0][0],
        height: points[1][1] - points[0][1]
    };
};

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
