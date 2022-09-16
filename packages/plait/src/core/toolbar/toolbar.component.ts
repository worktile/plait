import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Transforms } from '../../transfroms';
import { Viewport } from '../../interfaces/viewport';
import { PlaitBoard } from '../../interfaces/board';

@Component({
    selector: 'plait-toolbar',
    templateUrl: './toolbar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitToolbarComponent implements OnInit, OnDestroy {
    @HostBinding('class') hostClass = `zoom-toolbar`;

    @Input()
    board!: PlaitBoard;

    public get zoom(): number {
        return Math.floor(this.board.viewport.zoom * 100);
    }

    constructor(private cdr: ChangeDetectorRef, private renderer2: Renderer2) {}

    ngOnInit(): void {}

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
    zoomIn(event: MouseEvent) {
        const viewport = this.board?.viewport as Viewport;
        Transforms.setViewport(this.board, {
            ...viewport,
            zoom: viewport.zoom + 0.1
        });
    }

    // 缩小
    zoomOut(event: MouseEvent) {
        const viewport = this.board?.viewport as Viewport;
        Transforms.setViewport(this.board, {
            ...viewport,
            zoom: viewport.zoom - 0.1
        });
    }

    resetZoom(event?: MouseEvent) {
        const viewport = this.board?.viewport as Viewport;
        Transforms.setViewport(this.board, {
            ...viewport,
            zoom: 1
        });
    }

    ngOnDestroy(): void {}
}
