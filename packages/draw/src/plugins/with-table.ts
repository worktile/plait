import { TableComponent } from '../table.component';
import { PlaitBaseTable, PlaitTableBoard } from '../interfaces/table';
import {
    PlaitBoard,
    PlaitPluginElementContext,
    PlaitElement,
    RectangleClient,
    Selection,
    isPolylineHitRectangle,
    toViewBoxPoint,
    toHostPoint,
    getHitElementByPoint,
    getSelectedElements
} from '@plait/core';
import { editCell, getHitCell } from '../utils/table';
import { withTableResize } from './with-table-resize';
import { isVirtualKey, isDelete, isSpaceHotkey } from '@plait/common';
import { PlaitDrawElement } from '../interfaces';

export const withTable = (board: PlaitBoard) => {
    const tableBoard = board as PlaitTableBoard;

    const { drawElement, getRectangle, isRectangleHit, isHit, isMovable, dblClick, keyDown } = tableBoard;

    tableBoard.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitDrawElement.isElementByTable(context.element)) {
            return TableComponent;
        }
        return drawElement(context);
    };

    tableBoard.isHit = (element, point) => {
        if (PlaitDrawElement.isElementByTable(element)) {
            const client = RectangleClient.getRectangleByPoints(element.points);
            return RectangleClient.isPointInRectangle(client, point);
        }
        return isHit(element, point);
    };

    tableBoard.getRectangle = (element: PlaitElement) => {
        if (PlaitDrawElement.isElementByTable(element)) {
            return RectangleClient.getRectangleByPoints(element.points);
        }
        return getRectangle(element);
    };

    tableBoard.isMovable = (element: PlaitElement) => {
        if (PlaitDrawElement.isElementByTable(element)) {
            return true;
        }

        return isMovable(element);
    };

    tableBoard.isRectangleHit = (element: PlaitElement, selection: Selection) => {
        if (PlaitDrawElement.isElementByTable(element)) {
            const rangeRectangle = RectangleClient.getRectangleByPoints([selection.anchor, selection.focus]);
            return isPolylineHitRectangle(element.points, rangeRectangle);
        }
        return isRectangleHit(element, selection);
    };

    tableBoard.keyDown = (event: KeyboardEvent) => {
        const selectedElements = getSelectedElements(board);
        const isSingleSelection = selectedElements.length === 1;
        const targetElement = selectedElements[0];
        if (!PlaitBoard.isReadonly(board) && !isVirtualKey(event) && !isDelete(event) && !isSpaceHotkey(event) && isSingleSelection) {
            event.preventDefault();
            if (PlaitDrawElement.isElementByTable(targetElement)) {
                const firstTextCell = targetElement.cells.find(item => item.text && item.textHeight);
                if (firstTextCell) {
                    editCell(firstTextCell);
                    return;
                }
            }
        }
        keyDown(event);
    };

    tableBoard.dblClick = (event: MouseEvent) => {
        event.preventDefault();
        if (!PlaitBoard.isReadonly(board)) {
            const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const hitElement = getHitElementByPoint(board, point);
            if (hitElement && PlaitDrawElement.isElementByTable(hitElement)) {
                const hitCell = getHitCell(tableBoard, hitElement, point);
                if (hitCell && hitCell.text && hitCell.textHeight) {
                    editCell(hitCell);
                    return;
                }
            }
        }
        dblClick(event);
    };

    tableBoard.buildTable = (element: PlaitBaseTable) => {
        return element;
    };

    return withTableResize(tableBoard);
};
