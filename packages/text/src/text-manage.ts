import { ComponentRef, ViewContainerRef } from '@angular/core';
import { BaseElement, Descendant, Element, Operation, Transforms } from 'slate';
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
import { measureDivSize } from './text-size';
import { TextPlugin } from './custom-types';

export interface TextManageRef {
    newValue?: Element;
    width: number;
    height: number;
}

export class TextManage {
    componentRef!: ComponentRef<PlaitRichtextComponent>;
    g!: SVGGElement;
    foreignObject!: SVGForeignObjectElement;
    isEditing = false;

    constructor(
        private board: PlaitBoard,
        private viewContainerRef: ViewContainerRef,
        private getRectangle: () => RectangleClient,
        private isHitElement?: (point: Point) => boolean,
        private onChange?: (textChangeRef: TextManageRef) => void,
        private textPlugin?: TextPlugin[]
    ) {}

    draw(value: Element) {
        this.componentRef = this.viewContainerRef.createComponent(PlaitRichtextComponent);
        this.componentRef.instance.value = value;
        this.componentRef.instance.readonly = true;
        this.componentRef.instance.textPlugin = this.textPlugin || [];

        const rectangle = this.getRectangle();
        this.g = createG();
        this.foreignObject = createForeignObject(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        this.g.append(this.foreignObject);
        this.foreignObject.append(this.componentRef.instance.elementRef.nativeElement);
        this.g.classList.add('text');

        const editor = this.componentRef.instance.editor;

        let previousValue: Descendant[] = this.componentRef.instance.children;
        // use debounceTime to wait DOM render complete
        this.componentRef.instance.onChange
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

                if (!this.isEditing) {
                    const { x, y } = rectangle || this.getRectangle();
                    updateForeignObject(this.g, 999, 999, x, y);
                    // do not need to revert because foreign will be updated when node changed
                }

                previousValue = editor.children;
                const { width, height } = this.getSize();
                this.onChange && this.onChange({ width, height, newValue: editor.children[0] as Element });
                MERGING.set(this.board, true);
            });
    }

    updateRectangle(rectangle?: RectangleClient) {
        const { x, y, width, height } = rectangle || this.getRectangle();
        if (this.isEditing) {
            updateForeignObject(this.g, 999, 999, x, y);
        } else {
            updateForeignObject(this.g, width, height, x, y);
            // solve text lose on move node
            if (this.foreignObject.children.length === 0) {
                this.foreignObject.append(this.componentRef.instance.elementRef.nativeElement);
            }
        }
    }

    updateText(newText: BaseElement) {
        if (newText !== this.componentRef.instance.children[0] && !this.isEditing) {
            this.componentRef.instance.children = [newText];
        }
    }

    edit(onExit?: () => void) {
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

        this.updateRectangle();

        const { width, height } = this.getSize();
        this.onChange && this.onChange({ width, height });

        const composition$ = this.componentRef.instance.onComposition.pipe(debounceTime(0)).subscribe(event => {
            const { width, height } = this.getSize();
            this.onChange && this.onChange({ width, height });
            MERGING.set(this.board, true);
        });

        const mousedown$ = fromEvent<MouseEvent>(document, 'mousedown').subscribe((event: MouseEvent) => {
            const point = transformPoint(this.board, toPoint(event.x, event.y, PlaitBoard.getHost(this.board)));
            const clickInNode = this.isHitElement && this.isHitElement(point);
            const isAttached = (event.target as HTMLElement).closest('.plait-board-attached');

            // keep focus when click in node
            if ((clickInNode && !hasEditableTarget(editor, event.target)) || isAttached) {
                event.preventDefault();
            }

            if (!clickInNode && !isAttached) {
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
            if (event.key === 'Escape' || (event.key === 'Enter' && !event.shiftKey) || event.key === 'Tab') {
                event.preventDefault();
                event.stopPropagation();
                exitHandle();
                return;
            }
            onKeydown(event);
        };

        const exitHandle = () => {
            this.isEditing = false;
            this.updateRectangle();

            mousedown$.unsubscribe();
            composition$.unsubscribe();
            editor.onKeydown = onKeydown;

            this.componentRef.instance.readonly = true;
            this.componentRef.changeDetectorRef.detectChanges();
            IS_TEXT_EDITABLE.set(this.board, false);
            MERGING.set(this.board, false);

            if (onExit) {
                onExit();
            }
        };
    }

    private getSize() {
        const editor = this.componentRef.instance.editor;
        const paragraph = AngularEditor.toDOMNode(editor, editor.children[0]);
        return measureDivSize(paragraph);
    }

    destroy() {
        this.g?.remove();
        this.componentRef?.destroy();
    }
}
