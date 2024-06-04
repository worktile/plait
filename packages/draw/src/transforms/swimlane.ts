import { idCreator, PlaitBoard, Point, RectangleClient, Transforms } from '@plait/core';
import { PlaitDrawElement, PlaitSwimlane, SwimlaneSymbols } from '../interfaces';
import { PlaitTableCell } from '../interfaces/table';
import { getCellWithPoints } from '../utils/table';
import { Alignment } from '@plait/text';
import { memorizeLatest, SetOptions } from '@plait/common';
import { PlaitTable } from '../interfaces/table';
import { getSelectedCells } from '../utils';

export const addSwimlaneRow = (board: PlaitBoard, swimlane: PlaitSwimlane, index: number) => {
    if (PlaitDrawElement.isSwimlane(swimlane) && swimlane.shape === SwimlaneSymbols.swimlaneHorizontal) {
        const newRows = [...swimlane.rows];
        const newRowId = idCreator();
        newRows.splice(index, 0, { id: newRowId });

        const newCells = [...swimlane.cells, ...createNewSwimlaneCells(swimlane, newRowId, 'column')];
        const lastCellPoints = getCellWithPoints(board, swimlane, swimlane.cells[swimlane.cells.length - 1].id).points;
        const lastRowHeight = RectangleClient.getRectangleByPoints(lastCellPoints).height;
        const newPoints: Point[] = [swimlane.points[0], [swimlane.points[1][0], swimlane.points[1][1] + lastRowHeight]];

        updateSwimlane(board, swimlane, swimlane.columns, newRows, newCells, newPoints);
    }
};

export const addSwimlaneColumn = (board: PlaitBoard, swimlane: PlaitSwimlane, index: number) => {
    if (PlaitDrawElement.isSwimlane(swimlane) && swimlane.shape === SwimlaneSymbols.swimlaneVertical) {
        const newColumns = [...swimlane.columns];
        const newColumnId = idCreator();
        newColumns.splice(index, 0, { id: newColumnId });

        const newCells = [...swimlane.cells, ...createNewSwimlaneCells(swimlane, newColumnId, 'row')];
        const lastCellPoints = getCellWithPoints(board, swimlane, swimlane.cells[swimlane.cells.length - 1].id).points;
        const lastColumnWidth = RectangleClient.getRectangleByPoints(lastCellPoints).width;
        const newPoints: Point[] = [swimlane.points[0], [swimlane.points[1][0] + lastColumnWidth, swimlane.points[1][1]]];

        updateSwimlane(board, swimlane, newColumns, swimlane.rows, newCells, newPoints);
    }
};

export const removeSwimlaneRow = (board: PlaitBoard, swimlane: PlaitSwimlane, index: number) => {
    if (PlaitDrawElement.isSwimlane(swimlane) && swimlane.shape === SwimlaneSymbols.swimlaneHorizontal) {
        const newRows = [...swimlane.rows];
        newRows.splice(index, 1);
        if (newRows.length === 0) {
            const path = PlaitBoard.findPath(board, swimlane);
            Transforms.removeNode(board, path);
        } else {
            const removeRow = swimlane.rows[index];
            const newCells = swimlane.cells.filter(item => item.rowId !== removeRow.id);
            let removeRowHeight = removeRow.height;
            if (!removeRowHeight) {
                const rowCell = swimlane.cells.find(item => item.rowId === removeRow.id)!;
                const cellPoints = getCellWithPoints(board, swimlane, rowCell.id).points;
                removeRowHeight = RectangleClient.getRectangleByPoints(cellPoints).height;
            }
            const newPoints: Point[] = [swimlane.points[0], [swimlane.points[1][0], swimlane.points[1][1] - removeRowHeight]];
            updateSwimlane(board, swimlane, swimlane.columns, newRows, newCells, newPoints);
        }
    }
};

export const removeSwimlaneColumn = (board: PlaitBoard, swimlane: PlaitSwimlane, index: number) => {
    if (PlaitDrawElement.isSwimlane(swimlane) && swimlane.shape === SwimlaneSymbols.swimlaneVertical) {
        const newColumns = [...swimlane.columns];
        newColumns.splice(index, 1);
        if (newColumns.length === 0) {
            const path = PlaitBoard.findPath(board, swimlane);
            Transforms.removeNode(board, path);
        } else {
            const removeColumn = swimlane.columns[index];
            const newCells = swimlane.cells.filter(item => item.columnId !== removeColumn.id);
            let removeColumnWidth = removeColumn.width;
            if (!removeColumnWidth) {
                const columnCell = swimlane.cells.find(item => item.columnId === removeColumn.id)!;
                const cellPoints = getCellWithPoints(board, swimlane, columnCell.id).points;
                removeColumnWidth = RectangleClient.getRectangleByPoints(cellPoints).width;
            }
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
    cells.shift();
    cells[0] = {
        ...cells[0],
        text: {
            children: [{ text: 'Lane' }],
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

export const setSwimlaneFill = (board: PlaitBoard, element: PlaitTable, fill: string, options?: SetOptions) => {
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
        newCells = element.cells.map((cell, index) => {
            if (index === 0) {
                return {
                    ...cell,
                    fill
                };
            }
            return cell;
        });
    }
    const path = PlaitBoard.findPath(board, element);
    Transforms.setNode(board, { cells: newCells }, path);

    const memorizeKey = options?.getMemorizeKey ? options?.getMemorizeKey(element) : '';
    memorizeKey && memorizeLatest(memorizeKey, 'fill', fill);
};
