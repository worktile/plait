import { ChangeDetectorRef, Directive } from '@angular/core';
import { PlaitBoard } from '../../interfaces';

@Directive({
    host: {
        class: 'plait-island-container'
    }
})
export abstract class PlaitIslandBaseComponent {
    board!: PlaitBoard;

    constructor(protected cdr: ChangeDetectorRef) {}

    initialize(board: PlaitBoard) {
        this.board = board;
        this.markForCheck();
    }

    markForCheck() {
        this.cdr.markForCheck();
    }
}

export interface OnBoardChange {
    onBoardChange: () => void;
}

export const hasOnBoardChange = (value: any): value is OnBoardChange => {
    if (value.onBoardChange) {
        return true;
    } else {
        return false;
    }
};
