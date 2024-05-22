import { PlaitBoard, RectangleClient, Transforms } from '@plait/core';
import { ShapeDefaultSpace } from '../constants';
import { Element } from 'slate';
import { PlaitTable, PlaitTableCell, PlaitTableElement } from '../interfaces/table';
import { getCellWithPoints } from '../utils/table';

export const setTableText = (
    board: PlaitBoard,
    table: PlaitTable,
    cellId: string,
    text: Element,
    textWidth: number,
    textHeight: number
) => {
    const cell = getCellWithPoints(board, table, cellId);
    const cellIndex = table.cells.findIndex(item => item.id === cell.id);
    let rows = [...table.rows];
    let columns = [...table.columns];
    let cells = [...table.cells];
    let points = [...table.points];
    const { width: cellWidth, height: cellHeight } = RectangleClient.getRectangleByPoints(cell.points);
    const defaultSpace = ShapeDefaultSpace.rectangleAndText;
    if (PlaitTableElement.isVerticalText(cell as PlaitTableCell)) {
        const columnIdx = table.columns.findIndex(column => column.id === cell.columnId);
        const tableColumn = table.columns[columnIdx];
        if (textHeight > cellWidth) {
            const newColumnWidth = textHeight + defaultSpace * 2;
            columns[columnIdx] = {
                ...tableColumn,
                width: newColumnWidth
            };
            const offset = newColumnWidth - cellWidth;
            points = [points[0], [points[1][0] + offset, points[1][1]]];
        }
    } else {
        const rowIdx = table.rows.findIndex(row => row.id === cell.rowId);
        const tableRow = table.rows[rowIdx];
        const compareHeight = tableRow.height ?? Math.max(cellHeight, cell.textHeight || 0);
        if (textHeight > compareHeight) {
            const newRowHeight = textHeight + defaultSpace * 2;
            rows[rowIdx] = {
                ...tableRow,
                height: newRowHeight
            };
            // update table height
            const offset = newRowHeight - compareHeight;
            points = [points[0], [points[1][0], points[1][1] + offset]];
        }
    }
    cells[cellIndex] = {
        ...cells[cellIndex],
        textHeight: textHeight,
        text
    };

    const path = board.children.findIndex(child => child.id === table.id);
    Transforms.setNode(board, { rows, columns, cells, points }, [path]);
};
