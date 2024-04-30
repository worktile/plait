import { PlaitBoard, RectangleClient, Point, createG, PlaitElement, drawLine } from '@plait/core';
import { Options } from 'roughjs/bin/core';
import { ShapeEngine } from '../../interfaces';
import { PlaitTable, PlaitTableCell } from '../../interfaces/table';

export const TableEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options, element?: PlaitElement) {
        const rs = PlaitBoard.getRoughSVG(board);
        const g = createG();
        const { x, y, width, height } = rectangle;
        const tableTopBorder = drawLine(rs, [x, y], [x + width, y], options);
        const tableLeftBorder = drawLine(rs, [x, y], [x, y + height], options);
        g.append(tableTopBorder, tableLeftBorder);
        const cellCoordinates = calculateCellCoordinates(element as PlaitTable, rectangle);
        for (let cell in cellCoordinates) {
            const points = cellCoordinates[cell] as Point[];
            const rectangle = RectangleClient.getRectangleByPoints(points);
            const { x, y, width, height } = rectangle;
            const cellRightBorder = drawLine(rs, [x + width, y], [x + width, y + height], options);
            const tableBottomBorder = drawLine(rs, [x, y + height], [x + width, y + height], options);
            g.append(cellRightBorder, tableBottomBorder);
        }

        return g;
    },
    isInsidePoint(rectangle: RectangleClient, point: Point) {
        return false;
    },
    getCornerPoints(rectangle: RectangleClient) {
        return RectangleClient.getCornerPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        return [0, 0];
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return [
            [0, 0],
            [0, 0]
        ];
    }
};

function calculateCellCoordinates(table: PlaitTable, rectangle: RectangleClient): { [cellId: string]: number[][] } {
    const numColumns = table.columns.length;
    const numRows = table.rows.length;
    const cellWidths = calculateCellsWidth(table.columns, rectangle.width, numColumns);
    const cellHeights = calculateCellsHeight(table.rows, rectangle.height, numRows);

    const cellCoordinates: { [cellId: string]: number[][] } = {};
    table.cells.forEach(cell => {
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

        // 计算单元格宽度
        const cellWidth = calculateCellWidth(table, cell, cellWidths, rowIdx, columnIdx);
        const cellBottomRightX = cellTopLeftX + cellWidth;

        // 计算单元格高度
        const cellHeight = calculateCellHeight(table, cell, cellHeights, rowIdx, columnIdx);
        const cellBottomRightY = cellTopLeftY + cellHeight;

        cellCoordinates[cell.id] = [
            [cellTopLeftX, cellTopLeftY],
            [cellBottomRightX, cellBottomRightY]
        ];
    });

    return cellCoordinates;
}

function calculateCellsWidth(columns: { id: string; width?: number }[], tableWidth: number, numColumns: number) {
    const cellWidths: number[] = [];
    let totalWidthRemaining = tableWidth;

    // 计算每列的宽度
    columns.forEach((column, index) => {
        if (column.width) {
            cellWidths[index] = column.width;
            totalWidthRemaining -= column.width;
        }
    });

    // 平分剩余宽度
    const remainingColumnCount = numColumns - cellWidths.length;
    const remainingCellWidth = remainingColumnCount > 0 ? totalWidthRemaining / remainingColumnCount : 0;
    for (let i = 0; i < numColumns; i++) {
        if (!cellWidths[i]) {
            cellWidths[i] = remainingCellWidth;
        }
    }

    return cellWidths;
}

function calculateCellsHeight(rows: { id: string; height?: number }[], tableHeight: number, numRows: number) {
    const cellHeights: number[] = [];
    let totalHeightRemaining = tableHeight;

    // 计算每行的高度
    rows.forEach((row, index) => {
        if (row.height) {
            cellHeights[index] = row.height;
            totalHeightRemaining -= row.height;
        }
    });

    // 平分剩余高度
    const remainingRowCount = numRows - cellHeights.length;
    const remainingCellHeight = remainingRowCount > 0 ? totalHeightRemaining / remainingRowCount : 0;
    for (let i = 0; i < numRows; i++) {
        if (!cellHeights[i]) {
            cellHeights[i] = remainingCellHeight;
        }
    }
    return cellHeights;
}

function calculateCellWidth(table: PlaitTable, cell: PlaitTableCell, cellWidths: number[], rowIdx: number, columnIdx: number) {
    const colspan = cell.colspan || 1;
    const rowspan = cell.rowspan || 1;

    let cellWidth = 0;
    for (let i = 0; i < colspan; i++) {
        const columnIndex = columnIdx + i;
        if (!cellWidths[columnIndex]) {
            // 先找下方的单元格
            for (let j = rowIdx + rowspan; j < table.rows.length; j++) {
                const belowCell = table.cells.find(c => c.rowId === table.rows[j].id && c.columnId === table.columns[columnIndex].id);
                if (belowCell) {
                    cellWidth += cellWidths[columnIndex];
                    break;
                }
            }
            // 如果下方没有找到，再找上方的单元格
            if (cellWidth === 0) {
                for (let j = rowIdx - 1; j >= 0; j--) {
                    const aboveCell = table.cells.find(c => c.rowId === table.rows[j].id && c.columnId === table.columns[columnIndex].id);
                    if (aboveCell) {
                        cellWidth += cellWidths[columnIndex];
                        break;
                    }
                }
            }
        } else {
            cellWidth += cellWidths[columnIndex];
        }
    }
    return cellWidth;
}

function calculateCellHeight(table: PlaitTable, cell: PlaitTableCell, cellHeights: number[], rowIdx: number, columnIdx: number) {
    const colspan = cell.colspan || 1;
    const rowspan = cell.rowspan || 1;

    // 计算单元格高度
    let cellHeight = 0;
    for (let i = 0; i < rowspan; i++) {
        const rowIndex = rowIdx + i;
        if (!cellHeights[rowIndex]) {
            // 先找右侧的单元格
            for (let j = columnIdx + colspan; j < table.columns.length; j++) {
                const rightCell = table.cells.find(c => c.rowId === table.rows[rowIndex].id && c.columnId === table.columns[j].id);
                if (rightCell) {
                    cellHeight += cellHeights[rowIndex];
                    break;
                }
            }
            // 如果右侧没有找到，再找左侧的单元格
            if (cellHeight === 0) {
                for (let j = columnIdx - 1; j >= 0; j--) {
                    const leftCell = table.cells.find(c => c.rowId === table.rows[rowIndex].id && c.columnId === table.columns[j].id);
                    if (leftCell) {
                        cellHeight += cellHeights[rowIndex];
                        break;
                    }
                }
            }
        } else {
            cellHeight += cellHeights[rowIndex];
        }
    }
    return cellHeight;
}
