import {
    idCreator,
    Path,
    PlaitBoard,
    PlaitBoardComponent,
    PlaitElement,
    PLAIT_BOARD_TO_COMPONENT,
    SCROLL_BAR_WIDTH,
    Transforms
} from '@plait/core';
import { MindmapLayoutType } from '@plait/layouts';
import { Node } from 'slate';
import { MindmapNodeShape, NODE_MIN_WIDTH } from '../constants';
import { isPlaitMindmap, MindmapNode } from '../interfaces';
import { MindmapElement } from '../interfaces/element';
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
export const createEmptyNode = (board: PlaitBoard, inheritNode: MindmapElement, path: Path) => {
    let fill,
        strokeColor,
        strokeWidth,
        shape = MindmapNodeShape.roundRectangle;
    if (!inheritNode.isRoot) {
        fill = inheritNode.fill;
        strokeColor = inheritNode.strokeColor;
        strokeWidth = inheritNode.strokeWidth;
        shape = inheritNode.shape as MindmapNodeShape;
    }

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
        const boardComponent = PLAIT_BOARD_TO_COMPONENT.get(board) as PlaitBoardComponent;
        if (nodeComponent) {
            // todo: 新增节点重置偏移
            const shapeGRect = (nodeComponent.shapeG as SVGGElement).getBoundingClientRect();
            const canvasRect = boardComponent.contentContainer.nativeElement.getBoundingClientRect();
            const autoFitPadding = boardComponent.autoFitPadding;
            const { x, y } = isOutExtent(shapeGRect, canvasRect, autoFitPadding);
            if (x || y) {
                boardComponent.setScroll(boardComponent.scrollLeft - x, boardComponent.scrollTop - y);
            }

            nodeComponent.startEditText(true, false);
        }
    });
};

const isOutExtent = (node: DOMRect, boundary: DOMRect, skewing: number): { x: number; y: number } => {
    const result = { x: 0, y: 0 };
    if (!node || !boundary) return result;
    result.x =
        node.left < boundary.left + skewing
            ? boundary.left - node.left + skewing
            : node.right > boundary.right - SCROLL_BAR_WIDTH - skewing
            ? boundary.right - node.right - SCROLL_BAR_WIDTH - skewing
            : 0;
    result.y =
        node.top < boundary.top + skewing
            ? boundary.top - node.top + skewing
            : node.bottom > boundary.bottom - SCROLL_BAR_WIDTH - skewing
            ? boundary.bottom - node.bottom - SCROLL_BAR_WIDTH - skewing
            : 0;
    return result;
};
