import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef } from '@angular/core';
import { BoardTransforms, PlaitBoard, PlaitIslandBaseComponent, PlaitPointerType } from '@plait/core';
import { MindPointerType } from '@plait/mind';
import { DrawPointerType, DrawCreateMode } from '@plait/draw';
import { setCreateMode } from 'packages/draw/src/utils/create-mode';
import { fromEvent, take } from 'rxjs';

type PointerType = MindPointerType | PlaitPointerType | DrawPointerType;

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
    drawPointerType = DrawPointerType;
    drawCreateMode = DrawCreateMode;

    constructor(protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    isPointer(pointer: PointerType) {
        return PlaitBoard.isPointer<PointerType>(this.board, pointer);
    }

    setPointer(event: Event, pointer: PointerType) {
        event.preventDefault();
        BoardTransforms.updatePointerType<PointerType>(this.board, pointer);
        fromEvent(event.target as HTMLElement, 'mouseup')
            .pipe(take(1))
            .subscribe(() => {
                setCreateMode(this.board, DrawCreateMode.draw);
            });
    }
}
