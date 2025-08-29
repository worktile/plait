import { CustomText, getTextEditorsByElement, getTextManages } from '@plait/common';
import { PlaitElement } from '@plait/core';
import { PlaitMarkEditor } from '../mark/mark.editor';

export const getTextMarksByElement = (element: PlaitElement) => {
    const editors = getTextEditorsByElement(element);
    const editor = editors[0];
    if (!editor || editor.children.length === 0) {
        return {};
    }
    const currentMarks: Omit<CustomText, 'text'> = PlaitMarkEditor.getMarks(editor);
    return currentMarks;
};
