import { ChangeDetectorRef, Directive, Input, OnDestroy, OnInit } from '@angular/core';
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

@Directive({
    host: {
        class: 'plait-island-popover-container'
    }
})
export abstract class PlaitIslandPopoverBaseComponent implements OnInit, OnDestroy {
    @Input() board!: PlaitBoard;

    private onChange!: () => void;

    initialize(board: PlaitBoard) {
        this.board = board;
        const onChange = board.onChange;
        board.onChange = () => {
            onChange();
            if (hasOnBoardChange(this)) {
                this.onBoardChange();
            }
        };
        this.onChange = onChange;
    }

    ngOnInit(): void {
        if (!this.board) {
            throw new Error('can not find board instance');
        }
        this.initialize(this.board);
        this.islandOnInit();
    }

    ngOnDestroy(): void {
        this.board.onChange = this.onChange;
        this.islandOnDestroy();
    }

    /**
     * use islandOnInit replace ngOnInit to avoid ngOnInit being overridden
     */
    abstract islandOnInit(): void;

    /**
     * use islandOnDestroy replace ngOnDestroy to avoid ngOnDestroy being overridden
     */
    abstract islandOnDestroy(): void;
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
