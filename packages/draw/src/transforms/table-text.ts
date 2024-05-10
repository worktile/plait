import { PlaitBoard, RectangleClient, Transforms } from '@plait/core';
import { ShapeDefaultSpace } from '../constants';
import { Element } from 'slate';
import { PlaitTable, PlaitTableCell, PlaitTableCellParagraph } from '../interfaces/table';

export const setTableText = (
    board: PlaitBoard,
    table: PlaitTable,
    cell: PlaitTableCell,
    text: Element,
    textWidth: number,
    textHeight: number
) => {
    const cellIndex = table.cells.findIndex(item => item.id === cell.id);

    let rows = [...table.rows];
    let cells = [...table.cells];
    let points = [...table.points];
    const { height: cellHeight } = RectangleClient.getRectangleByPoints(cell.points!);
    if (cell.text!.writingMode === 'vertical-lr') {
        // 文字高度发生改变，修改该列的宽度
        // update table width
    } else {
        const rowIdx = table.rows.findIndex(row => row.id === cell.rowId);
        const tableRow = table.rows[rowIdx];
        const compareHeight = tableRow.height ?? Math.max(cellHeight, cell.textHeight!);
        if (textHeight > compareHeight) {
            const defaultSpace = ShapeDefaultSpace.rectangleAndText;
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
        ...cell,
        textHeight: textHeight,
        text: text as PlaitTableCellParagraph
    };
    const path = board.children.findIndex(child => child === table);
    Transforms.setNode(board, { rows, cells, points }, [path]);
};
