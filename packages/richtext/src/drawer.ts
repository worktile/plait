import { ComponentRef, ViewContainerRef } from '@angular/core';
import { Descendant, Editor, Element, Operation, Transforms } from 'slate';
import { PlaitRichtextComponent } from './richtext/richtext.component';
import {
    IS_TEXT_EDITABLE,
    MERGING,
    PlaitBoard,
    Point,
    RectangleClient,
    createForeignObject,
    createG,
    toPoint,
    transformPoint,
    updateForeignObject
} from '@plait/core';
import { AngularEditor, EDITOR_TO_ELEMENT, IS_FOCUSED, hasEditableTarget } from 'slate-angular';
import { debounceTime, filter } from 'rxjs/operators';
import { fromEvent, timer } from 'rxjs';
import { getRichtextContentSize } from './utils/dom';

export interface TextChangeRef {
    newValue?: Element;
    width: number;
    height: number;
}

export class TextDrawer {
    componentRef!: ComponentRef<PlaitRichtextComponent>;
    g!: SVGGElement;
    isEditing = false;

    constructor(
        private board: PlaitBoard,
        private viewContainerRef: ViewContainerRef,
        private getRectangle: () => RectangleClient,
        private isHitElement: (point: Point) => boolean,
        private onChange: (textChangeRef: TextChangeRef) => void
    ) {}

    draw(value: Element) {
        this.componentRef = this.viewContainerRef.createComponent(PlaitRichtextComponent);
        this.componentRef.instance.value = value;
        this.componentRef.instance.readonly = true;
        const rectangle = this.getRectangle();
        this.g = createG();
        const foreignObject = createForeignObject(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        this.g.append(foreignObject);
        foreignObject.append(this.componentRef.instance.elementRef.nativeElement);
        this.g.classList.add('text');
    }

    update() {}

    edit() {
        IS_TEXT_EDITABLE.set(this.board, true);
        this.isEditing = true;
        this.componentRef.instance.readonly = false;
        this.componentRef.changeDetectorRef.detectChanges();

        const editor = this.componentRef.instance.editor;
        const isFocused = IS_FOCUSED.get(editor);
        const editable = EDITOR_TO_ELEMENT.get(editor);
        if (!isFocused && editable) {
            editable.focus({ preventScroll: true });
        }
        Transforms.select(editor, [0]);

        // add 999， avoid changing lines when paste more text
        const rectangle = this.getRectangle();
        updateForeignObject(this.g, 999, 999, rectangle.x, rectangle.y);

        let previousValue: Descendant[] = this.componentRef.instance.children;
        // use debounceTime to wait DOM render complete
        const valueChange$ = this.componentRef.instance.onChange
            .pipe(
                filter(value => {
                    return !editor.operations.every(op => Operation.isSelectionOperation(op));
                }),
                debounceTime(0)
            )
            .subscribe(value => {
                if (previousValue === editor.children) {
                    return;
                }
                previousValue = editor.children;
                const paragraph = AngularEditor.toDOMNode(editor, value.children[0]);
                let result = getRichtextContentSize(paragraph);
                const width = result.width / this.board.viewport.zoom;
                const height = result.height / this.board.viewport.zoom;
                this.onChange({ width, height, newValue: editor.children[0] as Element });
                MERGING.set(this.board, true);
            });

        const composition$ = this.componentRef.instance.onComposition.pipe(debounceTime(0)).subscribe(event => {
            const paragraph = AngularEditor.toDOMNode(editor, previousValue[0]);
            let result = getRichtextContentSize(paragraph);
            const width = result.width / this.board.viewport.zoom;
            const height = result.height / this.board.viewport.zoom;
            this.onChange({ width, height });
            MERGING.set(this.board, true);
        });

        const mousedown$ = fromEvent<MouseEvent>(document, 'mousedown').subscribe((event: MouseEvent) => {
            const point = transformPoint(this.board, toPoint(event.x, event.y, PlaitBoard.getHost(this.board)));
            const clickInNode = this.isHitElement(point);
            if (clickInNode && !hasEditableTarget(editor, event.target)) {
                event.preventDefault();
            } else if (!clickInNode) {
                // handle composition input state, like: Chinese IME Composition Input
                timer(0).subscribe(() => {
                    exitHandle();
                });
            }
        });

        const { onKeydown } = editor;
        editor.onKeydown = (event: KeyboardEvent) => {
            if (event.isComposing) {
                return;
            }
            if (event.key === 'Escape' || event.key === 'Enter' || event.key === 'Tab') {
                event.preventDefault();
                event.stopPropagation();
                exitHandle();
                return;
            }
        };

        const exitHandle = () => {
            this.isEditing = false;

            // unsubscribe
            valueChange$.unsubscribe();
            mousedown$.unsubscribe();
            composition$.unsubscribe();
            editor.onKeydown = onKeydown; // reset keydown

            // editable status
            this.componentRef.instance.readonly = true;
            this.componentRef.changeDetectorRef.detectChanges();
            IS_TEXT_EDITABLE.set(this.board, false);
            MERGING.set(this.board, false);

            setTimeout(() => {
                const rectangle = this.getRectangle();
                updateForeignObject(this.g, rectangle.width, rectangle.height, rectangle.x, rectangle.y);
            }, 0);
        };
    }

    destroy() {
        this.g.remove();
        this.componentRef.destroy();
    }
}
