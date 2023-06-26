import { isKeyHotkey } from 'is-hotkey';
import { MarkTypes } from '../constant/mark';
import { MarkEditor, PlaitMarkEditor } from './mark.editor';
import { Editor, Range, Text, Transforms } from 'slate';
import { AngularEditor } from 'slate-angular';

export const withMark = <T extends AngularEditor & MarkEditor>(editor: T): T => {
    const e = editor;

    const { onKeydown } = e;

    e.removeMark = (key: string, shouldChange = true) => {
        const { selection } = e;
        if (selection) {
            if (Range.isExpanded(selection)) {
                Transforms.unsetNodes(e, key, {
                    match: Text.isText,
                    split: true
                });
            } else {
                const marks = { ...(Editor.marks(e) || {}) };
                delete (marks as any)[key];
                editor.marks = marks;
                const text = Editor.string(e, selection.anchor.path);
                if (text !== '') {
                    Editor.setNormalizing(editor, false);
                    e.insertText('');
                    editor.marks = marks;
                    Editor.setNormalizing(editor, true);
                } else {
                    Transforms.unsetNodes(e, key, { at: selection.anchor.path });
                }
                if (shouldChange) {
                    editor.onChange();
                }
            }
        }
    };

    e.addMark = (key: string, value: any) => {
        const { selection } = editor;

        if (selection) {
            if (Range.isExpanded(selection)) {
                Transforms.setNodes(e, { [key]: value }, { match: Text.isText, split: true });
            } else {
                const marks = {
                    ...(Editor.marks(e) || {}),
                    [key]: value
                };
                editor.marks = marks;
                const text = Editor.string(e, selection.anchor.path);
                if (text !== '') {
                    Editor.setNormalizing(editor, false);
                    e.insertText('');
                    editor.marks = marks;
                    Editor.setNormalizing(editor, true);
                } else {
                    Transforms.setNodes(e, { [key]: value }, { at: selection.anchor.path });
                }
            }
        }
    };

    e.onKeydown = (event: KeyboardEvent) => {
        markShortcuts(editor, event);
        onKeydown(event);
    };

    return e;
};

const HOTKEYS = {
    'mod+b': MarkTypes.bold,
    'mod+i': MarkTypes.italic,
    'mod+u': MarkTypes.underline,
    'mod+shift+x': MarkTypes.strike
};

export const markShortcuts = (editor: AngularEditor, event: KeyboardEvent) => {
    for (const hotkey in HOTKEYS) {
        if (isKeyHotkey(hotkey, event)) {
            event.preventDefault();
            const mark = (HOTKEYS as any)[hotkey];
            PlaitMarkEditor.toggleMark(editor, mark);
        }
    }
};
