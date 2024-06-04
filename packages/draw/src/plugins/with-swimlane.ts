import {
    isDragging,
    isMainPointer,
    PlaitBoard,
    PlaitPluginElementContext,
    PlaitPointerType,
    toHostPoint,
    toViewBoxPoint
} from '@plait/core';
import { PlaitDrawElement, PlaitSwimlane } from '../interfaces';
import { buildSwimlaneTable } from '../utils/swimlane';
import { TableComponent } from '../table.component';
import { withSwimlaneCreateByDrag, withSwimlaneCreateByDrawing } from './with-swimlane-create';
import { getHitCell, setSelectedCells, isSingleSelectSwimlane, getSelectedSwimlane } from '../utils';
import { PlaitBaseTable, PlaitTableBoard } from '../interfaces/table';

export const withSwimlane = (board: PlaitTableBoard) => {
    const { drawElement, buildTable, pointerUp } = board;

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

    board.pointerUp = (event: PointerEvent) => {
        const isSetSelectionPointer =
            PlaitBoard.isPointer(board, PlaitPointerType.selection) || PlaitBoard.isPointer(board, PlaitPointerType.hand);
        const isSkip = !isMainPointer(event) || isDragging(board) || !isSetSelectionPointer;
        if (isSkip) {
            pointerUp(event);
            return;
        }
        if (isSingleSelectSwimlane(board)) {
            const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const element = getSelectedSwimlane(board);
            const hitCell = getHitCell(board, element, point);
            if (hitCell && hitCell.text && hitCell.textHeight) {
                setSelectedCells(element, [hitCell]);
            }
        }
        pointerUp(event);
    };

    return withSwimlaneCreateByDrawing(withSwimlaneCreateByDrag(board));
};
