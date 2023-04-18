import { addSelectedElement, idCreator, NODE_TO_PARENT, Path, PlaitBoard, PlaitElement, PlaitNode, Transforms } from '@plait/core';
import { MindmapLayoutType } from '@plait/layouts';
import { Node } from 'slate';
import { MindmapNodeShape, NODE_MIN_WIDTH, ROOT_TOPIC_FONT_SIZE } from '../constants/node';
import { MindmapNode } from '../interfaces';
import { MindmapNodeElement } from '../interfaces/element';
import { getRootLayout } from './layout';
import { TEXT_DEFAULT_HEIGHT, getSizeByText, ROOT_DEFAULT_HEIGHT } from '@plait/richtext';
import { enterNodeEdit } from './node';

export function findParentElement(element: MindmapNodeElement): MindmapNodeElement | undefined {
    const parent = NODE_TO_PARENT.get(element);
    if (PlaitElement.isElement(parent)) {
        return parent as MindmapNodeElement;
    }
    {
        return undefined;
    }
}

export function findMindmap(board: PlaitBoard, element: MindmapNodeElement) {
    const path = PlaitBoard.findPath(board, element);
    return PlaitNode.get(board, path.slice(0, 1));
}

export function findMindmapBranch(board: PlaitBoard, element: MindmapNodeElement) {
    const path = PlaitBoard.findPath(board, element);
    return PlaitNode.get(board, path.slice(0, 2));
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

export const filterChildElement = (elements: MindmapNodeElement[]) => {
    let result: MindmapNodeElement[] = [];
    elements.forEach(element => {
        const isChild = elements.some(node => {
            return isChildElement(node, element);
        });

        if (!isChild) {
            result.push(element);
        }
    });
    return result;
};

export const isChildRight = (node: MindmapNode, child: MindmapNode) => {
    return node.x < child.x;
};

export const isChildUp = (node: MindmapNode, child: MindmapNode) => {
    return node.y > child.y;
};

export const copyNewNode = (node: MindmapNodeElement) => {
    const newNode: MindmapNodeElement = { ...node };
    newNode.id = idCreator();
    newNode.children = [];

    for (const childNode of node.children) {
        newNode.children.push(copyNewNode(childNode));
    }
    return newNode;
};

export const transformRootToNode = (board: PlaitBoard, node: MindmapNodeElement) => {
    const newNode: MindmapNodeElement = { ...node };
    delete newNode.isRoot;
    delete newNode.rightNodeCount;

    const text = Node.string(node.value.children[0]) || ' ';
    const { width, height } = getSizeByText(text, PlaitBoard.getViewportContainer(board));

    newNode.width = Math.max(width, NODE_MIN_WIDTH);
    newNode.height = height;

    if (newNode.layout === MindmapLayoutType.standard) {
        delete newNode.layout;
    }

    return newNode;
};

export const transformNodeToRoot = (board: PlaitBoard, node: MindmapNodeElement): MindmapNodeElement => {
    const newElement = { ...node };
    let text = Node.string(newElement.value);

    if (!text) {
        text = '思维导图';
        newElement.value = { children: [{ text }] };
    }

    delete newElement?.strokeColor;
    delete newElement?.fill;
    delete newElement?.shape;
    delete newElement?.strokeWidth;

    const { width, height } = getSizeByText(text, PlaitBoard.getViewportContainer(board), ROOT_TOPIC_FONT_SIZE);
    newElement.width = Math.max(width, NODE_MIN_WIDTH);
    newElement.height = height;

    return {
        ...newElement,
        layout: newElement.layout ?? MindmapLayoutType.right,
        isCollapsed: false,
        isRoot: true,
        type: 'mindmap'
    };
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

export const changeRightNodeCount = (board: PlaitBoard, parentPath: Path, changeNumber: number) => {
    const _rightNodeCount = board.children[parentPath[0]].rightNodeCount;
    Transforms.setNode(
        board,
        {
            rightNodeCount:
                changeNumber >= 0
                    ? _rightNodeCount! + changeNumber
                    : _rightNodeCount! + changeNumber < 0
                    ? 0
                    : _rightNodeCount! + changeNumber
        },
        parentPath
    );
};

export const shouldChangeRightNodeCount = (selectedElement: MindmapNodeElement) => {
    const parentElement = findParentElement(selectedElement);
    if (parentElement) {
        const nodeIndex: number = parentElement.children.findIndex(item => item.origin.id === selectedElement.id);
        if (
            parentElement.isRoot &&
            getRootLayout(parentElement) === MindmapLayoutType.standard &&
            parentElement.rightNodeCount &&
            nodeIndex <= parentElement.rightNodeCount - 1
        ) {
            return true;
        }
    }
    return false;
};

export const createMindmapData = (rightNodeCount: number, layout: MindmapLayoutType) => {
    const mindmapData: PlaitElement = {
        type: 'mindmap',
        id: idCreator(),
        isRoot: true,
        rightNodeCount,
        layout,
        width: 72,
        height: ROOT_DEFAULT_HEIGHT,
        points: [[230, 208]],
        value: { children: [{ text: '思维导图' }] },
        shape: MindmapNodeShape.roundRectangle,
        children: [
            {
                id: idCreator(),
                value: { children: [{ text: '新建节点' }] },
                children: [],
                width: 56,
                height: TEXT_DEFAULT_HEIGHT,
                shape: MindmapNodeShape.roundRectangle
            },
            {
                id: idCreator(),
                value: { children: [{ text: '新建节点' }] },
                children: [],
                width: 56,
                height: TEXT_DEFAULT_HEIGHT,
                shape: MindmapNodeShape.roundRectangle
            },
            {
                id: idCreator(),
                value: { children: [{ text: '新建节点' }] },
                children: [],
                width: 56,
                height: TEXT_DEFAULT_HEIGHT,
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
        height: TEXT_DEFAULT_HEIGHT,
        fill,
        strokeColor,
        strokeWidth,
        shape
    };
    Transforms.insertNode(board, newElement, path);
    addSelectedElement(board, newElement);
    setTimeout(() => {
        enterNodeEdit(newElement);
    });
};

export const findLastChild = (child: MindmapNode) => {
    let result = child;
    while (result.children.length !== 0) {
        result = result.children[result.children.length - 1];
    }
    return result;
};

export const deleteSelectedELements = (board: PlaitBoard, selectedElements: MindmapNodeElement[]) => {
    //翻转，从下到上修改，防止找不到 path
    filterChildElement(selectedElements)
        .reverse()
        .map(element => {
            const path = PlaitBoard.findPath(board, element);
            return () => {
                if (shouldChangeRightNodeCount(element)) {
                    changeRightNodeCount(board, path.slice(0, 1), -1);
                }
                Transforms.removeNode(board, path);
            };
        })
        .forEach(action => {
            action();
        });
};
