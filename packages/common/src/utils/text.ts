import { PlaitElement } from '@plait/core';
import { CommonPluginElement } from '../core/plugin-element';
import { CustomText, PlaitMarkEditor } from '@plait/text';

export const getTextManages = (element: PlaitElement) => {
    const component = PlaitElement.getComponent(element) as CommonPluginElement;
    return component.getTextManages();
};

export const getTextEditors = (element: PlaitElement) => {
    return getTextManages(element).map(manage => {
        return manage.componentRef.instance.editor;
    });
};

export const getTextMarksByElement = (element: PlaitElement) => {
    const editors = getTextEditors(element);
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
