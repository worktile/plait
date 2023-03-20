import { ROOT_TOPIC_FONT_SIZE, TOPIC_FONT_SIZE } from '../constants';
import { Node } from 'slate';
import { PlaitElement } from '@plait/core';

export function getSizeByNode(node: PlaitElement, container: HTMLElement, targetIsRoot: boolean) {
    const fontSize = targetIsRoot ? ROOT_TOPIC_FONT_SIZE : TOPIC_FONT_SIZE;
    const text = Node.string(node.value.children[0]);
    const fakeNode = document.createElement('plait-node');

    fakeNode.setAttribute('plait-node', 'text');
    fakeNode.textContent = text;
    fakeNode.style.display = 'inline-block';
    fakeNode.style.fontSize = `${fontSize}px`;
    const richtext = document.createElement('plait-richtext');
    richtext.className = 'plait-richtext-container';
    richtext.appendChild(fakeNode);
    container?.appendChild(richtext);
    const rect = fakeNode.getBoundingClientRect();
    container?.removeChild(richtext);

    return rect;
}
