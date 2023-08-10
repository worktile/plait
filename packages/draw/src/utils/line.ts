import { PlaitBoard, Point } from '@plait/core';
import { PlaitLine } from '../interfaces';

export const drawLine = (board: PlaitBoard, element: PlaitLine) => {
    const points = [element.source.connection, element.target.connection] as Point[];
    const roughSVG = PlaitBoard.getRoughSVG(board);
    const lineG = roughSVG.linearPath(points, {
        stroke: element.strokeColor,
        strokeWidth: element.strokeWidth
    });

    return lineG;
};
