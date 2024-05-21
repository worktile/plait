import { PlaitPluginElementContext } from '@plait/core';
import { PlaitDrawElement, PlaitSwimlane } from '../interfaces';
import { buildSwimlaneTable } from '../utils/swimlane';
import { PlaitTableBoard } from './with-table';
import { PlaitTable } from '../interfaces/table';
import { TableComponent } from '../table.component';

export const withSwimlane = (board: PlaitTableBoard) => {
    const { drawElement, buildTable } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitDrawElement.isSwimlane(context.element)) {
            return TableComponent;
        }
        return drawElement(context);
    };

    board.buildTable = (element: PlaitTable) => {
        if (PlaitDrawElement.isSwimlane(element)) {
            return buildSwimlaneTable(element as PlaitSwimlane);
        }
        return buildTable(element);
    };

    return board;
};
