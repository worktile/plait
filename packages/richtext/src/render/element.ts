import { SimpleChange } from '@angular/core';
import { Editor, Element } from 'slate';
import { LinkElement } from '../interface/custom-element';
import { NODE_TO_ELEMENT } from '../utils/weak-maps';
import { updateWeakMap } from '../utils/node-relation';
import { renderText } from './text';

export const renderElement = (editor: Editor, nativeElement: HTMLElement, element: Element & LinkElement, isLastNode: boolean, nodeChange?: SimpleChange) => {
    if (element.type === 'link') {
        if (nodeChange) {
            const node = NODE_TO_ELEMENT.get(nodeChange.previousValue) as HTMLElement;
            const text = node.querySelector('[plait-node="text"]') as HTMLElement;
            renderText(editor, text, element.children[0], isLastNode);
            updateWeakMap(element.children[0], 0, element, text);
        } else {
            const a = document.createElement('a');
            a.href = element.url;
            const breakNode = document.createElement('span');
            breakNode.contentEditable = 'false';
            breakNode.setAttribute('break-node', 'left');
            const textNodeBefore = document.createTextNode(String.fromCodePoint(160));
            breakNode.appendChild(textNodeBefore);
            const text = document.createElement('span');
            a.appendChild(breakNode);
            a.appendChild(text);
            const rightBreakNode = breakNode.cloneNode(true) as HTMLElement;
            rightBreakNode.setAttribute('break-node', 'right');
            a.appendChild(rightBreakNode);
            nativeElement.appendChild(a);
            renderText(editor, text, element.children[0], isLastNode);
            updateWeakMap(element.children[0], 0, element, text);
        }
    }
};
