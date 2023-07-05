import { PlaitBoard } from '@plait/core';
import { PlaitRichtextComponent } from './richtext/richtext.component';
import { Element } from 'slate';
import { AngularEditor } from 'slate-angular';

export function measureDivSize(div: HTMLElement) {
    const boundaryBox = {
        left: Number.MAX_VALUE,
        top: Number.MAX_VALUE,
        right: Number.NEGATIVE_INFINITY,
        bottom: Number.NEGATIVE_INFINITY
    };
    for (let index = 0; index < div.childElementCount; index++) {
        const element = div.children.item(index);
        const nodeRectangle = element?.getBoundingClientRect();
        if (nodeRectangle) {
            boundaryBox.left = Math.min(boundaryBox.left, nodeRectangle.x);
            boundaryBox.top = Math.min(boundaryBox.top, nodeRectangle.y);
            boundaryBox.right = Math.max(boundaryBox.right, nodeRectangle.x + nodeRectangle.width);
            boundaryBox.bottom = Math.max(boundaryBox.bottom, nodeRectangle.y + nodeRectangle.height);
        }
    }
    const width = boundaryBox.right - boundaryBox.left;
    // FIREFOX the height of inline span is less than the height of paragraph
    const height = div.getBoundingClientRect().height;
    return { width, height };
}

export const getValueSize = (board: PlaitBoard, text: string, maxWordCount?: number, fontSize?: number) => {
    const viewContainerRef = PlaitBoard.getComponent(board).viewContainerRef;
    const ref = viewContainerRef.createComponent(PlaitRichtextComponent);
    const value = { children: [{ text }] } as Element;
    ref.instance.value = value;
    ref.instance.readonly = true;
    ref.changeDetectorRef.detectChanges();
    ref.instance.slateEditable.writeValue(ref.instance.children);
    ref.instance.slateEditable.cdr.detectChanges();
    const richtextContainer = ref.instance.elementRef.nativeElement as HTMLElement;
    richtextContainer.style.lineHeight = 'normal';
    if (maxWordCount) {
        richtextContainer.style.maxWidth = `${maxWordCount}em`;
    }
    if (fontSize) {
        richtextContainer.style.fontSize = `${fontSize}px`;
    }
    PlaitBoard.getBoardContainer(board).append(richtextContainer);
    const paragraph = AngularEditor.toDOMNode(ref.instance.editor, ref.instance.children[0]);
    const { width, height } = measureDivSize(paragraph);
    ref.destroy();
    richtextContainer.remove();
    return { width, height }
};
