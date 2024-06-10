import { CustomElement, LinkElement } from '@plait/common';
import { Editor, Transforms, Range, Element, BaseRange, Location, Node } from 'slate';

export const LinkEditor = {
    wrapLink(editor: Editor, text: string, url: string) {
        if (LinkEditor.isLinkActive(editor)) {
            LinkEditor.unwrapLink(editor);
        }
        const { selection } = editor;
        const isCollapsed = selection && Range.isCollapsed(selection);
        const link: LinkElement = {
            type: 'link',
            url,
            children: [{ text }]
        };
        if (isCollapsed || Node.string(editor) === '') {
            Transforms.insertNodes(editor, link);
        } else if (!selection) {
            const at = { anchor: Editor.start(editor, [0]), focus: Editor.end(editor, [0]) };
            Transforms.wrapNodes(editor, link, { split: true, at });
        } else {
            Transforms.wrapNodes(editor, link, { split: true });
            Transforms.collapse(editor, { edge: 'end' });
        }
    },
    unwrapLink(editor: Editor, at?: Location) {
        if (!at) {
            at = editor.selection as BaseRange;
            if (!at && editor.children && editor.children.length > 0) {
                at = { anchor: Editor.start(editor, [0]), focus: Editor.end(editor, [0]) };
            }
        }
        Transforms.unwrapNodes<CustomElement>(editor, { at, match: n => Element.isElement(n) && (n as LinkElement).type === 'link' });
    },
    isLinkActive(editor: Editor) {
        let at = editor.selection as BaseRange;
        if (!at && editor.children && editor.children.length > 0) {
            at = { anchor: Editor.start(editor, [0]), focus: Editor.end(editor, [0]) };
        }
        const [link] = Editor.nodes<CustomElement>(editor, { match: n => Element.isElement(n) && (n as LinkElement).type === 'link', at });
        return !!link;
    },
    getLinkElement(editor: Editor) {
        let at = editor.selection as BaseRange;
        if (!at && editor.children && editor.children.length > 0) {
            at = { anchor: Editor.start(editor, [0]), focus: Editor.end(editor, [0]) };
        }
        const [link] = Editor.nodes<CustomElement>(editor, { match: n => Element.isElement(n) && (n as LinkElement).type === 'link', at });
        return link;
    }
};
