import { Element, NodeEntry, Transforms, Node } from 'slate';
import { LinkElement } from '../../custom-types';
import { AngularEditor } from 'slate-angular';
import { CLIPBOARD_FORMAT_KEY } from '../../constant';
import { LinkEditor } from './link-editor';

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
        const text = data.getData('text/plain');
        const fragment = data.getData(`application/${CLIPBOARD_FORMAT_KEY}`);

        if (text && isUrl(text) && !fragment) {
            LinkEditor.wrapLink(editor, text, text);
            Transforms.move(editor, { distance: 1, unit: 'offset' });
        } else {
            insertData(data);
        }
    };

    return editor;
};

function isUrl(string: string) {
    const protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;
    const localhostDomainRE = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/;
    const nonLocalhostDomainRE = /^[^\s\.]+\.\S{2,}$/;

    if (typeof string !== 'string') {
        return false;
    }

    var match = string.match(protocolAndDomainRE);
    if (!match) {
        return false;
    }

    var everythingAfterProtocol = match[1];
    if (!everythingAfterProtocol) {
        return false;
    }

    if (localhostDomainRE.test(everythingAfterProtocol) || nonLocalhostDomainRE.test(everythingAfterProtocol)) {
        return true;
    }

    return false;
}
