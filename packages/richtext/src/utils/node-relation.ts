import { Node } from "slate";
import { ELEMENT_TO_NODE, NODE_TO_ELEMENT, NODE_TO_INDEX, NODE_TO_PARENT } from "./weak-maps";

export const updateWeakMap = (node: Node, index: number, parent: Node, nativeElement: HTMLElement) => {
    ELEMENT_TO_NODE.set(nativeElement, node);
    NODE_TO_ELEMENT.set(node, nativeElement);
    NODE_TO_INDEX.set(node, index);
    NODE_TO_PARENT.set(node, parent);
};
