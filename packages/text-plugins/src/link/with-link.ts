import { LinkElement } from '@plait/common';
import { Element, NodeEntry, Transforms, Node, Editor } from 'slate';

export const withLink = <T extends Editor>(editor: T): T => {
    const { isInline, normalizeNode, insertFragment } = editor;

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

    return editor;
};
