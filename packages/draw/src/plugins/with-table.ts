import { TableComponent } from '../table.component';
import { PlaitTable, PlaitTableElement } from '../interfaces/table';
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
    getHitElementByPoint,
    WritableClipboardContext,
    WritableClipboardOperationType,
    WritableClipboardType,
    addClipboardContext,
    createClipboardContext,
    ClipboardData,
    Point
} from '@plait/core';
import { editCell, getHitCell } from '../utils/table';
import { getElementsText } from '@plait/common';
import { getSelectedTableElements } from '../utils';
import { buildTableClipboardData, insertClipboardTableData } from '../utils/clipboard';
import { withTableResize } from './with-table-resize';

export interface PlaitTableBoard extends PlaitBoard {
    buildTable: (element: PlaitTable) => PlaitTable;
}

export const withTable = (board: PlaitBoard) => {
    const tableBoard = board as PlaitTableBoard;

    const {
        drawElement,
        getRectangle,
        isRectangleHit,
        isHit,
        isMovable,
        getDeletedFragment,
        dblClick,
        buildFragment,
        insertFragment
    } = tableBoard;

    tableBoard.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitTableElement.isTable(context.element)) {
            return TableComponent;
        }
        return drawElement(context);
    };

    tableBoard.getDeletedFragment = (data: PlaitElement[]) => {
        const elements = getSelectedElements(board);
        if (elements.length) {
            const tableElements = elements.filter(value => PlaitTableElement.isTable(value));
            data.push(...[...tableElements]);
        }
        return getDeletedFragment(data);
    };

    tableBoard.isHit = (element, point) => {
        if (PlaitTableElement.isTable(element)) {
            const client = RectangleClient.getRectangleByPoints(element.points);
            return RectangleClient.isPointInRectangle(client, point);
        }
        return isHit(element, point);
    };

    tableBoard.getRectangle = (element: PlaitElement) => {
        if (PlaitTableElement.isTable(element)) {
            return RectangleClient.getRectangleByPoints(element.points);
        }
        return getRectangle(element);
    };

    tableBoard.isMovable = (element: PlaitElement) => {
        if (PlaitTableElement.isTable(element)) {
            return true;
        }

        return isMovable(element);
    };

    tableBoard.isRectangleHit = (element: PlaitElement, selection: Selection) => {
        if (PlaitTableElement.isTable(element)) {
            const rangeRectangle = RectangleClient.getRectangleByPoints([selection.anchor, selection.focus]);
            return isPolylineHitRectangle(element.points, rangeRectangle);
        }
        return isRectangleHit(element, selection);
    };

    tableBoard.dblClick = (event: MouseEvent) => {
        event.preventDefault();
        if (!PlaitBoard.isReadonly(board)) {
            const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const hitElement = getHitElementByPoint(board, point);
            if (hitElement && PlaitTableElement.isTable(hitElement)) {
                const hitCell = getHitCell(tableBoard, hitElement, point);
                if (hitCell && hitCell.text && hitCell.textHeight) {
                    editCell(hitCell);
                }
            }
        }
        dblClick(event);
    };

    tableBoard.buildTable = (element: PlaitTable) => {
        return element;
    };

    tableBoard.buildFragment = (
        clipboardContext: WritableClipboardContext | null,
        rectangle: RectangleClient | null,
        operationType: WritableClipboardOperationType,
        originData?: PlaitElement[]
    ) => {
        const selectedElements = getSelectedTableElements(board, originData);
        if (selectedElements.length) {
            // TODO: 执行 getRelatedFragment 获取内部所有关联元素
            const elements = buildTableClipboardData(selectedElements, rectangle ? [rectangle.x, rectangle.y] : [0, 0]);
            const text = getElementsText(selectedElements);
            if (!clipboardContext) {
                clipboardContext = createClipboardContext(WritableClipboardType.elements, elements, text);
            } else {
                clipboardContext = addClipboardContext(clipboardContext, {
                    text,
                    type: WritableClipboardType.elements,
                    elements
                });
            }
        }
        return buildFragment(clipboardContext, rectangle, operationType, originData);
    };

    board.insertFragment = (clipboardData: ClipboardData | null, targetPoint: Point, operationType?: WritableClipboardOperationType) => {
        if (clipboardData?.elements?.length) {
            const tableElements = clipboardData.elements?.filter(value => PlaitTableElement.isTable(value)) as PlaitTable[];
            if (clipboardData.elements && clipboardData.elements.length > 0 && tableElements.length > 0) {
                // TODO: 修改内部关联元素的 tableId
                insertClipboardTableData(board, tableElements, targetPoint);
            }
        }

        insertFragment(clipboardData, targetPoint, operationType);
    };

    return withTableResize(tableBoard);
};
