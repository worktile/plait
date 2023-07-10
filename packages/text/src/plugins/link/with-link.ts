import { Element, NodeEntry, Transforms, Node } from 'slate';
import { LinkElement } from '../../custom-types';
import { AngularEditor } from 'slate-angular';
import { CLIPBOARD_FORMAT_KEY } from '../../constant';
import { LinkEditor } from './link-editor';
import { getTextFromClipboard, isUrl } from '../../public-api';

export const withLink = <T extends AngularEditor>(editor: T): T => {
    const { isInline, normalizeNode, insertData } = editor;

    editor.isInline = (element: Element) => {
        return (element as LinkElement).type === 'link' ? true : isInline(element);
    };

    editor.normalizeNode = (nodeEntry: NodeEntry) => {
        const node = nodeEntry[0] as LinkElement;
        const path = nodeEntry[1];
        if (node.type && node.type === 'link' && Node.string(node) === '') {
            Transforms.removeNodes(editor, { at: path });
            return;
        }

        normalizeNode(nodeEntry);
    };

    editor.insertData = data => {
        const text = getTextFromClipboard(data);

        if (typeof text === 'string' && text && isUrl(text)) {
            LinkEditor.wrapLink(editor, text, text);
            Transforms.move(editor, { distance: 1, unit: 'offset' });
        } else {
            insertData(data);
        }
    };

    return editor;
};
