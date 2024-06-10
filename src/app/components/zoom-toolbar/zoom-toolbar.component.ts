import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef } from '@angular/core';
import { BoardTransforms } from '@plait/core';
import { NgTemplateOutlet } from '@angular/common';
import { OnBoardChange, PlaitIslandBaseComponent } from '@plait/angular-board';

@Component({
    selector: 'app-zoom-toolbar',
    templateUrl: './zoom-toolbar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: PlaitIslandBaseComponent, useExisting: forwardRef(() => AppZoomToolbarComponent) }],
    host: {
        class: 'app-zoom-toolbar'
    },
    standalone: true,
    imports: [NgTemplateOutlet]
})
export class AppZoomToolbarComponent extends PlaitIslandBaseComponent implements OnBoardChange {
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

    onBoardChange() {}
}
