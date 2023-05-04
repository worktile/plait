import { Element } from 'slate';
import { MindElement } from '../interfaces/element';
import { NODE_MIN_WIDTH } from '../constants/node';
import { PlaitBoard, Transforms } from '@plait/core';
import { EmojiData, EmojiItem } from '../interfaces/element-data';

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

export const addEmoji = (board: PlaitBoard, element: MindElement, emojiItem: EmojiItem) => {
    const emojis = element.data.emojis || [];
    emojis.push(emojiItem);
    const newElement = {
        data: { topic: element.data.topic, emojis }
    } as MindElement;
    const path = PlaitBoard.findPath(board, element);
    Transforms.setNode(board, newElement, path);
};

export const removeEmoji = (board: PlaitBoard, element: MindElement<EmojiData>, emojiItem: EmojiItem) => {
    const emojis = element.data.emojis.filter(value => value !== emojiItem);
    const newElement = {
        data: { topic: element.data.topic }
    } as MindElement;
    if (emojis.length > 0) {
        newElement.data.emojis = emojis;
    }
    const path = PlaitBoard.findPath(board, element);
    Transforms.setNode(board, newElement, path);
};
