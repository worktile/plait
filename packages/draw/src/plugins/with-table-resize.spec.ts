import { fakeAsync, tick } from '@angular/core/testing';
import { TestingBoardFixture, createPointerEvent } from '@plait/core';
import { setupTestingBoard } from '@plait/core';
import { PlaitTable } from '../interfaces/table';
import { withDraw } from './with-draw';

describe('withTableResize', () => {
    let table: PlaitTable;
    let fixture: TestingBoardFixture;

    beforeEach(() => {
        table = {
            id: 'table',
            type: 'table',
            points: [
                [0, 0],
                [200, 100]
            ],
            rows: [{ id: 'row-1' }],
            columns: [
                { id: 'column-1', width: 100 },
                { id: 'column-2', width: 100 }
            ],
            cells: [
                { id: 'cell-1-1', rowId: 'row-1', columnId: 'column-1' },
                { id: 'cell-1-2', rowId: 'row-1', columnId: 'column-2' }
            ]
        };
        fixture = setupTestingBoard([withDraw], [table], {
            selectedElements: [table],
            withRoughSVG: true
        });
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should restore the original column size when the pointer returns to the resize origin', fakeAsync(() => {
        fixture.board.pointerDown(createPointerEvent('pointerdown', 100, 50));
        fixture.board.pointerMove(createPointerEvent('pointermove', 120, 50));
        tick(16);
        expect((fixture.board.children[0] as PlaitTable).columns[0].width).toBe(120);
        expect((fixture.board.children[0] as PlaitTable).points).toEqual([
            [0, 0],
            [220, 100]
        ]);
        fixture.board.pointerMove(createPointerEvent('pointermove', 100, 50));
        tick(16);
        fixture.board.globalPointerUp(createPointerEvent('pointerup', 100, 50));
        expect((fixture.board.children[0] as PlaitTable).columns[0].width).toBe(100);
        expect((fixture.board.children[0] as PlaitTable).points).toEqual([
            [0, 0],
            [200, 100]
        ]);
    }));
});
