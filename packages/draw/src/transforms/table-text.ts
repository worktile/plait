import { Path, PlaitBoard, PlaitNode, RectangleClient, Transforms } from '@plait/core';
import { ShapeDefaultSpace } from '../constants';
import { Element } from 'slate';
import { PlaitBaseTable, PlaitTableCell, PlaitTableElement } from '../interfaces/table';
import { getCellWithPoints, updateColumns, updateRows } from '../utils/table';

export const setTableText = (board: PlaitBoard, path: Path, cellId: string, text: Element, textHeight: number) => {
    const table = PlaitNode.get(board, path) as PlaitBaseTable;
    const cell = getCellWithPoints(board, table, cellId);
    if (cell) {
        const cellIndex = table.cells.findIndex(item => item.id === cell.id);
        let rows = [...table.rows];
        let columns = [...table.columns];
        let cells = [...table.cells];
        let points = [...table.points];
        const { width: cellWidth, height: cellHeight } = RectangleClient.getRectangleByPoints(cell.points);
        const defaultSpace = ShapeDefaultSpace.rectangleAndText;
        if (PlaitTableElement.isVerticalText(cell as PlaitTableCell)) {
            const columnIdx = table.columns.findIndex(column => column.id === cell.columnId);
            if (textHeight > cellWidth) {
                const newColumnWidth = textHeight + defaultSpace * 2;
                const offset = newColumnWidth - cellWidth;
                const result = updateColumns(table, table.columns[columnIdx].id, newColumnWidth, offset);
                points = result.points;
                columns = result.columns;
            }
        } else {
            const rowIdx = table.rows.findIndex(row => row.id === cell.rowId);
            const tableRow = table.rows[rowIdx];
            const compareHeight = tableRow.height ?? Math.max(cellHeight, cell.textHeight || 0);
            if (textHeight > compareHeight) {
                const newRowHeight = textHeight + defaultSpace * 2;
                const offset = newRowHeight - compareHeight;
                const result = updateRows(table, table.rows[rowIdx].id, newRowHeight, offset);
                points = result.points;
                rows = result.rows;
            }
        }
        cells[cellIndex] = {
            ...cells[cellIndex],
            textHeight: textHeight,
            text
        };

        Transforms.setNode(board, { rows, columns, cells, points }, path);
    }
};
