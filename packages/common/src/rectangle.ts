import { PlaitBoard, Point } from '@plait/core';
import { Options } from 'roughjs/bin/core';
import { RectangleClient } from './interfaces';

export const drawRectangle = (board: PlaitBoard, rectangle: RectangleClient, options: Options) => {
    const roughSVG = PlaitBoard.getRoughSVG(board);
    const rectangleG = roughSVG.rectangle(rectangle.x, rectangle.y, rectangle.width, rectangle.height, options);
    rectangleG.querySelector('path')!.setAttribute('stroke-linecap', 'square');
    return rectangleG;
};

export const getRectangleByPoints = (points: [Point, Point]) => {
    return {
        x: points[0][0],
        y: points[0][1],
        width: points[1][0] - points[0][0],
        height: points[1][1] - points[0][1]
    } as RectangleClient;
};
