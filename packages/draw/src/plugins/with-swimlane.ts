import { PlaitPluginElementContext } from '@plait/core';
import { PlaitDrawElement, PlaitSwimlane } from '../interfaces';
import { buildSwimlaneTable } from '../utils/swimlane';
import { TableComponent } from '../table.component';
import { withSwimlaneCreateByDrag, withSwimlaneCreateByDrawing } from './with-swimlane-create';
import { PlaitBaseTable, PlaitTableBoard } from '../interfaces/table';

export const withSwimlane = (board: PlaitTableBoard) => {
    const { drawElement, buildTable, getElementsByTable } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitDrawElement.isSwimlane(context.element)) {
            return TableComponent;
        }
        return drawElement(context);
    };

    board.buildTable = (element: PlaitBaseTable) => {
        if (PlaitDrawElement.isSwimlane(element)) {
            return buildSwimlaneTable(element as PlaitSwimlane);
        }
        return buildTable(element);
    };

    board.getElementsByTable = (elements: PlaitBaseTable[] = []) => {
        const swimlaneElements = board.children.filter(item => PlaitDrawElement.isSwimlane(item));
        return getElementsByTable ? getElementsByTable([...elements, ...swimlaneElements] as PlaitBaseTable[]) : [...elements, ...swimlaneElements] as PlaitBaseTable[];
    };

    return withSwimlaneCreateByDrawing(withSwimlaneCreateByDrag(board));
};
