import { fakeAsync, tick } from '@angular/core/testing';
import {
    BOARD_TO_HOST,
    BOARD_TO_ELEMENT_HOST,
    IS_BOARD_ALIVE,
    PlaitBoard,
    cacheSelectedElements,
    clearNodeWeakMap,
    createG,
    createPointerEvent,
    createTestingBoard,
    fakeNodeWeakMap
} from '@plait/core';
import { PlaitTable } from '../interfaces/table';
import { withDraw } from './with-draw';

describe('withTableResize', () => {
    let board: PlaitBoard;
    let table: PlaitTable;

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
        board = createTestingBoard([withDraw], [table]);
        fakeNodeWeakMap(board);
        fakeElementHost(board);
        fakeBoardHost(board);
        IS_BOARD_ALIVE.set(board, true);
        cacheSelectedElements(board, [table]);
    });

    afterEach(() => {
        clearNodeWeakMap({ children: [table] } as unknown as PlaitBoard);
        clearNodeWeakMap(board);
        BOARD_TO_ELEMENT_HOST.delete(board);
        BOARD_TO_HOST.delete(board);
        IS_BOARD_ALIVE.delete(board);
    });

    it('should restore the original column size when the pointer returns to the resize origin', fakeAsync(() => {
        board.pointerDown(createPointerEvent('pointerdown', 100, 50));

        board.pointerMove(createPointerEvent('pointermove', 120, 50));
        tick(16);

        expect((board.children[0] as PlaitTable).columns[0].width).toBe(120);
        expect((board.children[0] as PlaitTable).points).toEqual([
            [0, 0],
            [220, 100]
        ]);

        board.pointerMove(createPointerEvent('pointermove', 100, 50));
        tick(16);
        board.globalPointerUp(createPointerEvent('pointerup', 100, 50));

        expect((board.children[0] as PlaitTable).columns[0].width).toBe(100);
        expect((board.children[0] as PlaitTable).points).toEqual([
            [0, 0],
            [200, 100]
        ]);
    }));
});

function fakeElementHost(board: PlaitBoard) {
    BOARD_TO_ELEMENT_HOST.set(board, {
        lowerHost: createG(),
        host: createG(),
        upperHost: createG(),
        topHost: createG(),
        activeHost: createG(),
        container: document.createElement('div'),
        viewportContainer: document.createElement('div')
    });
}

function fakeBoardHost(board: PlaitBoard) {
    const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGSVGElement;
    Object.defineProperty(host, 'viewBox', {
        value: {
            baseVal: {
                x: 0,
                y: 0,
                width: 1000,
                height: 1000
            }
        }
    });
    spyOn(host, 'getBoundingClientRect').and.returnValue({
        x: 0,
        y: 0,
        width: 1000,
        height: 1000,
        top: 0,
        right: 1000,
        bottom: 1000,
        left: 0
    } as DOMRect);
    BOARD_TO_HOST.set(board, host);
}
