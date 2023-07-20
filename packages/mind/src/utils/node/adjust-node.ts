import { PlaitBoard } from '@plait/core';
import { MindElement } from '../../interfaces/element';
import { getTextSize } from '@plait/text';
import { Node } from 'slate';
import { BRANCH_FONT_FAMILY, ROOT_TOPIC_FONT_SIZE, TOPIC_DEFAULT_MAX_WORD_COUNT } from '../../constants/node-topic-style';
import { MindLayoutType } from '@plait/layouts';
import { getNodeDefaultFontSize } from '../space/node-space';
import { PlaitMindBoard } from '../../plugins/with-mind.board';

export const adjustRootToNode = (board: PlaitBoard, node: MindElement) => {
    const newNode: MindElement = { ...node };
    delete newNode.isRoot;
    delete newNode.rightNodeCount;
    delete newNode.type;
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

export const adjustNodeToRoot = (board: PlaitMindBoard, node: MindElement): MindElement => {
    const newElement = { ...node };
    if (!Node.string(newElement.data.topic)) {
        newElement.data.topic = { children: [{ text: '思维导图' }] };
    }

    delete newElement?.strokeColor;
    delete newElement?.fill;
    delete newElement?.shape;
    delete newElement?.strokeWidth;
    delete newElement?.isCollapsed;

    const { width, height } = getTextSize(board, newElement.data.topic, TOPIC_DEFAULT_MAX_WORD_COUNT, {
        fontSize: ROOT_TOPIC_FONT_SIZE,
        fontFamily: BRANCH_FONT_FAMILY
    });
    newElement.width = Math.max(width, getNodeDefaultFontSize(true));
    newElement.height = height;

    return {
        ...newElement,
        layout: newElement.layout ?? MindLayoutType.right,
        isRoot: true,
        type: 'mindmap'
    };
};
