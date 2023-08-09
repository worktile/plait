import { PlaitBoard, PlaitPluginElementContext } from '@plait/core';
import { PlaitDraw } from '../utils/base';
import { GeometryComponent } from '../geometry.component';
import { LineComponent } from '../line.component';

export const withDraw = (board: PlaitBoard) => {
    const { drawElement } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitDraw.isGeometry(context.element)) {
            return GeometryComponent;
        } else if (PlaitDraw.isLine(context.element)) {
            return LineComponent;
        }
        return drawElement(context);
    };

    return board;
};
