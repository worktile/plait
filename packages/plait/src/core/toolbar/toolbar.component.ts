import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input } from '@angular/core';
import { Transforms } from '../../transfroms';
import { Viewport } from '../../interfaces/viewport';
import { PlaitBoard } from '../../interfaces/board';
import { BaseCursorStatus, CursorStatus } from '../../interfaces';

@Component({
    selector: 'plait-toolbar',
    templateUrl: './toolbar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitToolbarComponent {
    @HostBinding('class') hostClass = `plait-board-toolbar`;

    @Input()
    board!: PlaitBoard;

    public get isDragMoveModel(): boolean {
        return this.cursorStatus === BaseCursorStatus.drag;
    }

    public cursorStatus: CursorStatus = BaseCursorStatus.select;

    public viewZoom: number = 100;

    private get zoom(): number {
        return (2 * this.viewZoom - 100) / this.viewZoom;
    }

    constructor(private cdr: ChangeDetectorRef) {}

    openDragMove() {
        this.cursorStatus = BaseCursorStatus.drag;
        this.cdr.detectChanges();
    }

    closeDragMove() {
        this.cursorStatus = BaseCursorStatus.select;
        this.cdr.detectChanges();
    }

    dragMove() {
        this.isDragMoveModel ? this.closeDragMove() : this.openDragMove();
    }

    // 适应画布
    adapt() {
        const viewport = this.board?.viewport as Viewport;
        Transforms.setViewport(this.board, {
            ...viewport,
            offsetX: 0,
            offsetY: 0
        });
        this.resetZoom();
    }

    // 放大
    zoomIn() {
        if (this.viewZoom >= 400) {
            return;
        }
        this.viewZoom += 10;
        this.zoomChange();
    }

    // 缩小
    zoomOut() {
        if (this.viewZoom <= 20) {
            return;
        }
        this.viewZoom -= 10;
        this.zoomChange();
    }

    resetZoom() {
        this.viewZoom = 100;
        this.zoomChange();
    }

    zoomChange() {
        const viewport = this.board?.viewport as Viewport;
        Transforms.setViewport(this.board, {
            ...viewport,
            zoom: this.zoom
        });
    }
}
