import { idCreator, Path, PlaitBoard, Point, RectangleClient, Transforms } from '@plait/core';
import { PlaitDrawElement, PlaitSwimlane } from '../interfaces';
import { PlaitBaseTable, PlaitTableCell } from '../interfaces/table';
import { getCellWithPoints } from '../utils/table';
import { getSwimlaneCount } from '../utils/swimlane';
import { getSelectedCells } from '../utils';
import { Alignment } from '@plait/common';

export const updateSwimlaneCount = (board: PlaitBoard, swimlane: PlaitSwimlane, count: number) => {
    if (count > 0 && PlaitDrawElement.isSwimlane(swimlane)) {
        const currentCount = getSwimlaneCount(swimlane);
        if (PlaitDrawElement.isHorizontalSwimlane(swimlane)) {
            if (count > currentCount) {
                addSwimlaneRow(board, swimlane, swimlane.rows.length, count - currentCount);
            } else {
                const deleteIndex = swimlane.rows.length - (currentCount - count);
                removeSwimlaneRow(board, swimlane, deleteIndex, currentCount - count);
            }
        }
        if (PlaitDrawElement.isVerticalSwimlane(swimlane)) {
            if (count > currentCount) {
                addSwimlaneColumn(board, swimlane, swimlane.columns.length, count - currentCount);
            } else {
                const deleteIndex = swimlane.columns.length - (currentCount - count);
                removeSwimlaneColumn(board, swimlane, deleteIndex, currentCount - count);
            }
        }
    }
};

export const addSwimlaneRow = (board: PlaitBoard, swimlane: PlaitSwimlane, index: number, count: number = 1) => {
    if (PlaitDrawElement.isHorizontalSwimlane(swimlane)) {
        const newRows = [...swimlane.rows];
        const addRows: { id: string }[] = [];
        for (let i = 0; i < count; i++) {
            addRows.push({ id: idCreator() });
        }
        newRows.splice(index, 0, ...addRows);
        const newCells = [...swimlane.cells];
        addRows.forEach(item => {
            newCells.push(...createNewSwimlaneCells(swimlane, item.id, 'column'));
        });
        const lastCellPoints = getCellWithPoints(board, swimlane, swimlane.cells[swimlane.cells.length - 1].id).points;
        const lastRowHeight = RectangleClient.getRectangleByPoints(lastCellPoints).height;
        const newPoints: Point[] = [swimlane.points[0], [swimlane.points[1][0], swimlane.points[1][1] + lastRowHeight * count]];
        updateSwimlane(board, swimlane, swimlane.columns, newRows, newCells, newPoints);
    }
};

export const addSwimlaneColumn = (board: PlaitBoard, swimlane: PlaitSwimlane, index: number, count: number = 1) => {
    if (PlaitDrawElement.isVerticalSwimlane(swimlane)) {
        const newColumns = [...swimlane.columns];
        const addColumns: { id: string }[] = [];
        for (let i = 0; i < count; i++) {
            addColumns.push({ id: idCreator() });
        }
        newColumns.splice(index, 0, ...addColumns);
        const newCells = [...swimlane.cells];
        addColumns.forEach(item => {
            newCells.push(...createNewSwimlaneCells(swimlane, item.id, 'row'));
        });
        const lastCellPoints = getCellWithPoints(board, swimlane, swimlane.cells[swimlane.cells.length - 1].id).points;
        const lastColumnWidth = RectangleClient.getRectangleByPoints(lastCellPoints).width;
        const newPoints: Point[] = [swimlane.points[0], [swimlane.points[1][0] + lastColumnWidth * count, swimlane.points[1][1]]];

        updateSwimlane(board, swimlane, newColumns, swimlane.rows, newCells, newPoints);
    }
};

