import { fakeAsync, tick } from '@angular/core/testing';
import { PlaitBoard, PlaitElement, PlaitPointerType } from '../interfaces';
import { clearBoardElementHost, clearNodeWeakMap, createTestingBoard, fakeBoardElementHost, fakeNodeWeakMap } from '../testing';
import { Transforms } from '../transforms';
import { cacheSelectedElements, createG, getSelectedElements } from '../utils';
import { withOptions } from './with-options';
import { withSelection } from './with-selection';

const children: PlaitElement[] = [
    { id: 'first', type: 'geometry' },
    { id: 'second', type: 'geometry' }
];

describe('withSelection', () => {
    let board: PlaitBoard;
    let activeHost: SVGGElement;
    let drawSelectionRectangle: jasmine.Spy;

    beforeEach(() => {
        board = createTestingBoard([withOptions, withSelection], children);
        fakeNodeWeakMap(board);
        activeHost = fakeBoardElementHost(board).activeHost;
        drawSelectionRectangle = jasmine.createSpy('drawSelectionRectangle').and.callFake(() => createG());
        board.drawSelectionRectangle = drawSelectionRectangle;
    });

    afterEach(() => {
        clearNodeWeakMap(board);
        clearBoardElementHost(board);
    });

    it('should refresh the multi-selection rectangle after viewport changes in hand mode', fakeAsync(() => {
        cacheSelectedElements(board, children);
        board.afterChange();
        const initialRectangle = activeHost.firstElementChild;
        expect(activeHost.contains(initialRectangle)).toBeTrue();

        board.pointer = PlaitPointerType.hand;
        Transforms.setViewport(board, { zoom: 1, origination: [10, 10] });
        tick();

        expect(drawSelectionRectangle).toHaveBeenCalledTimes(2);
        expect(activeHost.contains(initialRectangle)).toBeFalse();
        expect(activeHost.children.length).toBe(1);
        expect(activeHost.firstElementChild).not.toBe(initialRectangle);
    }));

    it('should not update selected elements from selection operations in hand mode', fakeAsync(() => {
        cacheSelectedElements(board, children);
        board.pointer = PlaitPointerType.hand;

        Transforms.setSelection(board, {
            anchor: [100, 100],
            focus: [100, 100]
        });
        tick();

        expect(getSelectedElements(board)).toEqual(children);
    }));
});
