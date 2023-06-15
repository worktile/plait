import { PlaitBoard } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { getSizeByText } from '@plait/text';
import { Node } from 'slate';
import { ROOT_TOPIC_FONT_SIZE, TOPIC_DEFAULT_MAX_WORD_COUNT } from '../../constants/node-topic-style';
import { NODE_MIN_WIDTH } from '../../constants/node-rule';
import { MindLayoutType } from '@plait/layouts';

export const adjustRootToNode = (board: PlaitBoard, node: MindElement) => {
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

export const adjustAbstractToNode = (node: MindElement) => {
    const newNode: MindElement = { ...node };
    delete newNode.start;
    delete newNode.end;

    return newNode;
};

export const adjustNodeToRoot = (board: PlaitBoard, node: MindElement): MindElement => {
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
