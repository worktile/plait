import { CustomText, getTextEditorsByElement, getTextManages } from '@plait/common';
import { PlaitElement } from '@plait/core';
import { PlaitMarkEditor } from '../mark/mark.editor';

export const getTextMarksByElement = (element: PlaitElement) => {
    const editors = getTextEditorsByElement(element);
    const editor = editors[0];
    if (!editor) {
        return {};
    }
    if (editor.children.length === 0) {
        const textManage = getTextManages(element)[0];
        const currentMarks: Omit<CustomText, 'text'> = PlaitMarkEditor.getMarksByElement(textManage.componentRef.instance.children[0]);
        return currentMarks;
    }
    const currentMarks: Omit<CustomText, 'text'> = PlaitMarkEditor.getMarks(editor);
    return currentMarks;
};
