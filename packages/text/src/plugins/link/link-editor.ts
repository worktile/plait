import { Editor, Transforms, Range, Element, BaseRange, Location } from 'slate';
import { AngularEditor } from 'slate-angular';
import { CustomElement, LinkElement } from '../../custom-types';

export const LinkEditor = {
    wrapLink(editor: AngularEditor, text: string, url: string) {
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

        if (AngularEditor.isReadonly(editor)) {
            const at = { anchor: Editor.start(editor, [0]), focus: Editor.end(editor, [0]) };
            Transforms.wrapNodes(editor, link, { split: true, at });
        } else if (isCollapsed) {
            Transforms.insertNodes(editor, link);
        } else {
            Transforms.wrapNodes(editor, link, { split: true });
            Transforms.collapse(editor, { edge: 'end' });
        }
    },
    unwrapLink(editor: AngularEditor, at?: Location) {
        if (!at) {
            at = editor.selection as BaseRange;
            if (AngularEditor.isReadonly(editor) && editor.children && editor.children.length > 0) {
                at = { anchor: Editor.start(editor, [0]), focus: Editor.end(editor, [0]) };
            }
        }

        Transforms.unwrapNodes<CustomElement>(editor, { at, match: n => Element.isElement(n) && (n as LinkElement).type === 'link' });
    },
    isLinkActive(editor: AngularEditor) {
        let at = editor.selection as BaseRange;
        if (AngularEditor.isReadonly(editor) && editor.children && editor.children.length > 0) {
            at = { anchor: Editor.start(editor, [0]), focus: Editor.end(editor, [0]) };
        }
        const [link] = Editor.nodes<CustomElement>(editor, { match: n => Element.isElement(n) && (n as LinkElement).type === 'link', at });

        return !!link;
    },
    getLinkElement(editor: AngularEditor) {
        let at = editor.selection as BaseRange;
        if (AngularEditor.isReadonly(editor) && editor.children && editor.children.length > 0) {
            at = { anchor: Editor.start(editor, [0]), focus: Editor.end(editor, [0]) };
        }
        const [link] = Editor.nodes<CustomElement>(editor, { match: n => Element.isElement(n) && (n as LinkElement).type === 'link', at });
        return link;
    }
};
