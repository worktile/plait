import { createTestingBoard, fakeNodeWeakMap } from '@plait/core';
import { withDraw } from '../plugins/with-draw';
import { PlaitSwimlane, SwimlaneDrawSymbols } from '../interfaces';
import { createDefaultSwimlane } from '../utils/swimlane';
import { addSwimlaneColumn, addSwimlaneRow } from './swimlane';

describe('swimlane transforms', () => {
    const expectCellsInRowMajorOrder = (swimlane: PlaitSwimlane) => {
        const expectedPositions = swimlane.rows.flatMap((row) =>
            swimlane.columns.map((column) => ({ rowId: row.id, columnId: column.id }))
        );
        expect(swimlane.cells.map(({ rowId, columnId }) => ({ rowId, columnId }))).toEqual(expectedPositions);
    };

    it('should keep cells ordered after adding a row in the middle', () => {
        const swimlane = createDefaultSwimlane(SwimlaneDrawSymbols.swimlaneHorizontal, [
            [0, 0],
            [600, 300]
        ]);
        const board = createTestingBoard([withDraw], [swimlane]);
        fakeNodeWeakMap(board);

        addSwimlaneRow(board, swimlane, 1);

        expectCellsInRowMajorOrder(board.children[0] as PlaitSwimlane);
    });

    it('should keep cells ordered after adding a column in the middle', () => {
        const swimlane = createDefaultSwimlane(SwimlaneDrawSymbols.swimlaneVertical, [
            [0, 0],
            [600, 300]
        ]);
        const board = createTestingBoard([withDraw], [swimlane]);
        fakeNodeWeakMap(board);

        addSwimlaneColumn(board, swimlane, 1);

        expectCellsInRowMajorOrder(board.children[0] as PlaitSwimlane);
    });
});
