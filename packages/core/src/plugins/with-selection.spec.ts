import { fakeAsync, tick } from '@angular/core/testing';
import { PlaitBoard, PlaitElement, PlaitPointerType } from '../interfaces';
import { setupTestingBoard, TestingBoardFixture } from '../testing';
import { Transforms } from '../transforms';
import { cacheSelectedElements, createG, getSelectedElements } from '../utils';
import { withOptions } from './with-options';
import { withSelection } from './with-selection';

const children: PlaitElement[] = [
    { id: 'first', type: 'geometry' },
    { id: 'second', type: 'geometry' }
];

describe('withSelection', () => {
    let activeHost: SVGGElement;
    let drawSelectionRectangle: jasmine.Spy;
    let fixture: TestingBoardFixture;

    beforeEach(() => {
        fixture = setupTestingBoard([withOptions, withSelection], children);
        activeHost = PlaitBoard.getActiveHost(fixture.board);
        drawSelectionRectangle = jasmine.createSpy('drawSelectionRectangle').and.callFake(() => createG());
        fixture.board.drawSelectionRectangle = drawSelectionRectangle;
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should refresh the multi-selection rectangle after viewport changes in hand mode', fakeAsync(() => {
        cacheSelectedElements(fixture.board, children);
        fixture.board.afterChange();
        const initialRectangle = activeHost.firstElementChild;
        expect(activeHost.contains(initialRectangle)).toBeTrue();

        fixture.board.pointer = PlaitPointerType.hand;
        Transforms.setViewport(fixture.board, { zoom: 1, origination: [10, 10] });
        tick();

        expect(drawSelectionRectangle).toHaveBeenCalledTimes(2);
        expect(activeHost.contains(initialRectangle)).toBeFalse();
        expect(activeHost.children.length).toBe(1);
        expect(activeHost.firstElementChild).not.toBe(initialRectangle);
    }));

    it('should not update selected elements from selection operations in hand mode', fakeAsync(() => {
        cacheSelectedElements(fixture.board, children);
        fixture.board.pointer = PlaitPointerType.hand;

        Transforms.setSelection(fixture.board, {
            anchor: [100, 100],
            focus: [100, 100]
        });
        tick();

        expect(getSelectedElements(fixture.board)).toEqual(children);
    }));
});
