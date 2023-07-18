import { PlaitBoard } from '@plait/core';
import { PlaitRichtextComponent } from '../richtext/richtext.component';
import { Element } from 'slate';
import { AngularEditor } from 'slate-angular';

export function measureDivSize(div: HTMLElement) {
    const height = div.clientHeight;
    // const width = div.clientWidth;
    console.log(div);
    const width = div.clientWidth;
    return div.getBoundingClientRect();
}

export const getTextSize = (
    board: PlaitBoard,
    text: Element | string,
    maxWordCount?: number,
    styles?: { fontSize?: number; fontFamily?: string }
) => {
    const viewContainerRef = PlaitBoard.getComponent(board).viewContainerRef;
    const ref = viewContainerRef.createComponent(PlaitRichtextComponent);
    const value = typeof text === 'string' ? ({ children: [{ text }] } as Element) : text;
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
    if (styles) {
        if (styles.fontSize) {
            richtextContainer.style.fontSize = `${styles.fontSize}px`;
        }
        if (styles.fontFamily) {
            richtextContainer.style.fontFamily = styles.fontFamily;
        }
    }
    PlaitBoard.getBoardContainer(board).append(richtextContainer);
    const paragraph = AngularEditor.toDOMNode(ref.instance.editor, ref.instance.children[0]);
    const { width, height } = measureDivSize(paragraph);
    ref.destroy();
    richtextContainer.remove();
    return { width, height };
};
