import { Editor, Element } from 'slate';
import { LinkElement } from '../interface/custom-element';
import { updateWeakMap } from '../utils/node-relation';
import { renderText } from './text';

export const renderElement = (editor: Editor, nativeElement: HTMLElement, element: Element & LinkElement, isLastNode: boolean) => {
    if (element.type === 'link') {
        const a = document.createElement('a');
        a.href = element.url;
        nativeElement.appendChild(a);
        renderText(editor, a, element.children[0], isLastNode);
        updateWeakMap(element.children[0], 0, element, a);
    }
};
