import { AbstractNode, MindLayoutType } from '@plait/layouts';
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
import { MindNodeShape, NODE_MIN_WIDTH, ROOT_TOPIC_FONT_SIZE, TOPIC_DEFAULT_MAX_WORD_COUNT } from '../constants/node';
import { MindNode, PlaitMind } from '../interfaces';
import { MindElement } from '../interfaces/element';
import { getRootLayout } from './layout';
import { TEXT_DEFAULT_HEIGHT, getSizeByText, ROOT_DEFAULT_HEIGHT } from '@plait/richtext';
import { enterNodeEditing } from './node';
import { MindNodeComponent } from '../node.component';
import { getBehindAbstracts, getCorrespondingAbstract } from './abstract/common';

export function findParentElement(element: MindElement): MindElement | undefined {
    const component = PlaitElement.getComponent(element) as MindNodeComponent;
    if (component && component.parent) {
        return component.parent.origin;
    }
    return undefined;
}

export function findUpElement(element: MindElement): { root: MindElement; branch?: MindElement } {
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

export const getChildrenCount = (element: MindElement) => {
    const count: number = element.children.reduce((p: number, c: MindElement) => {
        return p + getChildrenCount(c);
    }, 0);
    return count + element.children.length;
};

export const isChildElement = (origin: MindElement, child: MindElement) => {
    let parent = findParentElement(child);
    while (parent) {
        if (parent === origin) {
            return true;
        }
        parent = findParentElement(parent);
    }
    return false;
};

export const filterChildElement = (elements: MindElement[]) => {
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

export const shouldChangeRightNodeCount = (selectedElement: MindElement) => {
    const parentElement = findParentElement(selectedElement);
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
    const root = createMindElement('思维导图', 72, ROOT_DEFAULT_HEIGHT, { shape: MindNodeShape.roundRectangle, layout });
    root.rightNodeCount = rightNodeCount;
    root.isRoot = true;
    root.type = 'mindmap';
    root.points = [point];
    const children = [1, 1, 1].map(() => {
        return createMindElement('新建节点', 56, TEXT_DEFAULT_HEIGHT, { shape: MindNodeShape.roundRectangle });
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
        shape?: MindNodeShape;
        layout?: MindLayoutType;
        branchColor?: string;
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
    return newElement;
};

// layoutLevel 用来表示插入兄弟节点还是子节点
export const insertMindElement = (board: PlaitBoard, inheritNode: MindElement, path: Path) => {
    let fill,
        strokeColor,
        strokeWidth,
        shape = MindNodeShape.roundRectangle;
    if (!inheritNode.isRoot) {
        fill = inheritNode.fill;
        strokeColor = inheritNode.strokeColor;
        strokeWidth = inheritNode.strokeWidth;
    }

    shape = inheritNode.shape as MindNodeShape;

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
    //翻转，从下到上修改，防止找不到 path
    const deletableElements = filterChildElement(selectedElements).reverse();
    const relativeAbstracts: MindElement[] = [];
    const accumulativeProperties = new WeakMap<MindElement, { start: number; end: number }>();

    deletableElements.forEach(node => {
        if (!PlaitMind.isMind(node)) {
            const behindAbstracts = getBehindAbstracts(node).filter(abstract => !deletableElements.includes(abstract));
            if (behindAbstracts.length) {
                behindAbstracts.forEach(abstract => {
                    let newProperties = accumulativeProperties.get(abstract);
                    if (!newProperties) {
                        newProperties = { start: abstract.start!, end: abstract.end! };
                        accumulativeProperties.set(abstract, newProperties);
                        relativeAbstracts.push(abstract);
                    }
                    newProperties.start = newProperties.start - 1;
                    newProperties.end = newProperties.end - 1;
                });
            }

            const correspondingAbstract = getCorrespondingAbstract(node);
            if (correspondingAbstract && !deletableElements.includes(correspondingAbstract)) {
                let newProperties = accumulativeProperties.get(correspondingAbstract);
                if (!newProperties) {
                    newProperties = { start: correspondingAbstract.start!, end: correspondingAbstract.end! };
                    accumulativeProperties.set(correspondingAbstract, newProperties);
                    relativeAbstracts.push(correspondingAbstract);
                }
                newProperties.end = newProperties.end - 1;
            }
        }
    });

    const abstractHandles = relativeAbstracts.map(value => {
        const newProperties = accumulativeProperties.get(value);
        if (newProperties) {
            const path = PlaitBoard.findPath(board, value as MindElement);
            return () => {
                if (newProperties.start > newProperties.end) {
                    Transforms.removeNode(board, path);
                } else {
                    Transforms.setNode(board, newProperties, path);
                }
            };
        }
        return () => {};
    });

    const deletableHandles = deletableElements.map(node => {
        const path = PlaitBoard.findPath(board, node);
        return () => {
            if (shouldChangeRightNodeCount(node)) {
                changeRightNodeCount(board, path.slice(0, path.length - 1), -1);
            }
            Transforms.removeNode(board, path);
        };
    });

    abstractHandles.forEach(action => action());
    deletableHandles.forEach(action => action());
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
