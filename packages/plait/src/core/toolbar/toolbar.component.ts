import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { PlaitPointerType } from '../../interfaces';

@Component({
    selector: 'plait-toolbar',
    templateUrl: './toolbar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitToolbarComponent {
    _viewZoom = 100;

    PlaitPointerType = PlaitPointerType;

    @HostBinding('class') hostClass = `plait-board-toolbar`;

    @Input() pointerType!: PlaitPointerType;

    @Input()
    set viewZoom(zoom: number) {
        this._viewZoom = Number(((zoom ?? 1) * 100).toFixed(0));
    }
    get viewZoom() {
        return this._viewZoom;
    }

    @Output() moveHandle: EventEmitter<PlaitPointerType> = new EventEmitter();

    @Output() adaptHandle = new EventEmitter();

    @Output() zoomInHandle = new EventEmitter();

    @Output() zoomOutHandle = new EventEmitter();

    @Output() resetZoomHandel = new EventEmitter();

    dragMove() {
        if (this.pointerType !== PlaitPointerType.hand) {
            this.moveHandle.emit(PlaitPointerType.hand);
        } else {
            this.moveHandle.emit(PlaitPointerType.selection);
        }
    }

    // 适应画布
    adapt() {
        this.adaptHandle.emit();
    }

    // 放大
    zoomIn() {
        this.zoomInHandle.emit();
    }

    // 缩小
    zoomOut() {
        this.zoomOutHandle.emit();
    }

    resetZoom() {
        this.resetZoomHandel.emit();
    }
}
