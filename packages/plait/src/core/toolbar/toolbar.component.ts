import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { PlaitBoard, PlaitPointerType } from '../../interfaces';
import { updatePointerType } from '../../transforms/board';

@Component({
    selector: 'plait-toolbar',
    templateUrl: './toolbar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaitToolbarComponent {
    PlaitPointerType = PlaitPointerType;

    @HostBinding('class') hostClass = `plait-board-toolbar`;

    @Input() board!: PlaitBoard;

    get zoom() {
        const zoom = this.board?.viewport.zoom || 1;
        return Number((zoom * 100).toFixed(0));
    }

    get isHand() {
        return this.board.pointer === PlaitPointerType.hand;
    }

    @Output() adaptHandle = new EventEmitter();

    @Output() zoomInHandle = new EventEmitter();

    @Output() zoomOutHandle = new EventEmitter();

    @Output() resetZoomHandel = new EventEmitter();

    activeHand() {
        updatePointerType(this.board, this.isHand ? PlaitPointerType.selection : PlaitPointerType.hand);
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
