import { PlaitBoard } from '@plait/core';
import { PlaitBaseLine } from '../interfaces';

export const drawLine = (board: PlaitBoard, element: PlaitBaseLine) => {
    const points = [element.source.connection, element.target.connection];
    const roughSVG = PlaitBoard.getRoughSVG(board);
    const lineG = roughSVG.linearPath(points, {
        stroke: element.strokeColor,
        strokeWidth: element.strokeWidth
    });

    return lineG;
};
