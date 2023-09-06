import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { Options } from 'roughjs/bin/core';

export const drawRectangle = (board: PlaitBoard, rectangle: RectangleClient, options: Options) => {
    const roughSVG = PlaitBoard.getRoughSVG(board);
    const rectangleG = roughSVG.rectangle(rectangle.x, rectangle.y, rectangle.width, rectangle.height, options);
    rectangleG.querySelector('path')!.setAttribute('stroke-linecap', 'square');
    return rectangleG;
};

export const getRectangleByPoints = (points: Point[]) => {
    let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
    points.forEach(point => {
        minX = Math.min(point[0], minX);
        maxX = Math.max(point[0], maxX);
        minY = Math.min(point[1], minY);
        maxY = Math.max(point[1], maxY);
    });

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
};
