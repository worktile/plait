import { CustomText, getTextEditorsByElement, getTextManages } from '@plait/common';
import { PlaitElement } from '@plait/core';
import { PlaitMarkEditor } from '../mark/mark.editor';
import { Element } from 'slate';

export const getTextMarksByElement = (element: PlaitElement) => {
    const editors = getTextEditorsByElement(element);
    const editor = editors[0];
    if (!editor) {
        return {};
    }
    if (editor.children.length === 0) {
        const textManage = getTextManages(element)[0];
        const currentMarks: Omit<CustomText, 'text'> = PlaitMarkEditor.getMarksByElement(editor.children[0] as Element);
        return currentMarks;
    }
    const currentMarks: Omit<CustomText, 'text'> = PlaitMarkEditor.getMarks(editor);
    return currentMarks;
};
