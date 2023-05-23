import { Element } from 'slate';
import { MindElement } from '../interfaces/element';
import { NODE_MIN_WIDTH } from '../constants/node-rule';
import { PlaitBoard, Transforms } from '@plait/core';

export const setTopic = (board: PlaitBoard, element: MindElement, topic: Element, width: number, height: number) => {
    const newElement = {
        data: { topic },
        width: width < NODE_MIN_WIDTH * board.viewport.zoom ? NODE_MIN_WIDTH : width / board.viewport.zoom,
        height: height / board.viewport.zoom
    } as MindElement;
    if (MindElement.hasEmojis(element)) {
        newElement.data.emojis = element.data.emojis;
    }
    const path = PlaitBoard.findPath(board, element);
    Transforms.setNode(board, newElement, path);
};

export const setTopicSize = (board: PlaitBoard, element: MindElement, width: number, height: number) => {
    const newElement = {
        width: width < NODE_MIN_WIDTH * board.viewport.zoom ? NODE_MIN_WIDTH : width / board.viewport.zoom,
        height: height / board.viewport.zoom
    };
    const path = PlaitBoard.findPath(board, element);
    Transforms.setNode(board, newElement, path);
};

