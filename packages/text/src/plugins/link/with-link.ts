import { Element, NodeEntry, Transforms, Node } from 'slate';
import { LinkElement } from '../../custom-types';
import { AngularEditor } from 'slate-angular';

export const withLink = <T extends AngularEditor>(editor: T): T => {
    const { isInline, normalizeNode } = editor;

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
