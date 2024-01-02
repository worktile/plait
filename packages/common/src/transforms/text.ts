import { PlaitBoard, getSelectedElements } from '@plait/core';
import { AlignEditor, Alignment, FontSizes, MarkTypes, PlaitMarkEditor } from '@plait/text';
import { BaseRange, Editor, Transforms as SlateTransforms } from 'slate';
import { AngularEditor } from 'slate-angular';
import { getTextEditors } from '../utils/text';

const setTextMarks = (board: PlaitBoard, mark: MarkTypes) => {
    const selectedElements = getSelectedElements(board);
    if (selectedElements.length) {
        const firstEditor = getTextEditors(selectedElements[0])[0];
        const activeMarks = PlaitMarkEditor.getMarks(firstEditor);
        const elements = selectedElements.filter(element => {
            const editors = getTextEditors(element);
            return editors.some(editor => {
                const elementMarks = PlaitMarkEditor.getMarks(editor);
                return elementMarks[mark] === activeMarks[mark];
            });
        });

        elements.forEach(element => {
            const editors = getTextEditors(element);
            editors.forEach(editor => PlaitMarkEditor.toggleMark(editor, mark));
        });
    }
};

const setFontSize = (board: PlaitBoard, size: FontSizes, defaultFontSize: number) => {
    const selectedElements = getSelectedElements(board);
    if (selectedElements.length) {
        selectedElements.forEach(element => {
            const editors = getTextEditors(element);
            editors.forEach(editor => PlaitMarkEditor.setFontSizeMark(editor, size, defaultFontSize));
        });
    }
};

const setTextColor = (board: PlaitBoard, color: string, textSelection?: BaseRange) => {
    const selectedElements = getSelectedElements(board);
    if (selectedElements?.length) {
        selectedElements.forEach(element => {
            const editors = getTextEditors(element);
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
        });
    }
};

const setTextAlign = (board: PlaitBoard, align: Alignment) => {
    const selectedElements = getSelectedElements(board);
    if (selectedElements?.length) {
        selectedElements.forEach(element => {
            const editors = getTextEditors(element);
            editors.forEach(editor => AlignEditor.setAlign(editor as AngularEditor, align));
        });
    }
};

export const TextTransforms = { setTextAlign, setTextColor, setFontSize, setTextMarks };
