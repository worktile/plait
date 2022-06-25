import isHotkey from 'is-hotkey';
import { Editor, Text } from 'slate';
import { RichtextEditor } from './richtext-editor';

export enum MarkTypes {
    bold = 'bold',
    italic = 'italic',
    underline = 'underlined',
    strike = 'strike'
    // code = 'inline-code'
}

const HOTKEYS = {
    'mod+b': MarkTypes.bold,
    'mod+i': MarkTypes.italic,
    'mod+u': MarkTypes.underline,
    'mod+`': MarkTypes.strike
    // 'mod+e': MarkTypes.code,
};

export const MarksEditor = {
    isMarkActive: (editor: Editor, format: MarkTypes) => {
        const marks = Editor.marks(editor) as Text & any;
        return marks ? marks[format] === true : false;
    },

    toggleMark: (editor: Editor, format: MarkTypes) => {
        const isActive = MarksEditor.isMarkActive(editor, format);
        if (isActive) {
            Editor.removeMark(editor, format);
        } else {
            Editor.addMark(editor, format, true);
        }
    }
};

export const withMarks = <T extends RichtextEditor>(editor: T) => {
    const { keydown } = editor;

    editor.keydown = (event: KeyboardEvent) => {
        for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event as any)) {
                event.preventDefault();
                const mark = (HOTKEYS as any)[hotkey];
                MarksEditor.toggleMark(editor, mark);
            }
        }
        keydown(event);
    };

    return editor;
};
