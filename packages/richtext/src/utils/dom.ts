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

export const ZERO_WIDTH_CHAR = '\uFEFF';

export const WITH_ZERO_WIDTH_CHAR = 'with-zero-width-char';
