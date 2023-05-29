import { MindLayoutType } from '@plait/layouts';
import {
    addSelectedElement,
    clearSelectedElement,
    idCreator,
    isNullOrUndefined,
    Path,
    PlaitBoard,
    PlaitElement,
    Point,
    Transforms
} from '@plait/core';
import { Node } from 'slate';
import { NODE_MIN_WIDTH } from '../constants/node-rule';
import { MindElementShape, MindNode } from '../interfaces';
import { MindElement } from '../interfaces/element';
import { getRootLayout } from './layout';
import { TEXT_DEFAULT_HEIGHT, getSizeByText, ROOT_DEFAULT_HEIGHT } from '@plait/richtext';
import { enterNodeEditing } from './node';
import { deleteElementHandleAbstract } from './abstract/common';
import { ROOT_TOPIC_FONT_SIZE, TOPIC_DEFAULT_MAX_WORD_COUNT } from '../constants/node-topic-style';
import { MindTransforms } from '../transforms';

export function findUpElement(element: MindElement): { root: MindElement; branch?: MindElement } {
    let branch;
    let root = element;
    let parent = MindElement.findParent(element);
    while (parent) {
        branch = root;
        root = parent;
        parent = MindElement.findParent(parent);
    }
    return { root, branch };
}

export const getChildrenCount = (element: MindElement) => {
    const count: number = element.children.reduce((p: number, c: MindElement) => {
        return p + getChildrenCount(c);
    }, 0);
    return count + element.children.length;
};

export const isChildElement = (origin: MindElement, child: MindElement) => {
    let parent = MindElement.findParent(child);
    while (parent) {
        if (parent === origin) {
            return true;
        }
        parent = MindElement.findParent(parent);
    }
    return false;
};

