import { Point, RectangleClient } from '@plait/core';
import { PlaitTable, PlaitTableCell, PlaitTableCellWithPoints } from '../interfaces/table';
import { getTextManage } from '../generators/text.generator';

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

export function getCellWithPoints(table: PlaitTable, cellId: string) {
    const cells = getCellsWithPoints(table);
    const cellIndex = table.cells.findIndex(item => item.id === cellId);
    return cells[cellIndex];
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
