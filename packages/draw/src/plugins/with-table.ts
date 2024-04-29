import { PlaitBoard, PlaitPluginElementContext } from '@plait/core';
import { PlaitDrawElement, SwimlaneSymbols } from '../interfaces';
import { TableComponent } from '../table.component';

export const withTable = (board: PlaitBoard) => {
    const { drawElement } = board;
    board.drawElement = (context: PlaitPluginElementContext) => {
        if (
            PlaitDrawElement.isGeometry(context.element) &&
            [SwimlaneSymbols.horizontal, SwimlaneSymbols.vertical].includes(context.element.shape as SwimlaneSymbols)
        ) {
            return TableComponent;
        }
        return drawElement(context);
    };
};
