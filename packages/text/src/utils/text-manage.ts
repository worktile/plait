import { ComponentRef, ViewContainerRef } from '@angular/core';
import { BaseElement, Descendant, Element, Operation, Transforms } from 'slate';
import { PlaitRichtextComponent } from '../richtext/richtext.component';
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
import { debounceTime, filter, tap } from 'rxjs/operators';
import { fromEvent, timer } from 'rxjs';
import { measureDivSize } from './text-size';
import { TextPlugin } from '../custom-types';
import { PlaitTextEditor } from '../plugins/text.editor';

export enum ExitOrigin {
    'destroy' = 'destroy',
    'default' = 'default'
}

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

    onSelectionChangeHandle: ((editor: PlaitTextEditor) => void) | null = null;

    private exitHandle: (origin: ExitOrigin) => void = () => {};

    setEditing(value: boolean) {
        const editor = this.componentRef.instance.editor;
        const editable = AngularEditor.toDOMNode(editor, editor);
        if (value) {
            this.isEditing = true;
            editable.classList.add('editing');
        } else {
            this.isEditing = false;
            editable.classList.remove('editing');
        }
    }

    constructor(
        private board: PlaitBoard,
        private viewContainerRef: ViewContainerRef,
        private getRectangle: () => RectangleClient,
        private onValueChangeHandle?: (textChangeRef: TextManageRef) => void,
        private textPlugins?: TextPlugin[]
    ) {}

    draw(value: Element) {
        this.componentRef = this.viewContainerRef.createComponent(PlaitRichtextComponent);
        this.componentRef.instance.value = value;
        this.componentRef.instance.readonly = true;
        this.textPlugins && (this.componentRef.instance.textPlugins = this.textPlugins);
        const rectangle = this.getRectangle();
        this.g = createG();
        this.foreignObject = createForeignObject(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        this.g.append(this.foreignObject);
        this.foreignObject.append(this.componentRef.instance.elementRef.nativeElement);
        this.g.classList.add('text');

        const editor = this.componentRef.instance.editor;

        (editor as PlaitTextEditor).board = this.board;

        let previousValue: Descendant[] = this.componentRef.instance.children;

        this.componentRef.instance.onChange
            .pipe(
                tap(() => {
                    if (editor.operations.every(op => Operation.isSelectionOperation(op))) {
                        this.onSelectionChangeHandle && this.onSelectionChangeHandle(editor);
                    }
                }),
                filter(value => {
                    return !editor.operations.every(op => Operation.isSelectionOperation(op));
                }),
                tap(() => {
                    // 1.add editing class to set max width
                    // 2.set isEditing state to avoid reset text during updating
                    if (AngularEditor.isReadonly(editor) && !this.isEditing) {
                        this.setEditing(true);
                    }
                }),
                debounceTime(0)
            )
            .subscribe(value => {
                if (previousValue === editor.children) {
                    return;
                }

                if (AngularEditor.isReadonly(editor)) {
                    const { x, y } = rectangle || this.getRectangle();
                    updateForeignObject(this.g, 999, 999, x, y);
                    // do not need to revert because foreign will be updated when node changed
                }

                previousValue = editor.children;
                const { width, height } = this.getSize();
                this.onValueChangeHandle && this.onValueChangeHandle({ width, height, newValue: editor.children[0] as Element });
                MERGING.set(this.board, true);

                if (AngularEditor.isReadonly(editor) && this.isEditing) {
                    this.setEditing(false);
                }
            });
    }

    updateWidth(width: number) {
        if (this.componentRef.instance.slateEditable) {
            const editable = AngularEditor.toDOMNode(this.componentRef.instance.editor, this.componentRef.instance.editor);
            // remove width and max-width
            if (width === 0) {
                editable.style.removeProperty('width');
                editable.style.removeProperty('max-width');
            } else {
                editable.style.width = `${width}px`;
                editable.style.maxWidth = `${width}px`;
            }
        } else {
            // init width
            this.componentRef.instance.width = width;
        }
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

    edit(onExitCallback?: (origin: ExitOrigin) => void) {
        IS_TEXT_EDITABLE.set(this.board, true);
        this.setEditing(true);
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
        this.onValueChangeHandle && this.onValueChangeHandle({ width, height });

        const composition$ = this.componentRef.instance.onComposition.pipe(debounceTime(0)).subscribe(event => {
            const { width, height } = this.getSize();
            this.onValueChangeHandle && this.onValueChangeHandle({ width, height });
            MERGING.set(this.board, true);
        });

        const mousedown$ = fromEvent<MouseEvent>(document, 'mousedown').subscribe((event: MouseEvent) => {
            const point = transformPoint(this.board, toPoint(event.x, event.y, PlaitBoard.getHost(this.board)));
            const textRec = this.getRectangle();
            const clickInText = RectangleClient.isHit(RectangleClient.toRectangleClient([point, point]), textRec);
            const isAttached = (event.target as HTMLElement).closest('.plait-board-attached');

            if (!clickInText && !isAttached) {
                // handle composition input state, like: Chinese IME Composition Input
                timer(0).subscribe(() => {
                    this.exitHandle(ExitOrigin.default);
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
                this.exitHandle(ExitOrigin.default);
                return;
            }
            onKeydown(event);
        };

        this.exitHandle = (origin: ExitOrigin) => {
            this.setEditing(false);

            if (origin === ExitOrigin.default) {
                this.updateRectangle();
            }

            mousedown$.unsubscribe();
            composition$.unsubscribe();
            editor.onKeydown = onKeydown;

            if (origin === ExitOrigin.default) {
                this.componentRef.instance.readonly = true;
                this.componentRef.changeDetectorRef.detectChanges();
            }

            IS_TEXT_EDITABLE.set(this.board, false);
            MERGING.set(this.board, false);

            if (onExitCallback) {
                onExitCallback(origin);
            }
        };
    }

    getSize() {
        const editor = this.componentRef.instance.editor;
        const paragraph = AngularEditor.toDOMNode(editor, editor.children[0]);
        return measureDivSize(paragraph);
    }

    setOnChangeHandle(onChange: ((editor: PlaitTextEditor) => void) | null) {
        this.onSelectionChangeHandle = onChange;
    }

    destroy() {
        this.g?.remove();
        this.componentRef?.destroy();
        this.exitHandle(ExitOrigin.destroy);
    }
}