export const getFirstLevelElement = (elements: MindElement[]) => {
    let result: MindElement[] = [];
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

export const isChildRight = (node: MindNode, child: MindNode) => {
    return node.x < child.x;
};

export const isChildUp = (node: MindNode, child: MindNode) => {
    return node.y > child.y;
};

export const copyNewNode = (node: MindElement) => {
    const newNode: MindElement = { ...node };
    newNode.id = idCreator();
    newNode.children = [];

    for (const childNode of node.children) {
        newNode.children.push(copyNewNode(childNode));
    }
    return newNode;
};

export const transformRootToNode = (board: PlaitBoard, node: MindElement) => {
    const newNode: MindElement = { ...node };
    delete newNode.isRoot;
    delete newNode.rightNodeCount;
    delete newNode.type;

    const text = Node.string(node.data.topic.children[0]) || ' ';
    const { width, height } = getSizeByText(text, PlaitBoard.getViewportContainer(board), TOPIC_DEFAULT_MAX_WORD_COUNT);

    newNode.width = Math.max(width, NODE_MIN_WIDTH);
    newNode.height = height;

    if (newNode.layout === MindLayoutType.standard) {
        delete newNode.layout;
    }

    return newNode;
};

export const transformAbstractToNode = (node: MindElement) => {
    const newNode: MindElement = { ...node };
    delete newNode.start;
    delete newNode.end;

    return newNode;
};

export const transformNodeToRoot = (board: PlaitBoard, node: MindElement): MindElement => {
    const newElement = { ...node };
    let text = Node.string(newElement.data.topic);

    if (!text) {
        text = '思维导图';
        newElement.data.topic = { children: [{ text }] };
    }

    delete newElement?.strokeColor;
    delete newElement?.fill;
    delete newElement?.shape;
    delete newElement?.strokeWidth;

    const { width, height } = getSizeByText(
        text,
        PlaitBoard.getViewportContainer(board),
        TOPIC_DEFAULT_MAX_WORD_COUNT,
        ROOT_TOPIC_FONT_SIZE
    );
    newElement.width = Math.max(width, NODE_MIN_WIDTH);
    newElement.height = height;

    return {
        ...newElement,
        layout: newElement.layout ?? MindLayoutType.right,
        isCollapsed: false,
        isRoot: true,
        type: 'mindmap'
    };
};

export const extractNodesText = (node: MindElement) => {
    let str = '';
    if (node) {
        str += Node.string(node.data.topic.children[0]) + ' ';
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

export const isInRightBranchOfStandardLayout = (selectedElement: MindElement) => {
    const parentElement = MindElement.findParent(selectedElement);
    if (parentElement) {
        const nodeIndex: number = parentElement.children.findIndex(item => item.id === selectedElement.id);
        if (
            parentElement.isRoot &&
            getRootLayout(parentElement) === MindLayoutType.standard &&
            parentElement.rightNodeCount &&
            nodeIndex <= parentElement.rightNodeCount - 1
        ) {
            return true;
        }
    }
    return false;
};

export const createDefaultMindMapElement = (point: Point, rightNodeCount: number, layout: MindLayoutType) => {
    const root = createMindElement('思维导图', 72, ROOT_DEFAULT_HEIGHT, { shape: MindElementShape.roundRectangle, layout });
    root.rightNodeCount = rightNodeCount;
    root.isRoot = true;
    root.type = 'mindmap';
    root.points = [point];
    const children = [1, 1, 1].map(() => {
        return createMindElement('新建节点', 56, TEXT_DEFAULT_HEIGHT, { shape: MindElementShape.roundRectangle });
    });
    root.children = children;
    return root;
};

export const createMindElement = (
    text: string,
    width: number,
    height: number,
    options: {
        fill?: string;
        strokeColor?: string;
        strokeWidth?: number;
        shape?: MindElementShape;
        layout?: MindLayoutType;
        branchColor?: string;
        branchWidth?: number;
    }
) => {
    const newElement: MindElement = {
        id: idCreator(),
        data: {
            topic: { children: [{ text }] }
        },
        children: [],
        width,
        height,
        fill: options.fill,
        strokeColor: options.strokeColor,
        strokeWidth: options.strokeWidth,
        shape: options.shape
    };
    if (options.fill) {
        newElement.fill = options.fill;
    }
    if (options.strokeColor) {
        newElement.strokeColor = options.strokeColor;
    }
    if (!isNullOrUndefined(options.strokeWidth)) {
        newElement.strokeWidth = options.strokeWidth;
    }
    if (options.shape) {
        newElement.shape = options.shape;
    }
    if (options.layout) {
        newElement.layout = options.layout;
    }
    if (options.branchColor) {
        newElement.branchColor = options.branchColor;
    }
    if (!isNullOrUndefined(options.branchWidth)) {
        newElement.branchWidth = options.branchWidth;
    }
    return newElement;
};

// layoutLevel 用来表示插入兄弟节点还是子节点
export const insertMindElement = (board: PlaitBoard, inheritNode: MindElement, path: Path) => {
    let fill,
        strokeColor,
        strokeWidth,
        shape = MindElementShape.roundRectangle;
    if (!inheritNode.isRoot) {
        fill = inheritNode.fill;
        strokeColor = inheritNode.strokeColor;
        strokeWidth = inheritNode.strokeWidth;
    }

    shape = inheritNode.shape as MindElementShape;

    const newElement = createMindElement('', NODE_MIN_WIDTH, TEXT_DEFAULT_HEIGHT, { fill, strokeColor, strokeWidth, shape });

    Transforms.insertNode(board, newElement, path);
    clearSelectedElement(board);
    addSelectedElement(board, newElement);
    setTimeout(() => {
        enterNodeEditing(newElement);
    });
};

export const findLastChild = (child: MindNode) => {
    let result = child;
    while (result.children.length !== 0) {
        result = result.children[result.children.length - 1];
    }
    return result;
};

export const divideElementByParent = (elements: MindElement[]) => {
    const abstractIncludedGroups = [];
    const parentElements: MindElement[] = [];

    for (let i = 0; i < elements.length; i++) {
        const parent = MindElement.getParent(elements[i]);
        const parentIndex = parentElements.indexOf(parent);
        if (parentIndex === -1) {
            parentElements.push(parent);
            abstractIncludedGroups.push([elements[i]]);
        } else {
            abstractIncludedGroups[parentIndex].push(elements[i]);
        }
    }
    return { parentElements, abstractIncludedGroups };
};
