import { Editor, Element, Transforms, Range, Path } from 'slate';
import { AngularEditor, hotkeys } from 'slate-angular';

export const withSelection = <T extends AngularEditor>(editor: T): T => {
    const { onKeydown } = editor;

    editor.onKeydown = (event: KeyboardEvent) => {
        const { selection } = editor;
        if (!selection || !selection.anchor || !selection.focus) {
            onKeydown(event);
            return;
        }
        const isMoveBackward = hotkeys.isMoveBackward(event);
        const isMoveForward = hotkeys.isMoveForward(event);
        const isCollapsed = selection && Range.isCollapsed(selection);
        const isInlineNode = isInline(editor);
        if (isCollapsed && isMoveForward) {
            let isInlineCodeBefore = false;
            if (!isInlineNode) {
                try {
                    const { path } = Editor.after(editor, selection)!;
                    if (path) {
                        isInlineCodeBefore = isInline(editor, path);
                    }
                } catch (error) {}
            }
            if (isInlineNode || isInlineCodeBefore) {
                event.preventDefault();
                Transforms.move(editor, { unit: 'offset' });
                return;
            }
        }
        if (isCollapsed && isMoveBackward) {
            let isInlineCodeAfter = false;
            if (!isInlineNode) {
                try {
                    const { path } = Editor.before(editor, selection)!;
                    isInlineCodeAfter = isInline(editor, path);
                } catch (error) {}
            }
            if (isInlineNode || isInlineCodeAfter) {
                event.preventDefault();
                Transforms.move(editor, { unit: 'offset', reverse: true });
                return;
            }
        }
        onKeydown(event);
    };

    return editor;
};

export const isInline = (editor: Editor, path?: Path): boolean => {
    const [inlineNode] = Editor.nodes(editor, {
        at: path ? path : editor.selection?.anchor.path,
        match: n => Element.isElement(n) && Editor.isInline(editor, n) && !Editor.isVoid(editor, n)
    });
    return !!inlineNode;
};
