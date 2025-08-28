import { CustomText, getTextEditorsByElement, getTextManages } from '@plait/common';
import { PlaitElement } from '@plait/core';
import { PlaitMarkEditor } from '../mark/mark.editor';
import { Element, Node } from 'slate';
import { ParagraphElement } from '../types';

export const getTextMarksByElement = (element: PlaitElement) => {
    const editors = getTextEditorsByElement(element);
    const editor = editors[0];
    if (!editor || editor.children.length === 0) {
        return {};
    }
    const currentMarks: Omit<CustomText, 'text'> = PlaitMarkEditor.getMarks(editor);
    return currentMarks;
};

export const getFirstTextMarks = (element: ParagraphElement) => {
    const firstText = Node.first({ children: [element] }, [0]);
    return firstText[0] as CustomText;
};
