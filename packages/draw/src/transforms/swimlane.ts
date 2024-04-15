import { idCreator, PlaitBoard, Point, RectangleClient, Transforms } from '@plait/core';
import { PlaitDrawElement, PlaitSwimlane, SwimlaneSymbols } from '../interfaces';
import { PlaitTableCell } from '../interfaces/table';
import { getCellWithPoints } from '../utils/table';

export const addSwimlaneRow = (board: PlaitBoard, swimlane: PlaitSwimlane, index: number) => {
    if (PlaitDrawElement.isSwimlane(swimlane) && swimlane.shape === SwimlaneSymbols.swimlaneHorizontal) {
        const newRows = [...swimlane.rows];
        const newRowId = idCreator();
        newRows.splice(index, 0, { id: newRowId });

        let newCells = createNewRowCells(swimlane, newRowId);
        newCells.shift();
        newCells = [...swimlane.cells, ...newCells];

        const lastCellPoints = getCellWithPoints(swimlane, swimlane.cells[swimlane.cells.length - 1].id).points;
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

        let newCells = createNewColumnCells(swimlane, newColumnId);
        newCells.shift();
        newCells = [...swimlane.cells, ...newCells];

        const lastCellPoints = getCellWithPoints(swimlane, swimlane.cells[swimlane.cells.length - 1].id).points;
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
                const cellPoints = getCellWithPoints(swimlane, swimlane.cells[index].id).points;
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
                const cellPoints = getCellWithPoints(swimlane, swimlane.cells[index].id).points;
                removeColumnWidth = RectangleClient.getRectangleByPoints(cellPoints).width;
            }
            const newPoints: Point[] = [swimlane.points[0], [swimlane.points[1][0] - removeColumnWidth, swimlane.points[1][1]]];
            updateSwimlane(board, swimlane, newColumns, swimlane.rows, newCells, newPoints);
        }
    }
};

const createNewColumnCells = (swimlane: PlaitSwimlane, newColumnId: string): PlaitTableCell[] => {
    return swimlane.rows.map(row => ({
        id: idCreator(),
        rowId: row.id,
        columnId: newColumnId
    }));
};

const createNewRowCells = (swimlane: PlaitSwimlane, newRowId: string): PlaitTableCell[] => {
    return swimlane.columns.map(column => ({
        id: idCreator(),
        rowId: newRowId,
        columnId: column.id
    }));
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
