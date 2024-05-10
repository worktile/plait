import { TableComponent } from '../table.component';
import { PlaitTableElement } from '../interfaces/table';
import {
    PlaitBoard,
    PlaitPluginElementContext,
    PlaitElement,
    RectangleClient,
    Selection,
    isPolylineHitRectangle,
    toViewBoxPoint,
    toHostPoint,
    getHitElementByPoint
} from '@plait/core';
import { getCellsWithPoints, getHitCell } from '../utils/table';
import { editText } from '../utils';
import { getFirstTextManage, getTextManages } from '@plait/common';

export const withTable = (board: PlaitBoard) => {
    const { drawElement, getRectangle, isRectangleHit, isHit, isMovable, dblClick } = board;
    board.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitTableElement.isTable(context.element)) {
            return TableComponent;
        }
        return drawElement(context);
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
            if (PlaitTableElement.isTable(hitElement)) {
                const hitCell = getHitCell(hitElement, point);
                if (hitCell && hitCell.text && hitCell.textHeight) {
                    const cellIndex = hitElement.cells.indexOf(hitCell);
                    const textManages = getTextManages(hitElement);
                    textManages[cellIndex]?.edit();
                }
            }
        }
        dblClick(event);
    };

    return board;
};
