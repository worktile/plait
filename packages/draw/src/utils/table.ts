import { idCreator, PlaitBoard, Point, RectangleClient } from '@plait/core';
import { PlaitBaseTable, PlaitTable, PlaitTableBoard, PlaitTableCell, PlaitTableCellWithPoints } from '../interfaces/table';
import { getTextManage } from '../generators/text.generator';
import { Alignment } from '@plait/common';
import { TEXT_DEFAULT_HEIGHT } from '@plait/text-plugins';

export function getCellsWithPoints(board: PlaitBoard, element: PlaitBaseTable): PlaitTableCellWithPoints[] {
    const table = (board as PlaitTableBoard).buildTable(element);
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

export function getCellWithPoints(board: PlaitBoard, table: PlaitBaseTable, cellId: string) {
    const cells = getCellsWithPoints(board as PlaitTableBoard, table);
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

export function getHitCell(board: PlaitTableBoard, element: PlaitBaseTable, point: Point) {
    const table = board.buildTable(element);
    const cells = getCellsWithPoints(board, table);
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

export const updateColumns = (table: PlaitBaseTable, columnId: string, width: number, offset: number) => {
    const columns = table.columns.map(item => (item.id === columnId ? { ...item, width } : item));
    const points = [table.points[0], [table.points[1][0] + offset, table.points[1][1]]] as Point[];
    return { columns, points };
};

export const updateRows = (table: PlaitBaseTable, rowId: string, height: number, offset: number) => {
    const rows = table.rows.map(item => (item.id === rowId ? { ...item, height } : item));
    const points = [table.points[0], [table.points[1][0], table.points[1][1] + offset]] as Point[];
    return { rows, points };
};

export function updateCellIdsByRowOrColumn(cells: PlaitTableCell[], oldId: string, newId: string, type: 'row' | 'column') {
    const id: 'rowId' | 'columnId' = `${type}Id`;
    cells.forEach(item => {
        if (item[id] === oldId) {
            item[id] = newId;
        }
    });
}

export function updateRowOrColumnIds(element: PlaitTable, type: 'row' | 'column') {
    element[`${type}s`].forEach(item => {
        const newId = idCreator();
        updateCellIdsByRowOrColumn(element.cells, item.id, newId, type);
        item.id = newId;
    });
}

export function updateCellIds(cells: PlaitTableCell[]) {
    cells.forEach(item => {
        const newId = idCreator();
        item.id = newId;
    });
}

export function isCellIncludeText(cell: PlaitTableCell) {
    return cell.text && cell.textHeight;
}

export function getCellsRectangle(board: PlaitTableBoard, element: PlaitTable, cells: PlaitTableCell[]) {
    const cellsWithPoints = getCellsWithPoints(board as PlaitTableBoard, element);
    const points = cells.map(cell => {
        const cellWithPoints = cellsWithPoints.find(item => item.id === cell.id);
        return cellWithPoints!.points;
    });
    return RectangleClient.getRectangleByPoints(points);
}

export const createCell = (rowId: string, columnId: string, text: string | null = null) => {
    const cell: PlaitTableCell = {
        id: idCreator(),
        rowId,
        columnId
    };
    if (text !== null) {
        cell['textHeight'] = TEXT_DEFAULT_HEIGHT;
        cell['text'] = {
            children: [{ text }],
            align: Alignment.center
        };
    }
    return cell;
};
