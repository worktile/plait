import { ComponentRef, ViewContainerRef } from '@angular/core';
import { BaseElement, BaseOperation, Descendant, Element, Node, Operation, Transforms } from 'slate';
import { PlaitRichtextComponent } from '../richtext/richtext.component';
import {
    IS_TEXT_EDITABLE,
    MERGING,
    PlaitBoard,
    Point,
    RectangleClient,
    createForeignObject,
    createG,
    setAngleForG,
    toHostPoint,
    toViewBoxPoint,
    updateForeignObject,
    updateForeignObjectWidth
} from '@plait/core';
import { AngularEditor, EDITOR_TO_ELEMENT } from 'slate-angular';
import { debounceTime, filter, tap } from 'rxjs/operators';
import { fromEvent, timer } from 'rxjs';
import { measureDivSize } from './text-size';
import { Alignment, CustomElement, TextPlugin } from '../custom-types';
import { PlaitTextEditor } from '../plugins/text.editor';
import { AlignEditor } from '../plugins/align/align-editor';

export enum ExitOrigin {
    'destroy' = 'destroy',
    'default' = 'default'
}

export interface TextManageRef {
    newValue?: Element;
    width: number;
    height: number;
    operations?: BaseOperation[];
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
        private options: {
            getRectangle: () => RectangleClient;
            onValueChangeHandle?: (textChangeRef: TextManageRef) => void;
            getRenderRectangle?: () => RectangleClient;
            textPlugins?: TextPlugin[];
            getMaxWidth?: () => number;
        }
    ) {
        if (!this.options.getMaxWidth) {
            this.options.getMaxWidth = () => 999;
        }
    }

    draw(value: Element) {
        this.componentRef = this.viewContainerRef.createComponent(PlaitRichtextComponent);
        this.componentRef.instance.value = value;
        this.componentRef.instance.readonly = true;
        this.options.textPlugins && (this.componentRef.instance.textPlugins = this.options.textPlugins);
        const _rectangle = this.options.getRectangle();
        this.g = createG();
        this.foreignObject = createForeignObject(_rectangle.x, _rectangle.y, _rectangle.width, _rectangle.height);
        this.g.append(this.foreignObject);
        this.foreignObject.append(this.componentRef.instance.elementRef.nativeElement);
        this.g.classList.add('text');

        const editor = this.componentRef.instance.editor;

        (editor as PlaitTextEditor).board = this.board;

        let previousValue: Descendant[] = this.componentRef.instance.children;
        let operations: BaseOperation[] = [];
        this.componentRef.instance.onChange
            .pipe(
                tap(() => {
                    operations = editor.operations;
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
                    const { x, y, height } = this.options.getRectangle();
                    updateForeignObject(this.g, this.options.getMaxWidth!(), height, x, y);
                    // do not need to revert because foreign will be updated when node changed
                }
                previousValue = editor.children;
                const { width, height } = this.getSize();
                this.options.onValueChangeHandle &&
                    this.options.onValueChangeHandle({ width, height, newValue: editor.children[0] as Element, operations });
                MERGING.set(this.board, true);

                if (AngularEditor.isReadonly(editor) && this.isEditing) {
                    this.setEditing(false);
                }
            });
    }

    updateRectangleWidth(width: number) {
        updateForeignObjectWidth(this.g, width);
    }

    updateAngle(centerPoint: Point, angle: number = 0) {
        setAngleForG(this.g, centerPoint, angle);
    }

    updateRectangle(rectangle?: RectangleClient) {
        const { x, y, width, height } = rectangle || this.options.getRectangle();
        if (this.isEditing) {
            const editor = this.componentRef.instance.editor;
            if (AlignEditor.isActive(editor, Alignment.right) || AlignEditor.isActive(editor, Alignment.center)) {
                if (AlignEditor.isActive(editor, Alignment.right)) {
                    const newX = x - (this.options.getMaxWidth!() - width);
                    updateForeignObject(this.g, this.options.getMaxWidth!(), height, newX, y);
                }
                if (AlignEditor.isActive(editor, Alignment.center)) {
                    const newX = x - (this.options.getMaxWidth!() - width) / 2;
                    updateForeignObject(this.g, this.options.getMaxWidth!(), height, newX, y);
                }
            } else {
                updateForeignObject(this.g, this.options.getMaxWidth!(), height, x, y);
            }
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

    edit(onExitCallback?: (origin: ExitOrigin, text: CustomElement[]) => void) {
        IS_TEXT_EDITABLE.set(this.board, true);
        this.setEditing(true);
        this.componentRef.instance.readonly = false;
        this.componentRef.changeDetectorRef.detectChanges();

        const editor = this.componentRef.instance.editor;
        const editable = EDITOR_TO_ELEMENT.get(editor);
        if (editable) {
            if (Node.string(editor).length === 0) {
                window.getSelection()?.removeAllRanges();
            }
            Transforms.select(editor, [0]);
            editable.focus({ preventScroll: true });
        }

        this.updateRectangle();
        const { width, height } = this.getSize();
        this.options.onValueChangeHandle && this.options.onValueChangeHandle({ width, height });

        const composition$ = this.componentRef.instance.onComposition.pipe(debounceTime(0)).subscribe(event => {
            const { width, height } = this.getSize();
            this.options.onValueChangeHandle && this.options.onValueChangeHandle({ width, height });
            MERGING.set(this.board, true);
        });

        const mousedown$ = fromEvent<MouseEvent>(document, 'mousedown').subscribe((event: MouseEvent) => {
            const point = toViewBoxPoint(this.board, toHostPoint(this.board, event.x, event.y));
            const textRec = this.options.getRenderRectangle? this.options.getRenderRectangle(): this.options.getRectangle();
            const clickInText = RectangleClient.isHit(RectangleClient.getRectangleByPoints([point, point]), textRec);
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
                AngularEditor.deselect(editor);
            }

            IS_TEXT_EDITABLE.set(this.board, false);
            MERGING.set(this.board, false);

            if (onExitCallback) {
                onExitCallback(origin, this.componentRef.instance.children);
            }
        };
    }

    getSize() {
        const editor = this.componentRef.instance.editor;
        const transformMatrix = this.g.getAttribute('transform');
        this.g.setAttribute('transform', '');
        const paragraph = AngularEditor.toDOMNode(editor, editor.children[0]);
        const { width, height } = measureDivSize(paragraph);
        if (transformMatrix) {
            this.g.setAttribute('transform', transformMatrix);
        }
        return { width, height };
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
