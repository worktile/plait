import { Editor, Text, Node, Element, Transforms, NodeEntry, Location } from 'slate';
import { DEFAULT_FONT_SIZE, DEFAULT_TEXT_COLOR, MarkProps, MarkTypes } from '../../constant/mark';
import { AngularEditor } from 'slate-angular';

export enum FontSizes {
    'fontSize12' = '12',
    'fontSize13' = '13',
    'fontSize14' = '14',
    'fontSize15' = '15',
    'fontSize16' = '16',
    'fontSize18' = '18',
    'fontSize20' = '20',
    'fontSize24' = '24',
    'fontSize28' = '28',
    'fontSize32' = '32',
    'fontSize40' = '40',
    'fontSize48' = '48'
}

export interface MarkEditor extends Editor {
    removeMark: (key: string, shouldChange?: boolean) => void;
}

export const PlaitMarkEditor = {
    getMarks(editor: AngularEditor) {
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
    isMarkActive(editor: AngularEditor, format: MarkTypes) {
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
    toggleMark(editor: AngularEditor, format: MarkTypes) {
        setSelection(editor);
        const isActive = PlaitMarkEditor.isMarkActive(editor, format);
        if (isActive) {
            Editor.removeMark(editor, format);
        } else {
            Editor.addMark(editor, format, true);
        }
    },
    setFontSizeMark(editor: AngularEditor, size: FontSizes, defaultSize: number = DEFAULT_FONT_SIZE) {
        setSelection(editor);
        // set paragraph text fontSize
        if (Number(size) === defaultSize) {
            Editor.removeMark(editor, MarkTypes.fontSize);
        } else {
            // set paragraph text fontSize
            Editor.addMark(editor, MarkTypes.fontSize, Number(size));
        }
    },
    setColorMark(editor: AngularEditor, color: string, defaultTextColor: string = DEFAULT_TEXT_COLOR) {
        setSelection(editor);

        if (color === defaultTextColor) {
            Editor.removeMark(editor, 'color');
        } else {
            Editor.addMark(editor, 'color', color);
        }
    }
};

export function setSelection(editor: AngularEditor) {
    if (AngularEditor.isReadonly(editor)) {
        Transforms.select(editor, [0]);
    }
}
