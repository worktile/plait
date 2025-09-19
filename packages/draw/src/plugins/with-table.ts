import { TableComponent } from '../table.component';
import { PlaitBaseTable, PlaitTableBoard } from '../interfaces/table';
import {
    PlaitBoard,
    PlaitPluginElementContext,
    PlaitElement,
    RectangleClient,
    Selection,
    isLineHitRectangle,
    toViewBoxPoint,
    toHostPoint,
    getHitElementByPoint,
    getSelectedElements,
    PlaitPointerType,
    isDragging,
    isMainPointer,
    distanceBetweenPointAndPoint,
    HIT_DISTANCE_BUFFER
} from '@plait/core';
import { editCell, getHitCell } from '../utils/table';
import { withTableResize } from './with-table-resize';
import { isVirtualKey, isDelete, isSpaceHotkey } from '@plait/common';
import { PlaitDrawElement } from '../interfaces';
import { getSelectedCells, getSelectedTableElements, isHitEdgeOfShape, isSingleSelectTable, setSelectedCells } from '../utils';
import { TableEngine } from '../engines/table/table';

export const withTable = (board: PlaitBoard) => {
    const tableBoard = board as PlaitTableBoard;

    const { drawElement, getRectangle, isRectangleHit, isHit, isMovable, dblClick, keyDown, pointerUp } = tableBoard;

    tableBoard.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitDrawElement.isElementByTable(context.element)) {
            return TableComponent;
        }
        return drawElement(context);
    };

    tableBoard.isHit = (element, point, isStrict?: boolean) => {
        if (PlaitDrawElement.isElementByTable(element)) {
            const client = RectangleClient.getRectangleByPoints(element.points);
            const nearestPoint = TableEngine.getNearestPoint(client, point);
            const distance = distanceBetweenPointAndPoint(nearestPoint[0], nearestPoint[1], point[0], point[1]);
            return distance <= HIT_DISTANCE_BUFFER || RectangleClient.isPointInRectangle(client, point);
        }
        return isHit(element, point, isStrict);
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
            const client = RectangleClient.getRectangleByPoints(element.points);
            return isLineHitRectangle(RectangleClient.getCornerPoints(client), rangeRectangle);
        }
        return isRectangleHit(element, selection);
    };

    tableBoard.keyDown = (event: KeyboardEvent) => {
        const selectedElements = getSelectedElements(board);
        const isSingleSelection = selectedElements.length === 1;
        const targetElement = selectedElements[0];
        if (
            !PlaitBoard.isReadonly(board) &&
            !PlaitBoard.hasBeenTextEditing(tableBoard) &&
            !isVirtualKey(event) &&
            !isDelete(event) &&
            !isSpaceHotkey(event) &&
            isSingleSelection
        ) {
            event.preventDefault();
            if (PlaitDrawElement.isElementByTable(targetElement)) {
                const cells = getSelectedCells(targetElement);
                let cell = targetElement.cells.find((item) => item.text);
                if (cells?.length) {
                    cell = cells.find((item) => item.text);
                }
                if (cell) {
                    editCell(board, cell);
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
                if (hitCell && hitCell.text) {
                    editCell(board, hitCell);
                    return;
                }
            }
        }
        dblClick(event);
    };

    tableBoard.pointerUp = (event: PointerEvent) => {
        const isSetSelectionPointer =
            PlaitBoard.isPointer(tableBoard, PlaitPointerType.selection) || PlaitBoard.isPointer(tableBoard, PlaitPointerType.hand);
        const isSkip = !isMainPointer(event) || isDragging(tableBoard) || !isSetSelectionPointer;
        if (isSkip) {
            pointerUp(event);
            return;
        }
        if (isSingleSelectTable(tableBoard)) {
            const point = toViewBoxPoint(tableBoard, toHostPoint(tableBoard, event.x, event.y));
            const element = getSelectedTableElements(tableBoard)[0];
            const hitCell = getHitCell(tableBoard, element, point);
            if (hitCell && hitCell.text) {
                setSelectedCells(element, [hitCell]);
            }
        }
        pointerUp(event);
    };

    tableBoard.buildTable = (element: PlaitBaseTable) => {
        return element;
    };

    return withTableResize(tableBoard);
};
