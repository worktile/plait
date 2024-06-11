import { ChangeDetectorRef, Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { PlaitBoard } from '@plait/core';
import { Subscription } from 'rxjs';
import { BOARD_TO_COMPONENT } from '../utils/weak-maps';
import { BoardComponentInterface } from '../board/board.component.interface';

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

    private subscription?: Subscription;

    constructor(public cdr: ChangeDetectorRef) {}

    initialize(board: PlaitBoard) {
        this.board = board;
        const boardComponent = BOARD_TO_COMPONENT.get(board) as BoardComponentInterface;
        this.subscription = boardComponent.onChange.subscribe(() => {
            if (hasOnBoardChange(this)) {
                this.onBoardChange();
            }
            this.cdr.markForCheck();
        });
    }

    ngOnInit(): void {
        if (!this.board) {
            throw new Error('can not find board instance');
        }
        this.initialize(this.board);
        this.islandOnInit();
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
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
