import { hotkeys } from 'plait';
import { Editor, Element, Range, Transforms, Path } from 'slate';
import { RichtextEditor } from './richtext-editor';

export const withInline = <T extends RichtextEditor>(editor: T) => {
    const e = editor as T;
    const { isInline, keydown } = e;

    e.isInline = (element: any) => {
        if (element.type === 'link') {
            return true;
        }
        return isInline(element);
    };

    e.keydown = (event: KeyboardEvent) => {
        const { selection } = editor;
        if (!selection || !selection.anchor || !selection.focus) {
            keydown(event);
            return;
        }
        const isMoveBackward = hotkeys.isMoveBackward(event);
        const isMoveForward = hotkeys.isMoveForward(event);
        const isCollapsed = selection && Range.isCollapsed(selection);
        const isInlineNode = isInlineByPath(editor);
        if (isCollapsed && isMoveForward) {
            let isInlineBefore = false;
            if (!isInlineNode) {
                const point = Editor.after(editor, selection);
                if (point) {
                    isInlineBefore = isInlineByPath(editor, point.path);
                }
            }
            if (isInlineNode || isInlineBefore) {
                event.preventDefault();
                Transforms.move(editor, { unit: 'offset' });
                return;
            }
        }
        if (isCollapsed && isMoveBackward) {
            let isInlineAfter = false;
            if (!isInlineNode) {
                const point = Editor.before(editor, selection);
                if (point) {
                    isInlineAfter = isInlineByPath(editor, point.path);
                }
            }
            if (isInlineNode || isInlineAfter) {
                event.preventDefault();
                Transforms.move(editor, { unit: 'offset', reverse: true });
                return;
            }
        }
        keydown(event);
    };

    return e;
};

export const isInlineByPath = (editor: Editor, path?: Path): boolean => {
    const [inlineNode] = Editor.nodes(editor, {
        at: path ? path : editor.selection?.anchor.path,
        match: n => Element.isElement(n) && Editor.isInline(editor, n) && !Editor.isVoid(editor, n)
    });
    return !!inlineNode;
};
