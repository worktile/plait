import { MindmapElement } from '../interfaces/element';
import { Path, PlaitBoard } from '@plait/core';
import { isPlaitMindmap, MindmapNode } from '../interfaces';
import { MINDMAP_ELEMENT_TO_COMPONENT, SELECTED_MINDMAP_ELEMENTS } from './weak-maps';
import { idCreator } from '../../../plait/src/utils';

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

export const isChildElement = (origin: MindmapElement, child: MindmapElement) => {
    let parent = findParentElement(child);
    while (parent) {
        if (parent === origin) {
            return true;
        }
        parent = findParentElement(parent);
    }
    return false;
};

export const isChildRight = (node: MindmapNode, child: MindmapNode) => {
    return node.x < child.x;
};

export const isChildUp = (node: MindmapNode, child: MindmapNode) => {
    return node.y > child.y;
};

export const cloneNodes = (node: MindmapElement) => {
    if (node == null) {
        return {} as MindmapElement;
    } else {
        const newNode: MindmapElement = { ...node };
        newNode.id = idCreator();
        newNode.children = [];
        for (const childNode of node.children) {
            newNode.children.push(cloneNodes(childNode));
        }
        return newNode;
    }
};

export const getSelectedNode = (board: PlaitBoard) => {
    const selectedNodes = SELECTED_MINDMAP_ELEMENTS.get(board);
    if (selectedNodes?.length) {
        const selectedNode = selectedNodes[0];
        const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(selectedNode);
        const nodeData = nodeComponent?.node;
        return nodeData;
    } else {
        return null;
    }
};
