import { Editor, Transforms, Range, Element } from 'slate';
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
            children: isCollapsed ? [{ text }] : []
        };
        if (isCollapsed) {
            Transforms.insertNodes(editor, link, { at: selection });
        } else {
            Transforms.wrapNodes(editor, link, { split: true });
            Transforms.collapse(editor, { edge: 'end' });
        }
    },
    unwrapLink(editor: AngularEditor) {
        Transforms.unwrapNodes<CustomElement>(editor, { match: n => Element.isElement(n) && (n as LinkElement).type === 'link' });
    },
    isLinkActive(editor: Editor) {
        const [link] = Editor.nodes<CustomElement>(editor, { match: n => Element.isElement(n) && (n as LinkElement).type === 'link' });
        return !!link;
    }
};