export const removeSwimlaneRow = (board: PlaitBoard, swimlane: PlaitSwimlane, index: number, count: number = 1) => {
    if (PlaitDrawElement.isHorizontalSwimlane(swimlane)) {
        if (count > swimlane.rows.length) {
            return;
        }
        const newRows = [...swimlane.rows];
        newRows.splice(index, count);
        if (newRows.length === 0) {
            const path = PlaitBoard.findPath(board, swimlane);
            Transforms.removeNode(board, path);
        } else {
            let newCells = [...swimlane.cells];
            const removeRows = [];
            for (let i = index; i < count + index; i++) {
                const removeRow = swimlane.rows[i];
                removeRows.push(removeRow);
                newCells = newCells.filter(item => item.rowId !== removeRow.id);
            }
            let removeRowHeight = 0;
            removeRows.forEach(row => {
                if (!row.height) {
                    const rowCell = swimlane.cells.find(item => item.rowId === row.id)!;
                    const cellPoints = getCellWithPoints(board, swimlane, rowCell.id).points;
                    removeRowHeight += RectangleClient.getRectangleByPoints(cellPoints).height;
                } else {
                    removeRowHeight += row.height;
                }
            });

            const newPoints: Point[] = [swimlane.points[0], [swimlane.points[1][0], swimlane.points[1][1] - removeRowHeight]];
            updateSwimlane(board, swimlane, swimlane.columns, newRows, newCells, newPoints);
        }
    }
};

export const removeSwimlaneColumn = (board: PlaitBoard, swimlane: PlaitSwimlane, index: number, count: number = 1) => {
    if (PlaitDrawElement.isVerticalSwimlane(swimlane)) {
        if (count > swimlane.columns.length) {
            return;
        }
        const newColumns = [...swimlane.columns];
        newColumns.splice(index, count);
        if (newColumns.length === 0) {
            const path = PlaitBoard.findPath(board, swimlane);
            Transforms.removeNode(board, path);
        } else {
            let newCells = [...swimlane.cells];
            const removeColumns = [];
            for (let i = index; i < count + index; i++) {
                const removeColumn = swimlane.columns[i];
                removeColumns.push(removeColumn);
                newCells = newCells.filter(item => item.columnId !== removeColumn.id);
            }
            let removeColumnWidth = 0;
            removeColumns.forEach(column => {
                if (!column.width) {
                    const rowCell = swimlane.cells.find(item => item.columnId === column.id)!;
                    const cellPoints = getCellWithPoints(board, swimlane, rowCell.id).points;
                    removeColumnWidth += RectangleClient.getRectangleByPoints(cellPoints).width;
                } else {
                    removeColumnWidth += column.width;
                }
            });
            const newPoints: Point[] = [swimlane.points[0], [swimlane.points[1][0] - removeColumnWidth, swimlane.points[1][1]]];
            updateSwimlane(board, swimlane, newColumns, swimlane.rows, newCells, newPoints);
        }
    }
};

const createNewSwimlaneCells = (swimlane: PlaitSwimlane, newId: string, type: 'row' | 'column'): PlaitTableCell[] => {
    const cells: PlaitTableCell[] = swimlane[`${type}s`].map(item => ({
        id: idCreator(),
        rowId: type === 'row' ? item.id : newId,
        columnId: type === 'row' ? newId : item.id
    }));
    if (swimlane.header) {
        cells.shift();
    }
    cells[0] = {
        ...cells[0],
        text: {
            children: [{ text: swimlane.header ? 'Lane' : 'New Swimlane' }],
            align: Alignment.center,
            direction: type === 'row' ? undefined : 'vertical'
        },
        textHeight: 20
    };
    return cells;
};

const updateSwimlane = (
    board: PlaitBoard,
    swimlane: PlaitSwimlane,
    newColumns: { id: string; width?: number }[],
    newRows: { id: string; height?: number }[],
    newCells: PlaitTableCell[],
    newPoints: Point[]
) => {
    const path = PlaitBoard.findPath(board, swimlane);
    Transforms.setNode(
        board,
        {
            columns: newColumns,
            rows: newRows,
            cells: newCells,
            points: newPoints
        },
        path
    );
};

export const setSwimlaneFill = (board: PlaitBoard, element: PlaitBaseTable, fill: string, path: Path) => {
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
