import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef } from '@angular/core';
import { BoardCreationMode, CommonImageItem, selectImage, setCreationMode } from '@plait/common';
import { BoardTransforms, PlaitBoard, PlaitIslandBaseComponent, PlaitPointerType, getSelectedElements } from '@plait/core';
import { DrawPointerType, DrawTransforms, GeometryShape, LineShape } from '@plait/draw';
import { MindElement, MindPointerType, MindTransforms, getSelectedImageElement } from '@plait/mind';
import { fromEvent, take } from 'rxjs';
import { NgClass, NgTemplateOutlet } from '@angular/common';

type PointerType = MindPointerType | PlaitPointerType | DrawPointerType | GeometryShape | LineShape;

@Component({
    selector: 'app-main-toolbar',
    templateUrl: './main-toolbar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: PlaitIslandBaseComponent, useExisting: forwardRef(() => AppMainToolbarComponent) }],
    host: {
        class: 'app-main-toolbar'
    },
    standalone: true,
    imports: [NgClass, NgTemplateOutlet]
})
export class AppMainToolbarComponent extends PlaitIslandBaseComponent {
    PlaitPointerType = PlaitPointerType;
    MindPointerType = MindPointerType;
    GeometryShapeType = GeometryShape;
    LineShapeType = LineShape;

    BoardCreationMode = BoardCreationMode;

    constructor(protected cdr: ChangeDetectorRef) {
        super(cdr);
    }

    isPointer(pointer: PointerType) {
        return PlaitBoard.isPointer<PointerType>(this.board, pointer);
    }

    setPointer(event: Event, pointer: PointerType) {
        event.preventDefault();
        BoardTransforms.updatePointerType<PointerType>(this.board, pointer);
        setCreationMode(this.board, BoardCreationMode.dnd);
        fromEvent(event.target as HTMLElement, 'mouseup')
            .pipe(take(1))
            .subscribe(() => {
                setCreationMode(this.board, BoardCreationMode.drawing);
            });
    }

    addImage(event: Event) {
        const element = getSelectedElements(this.board)[0] || getSelectedImageElement(this.board);
        const defaultImageWidth = element ? 240 : 1000;
        const handle = (imageItem: CommonImageItem) => {
            if (element) {
                MindTransforms.setImage(this.board, element as MindElement, imageItem);
            } else {
                DrawTransforms.insertImage(this.board, imageItem);
            }
        };
        selectImage(this.board, defaultImageWidth, handle);
    }
}
