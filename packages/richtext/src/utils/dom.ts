/**
 * Types.
 */

// COMPAT: This is required to prevent TypeScript aliases from doing some very
// weird things for Slate's types with the same name as globals. (2019/11/27)
// https://github.com/microsoft/TypeScript/issues/35002
import DOMNode = globalThis.Node;
import DOMComment = globalThis.Comment;
import DOMElement = globalThis.Element;
import DOMText = globalThis.Text;
import DOMRange = globalThis.Range;
import DOMSelection = globalThis.Selection;
import DOMStaticRange = globalThis.StaticRange;
export { DOMNode, DOMComment, DOMElement, DOMText, DOMRange, DOMSelection, DOMStaticRange };

export type DOMPoint = [Node, number];

declare global {
    interface Window {
        Selection: typeof Selection['constructor'];
        DataTransfer: typeof DataTransfer['constructor'];
        Node: typeof Node['constructor'];
    }
}

/**
 * Check if a value is a DOM selection.
 */
export const isDOMSelection = (value: any): value is DOMSelection => {
    const window = value && value.anchorNode && getDefaultView(value.anchorNode);
    return !!window && value instanceof window.Selection;
};

/**
 * Returns the host window of a DOM node
 */
export const getDefaultView = (value: any): Window => {
    return (value && value.ownerDocument && value.ownerDocument.defaultView) || window;
};

/**
 * Check if a DOM node is a comment node.
 */
export const isDOMComment = (value: any): value is DOMComment => {
    return isDOMNode(value) && value.nodeType === 8;
};

/**
 * Check if a DOM node is an element node.
 */
export const isDOMElement = (value: any): value is DOMElement => {
    return isDOMNode(value) && value.nodeType === 1;
};

/**
 * Check if a value is a DOM node.
 */
export const isDOMNode = (value: any): value is DOMNode => {
    const window = getDefaultView(value);
    return !!window && value instanceof window.Node;
};

/**
 * Get the nearest editable child and index at `index` in a `parent`, preferring
 * `direction`.
 */

export const getEditableChildAndIndex = (parent: DOMElement, index: number, direction: 'forward' | 'backward'): [DOMNode, number] => {
    const { childNodes } = parent;
    let child = childNodes[index];
    let i = index;
    let triedForward = false;
    let triedBackward = false;

    // While the child is a comment node, or an element node with no children,
    // keep iterating to find a sibling non-void, non-comment node.
    while (
        isDOMComment(child) ||
        (isDOMElement(child) && child.childNodes.length === 0) ||
        (isDOMElement(child) && child.getAttribute('contenteditable') === 'false')
    ) {
        if (triedForward && triedBackward) {
            break;
        }

        if (i >= childNodes.length) {
            triedForward = true;
            i = index - 1;
            direction = 'backward';
            continue;
        }

        if (i < 0) {
            triedBackward = true;
            i = index + 1;
            direction = 'forward';
            continue;
        }

        child = childNodes[i];
        index = i;
        i += direction === 'forward' ? 1 : -1;
    }

    return [child, index];
};

/**
 * Get the nearest editable child at `index` in a `parent`, preferring
 * `direction`.
 */

export const getEditableChild = (parent: DOMElement, index: number, direction: 'forward' | 'backward'): DOMNode => {
    const [child] = getEditableChildAndIndex(parent, index, direction);
    return child;
};

/**
 * Normalize a DOM point so that it always refers to a text node.
 */
export const normalizeDOMPoint = (domPoint: DOMPoint): DOMPoint => {
    let [node, offset] = domPoint;

    // If it's an element node, its offset refers to the index of its children
    // including comment nodes, so try to find the right text child node.
    if (isDOMElement(node) && node.childNodes.length) {
        let isLast = offset === node.childNodes.length;
        let index = isLast ? offset - 1 : offset;
        [node, index] = getEditableChildAndIndex(node, index, isLast ? 'backward' : 'forward');

        // If the editable child found is in front of input offset, we instead seek to its end
        isLast = index < offset;

        // If the node has children, traverse until we have a leaf node. Leaf nodes
        // can be either text nodes, or other void DOM nodes.
        while (isDOMElement(node) && node.childNodes.length) {
            const i = isLast ? node.childNodes.length - 1 : 0;
            node = getEditableChild(node, i, isLast ? 'backward' : 'forward');
        }

        // Determine the new offset inside the text node.
        offset = isLast && node.textContent != null ? node.textContent.length : 0;
    }

    // Return the node and offset.
    return [node, offset];
};

export const getSizeByText = (text: string, container: HTMLElement, maxWordCount?: number, fontSize?: number) => {
    const fakeNode = document.createElement('plait-node');
    if (fontSize) {
        fakeNode.style.fontSize = `${fontSize}px`;
    }
    fakeNode.setAttribute('plait-node', 'text');
    fakeNode.textContent = text;
    fakeNode.style.display = 'inline-block';
    const richtext = document.createElement('plait-richtext');
    richtext.className = 'plait-richtext-container';
    richtext.style.lineHeight = 'normal';
    if (maxWordCount) {
        richtext.style.maxWidth = `${maxWordCount}em`;
    }
    richtext.appendChild(fakeNode);
    container?.appendChild(richtext);
    const { width, height } = fakeNode.getBoundingClientRect();
    container?.removeChild(richtext);
    return { width, height };
};

export const getRichtextContentSize = (editable: HTMLElement) => {
    const boundaryBox = {
        left: Number.MAX_VALUE,
        top: Number.MAX_VALUE,
        right: Number.NEGATIVE_INFINITY,
        bottom: Number.NEGATIVE_INFINITY
    };
    for (let index = 0; index < editable.childElementCount; index++) {
        const element = editable.children.item(index);
        const nodeRectangle = element?.getBoundingClientRect();
        if (nodeRectangle) {
            boundaryBox.left = Math.min(boundaryBox.left, nodeRectangle.x);
            boundaryBox.top = Math.min(boundaryBox.top, nodeRectangle.y);
            boundaryBox.right = Math.max(boundaryBox.right, nodeRectangle.x + nodeRectangle.width);
            boundaryBox.bottom = Math.max(boundaryBox.bottom, nodeRectangle.y + nodeRectangle.height);
        }
    }
    const width = boundaryBox.right - boundaryBox.left;
    // FIREFOX the height of inline span is less than the height of paragraph
    const height = editable.getBoundingClientRect().height;
    return { width, height };
};

export const ZERO_WIDTH_CHAR = '\uFEFF';

export const WITH_ZERO_WIDTH_CHAR = 'with-zero-width-char';
