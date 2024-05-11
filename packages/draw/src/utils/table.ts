import { Point, RectangleClient } from '@plait/core';
import { PlaitTable, PlaitTableCell } from '../interfaces/table';

export function getCellsWithPoints(table: PlaitTable): (PlaitTableCell & { points: [Point, Point] })[] {
    const rectangle = RectangleClient.getRectangleByPoints(table.points);
    const columnsCount = table.columns.length;
    const rowsCount = table.rows.length;
    const cellWidths = calculateCellsSize(table.columns, rectangle.width, columnsCount, true);
    const cellHeights = calculateCellsSize(table.rows, rectangle.height, rowsCount, false);

    const cells: (PlaitTableCell & { points: [Point, Point] })[] = table.cells.map(cell => {
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
