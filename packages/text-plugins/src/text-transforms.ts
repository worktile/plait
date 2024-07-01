import { PlaitBoard, PlaitElement, getSelectedElements } from '@plait/core';
import { BaseEditor, BaseRange, Editor, Transforms as SlateTransforms } from 'slate';
import { FontSizes, MarkTypes } from './mark/types';
import { Alignment, findFirstTextEditor, getTextEditors, getTextEditorsByElement } from '@plait/common';
import { PlaitMarkEditor } from './mark/mark.editor';
import { AlignEditor } from './align/align-editor';

const setTextMarks = (board: PlaitBoard, mark: MarkTypes, editors?: BaseEditor[]) => {
    let textEditors: BaseEditor[] | undefined;
    if (editors?.length) {
        textEditors = editors;
    } else {
        const selectedElements = getSelectedElements(board);
        if (selectedElements.length) {
            const firstEditor = findFirstTextEditor(board);
            if (!firstEditor) {
                return;
            }
            const activeMarks = PlaitMarkEditor.getMarks(firstEditor);
            const elements = selectedElements.filter(element => {
                const elementEditors = getTextEditorsByElement(element);
                return elementEditors.some(editor => {
                    const elementMarks = PlaitMarkEditor.getMarks(editor);
                    return elementMarks[mark] === activeMarks[mark];
                });
            });
            textEditors = getTextEditors(board, elements);
        }
    }
    if (textEditors && textEditors.length) {
        textEditors.forEach(editor => {
            PlaitMarkEditor.toggleMark(editor, mark);
        });
    }
};

const setFontSize = (
    board: PlaitBoard,
    size: FontSizes,
    defaultFontSize: number | ((element: PlaitElement) => number | undefined),
    editors?: BaseEditor[]
) => {
    const textEditors = getHandleTextEditors(board, editors);
    if (textEditors && textEditors.length) {
        const selectedElements = getSelectedElements(board);
        textEditors.forEach(editor => {
            let finalDefaultFontSize;
            if (typeof defaultFontSize === 'function') {
                const element = selectedElements.find(element => {
                    const textEditors = getTextEditorsByElement(element);
                    return textEditors.includes(editor);
                });
                finalDefaultFontSize = defaultFontSize(element!);
            } else {
                finalDefaultFontSize = defaultFontSize;
            }

            PlaitMarkEditor.setFontSizeMark(editor, size, finalDefaultFontSize);
        });
    }
};

const setTextColor = (board: PlaitBoard, color: string, textSelection?: BaseRange, editors?: BaseEditor[]) => {
    const textEditors = getHandleTextEditors(board, editors);
    if (textEditors && textEditors.length) {
        textEditors.forEach(editor => {
            if (textSelection) {
                SlateTransforms.select(editor, textSelection);
            }
            if (color === 'transparent') {
                Editor.removeMark(editor, MarkTypes.color);
            } else {
                PlaitMarkEditor.setColorMark(editor, color);
            }
        });
    }
};

const setTextAlign = (board: PlaitBoard, align: Alignment, editors?: BaseEditor[]) => {
    const textEditors = getHandleTextEditors(board, editors);
    if (textEditors && textEditors.length) {
        textEditors.forEach(editor => AlignEditor.setAlign(editor, align));
    }
};

const getHandleTextEditors = (board: PlaitBoard, editors?: BaseEditor[]) => {
    let textEditors: BaseEditor[] | undefined;
    if (editors?.length) {
        textEditors = editors;
    } else {
        textEditors = getTextEditors(board);
    }
    return textEditors;
};

export const TextTransforms = { setTextAlign, setTextColor, setFontSize, setTextMarks };
