import { Path, PlaitBoard, Transforms } from '@plait/core';
import { PlaitBaseTable } from '../interfaces';
import { getSelectedCells } from '../utils';

export const setTableFill = (board: PlaitBoard, element: PlaitBaseTable, fill: string, path: Path) => {
    const selectedCells = getSelectedCells(element);
    let newCells = element.cells;
    if (selectedCells?.length) {
        newCells = element.cells.map(cell => {
            if (selectedCells.map(item => item.id).includes(cell.id)) {
                return {
                    ...cell,
                    fill
                };
            }
            return cell;
        });
    } else {
        newCells = element.cells.map(cell => {
            if (cell.text && cell.textHeight) {
                return {
                    ...cell,
                    fill
                };
            }
            return cell;
        });
    }
    Transforms.setNode(board, { cells: newCells }, path);
};
