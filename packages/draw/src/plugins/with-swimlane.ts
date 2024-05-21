import {
    PlaitBoard,
    PlaitPluginElementContext,
    toViewBoxPoint,
    toHostPoint,
    getHitElementByPoint
} from '@plait/core';
import { editCell, getHitCell } from '../utils/table';
import { PlaitDrawElement, PlaitSwimlane } from '../interfaces';
import { SwimlaneComponent } from '../swimlane.component';
import { buildSwimlane } from '../utils/swimlane';

export const withSwimlane = (board: PlaitBoard) => {
    const { drawElement, dblClick } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitDrawElement.isSwimlane(context.element)) {
            return SwimlaneComponent;
        }
        return drawElement(context);
    };

    board.dblClick = (event: MouseEvent) => {
        event.preventDefault();
        if (!PlaitBoard.isReadonly(board)) {
            const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const hitElement = getHitElementByPoint(board, point);
            if (hitElement && PlaitDrawElement.isSwimlane(hitElement)) {
                const swimlaneElement = buildSwimlane(hitElement as PlaitSwimlane);
                const hitCell = getHitCell(swimlaneElement, point);
                if (hitCell && hitCell.text && hitCell.textHeight) {
                    editCell(hitCell);
                    return;
                }
            }
        }
        dblClick(event);
    };

    return board;
};
