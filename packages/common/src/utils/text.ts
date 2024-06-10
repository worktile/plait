import { PlaitBoard, PlaitElement, getSelectedElements } from '@plait/core';
import { Editor, Node, Element } from 'slate';
import { TextManage } from '../text/text-manage';
import { Alignment, CustomText, ParagraphElement } from '../text/types';

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
        return manage.editor;
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
            return [editingTextManage.editor];
        }
        return textManages.map(item => {
            return item.editor;
        });
    }
    return undefined;
};

export const getEditingTextEditor = (board: PlaitBoard, elements?: PlaitElement[]) => {
    const selectedElements = elements || getSelectedElements(board);
    const textManages: TextManage[] = [];
    selectedElements.forEach(item => {
        textManages.push(...getTextManages(item));
    });
    const editingTextManage = textManages.find(textManage => textManage.isEditing);
    if (editingTextManage) {
        return editingTextManage.editor;
    }
    return undefined;
};

export const buildText = (text: string | Element, align?: Alignment, properties?: Partial<CustomText>) => {
    properties = properties || {};
    const plaitText = typeof text === 'string' ? { children: [{ text, ...properties }] } : text;
    if (align) {
        (plaitText as ParagraphElement).align = align;
    }
    return plaitText;
};

export const getLineHeightByFontSize = (fontSize: number) => {
    if (fontSize === 14) {
        return 20;
    }
    if (fontSize === 18) {
        return 25;
    }
    return fontSize * 1.5;
};

export const ELEMENT_TO_TEXT_MANAGES: WeakMap<PlaitElement, TextManage[]> = new WeakMap();
