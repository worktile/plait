import type { PlaitBaseTable } from '../interfaces/table';

export function normalizeTableCellsOrder(table: Pick<PlaitBaseTable, 'rows' | 'columns' | 'cells'>) {
    const rowIndexMap = new Map(table.rows.map((row, index) => [row.id, index]));
    const columnIndexMap = new Map(table.columns.map((column, index) => [column.id, index]));
    const getValidIndex = (index: number | undefined) => (index === undefined ? Number.MAX_SAFE_INTEGER : index);
    return table.cells
        .map((cell, index) => ({
            cell,
            index,
            rowIndex: getValidIndex(rowIndexMap.get(cell.rowId)),
            columnIndex: getValidIndex(columnIndexMap.get(cell.columnId))
        }))
        .sort((previous, next) => {
            return previous.rowIndex - next.rowIndex || previous.columnIndex - next.columnIndex || previous.index - next.index;
        })
        .map(({ cell }) => cell);
}
