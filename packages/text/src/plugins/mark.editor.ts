import { Editor, Text, Node, Transforms } from 'slate';
import { MarkTypes } from '../constant/mark';

export interface MarkEditor extends Editor {
    removeMark: (key: string, shouldChange?: boolean) => void;
}

export const MarkEditor = {
    isMarkActive(editor: Editor, format: MarkTypes) {
        if (!editor?.selection) {
            return;
        }
        const node = Node.get(editor, editor?.selection?.anchor?.path);
        if (!Text.isText(node)) {
            return false;
        }
        const marks = Editor.marks(editor) as any;
        return marks && marks[format] ? true : false;
    },
    toggleMark(editor: Editor, format: MarkTypes) {
        if (!editor.selection) {
            Transforms.select(editor, [0]);
        }

        const isActive = MarkEditor.isMarkActive(editor, format);
        if (isActive) {
            Editor.removeMark(editor, format);
        } else {
            Editor.addMark(editor, format, true);
        }
    }
};
