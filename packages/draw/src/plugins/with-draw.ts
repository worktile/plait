import { PlaitBoard, PlaitPluginElementContext } from '@plait/core';
import { GeometryComponent } from '../geometry.component';
import { LineComponent } from '../line.component';
import { PlaitDrawElement } from '../interfaces';

export const withDraw = (board: PlaitBoard) => {
    const { drawElement } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitDrawElement.isGeometry(context.element)) {
            return GeometryComponent;
        } else if (PlaitDrawElement.isLine(context.element)) {
            return LineComponent;
        }
        return drawElement(context);
    };

    return board;
};
