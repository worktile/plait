import type { PlaitBaseTable } from '../interfaces/table';
import { normalizeTableCellsOrder } from './table-cell-order';

describe('table utils', () => {
    describe('normalizeTableCellsOrder', () => {
        it('should sort cells from top to bottom and left to right', () => {
            const table = {
                rows: [{ id: 'row-1' }, { id: 'row-2' }, { id: 'row-3' }],
                columns: [{ id: 'column-1' }, { id: 'column-2' }],
                cells: [
                    { id: 'cell-2-2', rowId: 'row-2', columnId: 'column-2' },
                    { id: 'cell-1-2', rowId: 'row-1', columnId: 'column-2' },
                    { id: 'cell-3-1', rowId: 'row-3', columnId: 'column-1' },
                    { id: 'cell-1-1', rowId: 'row-1', columnId: 'column-1' },
                    { id: 'cell-2-1', rowId: 'row-2', columnId: 'column-1' }
                ]
            } as Pick<PlaitBaseTable, 'rows' | 'columns' | 'cells'>;

            const cells = normalizeTableCellsOrder(table);

            expect(cells.map((cell) => cell.id)).toEqual(['cell-1-1', 'cell-1-2', 'cell-2-1', 'cell-2-2', 'cell-3-1']);
        });
    });
});
