import { Editor, Text, Node, Element, Transforms, NodeEntry, Location } from 'slate';
import { FontSizes, MarkProps, MarkTypes } from './types';
import { DEFAULT_FONT_SIZE, DEFAULT_TEXT_COLOR } from './constant';

export interface MarkEditor extends Editor {
    removeMark: (key: string, shouldChange?: boolean) => void;
}

export const PlaitMarkEditor = {
    getMarks(editor: Editor) {
        const marks: any = {};
        let at: Location = [];
        if (editor.selection) {
            at = editor.selection;
        } else if (editor.children && editor.children.length > 0) {
            at = { anchor: Editor.start(editor, [0]), focus: Editor.end(editor, [0]) };
        }
        const matchResult = Editor.nodes(editor, { match: Text.isText, at });
        for (const match of matchResult) {
            const [node] = match as NodeEntry<Text>;
            const { text, ...rest } = node;
            Object.assign(marks, rest);
        }
        for (const key in marks) {
            if (!MarkProps.includes(key as MarkTypes)) {
                delete marks[key];
            }
        }
        return marks;
    },
    getMarksByElement(element: Element) {
        const marks: any = {};
        const texts = Node.texts(element);
        for (const match of texts) {
            const [node] = match as NodeEntry<Text>;
            const { text, ...rest } = node;
            Object.assign(marks, rest);
        }
        for (const key in marks) {
            if (!MarkProps.includes(key as MarkTypes)) {
                delete marks[key];
            }
        }
        return marks;
    },
    isMarkActive(editor: Editor, format: MarkTypes) {
        if (!editor?.selection) {
            return;
        }
        const node = Node.get(editor, editor?.selection?.anchor?.path);
        if (!Text.isText(node)) {
            return false;
        }
        const marks = PlaitMarkEditor.getMarks(editor);
        return marks && marks[format] ? true : false;
    },
    toggleMark(editor: Editor, format: MarkTypes) {
        setSelection(editor);
        const isActive = PlaitMarkEditor.isMarkActive(editor, format);
        if (isActive) {
            Editor.removeMark(editor, format);
        } else {
            Editor.addMark(editor, format, true);
        }
    },
    setFontSizeMark(editor: Editor, size: FontSizes, defaultSize: number = DEFAULT_FONT_SIZE) {
        setSelection(editor);
        // set paragraph text fontSize
        if (Number(size) === defaultSize) {
            Editor.removeMark(editor, MarkTypes.fontSize);
        } else {
            // set paragraph text fontSize
            Editor.addMark(editor, MarkTypes.fontSize, Number(size));
        }
    },
    setColorMark(editor: Editor, color: string, defaultTextColor: string = DEFAULT_TEXT_COLOR) {
        setSelection(editor);

        if (color === defaultTextColor) {
            Editor.removeMark(editor, 'color');
        } else {
            Editor.addMark(editor, 'color', color);
        }
    }
};

export function setSelection(editor: Editor) {
    if (!editor.selection) {
        Transforms.select(editor, [0]);
    }
}
