import { findElements, PlaitBoard, PlaitElement, Point, RectangleClient, Transforms } from '@plait/core';
import { PlaitTable, PlaitTableCell, PlaitTableCellWithPoints, PlaitTableElement } from '../interfaces/table';
import { getTextManage } from '../generators/text.generator';
import { PlaitDrawElement } from '../interfaces';

export function getCellsWithPoints(table: PlaitTable): PlaitTableCellWithPoints[] {
    const rectangle = RectangleClient.getRectangleByPoints(table.points);
    const columnsCount = table.columns.length;
    const rowsCount = table.rows.length;
    const cellWidths = calculateCellsSize(table.columns, rectangle.width, columnsCount, true);
    const cellHeights = calculateCellsSize(table.rows, rectangle.height, rowsCount, false);

    const cells: PlaitTableCellWithPoints[] = table.cells.map(cell => {
        const rowIdx = table.rows.findIndex(row => row.id === cell.rowId);
        const columnIdx = table.columns.findIndex(column => column.id === cell.columnId);

        let cellTopLeftX = rectangle.x;
        for (let i = 0; i < columnIdx; i++) {
            cellTopLeftX += cellWidths[i];
        }

        let cellTopLeftY = rectangle.y;
        for (let i = 0; i < rowIdx; i++) {
            cellTopLeftY += cellHeights[i];
        }

        const cellWidth = calculateCellSize(cell, cellWidths, columnIdx, true);
        const cellBottomRightX = cellTopLeftX + cellWidth;

        const cellHeight = calculateCellSize(cell, cellHeights, rowIdx, false);
        const cellBottomRightY = cellTopLeftY + cellHeight;

        return {
            ...cell,
            points: [
                [cellTopLeftX, cellTopLeftY],
                [cellBottomRightX, cellBottomRightY]
            ]
        };
    });

    return cells;
}

function calculateCellsSize(items: { id: string; [key: string]: any }[], tableSize: number, count: number, isWidth: boolean) {
    const cellSizes: number[] = [];
    const sizeType = isWidth ? 'width' : 'height';

    // The remaining size of the table excluding cells with already set sizes.
    let totalSizeRemaining = tableSize;

    items.forEach((item, index) => {
        if (item[sizeType]) {
            cellSizes[index] = item[sizeType];
            totalSizeRemaining -= item[sizeType];
        }
    });

    // Divide the remaining size equally.
    const remainingItemCount = count - cellSizes.filter(item => !!item).length;
    const remainingCellSize = remainingItemCount > 0 ? totalSizeRemaining / remainingItemCount : 0;
    for (let i = 0; i < count; i++) {
        if (!cellSizes[i]) {
            cellSizes[i] = remainingCellSize;
        }
    }
    return cellSizes;
}

function calculateCellSize(cell: PlaitTableCell, sizes: number[], index: number, isWidth: boolean) {
    const span = isWidth ? cell.colspan || 1 : cell.rowspan || 1;
    let size = 0;
    for (let i = 0; i < span; i++) {
        const cellIndex = index + i;
        size += sizes[cellIndex];
    }
    return size;
}

export function getHitCell(table: PlaitTable, point: Point) {
    const cells = getCellsWithPoints(table);
    const rectangle = RectangleClient.getRectangleByPoints([point, point]);
    const cell = cells.find(item => {
        const cellRectangle = RectangleClient.getRectangleByPoints(item.points);
        return RectangleClient.isHit(rectangle, cellRectangle);
    });
    if (cell) {
        return table.cells.find(item => item.id === cell.id);
    }
    return null;
}

export function editCell(cell: PlaitTableCell) {
    const textManage = getTextManageByCell(cell);
    textManage && textManage.edit();
}

export function getTextManageByCell(cell: PlaitTableCell) {
    return getTextManage(cell.id);
}

export function getHitTable(tableElements: PlaitTable[], points: Point[]) {
    return tableElements.find(item => {
        const tableRectangle = RectangleClient.getRectangleByPoints(item.points);
        const centerPoint = RectangleClient.getCenterPointByPoints(points);
        return RectangleClient.isPointInRectangle(tableRectangle, centerPoint);
    });
}

export function getTableElementByCell(board: PlaitBoard, cell: PlaitTableCell): PlaitTable {
    return board.children.find(
        element =>
            PlaitTableElement.isTable(element) &&
            element.rows.map(row => row.id).includes(cell.rowId) &&
            element.columns.map(column => column.id).includes(cell.columnId)
    ) as PlaitTable;
}

export function setElementsTableId(board: PlaitBoard, elements: PlaitDrawElement[]) {
    const tableElements = findElements(board, {
        match: element => PlaitTableElement.isTable(element),
        recursion: () => false
    }) as PlaitTable[];
    if (tableElements.length && elements.length) {
        elements.forEach(element => {
            const hitTable = getHitTable(tableElements, element.points);
            if (!hitTable && element.tableId) {
                const path = PlaitBoard.findPath(board, element);
                Transforms.setNode(board, { tableId: undefined }, path);
            }
            if (hitTable && element.tableId !== hitTable.id) {
                const path = PlaitBoard.findPath(board, element);
                Transforms.setNode(board, { tableId: hitTable.id }, path);
            }
        });
    }
}

export function getRelatedElementsInTable(board: PlaitBoard, elements: PlaitElement[]): PlaitDrawElement[] {
    const tableIds = elements.filter(item => PlaitTableElement.isTable(item)).map(item => item.id);
    return board.children.filter(item => PlaitDrawElement.isDrawElement(item) && tableIds.includes(item.tableId)) as PlaitDrawElement[];
}

export function getRelatedElementsInCell(board: PlaitBoard, cell: PlaitTableCell): PlaitDrawElement[] {
    const table = getTableElementByCell(board, cell);
    if (table) {
        const tableRelatedElements = findElements(board, {
            match: item => PlaitDrawElement.isDrawElement(item) && item.tableId === table.id,
            recursion: () => false
        });
        if (tableRelatedElements.length) {
            return tableRelatedElements.filter(element => {
                const hitCell = getHitCellByCenterPoints(table, element.points!);
                return hitCell && hitCell.id === cell.id;
            }) as PlaitDrawElement[];
        }
    }
    return [];
}

export function getHitCellByCenterPoints(table: PlaitTable, points: Point[]) {
    const cells = getCellsWithPoints(table);
    const rectangle = RectangleClient.getRectangleByPoints(points);
    const cell = cells.find(item => {
        const centerPoint = RectangleClient.getCenterPointByPoints(points);
        return RectangleClient.isPointInRectangle(rectangle, centerPoint);
    });
    if (cell) {
        return table.cells.find(item => item.id === cell.id);
    }
    return null;
}