export const getSizeByText = (text: string, container: HTMLElement, maxWordCount?: number, fontSize?: number) => {
    const fakeNode = document.createElement('plait-node');
    if (fontSize) {
        fakeNode.style.fontSize = `${fontSize}px`;
    }
    fakeNode.setAttribute('plait-node', 'text');
    fakeNode.textContent = text;
    fakeNode.style.display = 'inline-block';
    const richtext = document.createElement('plait-richtext');
    richtext.className = 'plait-richtext-container';
    richtext.style.lineHeight = 'normal';
    if (maxWordCount) {
        richtext.style.maxWidth = `${maxWordCount}em`;
    }
    richtext.appendChild(fakeNode);
    container?.appendChild(richtext);
    const { width, height } = fakeNode.getBoundingClientRect();
    container?.removeChild(richtext);
    return { width, height };
};

export const getRichtextContentSize = (editable: HTMLElement) => {
    const boundaryBox = {
        left: Number.MAX_VALUE,
        top: Number.MAX_VALUE,
        right: Number.NEGATIVE_INFINITY,
        bottom: Number.NEGATIVE_INFINITY
    };
    for (let index = 0; index < editable.childElementCount; index++) {
        const element = editable.children.item(index);
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
    const height = editable.getBoundingClientRect().height;
    return { width, height };
};
