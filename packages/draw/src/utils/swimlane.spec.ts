import { BOARD_TO_TEMPORARY_POINTER, createTestingBoard, PlaitBoard, PlaitPointerType } from '@plait/core';
import { SwimlaneDrawSymbols } from '../interfaces';
import { isSwimlanePointers } from './swimlane';

describe('isSwimlanePointers', () => {
    let board: PlaitBoard;

    afterEach(() => {
        BOARD_TO_TEMPORARY_POINTER.delete(board);
    });

    it('uses the effective pointer by default', () => {
        board = createTestingBoard([], []);
        board.pointer = SwimlaneDrawSymbols.swimlaneHorizontal;
        expect(isSwimlanePointers(board)).toBeTrue();
        BOARD_TO_TEMPORARY_POINTER.set(board, PlaitPointerType.hand);
        expect(isSwimlanePointers(board)).toBeFalse();
    });
});
