import {
    IS_TEXT_EDITABLE,
    MERGING,
    PlaitBoard,
    Point,
    RectangleClient,
    createForeignObject,
    createG,
    debounce,
    setAngleForG,
    toHostPoint,
    toViewBoxPoint,
    updateForeignObject,
    updateForeignObjectWidth
} from '@plait/core';
import { fromEvent, timer } from 'rxjs';
import { Editor, Element, NodeEntry, Range, Text, Node, Transforms, Operation } from 'slate';
import { PlaitTextBoard, TextPlugin } from './with-text';
import { measureElement } from './text-measure';
import { TextChangeData, TextComponentRef, TextProps } from './with-text';

export interface TextManageChangeData {
    newText?: Element;
    operations?: Operation[];
    width: number;
    height: number;
}

export class TextManage {
    isEditing = false;

    editor!: Editor;

    g!: SVGGElement;

    foreignObject!: SVGForeignObjectElement;

    textComponentRef!: TextComponentRef;

    // add debounce for composition input end and abandon before change in setTimeout period
    // be going to attract board children are overwritten when fired more times onChange(eg: board is embed in editor)
    textChange = debounce<TextManageChangeData>((data?: TextManageChangeData) => {
        if (!data) {
            return;
        }
        this.options.onChange && this.options.onChange({ ...data });
        MERGING.set(this.board, true);
    }, 0);

    exitCallback?: () => void;

    constructor(
        private board: PlaitBoard,
        private options: {
            getRectangle: () => RectangleClient;
            onChange?: (data: TextManageChangeData) => void;
            getRenderRectangle?: () => RectangleClient;
            getMaxWidth?: () => number;
            textPlugins?: TextPlugin[];
        }
    ) {
        if (!this.options.getMaxWidth) {
            this.options.getMaxWidth = () => 999;
        }
    }

    draw(text: Element) {
        const _rectangle = this.options.getRectangle();
        this.g = createG();
        this.foreignObject = createForeignObject(_rectangle.x, _rectangle.y, _rectangle.width, _rectangle.height);
        this.g.append(this.foreignObject);
        this.g.classList.add('text');
        const props: TextProps = {
            board: this.board,
            text,
            textPlugins: this.options.textPlugins,
            onChange: (data: TextChangeData) => {
                if (data.operations.some(op => !Operation.isSelectionOperation(op))) {
                    const { width: newWidth, height: newHeight } = this.getSize();
                    this.textChange({ ...data, width: newWidth, height: newHeight });
                    const { x, y, width, height } = this.options.getRectangle();
                    // update immediately width and height otherwise cursor come up shaking(in drawnix)
                    // in flowchart case width and height may greater than the calculational width and height
                    const temporaryWidth = newWidth > width ? newWidth : width;
                    const temporaryHeight = newHeight > height ? newHeight : height;
                    updateForeignObject(this.g, temporaryWidth, temporaryHeight, x, y);
                }
            },
            afterInit: (editor: Editor) => {
                this.editor = editor;
            },
            onComposition: (event: CompositionEvent) => {
                if (event.type === 'compositionend') {
                    return;
                }
                const fakeRoot = buildCompositionData(this.editor, event.data);
                if (fakeRoot) {
                    const sizeData = this.getSize(fakeRoot.children[0]);
                    // invoking onChange asap to avoid blinking on typing chinese
                    this.options.onChange && this.options.onChange({ ...sizeData });
                    MERGING.set(this.board, true);
                }
            }
        };
        this.textComponentRef = ((this.board as unknown) as PlaitTextBoard).renderText(this.foreignObject, props);
    }

    updateRectangleWidth(width: number) {
        updateForeignObjectWidth(this.g, width);
    }

    updateAngle(centerPoint: Point, angle: number = 0) {
        setAngleForG(this.g, centerPoint, angle);
    }

    updateRectangle(rectangle?: RectangleClient) {
        const { x, y, width, height } = rectangle || this.options.getRectangle();
        updateForeignObject(this.g, width, height, x, y);
    }

    updateText(newText: Element) {
        const props = {
            text: newText
        };
        this.textComponentRef.update(props);
    }

    edit(callback?: () => void, exitEdit?: (event: Event) => boolean) {
        this.isEditing = true;
        IS_TEXT_EDITABLE.set(this.board, true);
        const props: Partial<TextProps> = {
            readonly: false
        };
        this.textComponentRef.update(props);
        Transforms.select(this.editor, [0]);
        const mousedown$ = fromEvent<MouseEvent>(document, 'mousedown').subscribe((event: MouseEvent) => {
            const point = toViewBoxPoint(this.board, toHostPoint(this.board, event.x, event.y));
            const textRec = this.options.getRenderRectangle ? this.options.getRenderRectangle() : this.options.getRectangle();
            const clickInText = RectangleClient.isHit(RectangleClient.getRectangleByPoints([point, point]), textRec);
            const isAttached = (event.target as HTMLElement).closest('.plait-board-attached');
            if (!clickInText && !isAttached) {
                // handle composition input state, like: Chinese IME Composition Input
                timer(0).subscribe(() => {
                    exitCallback();
                });
            }
        });
        const keydown$ = fromEvent<KeyboardEvent>(document, 'keydown').subscribe((event: KeyboardEvent) => {
            if (event.isComposing) {
                return;
            }
            if (event.key === 'Escape' || event.key === 'Tab' || (exitEdit ? exitEdit(event) : false)) {
                event.preventDefault();
                event.stopPropagation();
                exitCallback();
                return;
            }
        });
        const exitCallback = () => {
            if (this.isEditing) {
                this.updateRectangle();
                mousedown$.unsubscribe();
                keydown$.unsubscribe();
                IS_TEXT_EDITABLE.set(this.board, false);
                MERGING.set(this.board, false);
                callback && callback();
                const props = {
                    readonly: true
                };
                this.textComponentRef.update(props);
                this.isEditing = false;
                this.exitCallback = undefined;
            }
        };
        this.exitCallback = exitCallback;
        return exitCallback;
    }

    getSize = (element?: Element, maxWidth?: number) => {
        const computedStyle = window.getComputedStyle(this.foreignObject.children[0]);
        const fontFamily = computedStyle.fontFamily;
        const fontSize = parseFloat(computedStyle.fontSize);
        const target = element || (this.editor.children[0] as Element);
        return measureElement(
            target,
            {
                fontSize: fontSize,
                fontFamily
            },
            maxWidth || this.options.getMaxWidth!()
        );
    };

    getText = () => {
        return this.editor.children[0];
    };

    destroy() {
        this.g?.remove();
        this.textComponentRef?.destroy();
        this.exitCallback && this.exitCallback();
    }
}

export const buildCompositionData = (editor: Editor, data: string) => {
    if (editor.selection && Range.isCollapsed(editor.selection)) {
        const [textNode, textPath] = Editor.node(editor, editor.selection) as NodeEntry<Text>;
        const offset = editor.selection.anchor.offset;
        const clonedElement = JSON.parse(JSON.stringify(editor.children[0]));
        const root = { children: [clonedElement] };
        const newTextString = textNode.text.slice(0, offset + 1) + data + textNode.text.slice(offset + 1);
        const clonedTextNode = Node.get(root, textPath) as Text;
        clonedTextNode.text = newTextString;
        return root;
    }
    return null;
};
