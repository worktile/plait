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
    @HostBinding('class') hostClass = `zoom-toolbar`;

    @Input()
    board!: PlaitBoard;

    public zoom: number = 10;

    private get zoomFactor(): number {
        return (2 * this.zoom - 10) / this.zoom;
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
        if (this.zoom >= 40) {
            return;
        }
        this.zoom++;
        this.zoomChange();
    }

    // 缩小
    zoomOut() {
        if (this.zoom <= 2) {
            return;
        }
        this.zoom--;
        this.zoomChange();
    }

    zoomChange() {
        const viewport = this.board?.viewport as Viewport;
        Transforms.setViewport(this.board, {
            ...viewport,
            zoom: this.zoomFactor
        });
    }

    resetZoom() {
        const viewport = this.board?.viewport as Viewport;
        Transforms.setViewport(this.board, {
            ...viewport,
            zoom: 1
        });
        this.zoom = 10;
    }
}
