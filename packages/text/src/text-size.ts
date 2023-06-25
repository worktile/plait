import { PlaitBoard } from '@plait/core';

export const getTextSize = (paragraph: HTMLElement) => {
    const boundaryBox = {
        left: Number.MAX_VALUE,
        top: Number.MAX_VALUE,
        right: Number.NEGATIVE_INFINITY,
        bottom: Number.NEGATIVE_INFINITY
    };
    for (let index = 0; index < paragraph.childElementCount; index++) {
        const element = paragraph.children.item(index);
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
    const height = paragraph.getBoundingClientRect().height;
    return { width, height };
};

export const calculateTextSize = (board: PlaitBoard, text: string, maxWordCount?: number, fontSize?: number) => {
    const richtext = document.createElement('plait-richtext');
    richtext.className = 'plait-richtext-container';
    richtext.style.lineHeight = 'normal';
    if (maxWordCount) {
        richtext.style.maxWidth = `${maxWordCount}em`;
    }
    if (fontSize) {
        richtext.style.fontSize = `${fontSize}px`;
    }
    const div = document.createElement('div');
    const span = document.createElement('span');
    span.innerHTML = text;
    div.append(span);
    richtext.append(div);
    PlaitBoard.getBoardNativeElement(board).append(richtext);
    const { width, height } = getTextSize(div);
    richtext.remove();
    return { width, height };
};
