import { idCreator, Path, PlaitBoard, PlaitElement, Transforms } from '@plait/core';
import { MindmapLayoutType } from '@plait/layouts';
import { Node } from 'slate';
import { MindmapNodeShape, NODE_MIN_WIDTH } from '../constants';
import { MindmapNode, PlaitMindmap } from '../interfaces';
import { MindmapNodeElement } from '../interfaces/element';
import { getRootLayout } from './layout';
import { addSelectedMindmapElements } from './selected-elements';
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
    if (PlaitMindmap.isPlaitMindmap(_node.origin)) {
        const index = board.children.indexOf(_node.origin);
        path.push(index);
    }
    return path.reverse();
}

export function findParentElement(element: MindmapNodeElement): MindmapNodeElement | undefined {
    const component = MINDMAP_ELEMENT_TO_COMPONENT.get(element);
    if (component && component.parent) {
        return component.parent.origin;
    }
    return undefined;
}

export function findUpElement(element: MindmapNodeElement): { root: MindmapNodeElement; branch?: MindmapNodeElement } {
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

export const getChildrenCount = (element: MindmapNodeElement) => {
    const count: number = element.children.reduce((p: number, c: MindmapNodeElement) => {
        return p + getChildrenCount(c);
    }, 0);
    return count + element.children.length;
};

export const isChildElement = (origin: MindmapNodeElement, child: MindmapNodeElement) => {
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

export const buildNodes = (node: MindmapNodeElement) => {
    if (node == null) {
        return {} as MindmapNodeElement;
    } else {
        const newNode: MindmapNodeElement = { ...node };
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
export const extractNodesText = (node: MindmapNodeElement) => {
    let str = '';
    if (node) {
        str += Node.string(node.value.children[0]) + ' ';
        for (const childNode of node.children) {
            str += extractNodesText(childNode);
        }
    }
    return str;
};

export const changeRightNodeCount = (board: PlaitBoard, selectedElement: MindmapNodeElement, changeNumber: number) => {
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

export const createMindmapData = (rightNodeCount: number, layout: MindmapLayoutType) => {
    const mindmapData: PlaitElement = {
        type: 'mindmap',
        id: idCreator(),
        isRoot: true,
        rightNodeCount,
        layout,
        width: 72,
        height: 28,
        points: [[230, 208]],
        value: { children: [{ text: '思维导图' }] },
        shape: MindmapNodeShape.roundRectangle,
        children: [
            {
                id: idCreator(),
                value: { children: [{ text: '新建节点' }] },
                children: [],
                width: 56,
                height: 24,
                shape: MindmapNodeShape.roundRectangle
            },
            {
                id: idCreator(),
                value: { children: [{ text: '新建节点' }] },
                children: [],
                width: 56,
                height: 24,
                shape: MindmapNodeShape.roundRectangle
            },
            {
                id: idCreator(),
                value: { children: [{ text: '新建节点' }] },
                children: [],
                width: 56,
                height: 24,
                shape: MindmapNodeShape.roundRectangle
            }
        ]
    };
    return [mindmapData];
};

// layoutLevel 用来表示插入兄弟节点还是子节点
export const createEmptyNode = (board: PlaitBoard, inheritNode: MindmapNodeElement, path: Path) => {
    let fill,
        strokeColor,
        strokeWidth,
        shape = MindmapNodeShape.roundRectangle;
    if (!inheritNode.isRoot) {
        fill = inheritNode.fill;
        strokeColor = inheritNode.strokeColor;
        strokeWidth = inheritNode.strokeWidth;
    }

    shape = inheritNode.shape as MindmapNodeShape;

    const newElement = {
        id: idCreator(),
        value: {
            children: [{ text: '' }]
        },
        children: [],
        width: NODE_MIN_WIDTH,
        height: 24,
        fill,
        strokeColor,
        strokeWidth,
        shape
    };
    Transforms.insertNode(board, newElement, path);
    addSelectedMindmapElements(board, newElement);
    setTimeout(() => {
        const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(newElement);
        if (nodeComponent) {
            nodeComponent.startEditText(true, false);
        }
    });
};

export const findLastChild = (child: MindmapNode) => {
    let result = child;
    while (result.children.length !== 0) {
        result = result.children[result.children.length - 1];
    }
    return result;
};
