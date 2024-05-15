import { TableComponent } from '../table.component';
import { PlaitTableElement } from '../interfaces/table';
import {
    PlaitBoard,
    PlaitPluginElementContext,
    PlaitElement,
    RectangleClient,
    Selection,
    isPolylineHitRectangle,
    getSelectedElements,
    toViewBoxPoint,
    toHostPoint,
    getHitElementByPoint
} from '@plait/core';
import { editCell, getHitCell } from '../utils/table';

export const withTable = (board: PlaitBoard) => {
    const { drawElement, getRectangle, isRectangleHit, isHit, isMovable, getDeletedFragment, dblClick } = board;
    board.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitTableElement.isTable(context.element)) {
            return TableComponent;
        }
        return drawElement(context);
    };

    board.getDeletedFragment = (data: PlaitElement[]) => {
        const elements = getSelectedElements(board);
        if (elements.length) {
            const tableElements = elements.filter(value => PlaitTableElement.isTable(value));
            data.push(...[...tableElements]);
        }
        return getDeletedFragment(data);
    };

    board.isHit = (element, point) => {
        if (PlaitTableElement.isTable(element)) {
            const client = RectangleClient.getRectangleByPoints(element.points);
            return RectangleClient.isPointInRectangle(client, point);
        }
        return isHit(element, point);
    };

    board.getRectangle = (element: PlaitElement) => {
        if (PlaitTableElement.isTable(element)) {
            return RectangleClient.getRectangleByPoints(element.points);
        }
        return getRectangle(element);
    };

    board.isMovable = (element: PlaitElement) => {
        if (PlaitTableElement.isTable(element)) {
            return true;
        }

        return isMovable(element);
    };

    board.isRectangleHit = (element: PlaitElement, selection: Selection) => {
        if (PlaitTableElement.isTable(element)) {
            const rangeRectangle = RectangleClient.getRectangleByPoints([selection.anchor, selection.focus]);
            return isPolylineHitRectangle(element.points, rangeRectangle);
        }
        return isRectangleHit(element, selection);
    };

    board.dblClick = (event: MouseEvent) => {
        event.preventDefault();
        if (!PlaitBoard.isReadonly(board)) {
            const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const hitElement = getHitElementByPoint(board, point);
            if (hitElement && PlaitTableElement.isTable(hitElement)) {
                const hitCell = getHitCell(hitElement, point);
                if (hitCell && hitCell.text && hitCell.textHeight) {
                    editCell(hitCell);
                }
            }
        }
        dblClick(event);
    };
    
    return board;
};
