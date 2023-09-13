import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef } from '@angular/core';
import { BoardCreateMode, BoardTransforms, PlaitBoard, PlaitIslandBaseComponent, PlaitPointerType, setCreateMode } from '@plait/core';
import { DrawPointerType } from '@plait/draw';
import { MindPointerType } from '@plait/mind';
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
    DrawPointerType = DrawPointerType;
    BoardCreateMode = BoardCreateMode;

    constructor(protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    isPointer(pointer: PointerType) {
        return PlaitBoard.isPointer<PointerType>(this.board, pointer);
    }

    setPointer(event: Event, pointer: PointerType) {
        event.preventDefault();
        BoardTransforms.updatePointerType<PointerType>(this.board, pointer);
        setCreateMode(this.board, BoardCreateMode.drag);
        fromEvent(event.target as HTMLElement, 'mouseup')
            .pipe(take(1))
            .subscribe(() => {
                setCreateMode(this.board, BoardCreateMode.draw);
            });
    }
}
