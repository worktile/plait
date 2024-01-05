import { PlaitElement } from '@plait/core';
import { CommonPluginElement } from '../core/plugin-element';
import { CustomText, PlaitMarkEditor } from '@plait/text';
import { Node } from 'slate';

export const getTextManages = (element: PlaitElement) => {
    const component = PlaitElement.getComponent(element) as CommonPluginElement;
    return component.getTextManages();
};

export const getFirstTextManage = (element: PlaitElement) => {
    const textManage = getTextManages(element)[0];
    if (!textManage) {
        throw new Error('can not find textManage');
    }
    return textManage;
};

export const getTextEditors = (element: PlaitElement) => {
    return getTextManages(element).map(manage => {
        return manage.componentRef.instance.editor;
    });
};

export const getFirstTextEditor = (element: PlaitElement) => {
    const textEditor = getTextEditors(element)[0];
    if (!textEditor) {
        throw new Error('can not find textEditor');
    }
    return textEditor;
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

export const getElementsText = (elements: PlaitElement[]) => {
    return elements
        .map(item => {
            try {
                const editors = getTextEditors(item);
                if (editors.length) {
                    return editors
                        .map(editor => {
                            const textsEntry = Node.texts(editor);
                            return Array.from(textsEntry).reduce((total, text) => (total += text[0].text), '');
                        })
                        .join(' ');
                }
                return '';
            } catch (error) {
                return '';
            }
        })
        .filter(item => item)
        .join(' ');
};
