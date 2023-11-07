import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, forwardRef } from '@angular/core';
import { BoardCreationMode, CommonImageItem, selectImage, setCreationMode } from '@plait/common';
import { BoardTransforms, PlaitBoard, PlaitIslandBaseComponent, PlaitPointerType, getSelectedElements } from '@plait/core';
import { DrawPointerType, DrawTransforms, LineShape, getLinePointers, BasicShapes, FlowchartSymbols } from '@plait/draw';
import { MindElement, MindPointerType, MindTransforms, getSelectedImageElement } from '@plait/mind';
import { fromEvent, take } from 'rxjs';
import { NgClass, NgTemplateOutlet, NgIf } from '@angular/common';

type PointerType = MindPointerType | PlaitPointerType | DrawPointerType | LineShape;

@Component({
    selector: 'app-main-toolbar',
    templateUrl: './main-toolbar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: PlaitIslandBaseComponent, useExisting: forwardRef(() => AppMainToolbarComponent) }],
    host: {
        class: 'app-main-toolbar'
    },
    standalone: true,
    imports: [NgClass, NgTemplateOutlet, NgIf]
})
export class AppMainToolbarComponent extends PlaitIslandBaseComponent {
    PlaitPointerType = PlaitPointerType;

    MindPointerType = MindPointerType;

    GeometryShapeType = BasicShapes;

    FlowchartSymbols = FlowchartSymbols;

    LineShapeType = LineShape;

    BoardCreationMode = BoardCreationMode;

    showToolbar = false;

    constructor(protected cdr: ChangeDetectorRef, private elementRef: ElementRef<HTMLElement>) {
        super(cdr);
    }

    isPointer(pointer: PointerType) {
        return PlaitBoard.isPointer<PointerType>(this.board, pointer);
    }

    setPointer(event: Event, pointer: PointerType) {
        event.preventDefault();
        const isLinePointer = getLinePointers().includes(pointer);
        if (!isLinePointer) {
            BoardTransforms.updatePointerType<PointerType>(this.board, pointer);
            setCreationMode(this.board, BoardCreationMode.dnd);
        }
        fromEvent(event.target as HTMLElement, 'mouseup')
            .pipe(take(1))
            .subscribe(() => {
                setCreationMode(this.board, BoardCreationMode.drawing);
                !PlaitBoard.isPointer(this.board, pointer) && BoardTransforms.updatePointerType<PointerType>(this.board, pointer);
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

    openPopover() {
        this.showToolbar = true;
        const upEvent = fromEvent(document, 'mouseup')
            .pipe(take(1))
            .subscribe(event => {
                this.showToolbar = false;
                upEvent.unsubscribe();
                this.cdr.markForCheck();
            });
    }
}
