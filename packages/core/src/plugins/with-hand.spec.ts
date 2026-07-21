import { fakeAsync, tick } from '@angular/core/testing';
import { SPACE } from '../constants';
import { PlaitBoard, PlaitElement, PlaitPointerType } from '../interfaces';
import {
    clearBoardElementHost,
    clearNodeWeakMap,
    createKeyboardEvent,
    createPointerEvent,
    createTestingBoard,
    fakeBoardElementHost,
    fakeNodeWeakMap
} from '../testing';
import { Transforms } from '../transforms';
import { cacheSelectedElements, createG, getSelectedElements } from '../utils';
import { withHandPointer } from './with-hand';
import { withOptions } from './with-options';
import { withSelection } from './with-selection';

const children: PlaitElement[] = [
    { id: 'first', type: 'geometry' },
    { id: 'second', type: 'geometry' }
];

const createSpaceEvent = (type: 'keydown' | 'keyup') => {
    return createKeyboardEvent(type, SPACE, ' ', {}, 'Space');
};

describe('withHandPointer', () => {
    let board: PlaitBoard;

    afterEach(() => {
        clearNodeWeakMap(board);
        clearBoardElementHost(board);
    });

    it('exposes Space panning as hand mode without changing the selected pointer', () => {
        const customPointer = 'custom-draw';
        const interactionDown = jasmine.createSpy('interactionDown');
        const interactionMove = jasmine.createSpy('interactionMove');
        const innerPointerUp = jasmine.createSpy('innerPointerUp');
        const withInnerPointerUp = (board: PlaitBoard) => {
            board.pointerUp = innerPointerUp;
            return board;
        };
        const withPointerInteraction = (board: PlaitBoard) => {
            const { pointerDown, pointerMove } = board;
            let isInteracting = false;
            board.pointerDown = (event) => {
                if (PlaitBoard.isInPointer(board, [customPointer])) {
                    isInteracting = true;
                    interactionDown();
                }
                pointerDown(event);
            };
            board.pointerMove = (event) => {
                if (isInteracting) {
                    interactionMove();
                }
                pointerMove(event);
            };
            return board;
        };
        board = createTestingBoard([withOptions, withInnerPointerUp, withHandPointer, withPointerInteraction], []);
        const { viewportContainer } = fakeBoardElementHost(board);
        Object.defineProperty(viewportContainer, 'scrollLeft', { value: 200, writable: true });
        Object.defineProperty(viewportContainer, 'scrollTop', { value: 100, writable: true });
        board.pointer = customPointer;

        board.keyDown(createSpaceEvent('keydown'));

        expect(board.pointer).toBe(customPointer);
        expect(PlaitBoard.getPointer(board)).toBe(PlaitPointerType.hand);
        expect(PlaitBoard.isPointer(board, PlaitPointerType.hand)).toBeTrue();
        expect(PlaitBoard.isInPointer(board, [PlaitPointerType.hand])).toBeTrue();

        board.pointerDown(createPointerEvent('pointerdown', 100, 50));
        board.keyUp(createSpaceEvent('keyup'));

        expect(PlaitBoard.getPointer(board)).toBe(PlaitPointerType.hand);

        board.pointerMove(createPointerEvent('pointermove', 120, 60));
        board.pointerUp(createPointerEvent('pointerup', 120, 60));

        expect(interactionDown).not.toHaveBeenCalled();
        expect(interactionMove).not.toHaveBeenCalled();
        expect(innerPointerUp).not.toHaveBeenCalled();
        expect(viewportContainer.scrollLeft).toBe(180);
        expect(viewportContainer.scrollTop).toBe(90);

        board.globalPointerUp(createPointerEvent('pointerup', 120, 60));

        expect(board.pointer).toBe(customPointer);
        expect(PlaitBoard.getPointer(board)).toBe(customPointer);
    });

    it('restores the selected pointer after a Space hand gesture is cancelled', () => {
        const customPointer = 'custom-draw';
        const innerPointerCancel = jasmine.createSpy('innerPointerCancel').and.callFake(() => {
            expect(PlaitBoard.getPointer(board)).toBe(PlaitPointerType.hand);
        });
        const withInnerPointerCancel = (board: PlaitBoard) => {
            board.pointerCancel = innerPointerCancel;
            return board;
        };
        board = createTestingBoard([withOptions, withInnerPointerCancel, withHandPointer], []);
        fakeBoardElementHost(board);
        board.pointer = customPointer;

        board.keyDown(createSpaceEvent('keydown'));
        board.pointerDown(createPointerEvent('pointerdown', 100, 50));
        board.keyUp(createSpaceEvent('keyup'));

        expect(PlaitBoard.getPointer(board)).toBe(PlaitPointerType.hand);

        const pointerCancelEvent = createPointerEvent('pointercancel', 100, 50);
        board.pointerCancel(pointerCancelEvent);

        expect(innerPointerCancel).toHaveBeenCalledOnceWith(pointerCancelEvent);
        expect(board.pointer).toBe(customPointer);
        expect(PlaitBoard.getPointer(board)).toBe(customPointer);
    });

    it('does not interrupt an active pointer interaction when Space is pressed', () => {
        const customPointer = 'custom-draw';
        const interactionComplete = jasmine.createSpy('interactionComplete');
        const withPointerInteraction = (board: PlaitBoard) => {
            const { pointerDown, pointerUp } = board;
            let isInteracting = false;
            board.pointerDown = (event) => {
                if (PlaitBoard.isPointer(board, customPointer)) {
                    isInteracting = true;
                }
                pointerDown(event);
            };
            board.pointerUp = (event) => {
                if (isInteracting && PlaitBoard.isPointer(board, customPointer)) {
                    isInteracting = false;
                    interactionComplete();
                }
                pointerUp(event);
            };
            return board;
        };
        board = createTestingBoard([withOptions, withHandPointer, withPointerInteraction], []);
        fakeBoardElementHost(board);
        board.pointer = customPointer;

        board.pointerDown(createPointerEvent('pointerdown', 100, 50));
        board.keyDown(createSpaceEvent('keydown'));

        expect(PlaitBoard.getPointer(board)).toBe(customPointer);

        board.pointerUp(createPointerEvent('pointerup', 120, 60));
        board.globalPointerUp(createPointerEvent('pointerup', 120, 60));
        board.keyUp(createSpaceEvent('keyup'));

        expect(interactionComplete).toHaveBeenCalledOnceWith();
    });

    it('preserves the selection overlay while panning with Space', fakeAsync(() => {
        board = createTestingBoard([withOptions, withSelection, withHandPointer], children);
        fakeNodeWeakMap(board);
        const { activeHost } = fakeBoardElementHost(board);
        const drawSelectionRectangle = jasmine.createSpy('drawSelectionRectangle').and.callFake(() => createG());
        board.drawSelectionRectangle = drawSelectionRectangle;
        cacheSelectedElements(board, children);
        board.afterChange();
        const initialRectangle = activeHost.firstElementChild;

        board.keyDown(createSpaceEvent('keydown'));
        Transforms.setViewport(board, { zoom: 1, origination: [10, 10] });
        tick();

        expect(getSelectedElements(board)).toEqual(children);
        expect(drawSelectionRectangle).toHaveBeenCalledTimes(2);
        expect(activeHost.contains(initialRectangle)).toBeFalse();
        expect(activeHost.children.length).toBe(1);

        board.keyUp(createSpaceEvent('keyup'));
    }));
});
