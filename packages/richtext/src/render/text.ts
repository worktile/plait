import { Editor, Text } from 'slate';
import { WITH_ZERO_WIDTH_CHAR, ZERO_WIDTH_CHAR } from '../utils/dom';
import { IS_NATIVE_INPUT } from '../utils/weak-maps';

export const renderText = (editor: Editor, textElement: HTMLElement, text: Text, isLastNode: boolean) => {
    if (IS_NATIVE_INPUT.get(editor)) {
        return;
    }
    
    // rule
    // zero width char
    let withZeroWidthChar = false;
    if (isLastNode && (text.text === '' || text.text.endsWith(`\n`))) {
        withZeroWidthChar = true;
        textElement.setAttribute(WITH_ZERO_WIDTH_CHAR, 'true');
    } else {
        if (textElement.hasAttribute(WITH_ZERO_WIDTH_CHAR)) {
            textElement.removeAttribute(WITH_ZERO_WIDTH_CHAR);
        }
    }
    // plait-node="text"
    const nodeKey = 'plait-node';
    if (!textElement.hasAttribute(nodeKey)) {
        textElement.setAttribute(nodeKey, 'text');
    }

    // render
    const textContent = text.text + (withZeroWidthChar ? ZERO_WIDTH_CHAR : '');
    if (textElement.textContent !== textContent) {
        textElement.textContent = textContent;
    }
    if (textElement.childNodes.length === 0) {
        const textNode = document.createTextNode('');
        textElement.appendChild(textNode);
    }
};

// const renderTextMarks = (textElement: HTMLElement, text: Text & any) => {
//     marks.forEach(mark => {
//         if (text[mark]) {
//             if (!textElement.hasAttribute(mark)) {
//                 const attr = `slate-${mark}`;
//                 textElement.setAttribute(attr, 'true');
//             }
//         } else {
//             if (textElement.hasAttribute(mark)) {
//                 const attr = `slate-${mark}`;
//                 textElement.removeAttribute(attr);
//             }
//         }
//     });
// };
