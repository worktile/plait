import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef } from '@angular/core';
import { BoardTransforms, PlaitBoard, PlaitIslandBaseComponent, PlaitPointerType } from '@plait/core';
import { MindPointerType } from '@plait/mind';

@Component({
    selector: 'app-main-toolbar',
    templateUrl: './main-toolbar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: PlaitIslandBaseComponent, useExisting: forwardRef(() => AppMainToolbarComponent) }],
    host: {
        class: 'app-main-toolbar'
    }
})
export class AppMainToolbarComponent extends PlaitIslandBaseComponent {
    PlaitPointerType = PlaitPointerType;
    MindPointerType = MindPointerType;

    constructor(protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    isPointer(pointer: MindPointerType | PlaitPointerType) {
        return PlaitBoard.isPointer<MindPointerType | PlaitPointerType>(this.board, pointer);
    }

    setPointer(event: Event, pointer: MindPointerType | PlaitPointerType) {
        BoardTransforms.updatePointerType<MindPointerType | PlaitPointerType>(this.board, pointer);
    }
}
