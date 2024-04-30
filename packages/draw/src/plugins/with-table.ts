import { PlaitBoard, PlaitElement, PlaitPluginElementContext, RectangleClient } from '@plait/core';
import { TableComponent } from '../table.component';
import { PlaitTableElement } from '../interfaces/table';

export const withTable = (board: PlaitBoard) => {
    const { drawElement, getRectangle } = board;
    board.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitTableElement.isTable(context.element)) {
            return TableComponent;
        }
        return drawElement(context);
    };

    board.getRectangle = (element: PlaitElement) => {
        if (PlaitTableElement.isTable(element)) {
            return RectangleClient.getRectangleByPoints(element.points);
        }
        return getRectangle(element);
    };
    return board;
};
