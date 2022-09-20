import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
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

    @Input()
    viewZoom!: number;

    @Input()
    isDragMoveModel!: boolean;

    @Output() dragMoveHandle = new EventEmitter();

    @Output() adaptHandle = new EventEmitter();

    @Output() zoomInHandle = new EventEmitter();

    @Output() zoomOutHandle = new EventEmitter();

    @Output() resetZoomHandel = new EventEmitter();

    dragMove() {
        this.dragMoveHandle.emit();
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
