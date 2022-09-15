import { idCreator, Path, PlaitBoard, Transforms } from '@plait/core';
import { Node } from 'slate';
import { isPlaitMindmap, MindmapNode } from '../interfaces';
import { MindmapElement } from '../interfaces/element';
import { MINDMAP_ELEMENT_TO_COMPONENT } from './weak-maps';
import { MindmapLayoutType } from '@plait/layouts';
import { getRootLayout } from './layout';

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

export const buildNodes = (node: MindmapElement) => {
    if (node == null) {
        return {} as MindmapElement;
    } else {
        const newNode: MindmapElement = { ...node };
        newNode.id = idCreator();
        newNode.children = [];
        if (newNode.isRoot) {
            delete newNode.isRoot;
        }
        for (const childNode of node.children) {
            newNode.children.push(buildNodes(childNode));
        }
        return newNode;
    }
};
export const extractNodesText = (node: MindmapElement) => {
    let str = '';
    if (node) {
        str += Node.string(node.value.children[0]) + ' ';
        for (const childNode of node.children) {
            str += extractNodesText(childNode);
        }
    }
    return str;
};

export const changeRightNodeCount = (board: PlaitBoard, selectedElement: MindmapElement, changeNumber: number) => {
    const parentElement = findParentElement(selectedElement);
    const mindmapNodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(selectedElement);
    if (mindmapNodeComponent) {
        const nodeIndex: number = mindmapNodeComponent.parent.children.findIndex(item => item.origin.id === selectedElement.id);
        if (
            parentElement &&
            parentElement.isRoot &&
            getRootLayout(parentElement) === MindmapLayoutType.standard &&
            parentElement.rightNodeCount &&
            nodeIndex <= parentElement.rightNodeCount - 1
        ) {
            const path = findPath(board, mindmapNodeComponent.parent);
            Transforms.setNode(
                board,
                {
                    rightNodeCount:
                        changeNumber >= 0
                            ? parentElement.rightNodeCount + changeNumber
                            : parentElement.rightNodeCount + changeNumber < 0
                            ? 0
                            : parentElement.rightNodeCount + changeNumber
                },
                path
            );
        }
    }
};
