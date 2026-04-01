import { Path, PlaitBoard, Transforms } from '@plait/core';
import { PlaitBaseTable, PlaitTableCell } from '../interfaces';
import { getSelectedCells } from '../utils';

export const setTableFill = (board: PlaitBoard, element: PlaitBaseTable, fill: string | null, path: Path) => {
    const selectedCells = getSelectedCells(element);
    let newCells = element.cells;
    if (selectedCells?.length) {
        newCells = element.cells.map((cell) => {
            if (selectedCells.map((item) => item.id).includes(cell.id)) {
                return getNewCell(cell, fill);
            }
            return cell;
        });
    } else {
        newCells = element.cells.map((cell) => {
            if (cell.text) {
                return getNewCell(cell, fill);
            }
            return cell;
        });
    }
    Transforms.setNode(board, { cells: newCells }, path);
};

const getNewCell = (cell: PlaitTableCell, fill: string | null) => {
    const newCell = {
        ...cell
    };
    if (fill) {
        newCell.fill = fill;
    } else {
        delete newCell.fill;
    }
    return newCell;
};
