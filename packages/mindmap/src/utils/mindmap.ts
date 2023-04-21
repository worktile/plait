import { addSelectedElement, idCreator, Path, PlaitBoard, PlaitElement, Transforms } from '@plait/core';
import { AbstractNode, MindmapLayoutType } from '@plait/layouts';
import { Node } from 'slate';
import { MindmapNodeShape, NODE_MIN_WIDTH, ROOT_TOPIC_FONT_SIZE } from '../constants/node';
import { MindmapNode, PlaitMindmap } from '../interfaces';
import { MindmapNodeElement } from '../interfaces/element';
import { getRootLayout } from './layout';
import { MINDMAP_ELEMENT_TO_COMPONENT } from './weak-maps';
import { TEXT_DEFAULT_HEIGHT, getSizeByText, ROOT_DEFAULT_HEIGHT } from '@plait/richtext';

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
    const mindmapNodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(selectedElement);
    if (parentElement && mindmapNodeComponent) {
        const nodeIndex: number = mindmapNodeComponent.parent.children.findIndex(item => item.origin.id === selectedElement.id);
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

export const deleteSelectedELements = (board: PlaitBoard, selectedElements: MindmapNodeElement[]) => {
    //翻转，从下到上修改，防止找不到 path
    const deletableElements = filterChildElement(selectedElements).reverse();

    const relativeAbstracts: AbstractNode[] = [];
    const accumulativeProperties = new WeakMap<AbstractNode, { start: number, end: number }>;

    deletableElements.forEach(node => {
        const mindmapNodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(node);
        if (mindmapNodeComponent && mindmapNodeComponent.parent) {
            const index = mindmapNodeComponent.parent.origin.children.indexOf(node);
            const abstracts = mindmapNodeComponent.parent.children.filter(value => AbstractNode.isAbstract(value.origin));
            abstracts.forEach(abstract => {
                const abstractNode = abstract.origin as AbstractNode;
                if (index >= abstractNode.start && index <= abstractNode.end) {
                    let newProperties = accumulativeProperties.get(abstractNode);
                    if (!newProperties) {
                        newProperties = { start: abstractNode.start, end: abstractNode.end };
                        accumulativeProperties.set(abstractNode, newProperties);
                        relativeAbstracts.push(abstractNode);
                    }
                    newProperties.end = newProperties.end - 1;
                }
            });
        }
    });

    const abstractHandles = relativeAbstracts.map((value) => {
        const newProperties = accumulativeProperties.get(value);
        if (newProperties) {
            const mindmapNodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(value as MindmapNodeElement);
            if (mindmapNodeComponent) {
                const path = findPath(board, mindmapNodeComponent.node);
                return () => {
                    if (newProperties.start > newProperties.end) {
                        Transforms.removeNode(board, path);
                    } else {
                        Transforms.setNode(board, newProperties, path);
                    }
                }
            }
        }
        return () => {}
    });

    const deletableHandles = deletableElements
        .map(node => {
            const mindmapNodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(node);
            if (mindmapNodeComponent) {
                const path = findPath(board, mindmapNodeComponent.node);
                const parent = mindmapNodeComponent.parent;
                const parentPath: Path = parent ? findPath(board, mindmapNodeComponent!.parent) : [];
                return () => {
                    if (shouldChangeRightNodeCount(node)) {
                        changeRightNodeCount(board, parentPath, -1);
                    }
                    Transforms.removeNode(board, path);
                };
            }
            return () => {};
        });

    abstractHandles.forEach((action) => action());
    deletableHandles.forEach((action) => action());
};
