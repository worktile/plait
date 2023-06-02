import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, forwardRef } from '@angular/core';
import { BoardTransforms, OnBoardChange, PlaitBoard, PlaitPointerType, PlaitIslandBaseComponent } from '@plait/core';

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    host: {
        class: 'plait-toolbar-container'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: PlaitIslandBaseComponent, useExisting: forwardRef(() => AppToolbarBaseComponent) }]
})
export class AppToolbarBaseComponent extends PlaitIslandBaseComponent implements OnBoardChange {
    constructor(protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    get zoom() {
        let zoom = 1;
        if (this.board) {
            zoom = this.board.viewport.zoom;
        }
        return Number((zoom * 100).toFixed(0));
    }

    get isHand() {
        return this.board?.pointer === PlaitPointerType.hand;
    }

    activeHand() {
        BoardTransforms.updatePointerType(this.board, this.isHand ? PlaitPointerType.selection : PlaitPointerType.hand);
    }

    adapt() {
        BoardTransforms.fitViewport(this.board);
    }

    zoomIn() {
        BoardTransforms.updateZoom(this.board, this.board.viewport.zoom + 0.1);
    }

    zoomOut() {
        BoardTransforms.updateZoom(this.board, this.board.viewport.zoom - 0.1);
    }

    resetZoom() {
        BoardTransforms.updateZoom(this.board, 1);
    }

    onBoardChange() {
    }
}
