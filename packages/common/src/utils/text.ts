import { PlaitBoard, PlaitElement, getSelectedElements } from '@plait/core';
import { CustomText, PlaitMarkEditor, TextManage } from '@plait/text';
import { Editor, Node } from 'slate';

export const getTextManages = (element: PlaitElement) => {
    return ELEMENT_TO_TEXT_MANAGES.get(element) || [];
};

export const getFirstTextManage = (element: PlaitElement) => {
    const textManage = getTextManages(element)[0];
    if (!textManage) {
        console.warn('can not find textManage');
    }
    return textManage;
};

export const getTextEditorsByElement = (element: PlaitElement) => {
    return getTextManages(element).map(manage => {
        return manage.componentRef.instance.editor;
    });
};

export const getFirstTextEditor = (element: PlaitElement) => {
    const textEditor = getTextEditorsByElement(element)[0];
    if (!textEditor) {
        console.warn('can not find textManage');
    }
    return textEditor;
};

export const findFirstTextEditor = (board: PlaitBoard) => {
    const selectedElements = getSelectedElements(board);
    let firstEditor: Editor | null = null;
    selectedElements.forEach(element => {
        const editors = getTextEditorsByElement(element);
        if (!firstEditor && editors && editors.length > 0) {
            firstEditor = editors[0];
        }
    });
    return firstEditor;
};

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

export const getElementsText = (elements: PlaitElement[]) => {
    return elements
        .map(item => {
            try {
                const editors = getTextEditorsByElement(item);
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

export const getTextEditors = (board: PlaitBoard, elements?: PlaitElement[]) => {
    const selectedElements = elements || getSelectedElements(board);
    if (selectedElements.length) {
        const textManages: TextManage[] = [];
        selectedElements.forEach(item => {
            textManages.push(...getTextManages(item));
        });
        const editingTextManage = textManages.find(textManage => textManage.isEditing);
        if (editingTextManage) {
            return [editingTextManage.componentRef.instance.editor];
        }
        return textManages.map(item => {
            return item.componentRef.instance.editor;
        });
    }
    return undefined;
};

export const ELEMENT_TO_TEXT_MANAGES: WeakMap<PlaitElement, TextManage[]> = new WeakMap();
