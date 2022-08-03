import { MindmapElement } from '../interfaces/element';
import { Path, PlaitBoard } from 'plait';
import { isPlaitMindmap, MindmapNode } from '../interfaces';
import { MINDMAP_ELEMENT_TO_COMPONENT } from './weak-maps';

export function findPath(board: PlaitBoard, node: MindmapNode): Path {
    const path = [];
    let _node: MindmapNode | undefined = node;
    while (true) {
        const component = MINDMAP_ELEMENT_TO_COMPONENT.get(_node.origin);
        if (component && component.parent) {
            _node = component?.parent;
            path.push(component.index);
        } else {
            break;
        }
    }
    if (isPlaitMindmap(_node.origin)) {
        const index = board.children.indexOf(_node.origin);
        path.push(index);
    }
    return path.reverse();
}

export function findParentElement(element: MindmapElement): MindmapElement | undefined {
    const component = MINDMAP_ELEMENT_TO_COMPONENT.get(element);
    if (component && component.parent) {
        return component.parent.origin;
    }
    return undefined;
}

export function findUpElement(element: MindmapElement): { root: MindmapElement; branch?: MindmapElement } {
    let branch;
    let root = element;
    let parent = findParentElement(element);
    while (parent) {
        branch = root;
        root = parent;
        parent = findParentElement(parent);
    }
    return { root, branch };
}

export const getChildrenCount = (element: MindmapElement) => {
    const count: number = element.children.reduce((p: number, c: MindmapElement) => {
        return p + getChildrenCount(c);
    }, 0);
    return count + element.children.length;
};
