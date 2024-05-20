import { idCreator, PlaitBoard, Point, RectangleClient, Transforms } from '@plait/core';
import { PlaitDrawElement, PlaitSwimlane, SwimlaneSymbols } from '../interfaces';
import { PlaitTableCell } from '../interfaces/table';
import { Alignment } from '@plait/text';
import { getCellWithPoints } from '../utils/table';
import { DEFAULT_TEXT_HEIGHT } from '../constants';

export const addSwimlaneRow = (board: PlaitBoard, swimlane: PlaitSwimlane, index: number) => {
    if (PlaitDrawElement.isSwimlane(swimlane) && swimlane.shape === SwimlaneSymbols.swimlaneHorizontal) {
        const newRows = [...swimlane.rows];
        const newRowId = idCreator();
        newRows.splice(index, 0, { id: newRowId });

        let newCells = createNewRowCells(swimlane, newRowId);
        newCells.shift();
        newCells = [...swimlane.cells, ...newCells];
        newCells[0] = {
            ...newCells[0],
            rowspan: (swimlane.cells[0].rowspan || 0) + 1
        };
        setInitialCellProperties(newCells[swimlane.cells.length], 'vertical');

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
        newCells[0] = {
            ...newCells[0],
            colspan: (swimlane.cells[0].colspan || 0) + 1
        };
        setInitialCellProperties(newCells[swimlane.cells.length], 'horizontal');

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
            const rowspan = swimlane.cells[0].rowspan || 0;
            const removeRow = swimlane.rows[index];
            let newCells = swimlane.cells.filter(item => item.rowId !== removeRow.id);
            newCells[0] = {
                ...newCells[0],
                rowspan: rowspan > 1 ? rowspan - 1 : undefined
            };
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
            const colspan = swimlane.cells[0].colspan || 0;
            const removeColumn = swimlane.columns[index];
            let newCells = swimlane.cells.filter(item => item.columnId !== removeColumn.id);
            newCells[0] = {
                ...newCells[0],
                colspan: colspan > 1 ? colspan - 1 : undefined
            };
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

const setInitialCellProperties = (cell: PlaitTableCell, direction: 'horizontal' | 'vertical') => {
    cell.textHeight = DEFAULT_TEXT_HEIGHT;
    cell.text = {
        children: [{ text: '' }],
        align: Alignment.center,
        ...(direction === 'vertical' && { direction: 'vertical' })
    };
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
