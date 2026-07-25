import { TestingBoardFixture, setupTestingBoard } from '@plait/core';
import { withDraw } from '../plugins/with-draw';
import { PlaitSwimlane, SwimlaneDrawSymbols } from '../interfaces';
import { createDefaultSwimlane } from '../utils/swimlane';
import { addSwimlaneColumn, addSwimlaneRow } from './swimlane';

describe('swimlane transforms', () => {
    let fixture: TestingBoardFixture | null = null;

    afterEach(() => {
        fixture?.destroy();
    });

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
        fixture = setupTestingBoard([withDraw], [swimlane]);
        addSwimlaneRow(fixture.board, swimlane, 1);
        expectCellsInRowMajorOrder(fixture.board.children[0] as PlaitSwimlane);
    });

    it('should keep cells ordered after adding a column in the middle', () => {
        const swimlane = createDefaultSwimlane(SwimlaneDrawSymbols.swimlaneVertical, [
            [0, 0],
            [600, 300]
        ]);
        fixture = setupTestingBoard([withDraw], [swimlane]);
        addSwimlaneColumn(fixture.board, swimlane, 1);
        expectCellsInRowMajorOrder(fixture.board.children[0] as PlaitSwimlane);
    });
});
