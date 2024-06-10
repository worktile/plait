import { PlaitBoard, PlaitElement, getSelectedElements } from '@plait/core';
import { BaseRange, Editor, Transforms as SlateTransforms } from 'slate';
import { FontSizes, MarkTypes } from './mark/types';
import { Alignment, findFirstTextEditor, getTextEditors, getTextEditorsByElement } from '@plait/common';
import { PlaitMarkEditor } from './mark/mark.editor';
import { AlignEditor } from './align/align-editor';

const setTextMarks = (board: PlaitBoard, mark: MarkTypes) => {
    const selectedElements = getSelectedElements(board);
    if (selectedElements.length) {
        const firstEditor = findFirstTextEditor(board);
        if (!firstEditor) {
            return;
        }
        const activeMarks = PlaitMarkEditor.getMarks(firstEditor);
        const elements = selectedElements.filter(element => {
            const editors = getTextEditorsByElement(element);
            return editors.some(editor => {
                const elementMarks = PlaitMarkEditor.getMarks(editor);
                return elementMarks[mark] === activeMarks[mark];
            });
        });
        const editors = getTextEditors(board, elements);
        if (editors && editors.length) {
            editors.forEach(editor => {
                PlaitMarkEditor.toggleMark(editor, mark);
            });
        }
    }
};

const setFontSize = (board: PlaitBoard, size: FontSizes, defaultFontSize: number | ((element: PlaitElement) => number | undefined)) => {
    const editors = getTextEditors(board);
    if (editors && editors.length) {
        const selectedElements = getSelectedElements(board);
        editors.forEach(editor => {
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

const setTextColor = (board: PlaitBoard, color: string, textSelection?: BaseRange) => {
    const editors = getTextEditors(board);
    if (editors && editors.length) {
        editors.forEach(editor => {
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

const setTextAlign = (board: PlaitBoard, align: Alignment) => {
    const editors = getTextEditors(board);
    if (editors && editors.length) {
        editors.forEach(editor => AlignEditor.setAlign(editor, align));
    }
};

export const TextTransforms = { setTextAlign, setTextColor, setFontSize, setTextMarks };
