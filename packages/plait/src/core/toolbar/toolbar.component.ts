import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { Transforms } from '../../transfroms';
import { Viewport } from '../../interfaces/viewport';
import { PlaitBoard } from '../../interfaces/board';

@Component({
    selector: 'plait-toolbar',
    templateUrl: './toolbar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitToolbarComponent {
    @HostBinding('class') hostClass = `plait-board-toolbar`;

    @Input()
    board!: PlaitBoard;

    public viewZoom: number = 100;

    private get zoom(): number {
        return (2 * this.viewZoom - 100) / this.viewZoom;
    }

    constructor() {}

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

    zoomChange() {
        const viewport = this.board?.viewport as Viewport;
        Transforms.setViewport(this.board, {
            ...viewport,
            zoom: this.zoom
        });
    }

    resetZoom() {
        const viewport = this.board?.viewport as Viewport;
        Transforms.setViewport(this.board, {
            ...viewport,
            zoom: 1
        });
        this.viewZoom = 100;
    }
}
