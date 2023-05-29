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
import { createMindElement } from './node/create-node';

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

export const shouldChangeRightNodeCount = (selectedElement: MindElement) => {
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

export const deleteSelectedELements = (board: PlaitBoard, selectedElements: MindElement[]) => {
    const deletableElements = getFirstLevelElement(selectedElements).reverse();

    const abstractRefs = deleteElementHandleAbstract(board, deletableElements);
    MindTransforms.setAbstractsByRefs(board, abstractRefs);

    //翻转，从下到上修改，防止找不到 path
    deletableElements
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
